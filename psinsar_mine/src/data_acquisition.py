"""
Step 1: Data Acquisition
========================
Uses the ASF Search Python package to find Sentinel-1 SLC granules
covering your mine area, then submits them to HyP3 for InSAR processing.

Requirements:
  - NASA Earthdata credentials in ~/.netrc
  - pip install hyp3-sdk asf-search

Usage:
  python src/01_data_acquisition.py                  # full run
  python src/01_data_acquisition.py --dry-run        # search + cost estimate only, no submit
  python src/01_data_acquisition.py --resume         # your jobs are already submitted — just watch + download
  python src/01_data_acquisition.py --download-only  # jobs already done — just download
"""

import os
import sys
import json
import yaml
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Tuple, Optional

import asf_search as asf
import hyp3_sdk as sdk

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)


def load_config(path: str = "config.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)

def search_sentinel1_granules(cfg: dict) -> List[asf.ASFProduct]:
    aoi_cfg  = cfg["aoi"]
    time_cfg = cfg["time_range"]
    s1_cfg   = cfg["sentinel1"]

    bbox = aoi_cfg["bbox"]
    wkt_poly = (
        f"POLYGON(({bbox[0]} {bbox[1]}, "
        f"{bbox[2]} {bbox[1]}, "
        f"{bbox[2]} {bbox[3]}, "
        f"{bbox[0]} {bbox[3]}, "
        f"{bbox[0]} {bbox[1]}))"
    )

    log.info("Searching ASF for Sentinel-1 SLC granules...")
    log.info(f"  AOI: {aoi_cfg['name']}  |  bbox: {bbox}")
    log.info(f"  Period: {time_cfg['start']} to {time_cfg['end']}")

    results = asf.search(
        platform        = [asf.PLATFORM.SENTINEL1],
        processingLevel = [asf.PRODUCT_TYPE.SLC],
        beamMode        = [asf.BEAMMODE.IW],
        flightDirection = s1_cfg.get("flight_direction", "DESCENDING"),
        start           = time_cfg["start"],
        end             = time_cfg["end"],
        intersectsWith  = wkt_poly,
        maxResults      = 2000,
    )

    log.info(f"  Found {len(results)} SLC granules")
    if len(results) < 15:
        log.warning("PSInSAR requires at least 15 images. Consider expanding date range.")
    return results


# ── 2. Select SBAS pairs ──────────────────────────────────────────────────────
def select_sbas_pairs(
    granules: List[asf.ASFProduct],
    max_temp_days: int = 48,
    max_n_secondaries: int = 3,
    max_total_pairs: int = 200,
) -> List[Tuple[asf.ASFProduct, asf.ASFProduct]]:
    """
    Build a LEAN SBAS network. Each image pairs with at most
    max_n_secondaries temporal neighbours within max_temp_days.
    This keeps cost linear (not quadratic) with image count.
    """
    sorted_granules = sorted(granules, key=lambda g: g.properties["startTime"])

    pairs = []
    for i, ref in enumerate(sorted_granules):
        ref_dt    = datetime.fromisoformat(ref.properties["startTime"].replace("Z", ""))
        connected = 0

        for sec in sorted_granules[i + 1:]:
            if connected >= max_n_secondaries:
                break
            if len(pairs) >= max_total_pairs:
                log.warning(f"  Reached max_total_pairs cap ({max_total_pairs}). Stopping.")
                break

            sec_dt     = datetime.fromisoformat(sec.properties["startTime"].replace("Z", ""))
            delta_days = (sec_dt - ref_dt).days

            if delta_days > max_temp_days:
                break

            pairs.append((ref, sec))
            connected += 1

        if len(pairs) >= max_total_pairs:
            break

    log.info(f"  SBAS network: {len(sorted_granules)} images -> {len(pairs)} pairs")
    log.info(f"  (max {max_n_secondaries} neighbours/image, max dt={max_temp_days} days)")
    return pairs


# ── 3. Credit check ───────────────────────────────────────────────────────────
def check_credits(hyp3: sdk.HyP3) -> int:
    """
    Get remaining HyP3 credits.
    Handles all SDK versions:
      - Newer SDK:  hyp3.check_credits()           returns int or None
      - Older SDK:  hyp3.my_info()                 returns a dict
    """
    # Try the dedicated method first (current SDK)
    if hasattr(hyp3, "check_credits"):
        try:
            remaining = hyp3.check_credits()
            if remaining is None:
                return 999999   # unlimited account
            return int(remaining)
        except Exception:
            pass

    # Fallback: my_info() returns a dict in some SDK versions
    try:
        info = hyp3.my_info()
        if isinstance(info, dict):
            # Key varies by SDK version
            for key in ("remaining_credits", "remainingCredits", "quota", "credits"):
                if key in info:
                    val = info[key]
                    return 999999 if val is None else int(val)
        # Newer SDK returns an object
        elif hasattr(info, "remaining_credits"):
            val = info.remaining_credits
            return 999999 if val is None else int(val)
    except Exception:
        pass

    # Can't determine credits — warn and continue
    log.warning("Could not retrieve credit balance. Proceeding without credit check.")
    return 999999


# ── 4. Submit jobs to HyP3 (with budget guard) ───────────────────────────────
def submit_hyp3_jobs(
    pairs: List[Tuple[asf.ASFProduct, asf.ASFProduct]],
    cfg: dict,
    dry_run: bool = False,
    budget_cap: Optional[int] = None,
) -> List[sdk.Job]:
    """
    Submit InSAR jobs safely. Returns a plain list of Job objects
    (NOT nested Batches) so hyp3.watch() works correctly.
    """
    hyp3_cfg = cfg["hyp3"]
    job_name = hyp3_cfg["job_name"]

    log.info("Connecting to HyP3...")
    hyp3 = sdk.HyP3()

    # Credit check
    remaining  = check_credits(hyp3)
    cost       = len(pairs)

    log.info(f"  Credits remaining : {remaining:,}")
    log.info(f"  Estimated cost    : {cost:,}  ({cost} pairs x 1 credit each)")
    log.info(f"  Credits after job : {remaining - cost:,}")

    if cost > remaining:
        raise RuntimeError(
            f"ABORTED: Job costs {cost} credits but you only have {remaining}. "
            f"Reduce max_total_pairs in config or wait for monthly reset."
        )
    if budget_cap and cost > budget_cap:
        raise RuntimeError(
            f"ABORTED: Job costs {cost} credits which exceeds budget_cap={budget_cap}. "
            f"Lower max_total_pairs or raise budget_cap_credits in config."
        )

    if dry_run:
        log.info("DRY RUN — no jobs submitted.")
        return []

    # Confirmation prompt
    print(f"\n{'='*55}")
    print(f"  About to submit {len(pairs)} InSAR jobs to HyP3")
    print(f"  Cost: {cost} credits  |  Remaining after: {remaining - cost}")
    print(f"  Job name: {job_name}")
    print(f"{'='*55}")
    answer = input("  Proceed? (yes/no): ").strip().lower()
    if answer not in ("yes", "y"):
        log.info("Submission cancelled.")
        return []

    # Submit in batches of 50, collect plain Job objects
    BATCH_SIZE = 50
    all_jobs: List[sdk.Job] = []
    total = len(pairs)

    log.info(f"Submitting {total} jobs in batches of {BATCH_SIZE}...")

    for batch_start in range(0, total, BATCH_SIZE):
        batch_pairs = pairs[batch_start : batch_start + BATCH_SIZE]
        batch_end   = min(batch_start + BATCH_SIZE, total)
        log.info(f"  Submitting jobs {batch_start + 1}-{batch_end} / {total} ...")

        for ref, sec in batch_pairs:
            job = hyp3.submit_insar_job(
                granule1             = ref.properties["sceneName"],
                granule2             = sec.properties["sceneName"],
                name                 = job_name,
                apply_water_mask     = hyp3_cfg.get("apply_water_mask", True),
                include_dem          = hyp3_cfg.get("include_dem", True),
                include_look_vectors = hyp3_cfg.get("include_look_vectors", True),
                include_inc_map      = hyp3_cfg.get("include_inc_map", True),
            )
            all_jobs.append(job)

        log.info(f"  {len(all_jobs)}/{total} submitted so far")

    log.info(f"  All {len(all_jobs)} jobs submitted successfully.")
    return all_jobs



def fetch_existing_jobs(cfg: dict) -> List[sdk.Job]:
    job_name = cfg["hyp3"]["job_name"]
    log.info(f"Fetching existing HyP3 jobs with name '{job_name}'...")

    hyp3 = sdk.HyP3()
    batch = hyp3.find_jobs(name=job_name)
    jobs = batch.jobs  

    if not jobs:
        return []

    log.info(f"  Found {len(jobs)} existing jobs")



    from collections import Counter

    status_counts = Counter(j.status_code for j in jobs)
    for status, count in status_counts.items():
        log.info(f"  {status}: {count} jobs")

    return jobs


def watch_and_download(jobs: List[sdk.Job], cfg: dict) -> Path:
    """
    Custom polling loop — replaces hyp3.watch() which is broken in some
    SDK versions because _count_statuses() iterates self.jobs and expects
    Job objects, but gets Batch objects instead.
    """
    import time

    data_dir = Path(cfg["output"]["data_dir"]) / "interferograms"
    data_dir.mkdir(parents=True, exist_ok=True)

    hyp3       = sdk.HyP3()
    job_ids    = [j.job_id for j in jobs]
    total      = len(job_ids)
    interval   = 60    
    timeout    = 10800 
    start_time = time.time()

    log.info(f"Watching {total} jobs (polling every {interval}s, timeout {timeout//3600}h)...")

    while True:
        # Check timeout
        elapsed = time.time() - start_time
        if elapsed > timeout:
            log.error(f"Timeout after {timeout//3600}h. Run with --resume to continue.")
            break

        # Fetch current status of all jobs by ID
        running_jobs   = []
        succeeded_jobs = []
        failed_jobs    = []
        pending_jobs   = []

        for job_id in job_ids:
            try:
                job = hyp3.get_job_by_id(job_id)
                status = job.status_code
                if status == "SUCCEEDED":
                    succeeded_jobs.append(job)
                elif status == "FAILED":
                    failed_jobs.append(job)
                elif status == "RUNNING":
                    running_jobs.append(job)
                else:
                    pending_jobs.append(job)   # PENDING or QUEUED
            except Exception as e:
                log.warning(f"Could not fetch job {job_id}: {e}")

        done  = len(succeeded_jobs) + len(failed_jobs)
        pct   = done / total * 100
        elapsed_min = int(elapsed // 60)

        log.info(
            f"  [{elapsed_min}min]  "
            f"SUCCEEDED={len(succeeded_jobs)}  "
            f"RUNNING={len(running_jobs)}  "
            f"PENDING={len(pending_jobs)}  "
            f"FAILED={len(failed_jobs)}  "
            f"({pct:.0f}% done)"
        )

        # All finished
        if len(running_jobs) == 0 and len(pending_jobs) == 0:
            log.info("All jobs finished!")
            break

        time.sleep(interval)

    # Download succeeded jobs
    log.info(f"Downloading {len(succeeded_jobs)} completed interferograms to: {data_dir}")
    if succeeded_jobs:
        succeeded_batch = sdk.Batch(succeeded_jobs)
        succeeded_batch.download_files(location=data_dir)

    if failed_jobs:
        log.warning(f"{len(failed_jobs)} jobs failed. Check https://hyp3-docs.asf.alaska.edu/")
        for j in failed_jobs[:5]:
            log.warning(f"  Failed job ID: {j.job_id}")

    log.info(f"Download complete. {len(succeeded_jobs)} interferograms in: {data_dir}")
    return data_dir


# ── 7. Save manifest ──────────────────────────────────────────────────────────
def save_granule_manifest(granules, pairs, output_dir: Path) -> None:
    manifest = {
        "granules": [g.properties["sceneName"] for g in granules],
        "pairs": [
            {"reference": r.properties["sceneName"], "secondary": s.properties["sceneName"]}
            for r, s in pairs
        ],
    }
    path = output_dir / "granule_manifest.json"
    path.write_text(json.dumps(manifest, indent=2))
    log.info(f"  Granule manifest saved: {path}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="PSInSAR Step 1: Data Acquisition")
    parser.add_argument("--config",        default="config.yaml")
    parser.add_argument("--dry-run",       action="store_true", help="Estimate cost only, no submit")
    parser.add_argument("--skip-download", action="store_true", help="Submit but don't wait/download")
    parser.add_argument("--resume",        action="store_true",
                        help="Jobs already submitted — fetch them by name and watch/download")
    parser.add_argument("--download-only", action="store_true",
                        help="Jobs already finished — fetch completed jobs and download")
    args = parser.parse_args()

    cfg        = load_config(args.config)
    output_dir = Path(cfg["output"]["data_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── RESUME PATH: jobs already submitted (your current situation) ──────────
    if args.resume or args.download_only:
        jobs = fetch_existing_jobs(cfg)
        if not jobs:
            log.error("No existing jobs found with that job name. Check config.yaml -> hyp3.job_name")
            sys.exit(1)

        if args.download_only:
            # Only download jobs that are already complete
            hyp3      = sdk.HyP3()
            batch     = sdk.Batch(jobs)
            succeeded = batch.filter_jobs(succeeded=True)
            log.info(f"Downloading {len(succeeded)} already-completed jobs...")
            succeeded.download_files(location=output_dir / "interferograms")
            log.info("Download complete. Next step: python src/02_preprocessing.py")
        else:
            # Watch running jobs then download
            data_dir = watch_and_download(jobs, cfg)
            log.info(f"Done. Interferograms at: {data_dir}")
            log.info("Next step: python src/02_preprocessing.py")
        return

    # ── NORMAL PATH: search -> pair -> submit -> watch ────────────────────────
    granules = search_sentinel1_granules(cfg)
    if not granules:
        log.error("No granules found. Check AOI, date range, and flight_direction in config.")
        sys.exit(1)

    max_temp  = cfg["hyp3"].get("max_temp_baseline", 48)
    max_pairs = cfg["hyp3"].get("max_total_pairs", 200)
    pairs = select_sbas_pairs(
        granules,
        max_temp_days     = max_temp,
        max_n_secondaries = 3,
        max_total_pairs   = max_pairs,
    )
    if not pairs:
        log.error("No pairs generated. Try raising max_temp_baseline in config.")
        sys.exit(1)

    budget_cap = cfg["hyp3"].get("budget_cap_credits", 300)
    jobs = submit_hyp3_jobs(pairs, cfg, dry_run=args.dry_run, budget_cap=budget_cap)

    if args.dry_run or not jobs:
        return

    save_granule_manifest(granules, pairs, output_dir)

    if not args.skip_download:
        data_dir = watch_and_download(jobs, cfg)
        log.info(f"Done. Interferograms at: {data_dir}")
        log.info("Next step: python src/02_preprocessing.py")
    else:
        log.info("Jobs submitted. Run with --resume to watch and download later.")


if __name__ == "__main__":
    main()
