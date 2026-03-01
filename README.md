# GeoSafe 🛰️
### *Because disasters shouldn't come as a surprise*

GeoSafe is an AI-powered rockfall prediction and worker safety platform for open-pit mines. It combines satellite-based InSAR displacement monitoring with real-time worker tracking to shift mine safety from **reactive response** to **proactive prevention**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Modules](#core-modules)
- [Technical Architecture](#technical-architecture)
- [Methodology](#methodology)
- [Feasibility & Viability](#feasibility--viability)
- [Impact & Benefits](#impact--benefits)
- [References](#references)
- [Team](#team)

---

## Overview

Open-pit mines face sudden slope failures and rockfalls that cause loss of life, operational shutdowns, and major financial damage. Existing monitoring systems are reactive and provide no predictive early warnings or real-time worker-level risk visibility.

GeoSafe addresses this gap through an integrated AI-driven system that:
- Forecasts slope instability before collapse occurs
- Tracks every worker in real-time
- Instantly alerts supervisors when workers enter danger zones

---

## Core Modules

### 🔭 RakshaDrishti — *See the risks before they strike*
Leverages multi-temporal SAR imagery processed with advanced **PSInSAR techniques** to detect and monitor field displacement. Builds a time-series forecasting model integrating:
- Ascending/descending geometries
- Sensitivity indices (TGNSS, PGNSS, Hterrain)
- Regression-based acceleration models
- ARIMA/ML methods with threshold-based early warning

### 👷 MineTrack — *Every worker, every step, always visible*
Integrates an **RFID-enabled LoRa GPS module** directly into mandatory mine helmets so that:
- Every worker's location is continuously tracked without extra devices
- Each helmet carries a unique ID for real-time dashboard monitoring
- Low-power, long-range LoRa communication ensures reliability in remote areas

### 🚧 Geo-Guardian — *No step into danger, every step in safety*
Geo-fences hazard zones derived from RakshaDrishti data:
- Instantly detects and records whenever a worker's location overlaps a danger zone
- Links each worker ID with spatial hazard maps for automatic real-time alerts
- Dynamically updates geo-fence boundaries as displacement trends evolve

### 📊 RakshaManch — *One command center for total mine safety*
Unified supervisor dashboard that:
- Integrates displacement-based hazard zoning with real-time worker positioning
- Automatically generates alerts linked to a worker's ID and precise coordinates when they enter a red zone
- Enables supervisors to initiate evacuation protocols, log incidents, and monitor hazard evolution

---

## Technical Architecture

| Layer | Technologies |
|---|---|
| **Data Ingestion & Pre-processing** | SAR satellite imagery, InSAR processing pipelines |
| **Core AI/ML Brain** | Python, PyTorch / TensorFlow, ARIMA, regression models |
| **Application Backend** | Node.js, Express |
| **Frontend** | Vite, React, Tailwind CSS |
| **Edge Devices** | RFID-LoRa-GPS helmets, field alert mics |
| **DevOps** | Docker, AWS, Grafana |

**Infrastructure Requirements:** RFID-LoRa-GPS helmets, hybrid LoRa-mesh networking, AWS cloud, offline sync, monitoring system, supervisor wireless communication, dashboards, and field alert mics.

---

## Methodology

GeoSafe processes SAR data using the **PSInSAR (Persistent Scatterer InSAR)** technique:

1. **Stack SLC Images** — Collect multi-temporal SAR imagery
2. **Pre-processing** — Coregistration and interferogram generation
3. **Estimation** — PS point identification and selection, APS estimation and removal, resampled velocity map generation
4. **Visualization & Interpretation** — Hazard zoning and displacement mapping

---

## Feasibility & Viability

**Technical Feasibility**
- All core technologies (InSAR, GPS, LoRa, RFID) are proven and commercially available
- Off-the-shelf hardware modules ensure rugged, low-power, reliable integration
- Simple interfaces and guided workflows minimize training requirements

**Market & Economic Viability**
- Target market: Open-pit mining firms globally seeking scalable safety and compliance solutions
- Business model: SaaS subscription per mine site
- ROI driven by accident prevention, reduced operational shutdowns, lower insurance premiums, and streamlined monitoring costs
- Key competitor: TRE ALTAMIRA (InSAR monitoring) — GeoSafe differentiates through GPS + LoRa + RFID integration, real-time alerts, and scalable AWS-driven safety infrastructure

---

## Impact & Benefits

| Category | Benefit |
|---|---|
| 🧑‍🤝‍🧑 **Social** | Reduces worker hazard exposure; faster emergency response and evacuation |
| 💰 **Economic** | Cuts delays, financial losses, and high accident compensation costs |
| 🌿 **Environmental** | Prevents unplanned excavation and slope failures; protects ecosystems |
| 🤖 **Predictive AI** | Enables mine planners to take proactive, data-driven decisions |

Projected impact (2026–2034): Significant reduction in annual lives lost and economic losses compared to mines operating without an AI-powered prediction system.

---

## References

- Bar, N., & Dixon, R. (2021). Practical application of InSAR for slope performance monitoring and risk management across multiple surface mines. *Engineering Geology, 293*, 106326.
- Tao, Q., Liu, R., Li, X. et al. (2025). A method for monitoring three-dimensional surface deformation in mining areas combining SBAS-InSAR, GNSS and probability integral method. *Sci Rep 15*, 2853. https://doi.org/10.1038/s41598-025-87087-4
- Senanayake, I., Hartmann, P., Giacomini, A., Huang, J., & Thoeni, K. (2024). Prediction of rockfall hazard in open pit mines using a regression-based machine learning model. *International Journal of Rock Mechanics and Mining Sciences, 177*, 105727.
- Yuan, L. et al. (2022). Mine slope stability based on fusion technology of InSAR monitoring and numerical simulation. *Journal of Sensors, 2022*, 8643586.
- Wang, Z. et al. (2024). Monitoring mine deformation by integrating SBAS-InSAR and probabilistic integral method. *Proceedings of SPIE, 12988*, 129880X.

---

## Team

**©BongoBoltu**

| Name |
|---|
| Uddalak Mukhopadhyay |
| Sayantan Patra |
| Nirupon Pal |
| Souherdya Sarkar |

---

> *GeoSafe Transforming mine safety from reactive response to proactive prevention.*
