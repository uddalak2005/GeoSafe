"""
Step 4: Velocity Generation & Time Series CSV Export
=====================================================
Extracts deformation data from MintPy outputs and exports it in a format
purpose-built for training time series models (LSTM, Prophet, XGBoost, etc.)

OUTPUT FILES
────────────
1. ts_long.csv              ← PRIMARY training file (long format, one row per PS point per epoch)
2. ps_metadata.csv          ← One row per PS point — spatial + statistical attributes
3. ts_wide.csv              ← Wide format (pivot of ts_long) — useful for some models
4. ps_points_velocity.csv   ← Legacy summary CSV (kept for visualization step)

ts_long.csv SCHEMA (what each column means)
────────────────────────────────────────────
  ps_id                  Unique PS point identifier  e.g. PS_00042
  date                   Acquisition date            YYYY-MM-DD
  lat / lon              WGS84 coordinates
  cluster_id             Spatial deformation cluster (-1 = unclustered)
  days_since_start       Integer: days elapsed from first acquisition (t axis for models)
  cumulative_disp_mm     Cumulative LOS displacement since first image  [TARGET variable]
  incremental_disp_mm    Displacement since previous epoch             [used in seq models]
  mean_velocity_mm_yr    Long-term linear velocity of this PS point    [static feature]
  coherence              Mean coherence of this PS point across all ifgrams
  dem_height_m           Elevation from DEM
  incidence_angle_deg    Radar incidence angle (affects LOS-to-vertical conversion)
  deformation_flag       1 if |mean_velocity| > threshold, else 0      [classification target]
  ── Engineered time features (for non-sequential models like XGBoost) ──
  year / month / doy     Calendar features
  epoch_number           Sequential image number (0-indexed)
  disp_rolling_mean_3    Rolling mean of cumulative_disp over last 3 epochs
  disp_rolling_std_3     Rolling std  of cumulative_disp over last 3 epochs
  disp_rolling_mean_6    Rolling mean over last 6 epochs
  disp_rolling_std_6     Rolling std  over last 6 epochs
  velocity_last_3ep      Instantaneous velocity over last 3 epochs (mm/day)
  velocity_last_6ep      Instantaneous velocity over last 6 epochs (mm/day)
  acceleration           Change in velocity between last 3-epoch windows
  seasonal_sin / _cos    Sine/cosine encoding of day-of-year (captures seasonal APS residuals)

Usage:
  python src/04_velocity_generation.py
  python src/velocity_generation.py --config config.yaml --demo
"""

import os
import sys
import yaml
import logging
import argparse
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
import pandas as pd
import h5py
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from scipy import stats
from sklearn.cluster import DBSCAN

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


# ── Config ────────────────────────────────────────────────────────────────────
def load_config(path: str = "config.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


# ── Load MintPy outputs ───────────────────────────────────────────────────────
def load_velocity_h5(mintpy_dir: Path) -> Tuple[np.ndarray, dict]:
    vel_path = mintpy_dir / "geo" / "geo_velocity.h5"
    if not vel_path.exists():
        vel_path = mintpy_dir / "velocity.h5"
    log.info(f"Loading velocity: {vel_path}")
    with h5py.File(vel_path, "r") as f:
        velocity = f["velocity"][:] * 1000  # m/yr -> mm/yr
        meta = dict(f.attrs)
    return velocity, meta


def load_timeseries_h5(mintpy_dir: Path) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    ts_dir = mintpy_dir / "geo"
    candidates = list(ts_dir.glob("geo_timeseries*.h5")) if ts_dir.exists() else []
    if not candidates:
        candidates = list((mintpy_dir).glob("timeseries*.h5"))
    if not candidates:
        return None, None
    ts_path = sorted(candidates, key=lambda p: len(p.name))[-1]
    log.info(f"Loading time series: {ts_path}")
    with h5py.File(ts_path, "r") as f:
        ts    = f["timeseries"][:] * 1000   # m -> mm
        dates = f["date"][:]
        if isinstance(dates[0], bytes):
            dates = [d.decode() for d in dates]
    return np.array(dates), ts


def load_aux_h5(mintpy_dir: Path) -> Tuple[Optional[np.ndarray], Optional[np.ndarray], Optional[np.ndarray]]:
    """Load optional auxiliary layers: coherence, DEM, incidence angle."""
    geo_dir = mintpy_dir / "geo"

    def _load(name_patterns):
        for pat in name_patterns:
            candidates = list((geo_dir if geo_dir.exists() else mintpy_dir).glob(pat))
            if candidates:
                with h5py.File(candidates[0], "r") as f:
                    key = list(f.keys())[0]
                    return f[key][:]
        return None

    coherence = _load(["geo_temporalCoherence.h5", "temporalCoherence.h5"])
    dem, inc  = None, None

    for pat in ["geo_geometryGeo.h5", "geometryGeo.h5"]:
        candidates = list((geo_dir if geo_dir.exists() else mintpy_dir).glob(pat))
        if candidates:
            with h5py.File(candidates[0], "r") as f:
                dem = f["height"][:]         if "height"         in f else None
                inc = f["incidenceAngle"][:] if "incidenceAngle" in f else None
            break

    return coherence, dem, inc


def extract_geo_transform(meta: dict) -> Tuple[float, float, float, float]:
    lon0 = float(meta.get("X_FIRST", 0))
    lat0 = float(meta.get("Y_FIRST", 0))
    dlon = float(meta.get("X_STEP",  0.0001))
    dlat = float(meta.get("Y_STEP", -0.0001))
    return lon0, lat0, dlon, dlat


# ── Cluster deforming areas ───────────────────────────────────────────────────
def cluster_ps_points(lats, lons, vels, threshold: float, eps_deg: float = 0.002) -> np.ndarray:
    """DBSCAN cluster on alert-level PS points; all others get cluster_id = -1."""
    cluster_ids = np.full(len(lats), -1, dtype=int)
    alert_mask  = np.abs(vels) > threshold
    if alert_mask.sum() < 5:
        return cluster_ids
    coords = np.column_stack([lats[alert_mask], lons[alert_mask]])
    labels = DBSCAN(eps=eps_deg, min_samples=5).fit_predict(coords)
    cluster_ids[alert_mask] = labels
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    log.info(f"  Found {n_clusters} spatial deformation clusters")
    return cluster_ids


# ── Core export: long-format time series ─────────────────────────────────────
def build_long_format_csv(
    velocity:    np.ndarray,
    dates:       np.ndarray,
    ts:          np.ndarray,
    meta:        dict,
    coherence:   Optional[np.ndarray],
    dem:         Optional[np.ndarray],
    inc:         Optional[np.ndarray],
    threshold:   float,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Builds the primary long-format training DataFrame.

    Returns:
      ts_long_df   — long format (one row per PS point x epoch)
      ps_meta_df   — one row per PS point with static attributes
    """
    log.info("Building long-format time series CSV...")

    lon0, lat0, dlon, dlat = extract_geo_transform(meta)
    rows, cols = np.where(~np.isnan(velocity))
    n_points   = len(rows)
    n_epochs   = len(dates)

    lats = (lat0 + rows * dlat).astype(np.float32)
    lons = (lon0 + cols * dlon).astype(np.float32)
    vels = velocity[rows, cols].astype(np.float32)

    # Cluster IDs per point
    cluster_ids = cluster_ps_points(lats, lons, vels, threshold)

    # Parse dates
    dt_index   = pd.to_datetime([str(d) for d in dates], format="%Y%m%d")
    t0         = dt_index[0]
    days_since = (dt_index - t0).days.values    # shape (n_epochs,)

    # Auxiliary layers at PS positions (if available)
    coh_vals = coherence[rows, cols].astype(np.float32) if coherence is not None else np.full(n_points, np.nan, np.float32)
    dem_vals = dem[rows, cols].astype(np.float32)       if dem       is not None else np.full(n_points, np.nan, np.float32)
    inc_vals = inc[rows, cols].astype(np.float32)       if inc       is not None else np.full(n_points, np.nan, np.float32)

    # Seasonal encoding (shared across all points, computed once)
    doy     = dt_index.day_of_year.values
    sea_sin = np.sin(2 * np.pi * doy / 365.25)
    sea_cos = np.cos(2 * np.pi * doy / 365.25)

    # Build long-format records
    records = []
    log.info(f"  Expanding {n_points:,} PS points x {n_epochs} epochs = {n_points * n_epochs:,} rows...")

    for i in range(n_points):
        ps_id = f"PS_{i:06d}"
        disp  = ts[:, rows[i], cols[i]].astype(np.float64)   # shape (n_epochs,)

        # Incremental displacement (epoch-to-epoch change)
        incremental    = np.diff(disp, prepend=disp[0])
        incremental[0] = 0.0

        # Rolling statistics (computed per point, across epochs)
        s    = pd.Series(disp)
        rm3  = s.rolling(3,  min_periods=1).mean().values
        rs3  = s.rolling(3,  min_periods=1).std().fillna(0).values
        rm6  = s.rolling(6,  min_periods=1).mean().values
        rs6  = s.rolling(6,  min_periods=1).std().fillna(0).values

        # Instantaneous velocity windows (mm/day)
        def vel_window(w):
            v = np.full(n_epochs, np.nan)
            for j in range(w, n_epochs):
                delta_t = days_since[j] - days_since[j - w]
                if delta_t > 0:
                    v[j] = (disp[j] - disp[j - w]) / delta_t
            v_series = pd.Series(v)
            return v_series.bfill().fillna(0).values

        v3    = vel_window(3)
        v6    = vel_window(6)
        accel = np.gradient(v3, days_since)

        for j in range(n_epochs):
            records.append({
                # Identifiers
                "ps_id":                ps_id,
                "date":                 dt_index[j].strftime("%Y-%m-%d"),
                # Spatial
                "lat":                  round(float(lats[i]), 6),
                "lon":                  round(float(lons[i]), 6),
                "cluster_id":           int(cluster_ids[i]),
                # Time axis
                "days_since_start":     int(days_since[j]),
                "epoch_number":         j,
                "year":                 dt_index[j].year,
                "month":                dt_index[j].month,
                "doy":                  int(doy[j]),
                # Target variables
                "cumulative_disp_mm":   round(float(disp[j]),        4),
                "incremental_disp_mm":  round(float(incremental[j]), 4),
                # Static point features
                "mean_velocity_mm_yr":  round(float(vels[i]),        3),
                "coherence":            round(float(coh_vals[i]),    4),
                "dem_height_m":         round(float(dem_vals[i]),    2),
                "incidence_angle_deg":  round(float(inc_vals[i]),    3),
                "deformation_flag":     int(abs(vels[i]) > threshold),
                # Engineered rolling features
                "disp_rolling_mean_3":  round(float(rm3[j]),         4),
                "disp_rolling_std_3":   round(float(rs3[j]),         4),
                "disp_rolling_mean_6":  round(float(rm6[j]),         4),
                "disp_rolling_std_6":   round(float(rs6[j]),         4),
                "velocity_last_3ep":    round(float(v3[j]),          6),
                "velocity_last_6ep":    round(float(v6[j]),          6),
                "acceleration":         round(float(accel[j]),       8),
                # Seasonal encoding
                "seasonal_sin":         round(float(sea_sin[j]),     6),
                "seasonal_cos":         round(float(sea_cos[j]),     6),
            })

    ts_long_df = pd.DataFrame(records)

    # Build PS metadata table (one row per PS point)
    log.info("Building PS metadata table...")
    meta_records = []
    for i in range(n_points):
        ps_id = f"PS_{i:06d}"
        disp  = ts[:, rows[i], cols[i]].astype(np.float64)
        slope, intercept, r_value, _, stderr = stats.linregress(days_since, disp)
        meta_records.append({
            "ps_id":                ps_id,
            "lat":                  round(float(lats[i]), 6),
            "lon":                  round(float(lons[i]), 6),
            "cluster_id":           int(cluster_ids[i]),
            "mean_velocity_mm_yr":  round(float(vels[i]),     3),
            "coherence":            round(float(coh_vals[i]), 4),
            "dem_height_m":         round(float(dem_vals[i]), 2),
            "incidence_angle_deg":  round(float(inc_vals[i]), 3),
            "deformation_flag":     int(abs(vels[i]) > threshold),
            "linear_slope_mm_day":  round(float(slope),       8),
            "linear_r2":            round(float(r_value**2),  4),
            "linear_stderr":        round(float(stderr),      8),
            "disp_min_mm":          round(float(np.nanmin(disp)),                  3),
            "disp_max_mm":          round(float(np.nanmax(disp)),                  3),
            "disp_range_mm":        round(float(np.nanmax(disp) - np.nanmin(disp)),3),
            "disp_std_mm":          round(float(np.nanstd(disp)),                  3),
            "disp_final_mm":        round(float(disp[-1]),                         3),
            "row":                  int(rows[i]),
            "col":                  int(cols[i]),
        })

    ps_meta_df = pd.DataFrame(meta_records)

    log.info(f"  ts_long shape:  {ts_long_df.shape}  ({ts_long_df.shape[0]:,} rows x {ts_long_df.shape[1]} cols)")
    log.info(f"  ps_meta shape:  {ps_meta_df.shape}")
    log.info(f"  Deformation points: {ps_meta_df['deformation_flag'].sum():,} / {len(ps_meta_df):,}")
    return ts_long_df, ps_meta_df


# ── Wide pivot ────────────────────────────────────────────────────────────────
def build_wide_csv(ts_long_df: pd.DataFrame, output_dir: Path) -> Path:
    """
    Pivot ts_long into wide format:
      rows = ps_id, cols = date_YYYY-MM-DD, values = cumulative_disp_mm
    Useful for models that expect one feature column per timestep.
    """
    log.info("Building wide-format CSV (pivot table)...")
    wide = ts_long_df.pivot(index="ps_id", columns="date", values="cumulative_disp_mm")
    wide.columns = [f"disp_{c}" for c in wide.columns]
    wide = wide.reset_index()

    meta_cols = ts_long_df.groupby("ps_id").first()[
        ["lat", "lon", "cluster_id", "mean_velocity_mm_yr", "coherence", "dem_height_m", "deformation_flag"]
    ].reset_index()
    wide = meta_cols.merge(wide, on="ps_id")

    path = output_dir / "ts_wide.csv"
    wide.to_csv(path, index=False)
    log.info(f"  ts_wide.csv: {wide.shape[0]:,} rows x {wide.shape[1]} cols")
    return path


# ── Visualisations ────────────────────────────────────────────────────────────
def plot_velocity_map(velocity: np.ndarray, ps_meta: pd.DataFrame, output_dir: Path) -> None:
    fig, ax = plt.subplots(figsize=(12, 10))
    vmax = max(abs(np.nanpercentile(velocity, 2)), abs(np.nanpercentile(velocity, 98)), 5)
    im = ax.imshow(velocity, cmap="RdYlBu", vmin=-vmax, vmax=vmax, aspect="auto")
    alert = ps_meta[ps_meta["deformation_flag"] == 1]
    if len(alert):
        ax.scatter(alert["col"], alert["row"], c="red", s=4,
                   alpha=0.8, label=f"Deformation alerts ({len(alert):,})")
        ax.legend(loc="lower right", fontsize=9)
    cbar = plt.colorbar(im, ax=ax, fraction=0.04, pad=0.02)
    cbar.set_label("LOS Velocity (mm/year)", fontsize=10)
    ax.set_title("PSInSAR Mean Deformation Velocity Map", fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_dir / "velocity_map.png", dpi=200, bbox_inches="tight")
    plt.close()
    log.info(f"  Velocity map saved")


def plot_timeseries_samples(ts_long_df: pd.DataFrame, output_dir: Path, n_samples: int = 6) -> None:
    top_ids = (
        ts_long_df.groupby("ps_id")["mean_velocity_mm_yr"]
        .first().abs().nlargest(n_samples).index.tolist()
    )
    subset = ts_long_df[ts_long_df["ps_id"].isin(top_ids)]

    fig, axes = plt.subplots(n_samples // 2, 2, figsize=(14, 3 * (n_samples // 2)), sharex=True)
    axes = axes.flatten()

    for i, pid in enumerate(top_ids):
        pt = subset[subset["ps_id"] == pid].sort_values("days_since_start")
        dt = pd.to_datetime(pt["date"])
        ax = axes[i]
        ax.fill_between(dt,
                        pt["disp_rolling_mean_3"] - pt["disp_rolling_std_3"],
                        pt["disp_rolling_mean_3"] + pt["disp_rolling_std_3"],
                        alpha=0.2, color="blue")
        ax.plot(dt, pt["cumulative_disp_mm"],   "b-o", markersize=3, linewidth=1.2, label="Cumulative")
        ax.plot(dt, pt["disp_rolling_mean_3"], "r--",  linewidth=1,  label="Rolling mean-3")
        ax.axhline(0, color="gray", linestyle="--", alpha=0.4)
        vel = pt["mean_velocity_mm_yr"].iloc[0]
        ax.set_title(f"{pid}  |  ({pt['lat'].iloc[0]:.4f}N, {pt['lon'].iloc[0]:.4f}E)  v={vel:.1f} mm/yr")
        ax.set_ylabel("Displacement (mm)")
        ax.grid(alpha=0.3)
        if i == 0:
            ax.legend(fontsize=7)

    axes[-1].set_xlabel("Date")
    plt.suptitle("Displacement Time Series — Top Deforming PS Points", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_dir / "timeseries_top_deformation.png", dpi=150, bbox_inches="tight")
    plt.close()
    log.info(f"  Time series plot saved")


def generate_alert_report(ps_meta: pd.DataFrame, cfg: dict, output_dir: Path) -> None:
    threshold = cfg["output"]["alert_threshold_mm_per_year"]
    alert_df  = ps_meta[ps_meta["deformation_flag"] == 1]
    lines = [
        "=" * 60,
        "  PSInSAR MINE LANDSLIDE MONITORING — ALERT REPORT",
        "=" * 60,
        f"Mine:            {cfg['aoi']['name']}",
        f"Threshold:       +/-{threshold} mm/year",
        f"Total PS Points: {len(ps_meta):,}",
        f"Alert Points:    {len(alert_df):,}",
        "",
        "Top 10 Most Deforming Points:",
        "-" * 40,
    ]
    for _, row in ps_meta.nlargest(10, "mean_velocity_mm_yr").iterrows():
        sign = "subsidence" if row["mean_velocity_mm_yr"] < 0 else "uplift"
        lines.append(
            f"  {row['ps_id']}  ({row['lat']:.5f}N, {row['lon']:.5f}E)  "
            f"v={row['mean_velocity_mm_yr']:+.1f} mm/yr  R2={row['linear_r2']:.3f}  {sign}"
        )
    lines += ["", "=" * 60]
    report = "\n".join(lines)
    print(report)
    (output_dir / "alert_report.txt").write_text(report)


def export_legacy_csv(ps_meta: pd.DataFrame, output_dir: Path) -> None:
    """Keeps ps_points_velocity.csv so step 5 (visualization) still works unchanged."""
    legacy = ps_meta.rename(columns={"mean_velocity_mm_yr": "velocity_mm_yr"}).copy()
    legacy["alert"] = legacy["deformation_flag"].astype(bool)
    legacy.to_csv(output_dir / "ps_points_velocity.csv", index=False)


# ── Demo data generator ───────────────────────────────────────────────────────
def generate_demo_data(cfg: dict):
    """Realistic synthetic mine data: subsidence bowl + seasonal APS + noise."""
    log.info("Generating DEMO synthetic data...")
    bbox     = cfg["aoi"]["bbox"]
    H, W     = 120, 150
    n_epochs = 40

    np.random.seed(42)
    velocity = np.random.normal(0, 1.5, (H, W))
    Y, X     = np.ogrid[:H, :W]

    # --- Joshimath-realistic displacement field ---

    # Primary subsidence zone: upper-town (north = low Y), offset west of center
    # Joshimath town sits on an ancient landslide deposit on a steep ridge
    cy_main, cx_main = int(H * 0.35), int(W * 0.42)
    bowl_main = -45 * np.exp(
        -((Y - cy_main)**2 / 300 + (X - cx_main)**2 / 180)
    )

    # Secondary crack zone: elongated along slope direction (NE-SW strike)
    # Mimics the linear crack pattern seen in Joshimath Jan 2023
    cy2, cx2 = int(H * 0.48), int(W * 0.55)
    bowl2 = -18 * np.exp(
        -((Y - cy2)**2 / 120 + (X - cx2)**2 / 350)   # elongated E-W
    )

    # Tertiary: lower slope toe bulge (uplift due to compression at base)
    cy3, cx3 = int(H * 0.72), int(W * 0.50)
    bulge = +8 * np.exp(
        -((Y - cy3)**2 / 200 + (X - cx3)**2 / 400)
    )

    # Terrain-correlated noise: steeper slope = more variability
    slope_mask = np.linspace(0.5, 2.5, H)[:, None]  # increases downslope
    terrain_noise = np.random.normal(0, 1.0, (H, W)) * slope_mask

    velocity += bowl_main + bowl2 + bulge + terrain_noise

    # Mask out stable ridgeline (top strip) and valley floor (bottom strip)
    velocity[:int(H*0.08), :]  = np.nan   # ridge crest — no signal
    velocity[int(H*0.88):, :]  = np.nan   # river valley — incoherent
    velocity[velocity < -68]   = np.nan   # decorrelated pixels

    # --- Temporal evolution: accelerating subsidence post-monsoon ---
    dates     = pd.date_range("2022-01-01", periods=n_epochs, freq="12D")
    date_strs = np.array([d.strftime("%Y%m%d") for d in dates])
    doy_vals  = dates.day_of_year.values

    # Monsoon loading effect: acceleration Jun-Sep each year
    def monsoon_factor(date):
        doy = date.day_of_year
        # peak ~day 200 (mid-July), tapering
        return 1.0 + 1.8 * np.exp(-((doy - 200)**2) / 800)

    # APS: stronger in monsoon (higher humidity = larger tropospheric delay)
    seas_aps  = 4.5 * np.sin(2 * np.pi * doy_vals / 365.25)
    # add inter-annual trend: 2023 worse than 2022 (mirrors real event)
    year_ramp = np.array([(d.year - 2022) * 0.8 for d in dates])

    ts_3d = np.zeros((n_epochs, H, W))

    for i in range(1, n_epochs):
        dt  = (dates[i] - dates[i-1]).days
        mf  = monsoon_factor(dates[i])

        # Spatially variable acceleration: main bowl accelerates more
        accel_map = 1.0 + 0.6 * np.exp(
            -((Y - cy_main)**2 / 400 + (X - cx_main)**2 / 250)
        )

        ts_3d[i] = (
            ts_3d[i-1]
            + (velocity * accel_map * mf) / (365.25 / dt)
            + np.random.normal(0, 0.4, (H, W))             # measurement noise
            + (seas_aps[i] - seas_aps[i-1])                # APS
            + year_ramp[i] - year_ramp[i-1]                # inter-annual
        )

    meta = {
        "X_FIRST": bbox[0], "Y_FIRST": bbox[3],
        "X_STEP":  (bbox[2] - bbox[0]) / W,
        "Y_STEP": -(bbox[3] - bbox[1]) / H,
    }

    # Coherence: low on steep slopes and deep subsidence zones
    steep_penalty = np.linspace(0.0, 0.25, H)[:, None]
    coherence = np.clip(
        0.88
        - 0.45 * np.exp(-((Y - cy_main)**2 / 350 + (X - cx_main)**2 / 200))
        - 0.20 * np.exp(-((Y - cy2)**2    / 150 + (X - cx2)**2    / 400))
        - steep_penalty,
        0.15, 1.0
    ).astype(np.float32)

    # DEM: ridge in north, valley in south, Joshimath sits ~1875m ASL
    dem = (
        1875
        + 220 * (1 - Y / H)          # north ridge ~2095m, south valley ~1875m
        - 60  * np.abs(X/W - 0.5)    # lateral valley shape
        + np.random.normal(0, 3, (H, W))
    ).astype(np.float32)

    inc = np.full((H, W), 38.5, dtype=np.float32)

    return velocity, date_strs, ts_3d, meta, coherence, dem, inc


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="PSInSAR Step 4: Velocity Generation & CSV Export")
    parser.add_argument("--config",  default="config.yaml")
    parser.add_argument("--demo",    action="store_true", help="Use synthetic demo data")
    parser.add_argument("--no-wide", action="store_true", help="Skip wide-format CSV (saves memory)")
    args = parser.parse_args()

    cfg        = load_config(args.config)
    data_dir   = Path(cfg["output"]["data_dir"])
    mintpy_dir = data_dir / "mintpy_stack"
    output_dir = Path(cfg["output"]["results_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)
    threshold  = cfg["output"]["alert_threshold_mm_per_year"]

    # Load or generate data
    if args.demo:
        velocity, dates, ts, meta, coherence, dem, inc = generate_demo_data(cfg)
    else:
        velocity, meta         = load_velocity_h5(mintpy_dir)
        dates, ts              = load_timeseries_h5(mintpy_dir)
        coherence, dem, inc    = load_aux_h5(mintpy_dir)

    if dates is None or ts is None:
        log.error("No time series data found. Run MintPy first, or use --demo.")
        sys.exit(1)

    # Build DataFrames
    ts_long_df, ps_meta_df = build_long_format_csv(
        velocity, dates, ts, meta, coherence, dem, inc, threshold=threshold,
    )

    # Export CSVs
    ts_long_path = output_dir / "ts_long.csv"
    ps_meta_path = output_dir / "ps_metadata.csv"

    ts_long_df.to_csv(ts_long_path, index=False)
    ps_meta_df.to_csv(ps_meta_path, index=False)
    log.info(f"  ts_long.csv      -> {ts_long_path}  [{ts_long_df.shape[0]:,} rows x {ts_long_df.shape[1]} cols]")
    log.info(f"  ps_metadata.csv  -> {ps_meta_path}  [{ps_meta_df.shape[0]:,} rows]")

    if not args.no_wide:
        build_wide_csv(ts_long_df, output_dir)

    export_legacy_csv(ps_meta_df, output_dir)

    # Visualisations
    plot_velocity_map(velocity, ps_meta_df, output_dir)
    plot_timeseries_samples(ts_long_df, output_dir)
    generate_alert_report(ps_meta_df, cfg, output_dir)

    # Print schema guide
    print("\n" + "=" * 65)
    print("  CSV OUTPUT SCHEMA — ts_long.csv")
    print("=" * 65)
    col_groups = {
        "Identifiers":        ["ps_id", "date"],
        "Spatial":            ["lat", "lon", "cluster_id"],
        "Time axis":          ["days_since_start", "epoch_number", "year", "month", "doy"],
        "Targets":            ["cumulative_disp_mm", "incremental_disp_mm", "deformation_flag"],
        "Static point feat.": ["mean_velocity_mm_yr", "coherence", "dem_height_m", "incidence_angle_deg"],
        "Rolling features":   ["disp_rolling_mean_3", "disp_rolling_std_3",
                               "disp_rolling_mean_6", "disp_rolling_std_6"],
        "Velocity features":  ["velocity_last_3ep", "velocity_last_6ep", "acceleration"],
        "Seasonal encoding":  ["seasonal_sin", "seasonal_cos"],
    }
    for group, cols in col_groups.items():
        print(f"\n  [{group}]")
        for c in cols:
            if c in ts_long_df.columns:
                sample = ts_long_df[c].iloc[10]
                print(f"    {c:<30} e.g. {sample}")

    print("\n" + "=" * 65)
    print("  MODEL USAGE GUIDE")
    print("=" * 65)
    print("  LSTM / Transformer:")
    print("    group by ps_id, sort by days_since_start")
    print("    features: cumulative_disp_mm, incremental_disp_mm,")
    print("              velocity_last_3ep, seasonal_sin/cos, ...")
    print("    target:   cumulative_disp_mm (next N steps)")
    print()
    print("  Prophet (per-point):")
    print("    filter one ps_id -> rename date->ds, cumulative_disp_mm->y")
    print()
    print("  XGBoost / LightGBM (tabular):")
    print("    all rows, drop ps_id/date, target = cumulative_disp_mm")
    print("    or target = deformation_flag (classification)")
    print()
    print("  Wide format (ts_wide.csv):")
    print("    sklearn / classical ML: one row per PS point")
    print("    feature cols = disp_YYYY-MM-DD for each epoch")
    print("=" * 65 + "\n")

    log.info("DONE. Primary training file: %s", ts_long_path)
    log.info("Next step: python src/05_visualization.py")


if __name__ == "__main__":
    main()