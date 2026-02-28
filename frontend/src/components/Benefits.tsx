import {
  Shield,
  DollarSign,
  Zap,
  Users,
  TrendingUp,
  Clock,
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: HardHat,
      title: "Underground Miner Safety",
      description:
        "Real-time underground tracking and seismic alerts significantly reduce the risk of cave-ins and rockfall accidents in deep excavation sites",
      metric: "95%",
      metricLabel: "Mining Accident Reduction",
      color: "from-primary to-primary-dark",
      miningType: "safety",
      oreGrade: "premium",
    },
    {
      icon: Mountain,
      title: "Geological Intelligence",
      description:
        "Combines underground analytics and machine learning to automatically assess evolving geological risks and rock formation stability",
      metric: "24/7",
      metricLabel: "Underground Monitoring",
      color: "from-secondary to-accent",
      miningType: "monitoring",
      oreGrade: "high",
    },
    {
      icon: Pickaxe,
      title: "Mining Cost-Effective",
      description:
        "Uses low-cost mining hardware and open-source geological technologies for broad adaptability across all excavation operations",
      metric: "70%",
      metricLabel: "Operational Cost Savings",
      color: "from-accent to-secondary",
      miningType: "efficiency",
      oreGrade: "standard",
    },
    {
      icon: Eye,
      title: "Dynamic Excavation System",
      description:
        "Continuously updates underground hazard maps and geo-fences in response to shifting geological displacement trends and rock formation changes",
      metric: "Real-time",
      metricLabel: "Geological Updates",
      color: "from-primary-dark to-primary",
      miningType: "adaptive",
      oreGrade: "high",
    },
    {
      icon: Radio,
      title: "Scalable Mining Solution",
      description:
        "Easily deployable across multiple underground mine sites with centralized surface monitoring capabilities and deep shaft communication",
      metric: "1000+",
      metricLabel: "Miners Tracked",
      color: "from-secondary to-primary",
      miningType: "scalable",
      oreGrade: "premium",
    },
    {
      icon: AlertTriangle,
      title: "Instant Underground Response",
      description:
        "Immediate seismic alerts and underground evacuation protocols minimize response time during geological emergencies and cave-in situations",
      metric: "<30s",
      metricLabel: "Alert Time",
      color: "from-accent to-primary-dark",
    },
  ];

  const getOreGradient = (oreGrade: string) => {
    switch (oreGrade) {
      case "premium":
        return "bg-gradient-ore";
      case "high":
        return "bg-gradient-mineral";
      case "standard":
        return "bg-gradient-to-br from-primary/80 to-secondary/80";
      default:
        return "bg-gradient-ore";
    }
  };

  const getMiningTypeIcon = (miningType: string) => {
    switch (miningType) {
      case "safety":
        return Layers;
      case "monitoring":
        return Eye;
      case "efficiency":
        return Zap;
      case "adaptive":
        return Monitor;
      case "scalable":
        return Radio;
      default:
        return Layers;
    }
  };

  return (
    <section
      id="safety"
      className="py-20 bg-gradient-depth geological-layer relative overflow-hidden"
    >
      {/* Underground mining background */}
      <div className="absolute inset-0 bg-pattern-ore opacity-15"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-seismic opacity-10"></div>

      {/* Ore vein patterns */}
      <div className="absolute top-0 left-1/5 w-2 h-full bg-gradient-to-b from-primary/40 to-secondary/40 opacity-60"></div>
      <div className="absolute top-0 right-1/5 w-2 h-full bg-gradient-to-b from-secondary/40 to-accent/40 opacity-60"></div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Pickaxe className="w-8 h-8 text-primary mr-4" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Underground <span className="text-primary">Mining</span>{" "}
              Advantages
            </h2>
            <Pickaxe className="w-8 h-8 text-primary ml-4 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            MineSafe.ai delivers measurable improvements in underground safety,
            geological efficiency, and excavation cost-effectiveness for deep
            mining operations worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="mining-panel depth-layer-2 rounded-xl p-8 hover-excavate border-2 border-primary/30 group relative overflow-hidden"
            >
              {/* Ore grade indicator */}
              <div
                className={`absolute top-0 right-0 w-4 h-full ${getOreGradient(
                  benefit.oreGrade
                )} opacity-40`}
              ></div>

              {/* Mining type indicator */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Layers className="w-3 h-3" />
                  <span className="uppercase font-bold">
                    {benefit.miningType} OPERATION
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {benefit.metric}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {benefit.metricLabel}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-card-foreground mb-4">
                  {benefit.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Mine Safety?
            </h3>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Join leading mining companies worldwide who trust MineSafe.ai to
              protect their most valuable asset - their workers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                className="bg-secondary hover:bg-secondary-light text-secondary-foreground px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Request Demo
              </button>
              <button
                type="button"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
