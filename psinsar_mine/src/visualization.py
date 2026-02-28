"""
Step 5: Visualization & Early Warning Dashboard
================================================
Creates interactive and static visualizations of PSInSAR results:
  - Interactive HTML map (Folium) with PS points colored by velocity
  - Deformation time series dashboard
  - Mine risk zone overlay
  - CSV → alert notifications

Usage:
  python src/05_visualization.py
  python src/05_visualization.py --config config.yaml --demo
"""

import os
import sys
import yaml
import logging
import argparse
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import matplotlib.colors as mcolors
from scipy import stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


def load_config(path: str = "config.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def load_ps_dataframe(results_dir: Path) -> pd.DataFrame:
    csv_path = results_dir / "ps_points_velocity.csv"
    if not csv_path.exists():
        log.error(f"CSV not found: {csv_path}\nRun step 4 first.")
        sys.exit(1)
    df = pd.read_csv(csv_path)
    log.info(f"Loaded {len(df):,} PS points from CSV")
    return df


# ── Interactive Folium map ────────────────────────────────────────────────────
def create_interactive_map(df: pd.DataFrame, cfg: dict, output_dir: Path) -> Path:
    """
    Create a Folium (Leaflet.js) interactive HTML map.
    PS points are colored by velocity (blue=uplift, red=subsidence).
    """
    try:
        import folium
        from folium.plugins import MarkerCluster, HeatMap
    except ImportError:
        log.warning("folium not installed. Skipping interactive map.")
        return None

    bbox    = cfg["aoi"]["bbox"]
    center  = [(bbox[1] + bbox[3]) / 2, (bbox[0] + bbox[2]) / 2]
    thresh  = cfg["output"]["alert_threshold_mm_per_year"]

    log.info("Building interactive Folium map...")
    m = folium.Map(
        location=center,
        zoom_start=13,
        tiles="CartoDB positron",
    )

    # Add satellite layer toggle
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="ESRI World Imagery",
        name="Satellite",
    ).add_to(m)

    # Color scale: blue (uplift) → white → red (subsidence)
    vmax = df["velocity_mm_yr"].abs().quantile(0.98)
    norm = mcolors.Normalize(vmin=-vmax, vmax=vmax)
    cmap = cm.RdYlBu

    def vel_to_color(v):
        r, g, b, _ = cmap(norm(v))
        return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"

    # Add PS points as circle markers
    # Sample down to max 5000 for performance
    sample_df = df.sample(min(5000, len(df)), random_state=42)

    ps_layer    = folium.FeatureGroup(name="All PS Points", show=True)
    alert_layer = folium.FeatureGroup(name="⚠ Alert Points", show=True)

    for _, row in sample_df.iterrows():
        color  = vel_to_color(row["velocity_mm_yr"])
        radius = 3 if not row.get("alert", False) else 6

        popup_html = f"""
        <b>PS Point</b><br>
        Lat: {row['lat']:.5f}°N<br>
        Lon: {row['lon']:.5f}°E<br>
        <b>Velocity: {row['velocity_mm_yr']:+.1f} mm/yr</b><br>
        {'<span style="color:red">⚠ ALERT</span>' if row.get('alert') else ''}
        """

        marker = folium.CircleMarker(
            location=[row["lat"], row["lon"]],
            radius=radius,
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.8,
            popup=folium.Popup(popup_html, max_width=200),
        )

        if row.get("alert", False):
            marker.add_to(alert_layer)
        else:
            marker.add_to(ps_layer)

    ps_layer.add_to(m)
    alert_layer.add_to(m)

    # Add heatmap of deformation intensity
    heat_data = [
        [row["lat"], row["lon"], abs(row["velocity_mm_yr"]) / vmax]
        for _, row in df[df["alert"]].iterrows()
        if abs(row["velocity_mm_yr"]) > thresh
    ]
    if heat_data:
        HeatMap(heat_data, name="Deformation Heatmap", show=False,
                radius=15, blur=10, max_zoom=1).add_to(m)

    # Add mine AOI boundary
    folium.Rectangle(
        bounds=[[bbox[1], bbox[0]], [bbox[3], bbox[2]]],
        color="yellow",
        weight=2,
        fill=False,
        popup=f"Mine AOI: {cfg['aoi']['name']}",
        name="Mine Boundary",
    ).add_to(m)

    # Add legend
    legend_html = f"""
    <div style="position:fixed; bottom:40px; right:10px; z-index:1000;
                background:white; padding:12px; border:2px solid #ccc;
                border-radius:6px; font-size:12px; min-width:180px;">
      <b>PSInSAR Velocity (mm/yr)</b><br>
      <span style="color:#2166ac">■</span> Uplift (+) &nbsp;
      <span style="color:#d73027">■</span> Subsidence (−)<br><br>
      <span style="color:red; font-size:14px">●</span>
      ⚠ Alert: |v| > {thresh} mm/yr
    </div>
    """
    m.get_root().html.add_child(folium.Element(legend_html))

    folium.LayerControl().add_to(m)

    out_path = output_dir / "interactive_map.html"
    m.save(str(out_path))
    log.info(f"  Interactive map saved: {out_path}")
    return out_path


# ── Dashboard figure ──────────────────────────────────────────────────────────
def create_dashboard(df: pd.DataFrame, cfg: dict, output_dir: Path) -> None:
    """
    Static matplotlib dashboard showing:
      - Velocity histogram
      - Spatial scatter plot
      - Alert summary pie chart
      - Top deforming locations
    """
    fig = plt.figure(figsize=(18, 12))
    fig.suptitle(
        f"PSInSAR Mine Deformation Dashboard — {cfg['aoi']['name']}",
        fontsize=16, fontweight="bold", y=0.98
    )
    gs = fig.add_gridspec(2, 3, hspace=0.35, wspace=0.3)

    # ── Panel 1: Velocity histogram ─────────────────────────────────────────
    ax1 = fig.add_subplot(gs[0, 0])
    vels = df["velocity_mm_yr"].dropna()
    ax1.hist(vels, bins=60, color="#4472C4", edgecolor="white", linewidth=0.3)
    ax1.axvline(0, color="black", linestyle="--", linewidth=1)
    thresh = cfg["output"]["alert_threshold_mm_per_year"]
    ax1.axvline(thresh,  color="red", linestyle=":", linewidth=1.5, label=f"+{thresh} mm/yr")
    ax1.axvline(-thresh, color="red", linestyle=":", linewidth=1.5, label=f"−{thresh} mm/yr")
    ax1.set_xlabel("Velocity (mm/year)")
    ax1.set_ylabel("Number of PS Points")
    ax1.set_title("Velocity Distribution")
    ax1.legend(fontsize=8)

    # ── Panel 2: Spatial scatter ─────────────────────────────────────────────
    ax2 = fig.add_subplot(gs[0, 1:])
    vmax = np.percentile(vels.abs(), 98)
    sc   = ax2.scatter(
        df["lon"], df["lat"], c=df["velocity_mm_yr"],
        cmap="RdYlBu", vmin=-vmax, vmax=vmax,
        s=1, alpha=0.6
    )
    alert_df = df[df["alert"]]
    if len(alert_df):
        ax2.scatter(
            alert_df["lon"], alert_df["lat"],
            c="red", s=20, marker="^", alpha=0.9,
            label=f"⚠ Alerts ({len(alert_df)})", zorder=5
        )
        ax2.legend(fontsize=9, markerscale=0.8)
    cbar = plt.colorbar(sc, ax=ax2)
    cbar.set_label("Velocity (mm/yr)")
    ax2.set_xlabel("Longitude (°E)")
    ax2.set_ylabel("Latitude (°N)")
    ax2.set_title("PS Point Velocity Map (LOS)")
    ax2.set_aspect("equal")

    # ── Panel 3: Alert pie chart ─────────────────────────────────────────────
    ax3 = fig.add_subplot(gs[1, 0])
    n_alert  = df["alert"].sum()
    n_stable = len(df) - n_alert
    ax3.pie(
        [n_stable, n_alert],
        labels=[f"Stable\n({n_stable:,})", f"⚠ Alert\n({n_alert:,})"],
        colors=["#70AD47", "#FF0000"],
        autopct="%1.1f%%",
        startangle=90,
        wedgeprops={"linewidth": 1, "edgecolor": "white"},
    )
    ax3.set_title("PS Point Status")

    # ── Panel 4: Top deforming points ────────────────────────────────────────
    ax4 = fig.add_subplot(gs[1, 1:])
    top10 = df.nlargest(10, "velocity_mm_yr")
    colors = ["red" if a else "#4472C4" for a in top10["alert"]]
    labels = [f"({r.lat:.4f}°, {r.lon:.4f}°)" for _, r in top10.iterrows()]
    ax4.barh(range(len(top10)), top10["velocity_mm_yr"].values, color=colors)
    ax4.set_yticks(range(len(top10)))
    ax4.set_yticklabels(labels, fontsize=8)
    ax4.axvline(thresh, color="red", linestyle="--", linewidth=1)
    ax4.set_xlabel("Velocity (mm/year)")
    ax4.set_title("Top 10 Most Deforming PS Points")
    ax4.invert_yaxis()

    plt.savefig(output_dir / "dashboard.png", dpi=180, bbox_inches="tight")
    plt.close()
    log.info(f" Dashboard saved: {output_dir / 'dashboard.png'}")


# ── Forecasting ───────────────────────────────────────────────────────────────
def forecast_deformation(df: pd.DataFrame, output_dir: Path, forecast_days: int = 180) -> pd.DataFrame:
    """
    Simple linear extrapolation to forecast future cumulative displacement.
    For each PS point with valid velocity, project out `forecast_days` days.
    Flags points that will likely exceed 50mm cumulative displacement.
    """
    log.info(f" Forecasting {forecast_days}-day displacement...")
    df["forecast_mm"] = df["velocity_mm_yr"] * (forecast_days / 365.25)
    df["forecast_alert"] = df["forecast_mm"].abs() > 50  # >50mm = high risk

    n_forecast_alert = df["forecast_alert"].sum()
    log.info(f"  Forecast alerts (>{50}mm in {forecast_days} days): {n_forecast_alert}")

    forecast_csv = output_dir / "ps_forecast.csv"
    df[["lat", "lon", "velocity_mm_yr", "forecast_mm", "alert", "forecast_alert"]].to_csv(
        forecast_csv, index=False
    )
    log.info(f"  Forecast CSV: {forecast_csv}")
    return df


# ── Summary stats ─────────────────────────────────────────────────────────────
def print_summary(df: pd.DataFrame, cfg: dict) -> None:
    print("\n" + "=" * 60)
    print(f"  PSINSAR SUMMARY — {cfg['aoi']['name']}")
    print("=" * 60)
    print(f"  Total PS Points:    {len(df):,}")
    print(f"  Mean velocity:      {df['velocity_mm_yr'].mean():.2f} mm/yr")
    print(f"  Std velocity:       {df['velocity_mm_yr'].std():.2f} mm/yr")
    print(f"  Max subsidence:     {df['velocity_mm_yr'].min():.1f} mm/yr")
    print(f"  Max uplift:         {df['velocity_mm_yr'].max():.1f} mm/yr")
    print(f"  ⚠ Alert points:    {df['alert'].sum():,}")
    print("=" * 60 + "\n")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="PSInSAR Step 5: Visualization")
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--demo", action="store_true",
                        help="Generate demo data if CSV doesn't exist")
    args = parser.parse_args()

    cfg        = load_config(args.config)
    output_dir = Path(cfg["output"]["results_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    csv_path = output_dir / "ps_points_velocity.csv"
    if not csv_path.exists() and args.demo:
        log.info("Demo mode: generating synthetic PS data...")
        # Generate synthetic data
        n = 5000
        bbox = cfg["aoi"]["bbox"]
        lats = np.random.uniform(bbox[1], bbox[3], n)
        lons = np.random.uniform(bbox[0], bbox[2], n)
        # Create a subsidence bowl in center
        center_lat = (bbox[1] + bbox[3]) / 2
        center_lon = (bbox[0] + bbox[2]) / 2
        dist = np.sqrt((lats - center_lat)**2 + (lons - center_lon)**2)
        vels = np.random.normal(0, 2, n) - 25 * np.exp(-dist**2 / 0.002)
        df = pd.DataFrame({"lat": lats, "lon": lons, "velocity_mm_yr": vels})
        df["row"] = ((bbox[3] - df["lat"]) / (bbox[3] - bbox[1]) * 200).astype(int)
        df["col"] = ((df["lon"] - bbox[0]) / (bbox[2] - bbox[0]) * 250).astype(int)
        df["alert"] = df["velocity_mm_yr"].abs() > cfg["output"]["alert_threshold_mm_per_year"]
        df["cluster"] = -1
        df.to_csv(csv_path, index=False)

    df = load_ps_dataframe(output_dir)

    # 5.1 Print summary
    print_summary(df, cfg)

    # 5.2 Forecast
    df = forecast_deformation(df, output_dir)

    # 5.3 Dashboard
    create_dashboard(df, cfg, output_dir)

    # 5.4 Interactive map
    if cfg["output"].get("generate_html_map", True):
        create_interactive_map(df, cfg, output_dir)

    log.info("\n ALL DONE!")
    log.info(f"     Results in: {output_dir}")
    log.info(f"      Open: {output_dir / 'interactive_map.html'}")
    log.info(f"     Dashboard: {output_dir / 'dashboard.png'}")
    log.info(f"     Data: {output_dir / 'ps_points_velocity.csv'}")
    


if __name__ == "__main__":
    main()