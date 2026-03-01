import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Activity,
  Bell,
  Settings,
  Menu,
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Radio,
  Monitor,
  Wifi,
  Cpu,
  Signal,
  Gauge,
  Satellite,
  Brain,
  ArrowLeft,
  TrendingUp,
  MapPin,
  Clock,
  Home,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HTMLMapViewer from "@/components/HTMLMapViewer";
import LiveMinersData from "@/components/LiveMinersData";
import RiskAlertsPanel from "@/components/RiskAlertsPanel";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
import MinerCheckIn from "@/components/MinerCheckIn";
import LoraGPS from "@/components/informatives/LoraGPS";
import QRScanner from "@/components/QRScanner";

interface MinerStatus {
  id: string;
  name: string;
  zone: string;
  depth: string;
  status: "safe" | "warning" | "danger" | "emergency";
  lastUpdate: string;
  coordinates: { lat: number; lng: number; depth: number };
}

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("alerts");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    connectionStatus: "connected",
  });
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        lastUpdate: new Date().toLocaleTimeString(),
        connectionStatus: Math.random() > 0.1 ? "connected" : "reconnecting",
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const technologyAreas = [
    {
      id: "insar",
      icon: Satellite,
      title: "InSAR Monitoring",
      description: "Sub-millimeter geological accuracy",
      metrics: [
        { name: "Displacement", value: "0.2mm", status: "online" },
        { name: "Coverage", value: "15km²", status: "online" },
        { name: "Accuracy", value: "±0.1mm", status: "online" },
      ],
      accent: "bg-primary/10 text-primary border-primary/20",
      iconBg: "bg-primary",
    },
    {
      id: "lora",
      icon: Radio,
      title: "LoRa Networks",
      description: "15km+ underground range",
      metrics: [
        { name: "Range", value: "18.5km", status: "online" },
        { name: "Power", value: "Ultra-low", status: "online" },
        { name: "Penetration", value: "300m rock", status: "online" },
      ],
      accent: "bg-accent/10 text-accent border-accent/20",
      iconBg: "bg-accent",
    },
    {
      id: "ai",
      icon: Brain,
      title: "AI Intelligence",
      description: "Real-time geological processing",
      metrics: [
        { name: "Processing", value: "Real-time", status: "online" },
        { name: "Accuracy", value: "94.7%", status: "online" },
        { name: "Predictions", value: "156/day", status: "online" },
      ],
      accent: "bg-secondary/10 text-secondary border-secondary/20",
      iconBg: "bg-secondary",
    },
    {
      id: "tracking",
      icon: HardHat,
      title: "RFID Tracking",
      description: "Centimeter underground precision",
      metrics: [
        { name: "Precision", value: "±2cm", status: "online" },
        { name: "Updates", value: "Real-time", status: "online" },
        { name: "Coverage", value: "100%", status: "online" },
      ],
      accent: "bg-primary/10 text-primary border-primary/20",
      iconBg: "bg-primary",
    },
  ];

  const sidebarItems = [
    { icon: Monitor, label: "Overview", id: "overview" },
    { icon: Pickaxe, label: "Miner check-in", id: "check-in" },
    { icon: Mountain, label: "Geological Zones", id: "zones" },
    { icon: Users, label: "Miners", id: "miners" },
    { icon: AlertTriangle, label: "Risk Alerts", id: "alerts" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  const miners: MinerStatus[] = [
    {
      id: "1",
      name: "John Smith",
      zone: "Shaft A-2",
      depth: "250m",
      status: "safe",
      lastUpdate: "2 min ago",
      coordinates: { lat: 40.7128, lng: -74.006, depth: 250 },
    },
    {
      id: "2",
      name: "Emma Davis",
      zone: "High-Risk Zone B-1",
      depth: "180m",
      status: "warning",
      lastUpdate: "1 min ago",
      coordinates: { lat: 40.713, lng: -74.0058, depth: 180 },
    },
    {
      id: "3",
      name: "Mike Johnson",
      zone: "Surface Operations",
      depth: "0m",
      status: "safe",
      lastUpdate: "30 sec ago",
      coordinates: { lat: 40.7125, lng: -74.0062, depth: 0 },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
      case "online":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "danger":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "emergency":
      case "offline":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  useEffect(() => {
    if (activeSection === "zones") {
      setLoading(true);
      fetch("https://agentsay-graphsih.hf.space/predict", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          setApiData(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch API data");
          setLoading(false);
        });
    }
  }, [activeSection]);

  const activeSectionLabel =
    sidebarItems.find((i) => i.id === activeSection)?.label ?? "";

  return (
    <div className="flex h-screen bg-depth-layer-1 overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <motion.aside
        className={`${
          sidebarOpen ? "w-72" : "w-[68px]"
        } flex-shrink-0 transition-all duration-300 bg-[hsl(214,59%,20%)] flex flex-col border-r border-[hsl(214,50%,16%)] relative z-30`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[hsl(214,50%,16%)] flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 shadow-ore">
            <HardHat className="h-5 w-5 text-[hsl(214,59%,14%)]" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-white font-bold text-base leading-tight">
                  MineSafe.ai
                </p>
                <p className="text-[hsl(214,30%,65%)] text-[10px] uppercase tracking-widest font-medium">
                  Safety Command
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto w-7 h-7 rounded-md bg-[hsl(214,48%,28%)] hover:bg-[hsl(214,48%,34%)] flex items-center justify-center transition-colors flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <Menu className="w-3.5 h-3.5 text-[hsl(214,20%,80%)]" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.25 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group ${
                  isActive
                    ? "bg-secondary text-[hsl(214,59%,12%)] shadow-ore font-semibold"
                    : "text-[hsl(214,20%,72%)] hover:bg-[hsl(214,48%,28%)] hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? "text-[hsl(214,59%,12%)]" : "text-[hsl(214,20%,60%)] group-hover:text-white"}`}
                  size={18}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && (
                  <ChevronRight className="ml-auto w-3.5 h-3.5 text-[hsl(214,59%,22%)]" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* System status footer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="p-3 border-t border-[hsl(214,50%,16%)]"
            >
              <div className="rounded-lg bg-[hsl(214,48%,15%)] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      realTimeData.connectionStatus === "connected"
                        ? "bg-emerald-400 shadow-[0_0_6px_hsl(142,70%,55%)] animate-pulse"
                        : "bg-amber-400 animate-bounce"
                    }`}
                  />
                  <span className="text-xs text-[hsl(214,20%,72%)]">
                    {realTimeData.connectionStatus === "connected"
                      ? "All Systems Online"
                      : "Reconnecting..."}
                  </span>
                </div>
                <div className="text-xs text-[hsl(214,20%,55%)]">
                  {miners.filter((m) => m.status === "safe").length} of{" "}
                  {miners.length} miners safe
                </div>
                <div className="text-xs text-[hsl(214,20%,45%)]">
                  Updated {realTimeData.lastUpdate}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        {/* Top Header */}
        <motion.header
          className="h-16 flex-shrink-0 bg-white border-b border-border flex items-center px-6 gap-4 shadow-sm relative z-20"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Back + Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 px-2.5 h-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-sm">Home</span>
            </Button>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h1 className="text-base font-semibold text-foreground">
                Command Center
              </h1>
              {activeSectionLabel && (
                <>
                  <span className="text-muted-foreground/50 text-sm">/</span>
                  <span className="text-sm text-muted-foreground">
                    {activeSectionLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-primary/70" />
              <span className="tabular-nums text-xs">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-md font-medium">
              <Zap className="w-3 h-3" />
              Live
            </div>

            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white gap-1.5 h-8 px-3 text-sm shadow-equipment"
            >
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </Button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto bg-depth-layer-1 
        p-6 relative z-10"
        >
          {/* ── OVERVIEW ─────────────────────────────────── */}
          {activeSection === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 max-w-6xl"
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Technology Systems Status
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Real-time health of all active monitoring modules
                </p>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 
                xl:grid-cols-4 gap-4"
                >
                  {technologyAreas.map((tech, index) => (
                    <motion.div
                      key={tech.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      onClick={() => setActiveSection(tech.id)}
                      className="cursor-pointer group"
                    >
                      <Card
                        className="bg-white h-[25vh] border border-border 
                      hover:border-primary/30 hover:shadow-excavation 
                      transition-all duration-300 overflow-hidden"
                      >
                        <CardHeader className="pb-3 pt-5 px-5">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg ${tech.iconBg} 
                              flex items-center justify-center flex-shrink-0 shadow-sm`}
                            >
                              <tech.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3
                                className="font-semibold text-foreground 
                              text-sm leading-tight"
                              >
                                {tech.title}
                              </h3>
                              <p
                                className="text-xs text-muted-foreground 
                              mt-0.5 leading-snug"
                              >
                                {tech.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-5 pb-5">
                          <div className="space-y-2.5 mt-1">
                            {tech.metrics.map((metric, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center"
                              >
                                <span className="text-xs text-muted-foreground">
                                  {metric.name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${getStatusColor(metric.status)}`}
                                >
                                  {metric.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MINER CHECK-IN ─────────────────────────── */}
          {activeSection === "check-in" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Miner Check-in</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor miner check-in status in real-time.
                  </p>
                </div>
              </div>
              <QRScanner />
            </motion.div>
          )}

          {/* ── GEOLOGICAL ZONES ─────────────────────────── */}
          {activeSection === "zones" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <HTMLMapViewer
                apiEndpoint="/"
                baseUrl="https://agentsay-htmlteansponder.hf.space"
                htmlUrl="/singrauli_heatmap.html"
                title="Live Geospatial PS Data Analysis"
                description="Real-time ML-powered geological monitoring with live PS data from HuggingFace"
                refreshInterval={30}
                onDataUpdate={(data) => {
                  console.log(
                    "Map data updated from HF API:",
                    data ? "Success" : "Fallback",
                  );
                }}
                onError={(error) => {
                  console.error("HuggingFace API error:", error);
                }}
              />

              <Card className="bg-white border border-border shadow-sm">
                <CardHeader className="px-6 pt-5 pb-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Geolocation Zone Prediction Graph
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Actual vs predicted seismic displacement data
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading zone data...
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}
                  {apiData && apiData.chart_data && (
                    <Line
                      data={{
                        labels: apiData.chart_data.map((d: any) => d.index),
                        datasets: [
                          {
                            label: "Actual",
                            data: apiData.chart_data.map((d: any) => d.actual),
                            borderColor: "hsl(214, 59%, 27%)",
                            backgroundColor: "hsl(214, 59%, 27%, 0.1)",
                            fill: false,
                          },
                          {
                            label: "Predicted Median",
                            data: apiData.chart_data.map(
                              (d: any) => d.predicted_median,
                            ),
                            borderColor: "hsl(38, 95%, 45%)",
                            backgroundColor: "hsl(38, 95%, 53%, 0.1)",
                            fill: false,
                          },
                          {
                            label: "Lower Bound",
                            data: apiData.chart_data.map(
                              (d: any) => d.lower_bound,
                            ),
                            borderColor: "hsl(203, 45%, 55%)",
                            backgroundColor: "hsl(203, 45%, 45%, 0.1)",
                            borderDash: [5, 5],
                            fill: false,
                          },
                          {
                            label: "Upper Bound",
                            data: apiData.chart_data.map(
                              (d: any) => d.upper_bound,
                            ),
                            borderColor: "hsl(203, 45%, 35%)",
                            backgroundColor: "hsl(203, 45%, 35%, 0.1)",
                            borderDash: [5, 5],
                            fill: false,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: false },
                        },
                        scales: {
                          x: {
                            grid: { color: "hsl(214, 20%, 92%)" },
                            ticks: {
                              color: "hsl(215, 16%, 48%)",
                              font: { size: 11 },
                            },
                          },
                          y: {
                            grid: { color: "hsl(214, 20%, 92%)" },
                            ticks: {
                              color: "hsl(215, 16%, 48%)",
                              font: { size: 11 },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── MINERS ───────────────────────────────────── */}
          {activeSection === "miners" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Section header card */}
              <Card className="bg-white border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 bg-primary rounded-xl flex items-center 
                    justify-center shadow-equipment"
                    >
                      <HardHat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Live Miners Tracking System
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Real-time monitoring and location tracking of all mining
                        personnel
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Mining Operations
                    </div>
                    <div className="text-xl font-bold text-primary mt-0.5">
                      Singrauli
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Madhya Pradesh, India
                    </div>
                  </div>
                </div>
              </Card>

              <LiveMinersData refreshInterval={15} />
            </motion.div>
          )}

          {/* ── ALERTS ──────────────────────────────────── */}
          {activeSection === "alerts" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <RiskAlertsPanel refreshInterval={10} />
            </motion.div>
          )}

          {activeSection === "lora" && <LoraGPS />}

          {/* ── PLACEHOLDER SECTIONS ─────────────────────── */}
          {activeSection !== "overview" &&
            activeSection !== "zones" &&
            activeSection !== "miners" &&
            activeSection !== "alerts" &&
            activeSection !== "check-in" &&
            activeSection !== "lora" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {
                    sidebarItems.find((item) => item.id === activeSection)
                      ?.label
                  }
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  This section is under development. Advanced mining safety
                  features are coming soon.
                </p>
              </motion.div>
            )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
