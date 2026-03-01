import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Mountain,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Download,
  Eye,
  Layers,
  Activity,
  AlertTriangle,
  Satellite,
  Radio,
  Cpu,
  ChevronDown,
} from "lucide-react";

interface HTMLMapViewerProps {
  htmlUrl?: string;
  apiEndpoint?: string;
  baseUrl?: string;
  title?: string;
  description?: string;
  refreshInterval?: number; // in seconds
  onDataUpdate?: (data?: any) => void;
  onError?: (error: any) => void;
}

const HTMLMapViewer: React.FC<HTMLMapViewerProps> = ({
  htmlUrl,
  apiEndpoint = "/heatmap",
  baseUrl = "https://agentsay-htmlteansponder.hf.space", // Production HuggingFace server
  title = "Real-time ML Heatmap Analysis",
  description = "Live geological ML data visualization with predictive analytics",
  refreshInterval = 30, // 30 seconds default
  onDataUpdate,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [dataSources, setDataSources] = useState<
    ("satellite" | "drone" | "sensor")[]
  >(["satellite"]);

  // Define data source options
  const dataSourceOptions = [
    { value: "satellite" as const, label: "Satellite", icon: Satellite },
    { value: "drone" as const, label: "Drone", icon: Radio },
    { value: "sensor" as const, label: "Sensor", icon: Cpu },
  ];

  // Handle multiple data source selection
  const handleDataSourceToggle = (source: "satellite" | "drone" | "sensor") => {
    setDataSources((prev) => {
      if (prev.includes(source)) {
        // Remove if already selected (but keep at least one selected)
        return prev.length > 1 ? prev.filter((s) => s !== source) : prev;
      } else {
        // Add if not selected
        return [...prev, source];
      }
    });
  };

  // Fetch HTML content from server
  const fetchHtmlContent = async () => {
    if (!apiEndpoint || !baseUrl) {
      // Fallback to static file if no API endpoint
      if (htmlUrl) {
        setDataUrl(htmlUrl);
        setIsOnline(false);
        return;
      }
      setError("No data source configured");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${baseUrl}${apiEndpoint}`, {
        timeout: 30000, // 30 second timeout for large HTML files
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (response.data) {
        setHtmlContent(response.data);

        // Create a blob URL for the HTML content
        const blob = new Blob([response.data], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        setDataUrl(url);

        setIsOnline(true);
        setLastUpdate(new Date().toLocaleTimeString());
        onDataUpdate?.(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching heatmap:", err);
      setError(err.message || "Failed to fetch heatmap data");
      setIsOnline(false);
      onError?.(err);

      // Fallback to static file if available
      if (htmlUrl) {
        setDataUrl(htmlUrl);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    if (!error) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  // Refresh the map
  const refreshMap = () => {
    fetchHtmlContent();
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(htmlUrl, "_blank");
  };

  // Download the HTML file
  const downloadHTML = () => {
    const link = document.createElement("a");
    link.href = htmlUrl;
    link.download = "singrauli_heatmap.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial load and setup
  useEffect(() => {
    fetchHtmlContent();
  }, [apiEndpoint, baseUrl]);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchHtmlContent();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, apiEndpoint, baseUrl]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (dataUrl && dataUrl.startsWith("blob:")) {
        URL.revokeObjectURL(dataUrl);
      }
    };
  }, [dataUrl]);

  return (
    <div className="space-y-4">
      {/* Map Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-ore rounded-lg flex items-center justify-center shadow-ore">
            <Mountain className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshMap}
            disabled={isLoading}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Data Source Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
              >
                {(() => {
                  if (dataSources.length === 1) {
                    const currentOption = dataSourceOptions.find(
                      (option) => option.value === dataSources[0],
                    );
                    const IconComponent = currentOption?.icon || Satellite;
                    return (
                      <>
                        <IconComponent className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          {currentOption?.label}
                        </span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </>
                    );
                  } else if (dataSources.length === dataSourceOptions.length) {
                    return (
                      <>
                        <Layers className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">All Sources</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </>
                    );
                  } else {
                    return (
                      <>
                        <Layers className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          {dataSources.length} Sources
                        </span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </>
                    );
                  }
                })()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mining-panel depth-layer-3 border-primary/30 w-48"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-primary">
                Data Sources
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dataSourceOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = dataSources.includes(option.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={isSelected}
                    onCheckedChange={() => handleDataSourceToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setDataSources(dataSourceOptions.map((o) => o.value))
                }
                className="cursor-pointer text-xs"
              >
                <Layers className="w-3 h-3 mr-2" />
                Select All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline ml-2">
              {isFullscreen ? "Minimize" : "Fullscreen"}
            </span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={openInNewTab}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Open</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadHTML}
            className="mining-panel depth-layer-2 border-primary/30 hover:border-primary/50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Download</span>
          </Button>
        </div>
      </div>

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
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Loading Live Geological Data...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fetching large heatmap from HuggingFace server (may take
                      up to 30s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && !isLoading && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-12 h-12 border-2 border-destructive rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Connection Error
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {error}
                    </p>
                    <Button
                      size="sm"
                      onClick={refreshMap}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* HTML Map Iframe */}
            {dataUrl && (
              <iframe
                ref={iframeRef}
                src={dataUrl}
                className="w-full h-full border-0 rounded-lg bg-transparent"
                onLoad={handleIframeLoad}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}

            {/* Fullscreen Close Button */}
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

      {/* Map Information Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="mining-panel depth-layer-2 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Data Visualization</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">ML Heatmap</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Sources:</span>
                <div className="font-medium flex flex-col gap-1 items-end">
                  {dataSources.map((source) => {
                    const option = dataSourceOptions.find(
                      (opt) => opt.value === source,
                    );
                    if (!option) return null;
                    const IconComponent = option.icon;
                    return (
                      <div key={source} className="flex items-center gap-1">
                        <IconComponent className="w-3 h-3" />
                        <span className="text-xs">{option.label}</span>
                      </div>
                    );
                  })}
                  {dataSources.length > 1 && (
                    <div className="text-[10px] text-primary mt-1">
                      {dataSources.length === dataSourceOptions.length
                        ? "All Sources"
                        : `${dataSources.length} Active`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="font-medium">Singrauli</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Points:</span>
                <span className="font-medium">500+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">ML Analytics</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm:</span>
                <span className="font-medium">Heatmap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing:</span>
                <span className="font-medium">Real-time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">Map Layers</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Map:</span>
                <span className="font-medium">OpenStreetMap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heatmap:</span>
                <span className="font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markers:</span>
                <span className="font-medium">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mining-panel depth-layer-2 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Status</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`font-medium ${
                    isOnline
                      ? "text-primary"
                      : error
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {isLoading
                    ? "Loading..."
                    : isOnline
                      ? "Online"
                      : error
                        ? "Error"
                        : "Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-medium">{lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-refresh:</span>
                <span className="font-medium">{refreshInterval}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium">
                  {isOnline ? "API" : "Static"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive features instructional block removed per user request */}
    </div>
  );
};

export default HTMLMapViewer;
