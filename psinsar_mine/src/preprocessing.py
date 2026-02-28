"""
Step 2: Preprocessing
=====================
Prepares HyP3-downloaded interferogram stack for PSInSAR/MintPy analysis.

Key fixes vs original:
  - CRS-aware clipping: converts WGS84 AOI bbox to raster UTM CRS before clipping
  - Correct path: reads from data/interferograms (set in config.yaml)
  - Skips already-clipped files (safe to re-run)
  - One bad interferogram won't crash everything

Usage:
  python src/preprocessing.py
  python src/preprocessing.py --config config.yaml
"""

import sys
import yaml
import logging
import argparse
import zipfile
from pathlib import Path
from typing import List, Tuple, Dict, Optional


import rasterio
from rasterio.mask import mask as rio_mask
from pyproj import Transformer
from shapely.geometry import box, mapping

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


# ── Config ────────────────────────────────────────────────────────────────────
def load_config(path: str = "config.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


# ── Step 2.1: Extract ZIPs ────────────────────────────────────────────────────
def unzip_hyp3_products(interferogram_dir: Path) -> List[Path]:
    """
    Extract HyP3 ZIP packages. Skips already-extracted ones.
    If no ZIPs found, assumes already extracted and returns existing dirs.
    """
    zip_files = sorted(interferogram_dir.glob("*.zip"))

    if not zip_files:
        existing = [d for d in interferogram_dir.iterdir() if d.is_dir()]
        log.info(f"No ZIPs found — using {len(existing)} existing extracted directories")
        return existing

    log.info(f"Extracting {len(zip_files)} ZIP packages from {interferogram_dir}...")
    extracted = []
    for i, zf in enumerate(zip_files, 1):
        dest = interferogram_dir / zf.stem
        if dest.exists():
            extracted.append(dest)
            continue
        try:
            with zipfile.ZipFile(zf, "r") as z:
                z.extractall(interferogram_dir)
            extracted.append(dest)
            if i % 10 == 0:
                log.info(f"  {i}/{len(zip_files)} extracted...")
        except Exception as e:
            log.warning(f"  Could not extract {zf.name}: {e}")

    log.info(f"  {len(extracted)} packages ready")
    return extracted


# ── Step 2.2: Discover interferogram files ────────────────────────────────────
def discover_interferogram_files(product_dirs: List[Path]) -> Dict[str, dict]:
    """
        Scan each HyP3 product directory for GeoTIFF files.
        Expected HyP3 INSAR_GAMMA files:
      *_unw_phase.tif   unwrapped phase
      *_corr.tif        coherence
      *_dem.tif         DEM
      *_lv_phi.tif      look vector phi
      *_lv_theta.tif    look vector theta
      *_inc_map.tif     incidence angle
    """
    log.info("Discovering interferogram files...")
    products = {}

    for d in product_dirs:
        if not d.is_dir():
            continue

        unw  = list(d.glob("*_unw_phase.tif"))
        corr = list(d.glob("*_corr.tif"))
        dem  = list(d.glob("*_dem.tif"))
        lv   = list(d.glob("*_lv_*.tif"))
        inc  = list(d.glob("*_inc_map.tif"))

        if not unw or not corr:
            log.warning(f"  Skipping {d.name} — missing unw_phase or corr")
            continue

        # Parse date pair: S1AA_20230106T002115_20230118T002115_VVP012_...
        parts = d.name.split("_")
        try:
            date_pair = f"{parts[1][:8]}_{parts[2][:8]}"
        except IndexError:
            date_pair = d.name

        products[date_pair] = {
            "dir":     d,
            "unw":     unw[0],
            "corr":    corr[0],
            "dem":     dem[0]  if dem else None,
            "lv":      lv,
            "inc_map": inc[0]  if inc else None,
        }

    log.info(f"  Found {len(products)} valid interferograms")
    return products


# ── Step 2.3: CRS-aware extent calculation ────────────────────────────────────
def get_raster_crs_and_bounds(raster_path: Path):
    """Return the CRS and bounds of a raster."""
    with rasterio.open(raster_path) as src:
        return src.crs, src.bounds


def wgs84_bbox_to_native(bbox_wgs84: List[float], raster_path: Path) -> Tuple[float, float, float, float]:
    """
    Convert WGS84 bbox [min_lon, min_lat, max_lon, max_lat]
    into the native CRS of the raster (e.g. UTM metres).

    This is the critical fix — HyP3 rasters are in UTM (metres),
    config.yaml bbox is in degrees. They CANNOT be mixed directly.
    """
    crs, _ = get_raster_crs_and_bounds(raster_path)

    # If raster is already WGS84 (EPSG:4326), no transform needed
    if crs.to_epsg() == 4326:
        return (bbox_wgs84[0], bbox_wgs84[1], bbox_wgs84[2], bbox_wgs84[3])

    # Reproject all four corners from WGS84 to raster CRS
    transformer = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    min_lon, min_lat, max_lon, max_lat = bbox_wgs84

    corners_lon = [min_lon, max_lon, min_lon, max_lon]
    corners_lat = [min_lat, min_lat, max_lat, max_lat]
    xs, ys = transformer.transform(corners_lon, corners_lat)

    return min(xs), min(ys), max(xs), max(ys)


def get_common_extent_native(tif_files: List[Path]) -> Tuple[float, float, float, float]:
    """
    Intersection of all raster extents in their native CRS.
    Intersection = max of mins, min of maxs.
    """
    extents = []
    for f in tif_files:
        _, b = get_raster_crs_and_bounds(f)
        extents.append((b.left, b.bottom, b.right, b.top))

    minx = max(e[0] for e in extents)
    miny = max(e[1] for e in extents)
    maxx = min(e[2] for e in extents)
    maxy = min(e[3] for e in extents)

    if minx >= maxx or miny >= maxy:
        raise ValueError("No common overlap between interferograms. Check that all cover the same area.")

    return minx, miny, maxx, maxy


def clip_raster(src_path: Path, dst_path: Path, extent_native: Tuple) -> bool:
    """
    Clip raster to extent already in the raster's native CRS.
    Returns True on success, False on failure.
    Skips if output already exists.
    """
    if dst_path.exists():
        return True

    geom = box(*extent_native)
    try:
        with rasterio.open(src_path) as src:
            out_image, out_transform = rio_mask(src, [mapping(geom)], crop=True)
            out_meta = src.meta.copy()
            out_meta.update({
                "height":    out_image.shape[1],
                "width":     out_image.shape[2],
                "transform": out_transform,
            })
        with rasterio.open(dst_path, "w", **out_meta) as dst:
            dst.write(out_image)
        return True
    except Exception as e:
        log.warning(f" Could not clip {src_path.name}: {e}")
        return False


def prepare_mintpy_stack(
    products: Dict[str, dict],
    mintpy_dir: Path,
    aoi_bbox_wgs84: List[float],
) -> Path:
    """
    Clip all interferograms to common AOI extent and organize into:

    data/mintpy_stack/hyp3_stack/
      20230106_20230118/
        unw_phase.tif
        coherence.tif
        dem.tif
        inc_map.tif
        lv_phi.tif
        lv_theta.tif
      20230118_20230130/
        ...
    """
    stack_dir = mintpy_dir / "hyp3_stack"
    stack_dir.mkdir(parents=True, exist_ok=True)

   
    first_unw = next(p["unw"] for p in products.values())
    crs, _    = get_raster_crs_and_bounds(first_unw)
    log.info(f"Raster CRS detected: {crs.to_string()}")

    # Get common native extent across all interferograms
    log.info("Computing common spatial extent (native CRS)...")
    unw_files     = [p["unw"] for p in products.values()]
    native_extent = get_common_extent_native(unw_files)
    log.info(f"  Common extent (native): {native_extent}")

    # Convert AOI bbox from WGS84 degrees → native CRS (UTM metres)
    if aoi_bbox_wgs84:
        log.info(f"  AOI bbox (WGS84): {aoi_bbox_wgs84}")
        aoi_native = wgs84_bbox_to_native(aoi_bbox_wgs84, first_unw)
        log.info(f"  AOI bbox (native CRS): {aoi_native}")

        # Intersect common extent with AOI
        clip_extent = (
            max(native_extent[0], aoi_native[0]),
            max(native_extent[1], aoi_native[1]),
            min(native_extent[2], aoi_native[2]),
            min(native_extent[3], aoi_native[3]),
        )

        # Safety check
        if clip_extent[0] >= clip_extent[2] or clip_extent[1] >= clip_extent[3]:
            log.warning("AOI does not overlap rasters — using full common extent")
            clip_extent = native_extent
        else:
            log.info(f"  Final clip extent: {clip_extent}")
    else:
        clip_extent = native_extent

    # Clip all interferograms
    log.info(f"Clipping {len(products)} interferograms...")
    success = 0
    failed  = 0

    for i, (date_pair, p) in enumerate(products.items(), 1):
        pair_dir = stack_dir / date_pair
        pair_dir.mkdir(exist_ok=True)

        ok  = clip_raster(p["unw"],  pair_dir / "unw_phase.tif", clip_extent)
        ok &= clip_raster(p["corr"], pair_dir / "coherence.tif", clip_extent)

        if p["dem"]     is not None:
            clip_raster(p["dem"],     pair_dir / "dem.tif",     clip_extent)
        if p["inc_map"] is not None:
            clip_raster(p["inc_map"], pair_dir / "inc_map.tif", clip_extent)
        for lv_file in p["lv"]:
            name = lv_file.stem.split("_")[-1]   # phi or theta
            clip_raster(lv_file, pair_dir / f"lv_{name}.tif", clip_extent)

        if ok:
            success += 1
        else:
            failed += 1

        if i % 10 == 0:
            log.info(f"  Progress: {i}/{len(products)} ({success} ok, {failed} failed)")

    log.info(f"  Clipping done: {success} succeeded, {failed} failed")
    log.info(f"  Stack directory: {stack_dir}")
    return stack_dir


def run_mintpy_prep(stack_dir: Path, mintpy_dir: Path) -> None:
    """MintPy 1.6.x compatible: prep_hyp3.py takes positional unw_phase files."""
    log.info("Running MintPy prep_hyp3.py ...")

    unw_files = sorted(stack_dir.glob("*/unw_phase.tif"))
    if not unw_files:
        raise RuntimeError(f"No unw_phase.tif files found in {stack_dir}")

    log.info(f"  Passing {len(unw_files)} unw_phase files to prep_hyp3")
    (mintpy_dir / "inputs").mkdir(parents=True, exist_ok=True)

    try:
        from mintpy.cli.prep_hyp3 import main as prep_hyp3_main

        prep_hyp3_main([str(f) for f in unw_files])
        log.info(f"HDF5 files ready in: {mintpy_dir / 'inputs'}")
    except Exception as e:
        log.error(f"prep_hyp3 failed: {e}")
        raise RuntimeError("MintPy preparation failed")


def main():
    parser = argparse.ArgumentParser(description="PSInSAR Step 2: Preprocessing")
    parser.add_argument("--config",      default="config.yaml")
    parser.add_argument("--skip-mintpy", action="store_true",
                        help="Stop after clipping, skip MintPy HDF5 creation")
    args = parser.parse_args()

    cfg        = load_config(args.config)
    data_dir   = Path(cfg["output"]["data_dir"])
    ifgram_dir = data_dir / "interferograms"
    mintpy_dir = data_dir / "mintpy_stack"
    aoi_bbox   = cfg["aoi"]["bbox"]       # [min_lon, min_lat, max_lon, max_lat] WGS84

    log.info(f"Interferograms : {ifgram_dir.resolve()}")
    log.info(f"MintPy stack   : {mintpy_dir.resolve()}")
    log.info(f"AOI bbox (WGS84): {aoi_bbox}")

    # Check interferogram directory exists
    if not ifgram_dir.exists():
        log.error(f"Directory not found: {ifgram_dir}")
        log.error("Make sure your interferograms are in data/interferograms/")
        sys.exit(1)

    # 2.1 Extract ZIPs (skips if already extracted)
    product_dirs = unzip_hyp3_products(ifgram_dir)

    # 2.2 Find interferogram files
    products = discover_interferogram_files(product_dirs)
    if not products:
        log.error("No valid interferograms found in the directory.")
        sys.exit(1)

    # 2.3–2.5 Clip and stack
    stack_dir = prepare_mintpy_stack(products, mintpy_dir, aoi_bbox)

    # 2.6 MintPy HDF5 conversion
    if not args.skip_mintpy:
        try:
            run_mintpy_prep(stack_dir, mintpy_dir)
        except Exception as e:
            log.warning(f"MintPy prep skipped: {e}")
            log.info(f"Once MintPy is installed, run manually:")
            log.info(f"  prep_hyp3.py -d {stack_dir} -o {mintpy_dir / 'inputs'}")

    log.info("\nPREPROCESSING COMPLETE")
    log.info(f"  Stack: {stack_dir}")
    log.info("  Next step: python src/ps_estimation.py")


if __name__ == "__main__":
    main()