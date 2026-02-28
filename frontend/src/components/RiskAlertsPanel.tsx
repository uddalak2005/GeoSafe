import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  HardHat,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface WorkerLocation {
  type: string;
  coordinates: [number, number];
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
  riskZone?: boolean; // Backend sets this for workers in hazard zones
  __v: number;
}

interface WorkerApiResponse {
  success: boolean;
  data: Worker[];
}

interface RiskAlertsPanelProps {
  refreshInterval?: number; // seconds
  serverUrl?: string;
  className?: string;
}

const RiskAlertsPanel: React.FC<RiskAlertsPanelProps> = ({
  refreshInterval = 10,
  serverUrl = (import.meta as any).env?.VITE_MINERS_SERVER_URL ||
    "http://localhost:3000",
  className = "",
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [riskWorkers, setRiskWorkers] = useState<Worker[]>([]);
  const [safeWorkers, setSafeWorkers] = useState<Worker[]>([]);
  const [hasRiskField, setHasRiskField] = useState<boolean | null>(null);
  const [newRiskIds, setNewRiskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const previousRiskIdsRef = useRef<Set<string>>(new Set());
  const [lastFetch, setLastFetch] = useState<string>("");
  // Crossing log: records safe -> risk transitions
  const [crossLogs, setCrossLogs] = useState<
    Array<{
      uid: string;
      name: string;
      time: string;
      lat?: number;
      lng?: number;
    }>
  >([]);
  const previousRiskStateRef = useRef<Record<string, boolean>>({});

  // Helper function to get unique ID for worker
  const getWorkerId = (worker: Worker): string => {
    return worker._id || worker.workerId || worker.helmetId || "unknown";
  };

  // Helper function to check if worker is in risk zone
  const isWorkerInRisk = (worker: Worker): boolean => {
    return Boolean(worker.riskZone);
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<WorkerApiResponse>(
        `${serverUrl}/worker`,
        {
          timeout: 15000,
          headers: { Accept: "application/json" },
        }
      );

      if (response.data.success && response.data.data) {
        const workers = response.data.data;

        // Check if any worker has riskZone field
        const anyRiskField = workers.some((w) =>
          Object.prototype.hasOwnProperty.call(w, "riskZone")
        );
        setHasRiskField(anyRiskField);
        setWorkers(workers);

        // Extract risk & safe workers based on riskZone field
        const risks = workers.filter((w) => isWorkerInRisk(w));
        const safe = workers.filter((w) => !isWorkerInRisk(w));

        // New risk detection (for badges)
        const previousRiskIdSet = previousRiskIdsRef.current;
        const currentIds = new Set(risks.map((w) => getWorkerId(w)));
        const newEntries = new Set<string>();
        for (const id of currentIds) {
          if (!previousRiskIdSet.has(id)) newEntries.add(id);
        }
        setNewRiskIds(newEntries);
        previousRiskIdsRef.current = currentIds;

        // Crossing log detection: safe -> risk transitions
        const prevState = previousRiskStateRef.current; // workerId -> boolean
        const crossingEvents: Array<{
          uid: string;
          name: string;
          time: string;
          lat?: number;
          lng?: number;
        }> = [];
        for (const worker of workers) {
          const workerId = getWorkerId(worker);
          const wasRisk = prevState[workerId];
          const isRisk = isWorkerInRisk(worker);

          if (wasRisk === false && isRisk === true) {
            const coords = worker.currentLocation?.coordinates;
            crossingEvents.push({
              uid: workerId,
              name: worker.name || worker.workerId || workerId,
              time: new Date().toISOString(),
              lat: coords ? coords[1] : undefined,
              lng: coords ? coords[0] : undefined,
            });
          }
          // Initialize new workers with their current risk state
          if (wasRisk === undefined) {
            prevState[workerId] = isRisk;
          } else {
            // Update to latest
            prevState[workerId] = isRisk;
          }
        }
        if (crossingEvents.length) {
          setCrossLogs((prev) => {
            const updated = [...crossingEvents, ...prev];
            return updated.slice(0, 200); // cap size
          });
        }

        setRiskWorkers(risks);
        setSafeWorkers(safe);
        setLastFetch(new Date().toLocaleTimeString());
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("RiskAlertsPanel fetch error", err);
      setError(
        err?.message?.includes("timeout")
          ? "Request timeout"
          : "Failed to load worker risk data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [serverUrl]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const id = setInterval(fetchWorkers, refreshInterval * 1000);
      return () => clearInterval(id);
    }
  }, [refreshInterval, serverUrl]);

  const pulseIfNew = (worker: Worker) =>
    newRiskIds.has(getWorkerId(worker))
      ? "animate-[pulse_1.5s_ease-in-out_infinite]"
      : "";
  const timeAgo = (ts: string): string => {
    const diffSec = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(ts)) / 1000)
    );
    if (diffSec < 60) return `${diffSec}s ago`;
    const m = Math.floor(diffSec / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  };

  const sortedRiskWorkers: Worker[] = React.useMemo(
    () =>
      [...riskWorkers].sort(
        (a, b) => Date.parse(b.lastUpdated) - Date.parse(a.lastUpdated)
      ),
    [riskWorkers]
  );
  const [query, setQuery] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);

  const filteredRiskWorkers: Worker[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedRiskWorkers.filter((w) => {
      const id = getWorkerId(w).toLowerCase();
      const name = (w.name || "").toLowerCase();
      const matches = !q || id.includes(q) || name.includes(q);
      return matches && (!onlyNew || newRiskIds.has(getWorkerId(w)));
    });
  }, [sortedRiskWorkers, query, onlyNew, newRiskIds]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="mining-panel depth-layer-2 border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                HAZARD ZONE ALERTS - SUPERVISOR DASHBOARD
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ CRITICAL: Workers currently inside hazard zones requiring
                immediate supervisor attention
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="hidden sm:flex text-[11px] px-2 py-1 rounded bg-muted/30 text-muted-foreground items-center gap-1">
                <Clock className="w-3 h-3" /> Auto refresh: {refreshInterval}s
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="h-8 px-2 rounded border border-muted/40 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <Button
                size="sm"
                variant={onlyNew ? "destructive" : "outline"}
                onClick={() => setOnlyNew((v) => !v)}
                className="border-destructive/40 hover:border-destructive/60"
              >
                <Activity className="w-4 h-4 mr-2" />
                {onlyNew ? "New only" : "All entries"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchWorkers}
                disabled={loading}
                className="border-destructive/40 hover:border-destructive/60"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-6 items-center mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/20 border border-destructive/40">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-semibold text-destructive text-sm">
                {riskWorkers.length} WORKERS IN HAZARD ZONES
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-green-700 text-sm">
                {safeWorkers.length} Safe
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 border border-primary/40">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-medium text-primary text-sm">
                {workers.length} Total Workers
              </span>
            </div>
            {lastFetch && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastFetch}
              </div>
            )}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-destructive/20 border border-destructive/40">
                <span className="text-destructive font-medium text-xs">
                  {error}
                </span>
              </div>
            )}
          </div>

          {hasRiskField === false && !loading && (
            <div className="mb-4 p-3 text-xs rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
              No risk zone flag found in API response. Showing all workers as
              Safe unless a future fetch includes a risk indicator.
            </div>
          )}

          {loading && riskWorkers.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Loading risk data...
            </div>
          )}

          {!loading && riskWorkers.length === 0 && !error && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              All workers currently safe (no one in risk zone).
            </div>
          )}

          <AnimatePresence initial={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRiskWorkers.map((w: Worker) => {
                return (
                  <motion.div
                    key={getWorkerId(w)}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`mining-panel depth-layer-2 border-destructive/40 hover:border-destructive/60 transition-all relative overflow-hidden`}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center border border-destructive/40 ${pulseIfNew(
                                w
                              )}`}
                            >
                              <HardHat className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground leading-tight">
                                {w.name || w.workerId || getWorkerId(w)}
                              </h3>
                              {w.role && (
                                <p className="text-xs text-muted-foreground">
                                  {w.role}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1 text-xs">
                                <AlertTriangle className="w-3 h-3 text-destructive" />
                                <span className="text-destructive font-medium">
                                  IN RISK ZONE
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              Updated
                            </div>
                            <div className="text-xs font-mono text-foreground">
                              {timeAgo(w.lastUpdated)}
                            </div>
                          </div>
                        </div>

                        {w.currentLocation?.coordinates && (
                          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                              <span className="font-semibold text-destructive">
                                HAZARD ZONE LOCATION
                              </span>
                            </div>
                            <div className="font-mono text-foreground">
                              <span className="text-muted-foreground">
                                Lat:
                              </span>{" "}
                              {w.currentLocation.coordinates[1].toFixed(6)}°N
                            </div>
                            <div className="font-mono text-foreground">
                              <span className="text-muted-foreground">
                                Lng:
                              </span>{" "}
                              {w.currentLocation.coordinates[0].toFixed(6)}°E
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Last updated:{" "}
                              {new Date(w.lastUpdated).toLocaleString()}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive border border-destructive/40">
                            <AlertTriangle className="w-3 h-3" /> Risk
                          </div>
                          {newRiskIds.has(getWorkerId(w)) && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 animate-pulse">
                              <Activity className="w-3 h-3" /> New Entry
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          {/* Safe workers list (collapsed style) */}
          {safeWorkers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" /> Safe Workers
                <span className="text-xs font-medium text-muted-foreground">
                  (not in risk zone)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {safeWorkers.slice(0, 18).map((w) => (
                  <div
                    key={getWorkerId(w)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/10 border border-muted/20 text-xs"
                  >
                    <span className="truncate max-w-[140px] text-foreground">
                      {w.name || w.workerId || getWorkerId(w)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                      Safe
                    </span>
                  </div>
                ))}
              </div>
              {safeWorkers.length > 18 && (
                <div className="text-[11px] text-muted-foreground mt-2">
                  +{safeWorkers.length - 18} more safe workers
                </div>
              )}
            </div>
          )}

          {/* Supervisor Log - Enhanced for better visibility */}
          <div className="mt-12">
            <Card className="mining-panel depth-layer-2 border-amber-500/40 bg-amber-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-500" />
                      Supervisor Alert Log
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time log of workers entering hazard zones - for
                      supervisor monitoring
                    </p>
                  </div>
                  {crossLogs.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCrossLogs([])}
                      className="border-amber-500/40 hover:border-amber-500/60"
                    >
                      Clear Log
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {crossLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">
                      No hazard zone entries recorded this session
                    </div>
                    <div className="text-xs mt-1">
                      Workers entering hazard zones will appear here
                    </div>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto pr-1 space-y-3">
                    {crossLogs.map((log, idx) => (
                      <div
                        key={log.uid + log.time + idx}
                        className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold text-amber-700 text-sm">
                              WORKER ENTERED HAZARD ZONE
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                            {new Date(log.time).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Worker Name:
                            </span>
                            <div className="font-medium text-foreground">
                              {log.name}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Location:
                            </span>
                            <div className="font-mono text-xs text-foreground">
                              {log.lat !== undefined && log.lng !== undefined
                                ? `${log.lat.toFixed(6)}°N, ${log.lng.toFixed(
                                    6
                                  )}°E`
                                : "Location unavailable"}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Entry Time:
                            </span>
                            <div className="font-medium text-foreground">
                              {new Date(log.time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAlertsPanel;
