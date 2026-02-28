import {
  Satellite,
  Users,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle,
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Zap,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Satellite,
      title: "Underground Geological Surveying",
      description:
        "Multi-temporal SAR imagery penetrates deep earth layers, continuously monitoring underground displacement patterns and geological instabilities across the entire mining excavation site.",
      details: [
        "SBAS-InSAR processing for sub-millimeter geological accuracy",
        "All-weather underground monitoring capability",
        "Wide-area coverage of entire mining operations and shafts",
      ],
      color: "from-primary to-primary-dark",
      miningPhase: "exploration",
      depth: "surface",
    },
    {
      number: "02",
      icon: Brain,
      title: "Geological AI Intelligence",
      description:
        "Advanced machine learning algorithms analyze rock formation data, seismic patterns, and underground displacement trends to predict potential cave-ins, rockfall incidents, and geological hazards.",
      details: [
        "Time-series geological forecasting with ARIMA models",
        "Neural network rock pattern recognition",
        "Threshold-based seismic early warning systems",
      ],
      color: "from-secondary to-accent",
      miningPhase: "analysis",
      depth: "shallow",
    },
    {
      number: "03",
      icon: Mountain,
      title: "Dynamic Excavation Zone Mapping",
      description:
        "Real-time hazard zones are generated and continuously updated based on underground displacement trends, creating dynamic geo-fenced safety boundaries around active mining areas.",
      details: [
        "Automated excavation hazard zone generation",
        "Real-time underground boundary adjustments",
        "Multi-depth geological risk classification",
      ],
      color: "from-accent to-secondary",
      miningPhase: "mapping",
      depth: "deep",
    },
    {
      number: "04",
      icon: HardHat,
      title: "Miner Tracking & Underground Alerts",
      description:
        "RFID-enabled GPS helmets track miner positions in real-time throughout underground tunnels, triggering immediate alerts when miners enter hazardous excavation zones.",
      details: [
        "Continuous underground miner position monitoring",
        "Instant SMS/radio notifications to surface control",
        "Automated underground evacuation protocols",
      ],
      color: "from-primary-dark to-primary",
      miningPhase: "safety",
      depth: "control",
    },
  ];

  const workflow = [
    {
      title: "Underground Data Acquisition",
      description:
        "Satellite imagery and miner positioning data collected continuously from deep excavation sites",
      icon: Satellite,
      miningEquipment: "InSAR Sensors",
    },
    {
      title: "Geological Processing & Analysis",
      description:
        "AI algorithms process rock formation data to identify seismic patterns and predict geological risks",
      icon: Brain,
      miningEquipment: "AI Processing Units",
    },
    {
      title: "Excavation Risk Assessment",
      description:
        "Dynamic hazard zones generated based on underground displacement analysis and rock stability",
      icon: Mountain,
      miningEquipment: "Geological Scanners",
    },
    {
      title: "Real-time Underground Monitoring",
      description:
        "Miner positions tracked against hazard zones throughout mine shafts with instant alerts",
      icon: HardHat,
      miningEquipment: "RFID Helmet Systems",
    },
    {
      title: "Emergency Response & Action",
      description:
        "Automated notifications trigger immediate underground evacuation protocols",
      icon: AlertTriangle,
      miningEquipment: "Emergency Communication",
    },
  ];

  const getMiningDepthClass = (depth: string) => {
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
    <section className="py-20 bg-gradient-depth geological-layer relative overflow-hidden">
      {/* Underground mining shaft background */}
      <div className="absolute inset-0 bg-pattern-ore opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-seismic opacity-5"></div>

      {/* Vertical mining shaft indicators */}
      <div className="absolute top-0 left-1/6 w-1 h-full bg-gradient-to-b from-primary/30 to-secondary/30 opacity-50"></div>
      <div className="absolute top-0 right-1/6 w-1 h-full bg-gradient-to-b from-secondary/30 to-accent/30 opacity-50"></div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Pickaxe className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Underground <span className="text-primary">Mining</span>{" "}
              Operations
            </h2>
            <Pickaxe className="w-8 h-8 text-primary ml-4 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Our comprehensive underground workflow combines cutting-edge
            geological technology with real-time miner monitoring to create an
            impenetrable safety net for deep excavation operations
          </p>
        </div>

        {/* Underground Mining Process Steps */}
        <div className="space-y-16 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:w-1/2">
                <div
                  className={`mining-panel ${getMiningDepthClass(
                    step.depth,
                  )} rounded-xl p-8 border-2 border-primary/30 relative overflow-hidden`}
                >
                  {/* Mining depth indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Layers className="w-3 h-3" />
                      <span className="uppercase font-bold">
                        {step.depth} LEVEL
                      </span>
                    </div>
                  </div>

                  {/* Mining phase indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Eye className="w-3 h-3" />
                      <span className="uppercase font-bold">
                        {step.miningPhase} PHASE
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mb-6 mt-8">
                    <div
                      className={`w-20 h-20 bg-blue-900 rounded-lg flex items-center justify-center mr-4 shadow-ore`}
                    >
                      <step.icon className="w-10 h-10 text-background" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-secondary mb-1 flex items-center gap-2">
                        <Pickaxe className="w-4 h-4" />
                        MINING OPERATION {step.number}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <div className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-card-foreground">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 flex justify-center">
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-xl`}
                >
                  <step.icon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Timeline */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border border-primary/20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Complete Workflow Process
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {workflow.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center gap-4"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-3">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h4 className="text-sm font-bold text-card-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-24">
                    {item.description}
                  </p>
                </div>

                {index < workflow.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
