import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  HardHat,
  MapPin,
  Clock,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Activity,
  Map,
  List,
} from "lucide-react";
import MinersMapViewer from "./MinersMapViewer";

interface WorkerLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  timeStamp: string;
}

interface Worker {
  _id: string;
  name: string;
  workerId: string;
  helmetId: string;
  role: string;
  currentLocation: WorkerLocation;
  lastUpdated: string;
  __v: number;
}

interface WorkerApiResponse {
  success: boolean;
  data: Worker[];
}

interface LiveMinersDataProps {
  className?: string;
  refreshInterval?: number; // in seconds
  serverUrl?: string; // Allow custom server URL
}

const LiveMinersData: React.FC<LiveMinersDataProps> = ({
  className = "",
  refreshInterval = 30,
  // Default to local development server; override via prop or Vite env var if set
  serverUrl = import.meta.env.VITE_API_URL || "http://localhost:3000",
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Enhanced mock data for testing when server is unavailable
  const mockWorkers: Worker[] = [
    {
      _id: "mock1",
      name: "Ravi Kumar",
      workerId: "W001",
      helmetId: "H001",
      role: "miner",
      currentLocation: {
        type: "Point",
        coordinates: [82.56266050272632, 22.312910838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock2",
      name: "Nirupon Pal",
      workerId: "W002",
      helmetId: "H002",
      role: "miner",
      currentLocation: {
        type: "Point",
        coordinates: [82.56300050272632, 22.313010838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock3",
      name: "John Doe",
      workerId: "W003",
      helmetId: "H003",
      role: "Engineer",
      currentLocation: {
        type: "Point",
        coordinates: [82.56200050272632, 22.312810838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock4",
      name: "Priya Sharma",
      workerId: "W004",
      helmetId: "H004",
      role: "Safety Officer",
      currentLocation: {
        type: "Point",
        coordinates: [82.56280050272632, 22.312950838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock5",
      name: "Amit Singh",
      workerId: "W005",
      helmetId: "H005",
      role: "Electrician",
      currentLocation: {
        type: "Point",
        coordinates: [82.56250050272632, 22.312880838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock6",
      name: "Rajesh Patel",
      workerId: "W006",
      helmetId: "H006",
      role: "Operator",
      currentLocation: {
        type: "Point",
        coordinates: [82.56320050272632, 22.313050838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock7",
      name: "Sunita Devi",
      workerId: "W007",
      helmetId: "H007",
      role: "Welder",
      currentLocation: {
        type: "Point",
        coordinates: [82.56290050272632, 22.312920838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock8",
      name: "Vikram Singh",
      workerId: "W008",
      helmetId: "H008",
      role: "Technician",
      currentLocation: {
        type: "Point",
        coordinates: [82.56310050272632, 22.312980838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
    {
      _id: "mock9",
      name: "Anita Kumari",
      workerId: "W009",
      helmetId: "H009",
      role: "Plumber",
      currentLocation: {
        type: "Point",
        coordinates: [82.56270050272632, 22.312860838499537],
        timeStamp: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
      __v: 0,
    },
  ];

  const fetchWorkerData = async (retryCount = 0) => {
    const maxRetries = 2;

    try {
      setLoading(true);
      setError(null);

      console.log(
        `Attempting to fetch data from: ${serverUrl}/worker (attempt ${
          retryCount + 1
        })`,
      );

      const response = await axios.get<WorkerApiResponse>(
        `${serverUrl}/worker`,
        {
          timeout: 25000, // Increased timeout for database operations
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API Response:", response.data);

      if (response.data.success && response.data.data) {
        console.log(
          "Raw server response:",
          JSON.stringify(response.data, null, 2),
        );
        console.log(
          `Server returned ${response.data.data.length} workers:`,
          response.data.data.map((w) => ({ name: w.name, id: w.workerId })),
        );

        setWorkers(response.data.data);
        setIsOnline(true);
        setLastUpdate(new Date().toLocaleTimeString());
        console.log(
          `Successfully fetched ${response.data.data.length} workers from server`,
        );
      } else {
        console.log("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching worker data:", err);

      let errorMessage = "Server unavailable";
      if (err.code === "ECONNABORTED") {
        errorMessage = "Connection timeout - Server taking too long to respond";
      } else if (err.response?.status === 404) {
        errorMessage = "API endpoint not found";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error - Please try again later";
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Network connection failed";
      } else if (err.response?.data?.message?.includes("buffering timed out")) {
        errorMessage = "Database timeout - Server is processing, please wait";
      } else if (err.response?.data?.success === false) {
        errorMessage = `Server error: ${
          err.response.data.message || "Unknown error"
        }`;
      }

      // Retry logic for database timeouts
      if (
        retryCount < maxRetries &&
        (err.response?.data?.message?.includes("buffering timed out") ||
          err.code === "ECONNABORTED")
      ) {
        console.log(
          `Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`,
        );
        setTimeout(() => fetchWorkerData(retryCount + 1), 2000);
        return;
      }

      setError(errorMessage);
      setIsOnline(false);

      // Use mock data as fallback
      if (workers.length === 0) {
        console.log("No existing workers, using mock data as fallback");
        setWorkers(mockWorkers);
        setLastUpdate(new Date().toLocaleTimeString() + " (Demo Data)");
        console.log(`Loaded ${mockWorkers.length} mock workers`);
      } else {
        console.log(
          `Keeping existing ${workers.length} workers due to server error`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Wrapper function for onClick handlers
  const handleRefresh = () => {
    fetchWorkerData(0);
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchWorkerData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const getStatusColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "miner":
        return "bg-primary/20 text-primary border-primary/30";
      case "engineer":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "safety officer":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "electrician":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "welder":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "plumber":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "operator":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "technician":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  const formatCoordinates = (coordinates: [number, number]) => {
    const [lng, lat] = coordinates;
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const getWorkerStatus = (
    lastUpdated: string,
  ): { status: string; color: string; icon: any } => {
    const now = new Date();
    const time = new Date(lastUpdated);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffInMinutes < 5) {
      return {
        status: "Active",
        color: "text-green-400 border-green-400/30 bg-green-400/10",
        icon: Activity,
      };
    } else if (diffInMinutes < 30) {
      return {
        status: "Recent",
        color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
        icon: Clock,
      };
    } else {
      return {
        status: "Inactive",
        color: "text-red-400 border-red-400/30 bg-red-400/10",
        icon: AlertTriangle,
      };
    }
  };

  if (loading && workers.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Live Worker Tracking
          </h2>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="mining-panel depth-layer-2 border-primary/30"
            >
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && workers.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Live Worker Tracking
          </h2>
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">Offline</span>
          </div>
        </div>
        <Card className="mining-panel depth-layer-2 border-destructive/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connection Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={handleRefresh}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced Header */}
      <Card className="mining-panel depth-layer-2 border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-mineral rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-background" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  Worker Management Dashboard
                  <span className="text-lg bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    {workers.length} Active
                  </span>
                </h2>
                <p className="text-muted-foreground mt-1">
                  Monitor worker locations, status, and safety in real-time
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-9 px-4"
                >
                  <List className="w-4 h-4 mr-2" />
                  List View
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "map" ? "default" : "ghost"}
                  onClick={() => setViewMode("map")}
                  className="h-9 px-4"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map View
                </Button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/10">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-destructive" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isOnline ? "text-green-400" : "text-destructive"
                  }`}
                >
                  {isOnline ? "Live Data" : "Demo Mode"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log(
                      "Force refresh - clearing workers and fetching fresh data",
                    );
                    setWorkers([]);
                    setIsOnline(false);
                    handleRefresh();
                  }}
                  disabled={loading}
                  className="mining-panel depth-layer-2 border-amber-500/30 hover:border-amber-500/50"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Force Sync
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Banner for Mock Data */}
      {!isOnline && workers.length > 0 && (
        <Card className="mining-panel depth-layer-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  Server database timeout - Displaying {workers.length} demo
                  workers.
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-amber-400 hover:text-amber-300 p-0 h-auto ml-1"
                  >
                    Retry connection
                  </Button>
                </span>
              </div>
              <div className="text-xs text-amber-400/70">
                Expected: 9 workers from server
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">
                  {workers.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Workers
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Currently tracked
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-green-500/30 hover:border-green-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {
                    workers.filter(
                      (w) => getWorkerStatus(w.lastUpdated).status === "Active",
                    ).length
                  }
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Active Now
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last 5 minutes
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {new Set(workers.map((w) => w.role)).size}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Job Roles
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Different types
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <HardHat className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">
                  {
                    workers.filter((w) =>
                      w.role.toLowerCase().includes("safety"),
                    ).length
                  }
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Safety Staff
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  On duty
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Panel */}
      <Card className="mining-panel depth-layer-2 border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
                ></div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {isOnline ? "Live Server Connected" : "Demo Mode Active"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isOnline
                      ? "Real-time data streaming"
                      : "Using sample data for demonstration"}
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-border"></div>

              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {workers.length}/9
                </div>
                <div className="text-xs text-muted-foreground">
                  Workers Loaded
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  Last Update
                </div>
                <div className="text-xs text-muted-foreground">
                  {lastUpdate || "No updates"}
                </div>
              </div>

              {isOnline && (
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">
                    Server Status
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cloudflare Tunnel Active
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Connection Error
                </span>
              </div>
              <div className="text-xs text-destructive/80 mt-1">{error}</div>
            </div>
          )}

          {/* Worker IDs for debugging */}
          {workers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Active Worker IDs:</span>{" "}
                {workers.map((w) => w.workerId).join(", ")}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === "list" ? (
        /* Enhanced Workers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {workers.map((worker, index) => (
              <motion.div
                key={worker._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-mineral rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <HardHat className="w-7 h-7 text-foreground" />
                        </div>
                        {(() => {
                          const status = getWorkerStatus(worker.lastUpdated);
                          return (
                            <div
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                                status.status === "Active"
                                  ? "bg-green-400"
                                  : status.status === "Recent"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                              }`}
                            ></div>
                          );
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-foreground text-lg leading-tight">
                              {worker.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {worker.workerId}
                            </p>
                          </div>
                          {(() => {
                            const status = getWorkerStatus(worker.lastUpdated);
                            const StatusIcon = status.icon;
                            return (
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {status.status}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Worker Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">
                          Role
                        </span>
                        <span
                          className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                            worker.role,
                          )}`}
                        >
                          {worker.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">
                          Helmet ID
                        </span>
                        <span className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">
                          {worker.helmetId}
                        </span>
                      </div>

                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Current Location
                          </span>
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-mono text-foreground">
                          {formatCoordinates(
                            worker.currentLocation.coordinates,
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">
                          Last Update
                        </span>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          {formatTimeAgo(worker.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Map View */
        <MinersMapViewer
          workers={workers}
          isOnline={isOnline}
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default LiveMinersData;
