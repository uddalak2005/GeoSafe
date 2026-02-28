import fs from "fs";
import path from "path";
import Worker from "../models/worker.model.js";
import { sendSMSForWorkers } from "./smsAlert.util.js";

// Helper: Haversine distance between two [lng, lat] points in meters
function haversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Utility: Check if worker is near a High Risk Point (within 20 meters)
async function checkWorkersInHighRiskZones() {
  try {
    // Load GeoJSON
    const geojsonPath = path.resolve("data/synthetic_ps_points.geojson");
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));

    // Filter High Risk Points
    const highRiskPoints = geojson.features.filter(
      (f) =>
        f.properties &&
        f.properties.risk === "High" &&
        f.geometry &&
        f.geometry.type === "Point"
    );

    // Get all workers
    const workers = await Worker.find();
    const workersInHighRisk = [];
    const workerIdsInHighRisk = [];
    const thresholdMeters = 20;

    // Check each worker against high risk zones
    for (let worker of workers) {
      if (!worker.currentLocation || !worker.currentLocation.coordinates)
        continue;

      const workerCoord = worker.currentLocation.coordinates;
      let isInRiskZone = false;

      for (let zone of highRiskPoints) {
        const zoneCoord = zone.geometry.coordinates;
        const dist = haversineDistance(workerCoord, zoneCoord);
        if (dist <= thresholdMeters) {
          workersInHighRisk.push(worker);
          workerIdsInHighRisk.push(worker._id.toString());
          isInRiskZone = true;
          break;
        }
      }
    }

    // Update ALL workers' riskZone status
    for (let worker of workers) {
      const isInRisk = workerIdsInHighRisk.includes(worker._id.toString());

      // Only update if the status has changed
      if (worker.riskZone !== isInRisk) {
        await Worker.findByIdAndUpdate(worker._id, {
          $set: {
            riskZone: isInRisk,
          },
        });
      }
    }

    // Log and send SMS for workers currently in high risk zones
    if (workersInHighRisk.length > 0) {
      console.log(
        "Workers in High Risk Zones:",
        workersInHighRisk.map((w) => w._id)
      );
      // Send SMS for newly detected workers (optional - you may want to add logic to avoid spam)
      workersInHighRisk.forEach(async (w) => {
        sendSMSForWorkers(w._id);
      });
    } else {
      console.log("No workers in High Risk Zones.");
    }

    return workersInHighRisk;
  } catch (err) {
    console.log("Error in checkWorkersInHighRiskZones:", err.message);
    return [];
  }
}

// Utility: Run check every 20 seconds
function startHighRiskZoneMonitor() {
  checkWorkersInHighRiskZones();
  setInterval(checkWorkersInHighRiskZones, 10000);
}

export { checkWorkersInHighRiskZones, startHighRiskZoneMonitor };
