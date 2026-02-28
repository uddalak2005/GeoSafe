import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Maximize2,
  Minimize2,
  RefreshCw,
  HardHat,
  Eye,
  Layers,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface Worker {
  _id: string;
  name: string;
  workerId: string;
  helmetId: string;
  role: string;
  currentLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    timeStamp: string;
  };
  lastUpdated: string;
  __v: number;
}

interface MinersMapViewerProps {
  workers: Worker[];
  className?: string;
  isOnline?: boolean;
  lastUpdate?: string;
  onRefresh?: () => void;
}

const MinersMapViewer: React.FC<MinersMapViewerProps> = ({
  workers,
  className = "",
  isOnline = false,
  lastUpdate = "",
  onRefresh,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Role-based colors for markers
  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case "miner":
        return "#f59e0b"; // Amber
      case "engineer":
        return "#3b82f6"; // Blue
      case "safety officer":
        return "#22c55e"; // Green
      case "electrician":
        return "#eab308"; // Yellow
      case "welder":
        return "#f97316"; // Orange
      case "plumber":
        return "#06b6d4"; // Cyan
      case "operator":
        return "#a855f7"; // Purple
      case "technician":
        return "#ec4899"; // Pink
      default:
        return "#6b7280"; // Gray
    }
  };

  // Get worker status based on last update
  const getWorkerStatus = (lastUpdated: string): string => {
    const now = new Date();
    const time = new Date(lastUpdated);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffInMinutes < 5) return "Active";
    if (diffInMinutes < 30) return "Recent";
    return "Inactive";
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !(window as any).L) {
        // Load Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.js";
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Calculate center point from workers
      let centerLat = 22.3263; // Default Singrauli center
      let centerLng = 82.56725;

      if (workers.length > 0) {
        const avgLat =
          workers.reduce(
            (sum, w) => sum + w.currentLocation.coordinates[1],
            0
          ) / workers.length;
        const avgLng =
          workers.reduce(
            (sum, w) => sum + w.currentLocation.coordinates[0],
            0
          ) / workers.length;
        centerLat = avgLat;
        centerLng = avgLng;
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
        preferCanvas: false,
      });

      // Add tile layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 0,
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add mining area boundary (similar to geological zones)
      const miningAreaBounds = [
        [22.3105, 82.5065], // Southwest corner
        [22.3105, 82.628], // Southeast corner
        [22.3421, 82.628], // Northeast corner
        [22.3421, 82.5065], // Northwest corner
        [22.3105, 82.5065], // Close the polygon
      ];

      L.polygon(miningAreaBounds, {
        color: "#f59e0b",
        weight: 2,
        opacity: 0.8,
        fillColor: "#f59e0b",
        fillOpacity: 0.1,
        dashArray: "5, 5",
      })
        .addTo(map)
        .bindPopup(
          "<b>Singrauli Mining Area</b><br>Active mining operations zone"
        );

      setMapInstance(map);
      setIsMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
        setIsMapLoaded(false);
      }
    };
  }, []);

  // Update markers when workers change
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    console.log(`MinersMapViewer: Updating map with ${workers.length} workers`);
    console.log(
      "Workers to plot:",
      workers.map((w) => ({
        name: w.name,
        id: w.workerId,
        coords: w.currentLocation.coordinates,
      }))
    );

    // Clear existing markers
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Group workers by location (with small tolerance for GPS precision)
    const locationGroups = new Map();
    workers.forEach((worker) => {
      const [lng, lat] = worker.currentLocation.coordinates;
      // Round to 5 decimal places to group workers at very similar locations
      const locationKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (!locationGroups.has(locationKey)) {
        locationGroups.set(locationKey, []);
      }
      locationGroups.get(locationKey).push(worker);
    });

    console.log(
      `Found ${locationGroups.size} unique locations for ${workers.length} workers`
    );
    locationGroups.forEach((workersAtLocation, locationKey) => {
      console.log(
        `Location ${locationKey}: ${
          workersAtLocation.length
        } workers - ${workersAtLocation.map((w) => w.name).join(", ")}`
      );
    });

    // Add markers for each location group
    locationGroups.forEach((workersAtLocation, locationKey) => {
      const [lat, lng] = locationKey.split(",").map(Number);
      const workerCount = workersAtLocation.length;

      // Determine marker appearance based on worker count and roles
      const primaryWorker = workersAtLocation[0];
      const color = getRoleColor(primaryWorker.role);

      // Create enhanced icon for multiple workers
      const iconHtml =
        workerCount > 1
          ? `
        <div style="
          position: relative;
          width: 45px;
          height: 45px;
        ">
          <div style="
            background-color: ${color};
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
          ">
            ⛑️
          </div>
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${workerCount}</div>
        </div>
      `
          : `
        <div style="
          background-color: ${color};
          width: 35px;
          height: 35px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ⛑️
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-worker-marker",
        iconSize: [workerCount > 1 ? 45 : 35, workerCount > 1 ? 45 : 35],
        iconAnchor: [
          workerCount > 1 ? 22.5 : 17.5,
          workerCount > 1 ? 22.5 : 17.5,
        ],
      });

      // Create compact popup content for multiple workers
      const popupContent = `
        <div style="min-width: 250px; max-width: 320px;">
          <div style="
            background: ${color}15;
            border-left: 3px solid ${color};
            padding: 8px;
            margin: -6px -6px 8px -6px;
            border-radius: 6px 6px 0 0;
          ">
            <h3 style="margin: 0; color: #1f2937; font-size: 14px; font-weight: bold;">
              📍 ${workerCount} worker${workerCount > 1 ? "s" : ""} here
            </h3>
          </div>

          ${workersAtLocation
            .map((worker, index) => {
              const workerStatus = getWorkerStatus(worker.lastUpdated);
              const workerColor = getRoleColor(worker.role);
              const statusIcon =
                workerStatus === "Active"
                  ? "🟢"
                  : workerStatus === "Recent"
                  ? "🟡"
                  : "🔴";
              return `
              <div style="
                margin-bottom: ${
                  index < workersAtLocation.length - 1 ? "8px" : "4px"
                };
                padding: 8px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: ${index % 2 === 0 ? "#f9fafb" : "white"};
                border-left: 3px solid ${workerColor};
              ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <strong style="color: #1f2937; font-size: 14px;">${
                    worker.name
                  }</strong>
                  <span style="font-size: 12px;">${statusIcon} ${workerStatus}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
                  <span><strong>ID:</strong> ${worker.workerId}</span>
                  <span><strong>Role:</strong> ${worker.role}</span>
                </div>

                <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                  Updated: ${new Date(worker.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;

      // Add marker to map with compact popup and click handler
      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(popupContent, {
          maxWidth: 320,
          className: "custom-worker-popup",
          closeButton: true,
          autoClose: false,
          closeOnEscapeKey: true,
        });

      // Add click handler to select worker(s) at this location
      marker.on("click", () => {
        if (onWorkerSelect && workersAtLocation.length > 0) {
          // If multiple workers at location, select the first one
          // In a real app, you might want to show a selection dialog
          onWorkerSelect(workersAtLocation[0]);
        }
      });
    });

    // Fit map to show all location groups if workers exist
    if (workers.length > 0 && locationGroups.size > 0) {
      const markers = Array.from(locationGroups.keys()).map((locationKey) => {
        const [lat, lng] = locationKey.split(",").map(Number);
        return L.marker([lat, lng]);
      });

      if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        mapInstance.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [workers, mapInstance, isMapLoaded]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Trigger map resize after fullscreen toggle
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize();
      }
    }, 100);
  };

  const refreshMap = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Live Miners Location Map
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshMap}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <Card className="mining-panel depth-layer-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                Showing demo data - {workers.length} workers plotted
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <Card
        className={`mining-panel depth-layer-2 border-primary/30 overflow-hidden transition-all duration-300 ${
          isFullscreen ? "fixed inset-4 z-50" : "relative"
        }`}
      >
        <CardContent className="p-0">
          <div
            className={`relative ${
              isFullscreen ? "h-full" : "h-96 sm:h-[500px] md:h-[600px]"
            } w-full`}
          >
            {/* Map */}
            <div
              ref={mapRef}
              className="w-full h-full rounded-lg"
              style={{ minHeight: "400px" }}
            />

            {/* Loading overlay */}
            {!isMapLoaded && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading Map...</p>
                </div>
              </div>
            )}

            {/* Fullscreen close button */}
            {isFullscreen && (
              <Button
                size="sm"
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-20 bg-background/90 hover:bg-background border border-primary/30"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Close Fullscreen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="mining-panel depth-layer-2 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Workers on Map</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {workers.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Plotted</div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-green-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold">Active Workers</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-400">
              {
                workers.filter(
                  (w) => getWorkerStatus(w.lastUpdated) === "Active"
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Last 5 minutes</div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-blue-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold">Roles</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-400">
              {new Set(workers.map((w) => w.role)).size}
            </div>
            <div className="text-xs text-muted-foreground">Different Types</div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-amber-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold">Last Update</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs font-medium text-amber-400">
              {lastUpdate || "No updates"}
            </div>
            <div className="text-xs text-muted-foreground">Map Data</div>
          </CardContent>
        </Card>
      </div>

      {/* Role Legend */}
      <Card className="mining-panel depth-layer-2 border-primary/30">
        <CardHeader className="pb-2">
          <h4 className="text-sm font-semibold text-foreground">
            Worker Role Legend
          </h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from(new Set(workers.map((w) => w.role))).map((role) => (
              <div key={role} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getRoleColor(role) }}
                />
                <span className="text-xs text-foreground">{role}</span>
                <span className="text-xs text-muted-foreground">
                  ({workers.filter((w) => w.role === role).length})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Instructions */}
      <Card className="mining-panel depth-layer-2 border-primary/30">
        <CardHeader className="pb-2">
          <h4 className="text-sm font-semibold text-foreground">
            Map Controls
          </h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-medium text-foreground mb-2">Navigation:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zoom with mouse wheel or +/- buttons</li>
                <li>• Pan by clicking and dragging</li>
                <li>• Click worker markers for details</li>
                <li>• Use fullscreen for better view</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">Marker Info:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Color indicates worker role</li>
                <li>• Click marker for detailed info</li>
                <li>• Status shows activity level</li>
                <li>• Real-time location updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinersMapViewer;

function onWorkerSelect(arg0: any) {
  throw new Error("Function not implemented.");
}
