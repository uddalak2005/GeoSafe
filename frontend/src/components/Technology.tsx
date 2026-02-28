import {
  Satellite,
  Cpu,
  Radio,
  Layers,
  Zap,
  Eye,
  HardHat,
  Mountain,
  Pickaxe,
} from "lucide-react";

const Technology = () => {
  const technologies = [
    {
      icon: Satellite,
      title: "InSAR Geological Surveying",
      description:
        "Deep earth monitoring using multi-temporal Synthetic Aperture Radar imagery with SBAS-InSAR processing for precise underground displacement detection",
      features: [
        "Sub-millimeter geological accuracy",
        "All-weather underground monitoring",
        "Wide excavation area coverage",
      ],
      miningType: "surface",
      oreType: "primary",
    },
    {
      icon: Radio,
      title: "Underground LoRa Networks",
      description:
        "Long-range, low-power wireless communication penetrating deep mine shafts and ensuring reliable data transmission in the harshest underground environments",
      features: [
        "15km+ underground range",
        "Ultra-low power consumption",
        "Penetrates rock formations",
      ],
      miningType: "underground",
      oreType: "secondary",
    },
    {
      icon: Cpu,
      title: "Geological AI Intelligence",
      description:
        "Advanced machine learning algorithms analyzing rock formations, seismic patterns, and geological data for predictive hazard analysis",
      features: [
        "Real-time geological processing",
        "Rock pattern recognition",
        "Seismic predictive modeling",
      ],
      miningType: "deep",
      oreType: "primary",
    },
    {
      icon: HardHat,
      title: "Miner RFID Tracking",
      description:
        "Embedded helmet-based positioning system with unique miner identification and continuous underground location monitoring",
      features: [
        "Centimeter underground precision",
        "Real-time shaft updates",
        "Hands-free mining operation",
      ],
      miningType: "surface",
      oreType: "secondary",
    },
    {
      icon: Mountain,
      title: "Dynamic Excavation Zones",
      description:
        "Intelligent boundary systems that adapt to changing geological conditions based on real-time displacement and excavation data",
      features: [
        "Automatic zone updates",
        "Multi-depth support",
        "Instant geological alerts",
      ],
      miningType: "underground",
      oreType: "primary",
    },
    {
      icon: Eye,
      title: "Seismic Prediction Engine",
      description:
        "Time-series forecasting models that predict slope failures, rockfall incidents, and underground collapses before they occur",
      features: [
        "Early seismic warning system",
        "Geological risk assessment",
        "Underground trend analysis",
      ],
      miningType: "deep",
      oreType: "secondary",
    },
  ];

  const getMiningDepthClass = (miningType: string) => {
    switch (miningType) {
      case "surface":
        return "depth-layer-1";
      case "underground":
        return "depth-layer-2";
      case "deep":
        return "depth-layer-3";
      default:
        return "depth-layer-1";
    }
  };

  const getOreGradient = (oreType: string) => {
    return oreType === "primary" ? "bg-blue-900" : "bg-amber-900";
  };

  return (
    <section
      id="technology"
      className="py-20 bg-gradient-depth geological-layer relative overflow-hidden"
    >
      {/* Underground mining shaft background */}
      <div className="absolute inset-0 bg-pattern-ore opacity-15"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-seismic opacity-10"></div>

      {/* Vertical ore veins */}
      <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-primary/40 to-secondary/40 opacity-60"></div>
      <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-secondary/40 to-accent/40 opacity-60"></div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Pickaxe className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Underground <span className="text-primary">Technology</span>{" "}
              Arsenal
            </h2>
            <Pickaxe className="w-8 h-8 text-primary ml-4 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Deep-earth engineering solutions leveraging geological intelligence,
            seismic monitoring, and underground communication networks to create
            the most advanced mining safety ecosystem
          </p>
        </div>

        {/* Mining equipment grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className={`mining-panel ${getMiningDepthClass(
                tech.miningType,
              )} rounded-xl p-8 hover-excavate border-2 border-primary/30 group relative overflow-hidden`}
            >
              {/* Ore vein indicator */}
              <div
                className={`absolute top-0 right-0 w-4 h-full ${getOreGradient(
                  tech.oreType,
                )} opacity-30`}
              ></div>

              {/* Mining depth indicator */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Layers className="w-3 h-3" />
                  <span className="uppercase font-bold">
                    {tech.miningType} LEVEL
                  </span>
                </div>
              </div>

              <div className="flex items-center mb-6 mt-8">
                <div
                  className={`w-20 h-20 ${getOreGradient(
                    tech.oreType,
                  )} rounded-lg flex items-center justify-center mr-4 group-hover:seismic-pulse shadow-ore`}
                >
                  <tech.icon className="w-10 h-10 text-background" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {tech.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Zap className="w-4 h-4" />
                    <span>{tech.oreType.toUpperCase()} ORE GRADE</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {tech.description}
              </p>

              {/* Technical specifications panel */}
              <div className="bg-background/20 rounded-lg p-4 border border-primary/20">
                <h4 className="text-sm font-bold text-secondary mb-3 flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  GEOLOGICAL SPECIFICATIONS
                </h4>
                <div className="space-y-3">
                  {tech.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 shadow-ore"></div>
                      <span className="text-sm text-foreground font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Underground bedrock foundation */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-xl p-8 border-2 border-primary/30 ore-vein">
            <div className="flex items-center justify-center mb-4">
              <Mountain className="w-8 h-8 text-primary mr-3" />
              <h3 className="text-2xl font-bold text-foreground">
                Built on Geological Bedrock Engineering
              </h3>
              <Mountain className="w-8 h-8 text-primary ml-3" />
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our technology stack operates like a well-engineered mining
              operation - each component works in harmony from surface
              monitoring to deep underground analysis, creating an integrated
              safety ecosystem that protects miners at every level of
              excavation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
