import trackingIcon from "@/assets/icon-tracking.png";
import hazardIcon from "@/assets/icon-hazard-zone.png";
import alertsIcon from "@/assets/icon-alerts.png";
import {
  HardHat,
  Satellite,
  Brain,
  Pickaxe,
  Mountain,
  Zap,
  Eye,
  Layers,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: trackingIcon,
      title: "MineTrack",
      subtitle: "Real-Time Worker Positioning",
      description:
        "Every worker's helmet is embedded with an RFID-enabled LoRa GPS module with unique worker ID, enabling continuous tracking without extra devices. Low-power, long-range LoRa communication ensures reliable data transmission even in remote mine locations.",
      highlight: "⛑️",
      iconComponent: HardHat,
      miningIcon: Radio,
      details: [
        "RFID-enabled LoRa GPS modules in helmets",
        "Unique worker ID tracking",
        "Low-power, long-range communication",
        "Automatic SMS/Email alerts for hazard zones",
      ],
      depth: "surface",
    },
    {
      icon: hazardIcon,
      title: "GeoGuardian",
      subtitle: "Dynamic Geo-Fencing & Automated Alerts",
      description:
        "Hazard zones generated from RakshaDrishti's InSAR-based displacement data. Geo-fencing logic links each worker ID to spatial hazard maps, automatically recording intrusions and sending real-time alerts with precise coordinates.",
      highlight: "⚠️",
      iconComponent: AlertTriangle,
      miningIcon: Mountain,
      details: [
        "Dynamic geo-fencing from InSAR data",
        "Real-time intrusion detection",
        "Automated supervisor alerts",
        "Continuously updated hazard zones",
      ],
      depth: "shallow",
    },
    {
      icon: alertsIcon,
      title: "RakshaDrishti",
      subtitle: "Predictive Hazard Analysis",
      description:
        "Leverages multi-temporal SAR imagery with advanced InSAR techniques to detect field displacement. Uses SBAS-InSAR data, sensitivity indices, and machine learning for threshold-based early warnings and slope failure prediction.",
      highlight: "🛰️",
      iconComponent: Satellite,
      miningIcon: Eye,
      details: [
        "Multi-temporal SAR imagery processing",
        "SBAS-InSAR displacement analysis",
        "Machine learning forecasting models",
        "Dynamic hazard zoning maps",
      ],
      depth: "deep",
    },
    {
      icon: alertsIcon,
      title: "RakshaMantri",
      subtitle: "Centralized Dashboard & Decision Support",
      description:
        "Integrates real-time worker positioning with displacement-based hazard zones on an intuitive dashboard. Displays worker locations relative to unstable slope regions and enables immediate evacuation protocols.",
      highlight: "🎛️",
      iconComponent: Monitor,
      miningIcon: Brain,
      details: [
        "Real-time worker positioning integration",
        "Intuitive hazard zone visualization",
        "Immediate evacuation protocol alerts",
        "Continuous InSAR forecast updates",
      ],
      depth: "control",
    },
  ];

  const getDepthClass = (depth: string) => {
    switch (depth) {
      case "surface":
        return "depth-layer-1";
      case "shallow":
        return "depth-layer-2";
      case "deep":
        return "depth-layer-3";
      case "control":
        return "depth-layer-4";
      default:
        return "depth-layer-1";
    }
  };

  return (
    <section
      id="features"
      className="py-20 bg-gradient-depth geological-layer relative overflow-hidden"
    >
      {/* Mining shaft background effect */}
      <div className="absolute inset-0 bg-pattern-rock opacity-20"></div>
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-primary/30 to-transparent"></div>
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-secondary/30 to-transparent"></div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <Pickaxe className="w-6 h-6 md:w-8 md:h-8 text-primary mr-2 md:mr-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Four <span className="text-primary">Mining Shafts</span> of Safety
            </h2>
            <Pickaxe className="w-6 h-6 md:w-8 md:h-8 text-primary ml-2 md:ml-4 scale-x-[-1]" />
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto px-2">
            Deep underground intelligence systems working in perfect harmony to
            protect every miner, from surface operations to the deepest
            excavations
          </p>
        </div>

        {/* Mining shaft layout - Uniform card sizes */}
        <div className="space-y-6 md:space-y-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`mining-panel ${getDepthClass(
                feature.depth,
              )} rounded-xl p-4 sm:p-6 md:p-8 hover-excavate border-l-4 border-primary relative group w-full max-w-none`}
            >
              {/* Ore vein indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1"></div>

              {/* Mining equipment icons */}
              <div className="absolute top-4 right-4 opacity-20">
                <feature.miningIcon className="w-16 h-16 text-secondary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
                {/* Main icon and title */}
                <div className="md:col-span-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg 
                      flex items-center justify-center 
                      bg-blue-900 group-hover:seismic-pulse"
                      >
                        <feature.iconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-background" />
                      </div>
                      <span className="absolute -top-2 -right-2 text-2xl sm:text-3xl bg-card rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-equipment">
                        {feature.highlight}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl sm:text-2xl font-bold text-primary 
                      mb-2"
                      >
                        {feature.title}
                      </h3>
                      <h4
                        className="text-base sm:text-lg font-semibold 
                      text-secondary mb-3 sm:mb-4"
                      >
                        {feature.subtitle}
                      </h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Depth Level: {feature.depth.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-1">
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Technical specifications */}
                <div className="md:col-span-1 lg:col-span-1">
                  <div className="bg-background/20 rounded-lg p-4 sm:p-6 border border-primary/20">
                    <h5 className="text-xs sm:text-sm font-bold text-secondary mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      TECHNICAL SPECIFICATIONS
                    </h5>
                    <div className="space-y-2 sm:space-y-3">
                      {feature.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="flex items-start gap-2 sm:gap-3"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-1 sm:mt-2 flex-shrink-0 shadow-ore"></div>
                          <span className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mining shaft connection line */}
              {index < features.length - 1 && (
                <div className="absolute -bottom-4 left-12 w-px h-8 bg-gradient-to-b from-primary to-secondary"></div>
              )}
            </div>
          ))}
        </div>

        {/* Underground bedrock footer */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-xl p-8 border-2 border-primary/30 ore-vein">
            <div className="flex items-center justify-center mb-4">
              <Mountain className="w-8 h-8 text-primary mr-3" />
              <h3 className="text-2xl font-bold text-foreground">
                Built on Solid Bedrock Technology
              </h3>
              <Mountain className="w-8 h-8 text-primary ml-3" />
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our four-tier mining safety architecture operates like a
              well-engineered mine shaft - each level serves a critical purpose,
              from surface monitoring to deep geological analysis, ensuring
              comprehensive protection at every depth of your operation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
