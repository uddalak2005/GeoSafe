import {
  TrendingUp,
  Users,
  Shield,
  Clock,
  MapPin,
  Zap,
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";

const Statistics = () => {
  const stats = [
    {
      icon: HardHat,
      number: "10,000+",
      label: "Underground Miners Protected",
      description: "Active miners across deep excavation operations",
      miningType: "workforce",
      oreGrade: "premium",
    },
    {
      icon: Mountain,
      number: "95%",
      label: "Cave-in Prevention Rate",
      description: "Decrease in underground rockfall incidents",
      miningType: "safety",
      oreGrade: "high",
    },
    {
      icon: AlertTriangle,
      number: "<30s",
      label: "Seismic Alert Response Time",
      description: "From geological detection to underground notification",
      miningType: "response",
      oreGrade: "premium",
    },
    {
      icon: Pickaxe,
      number: "50+",
      label: "Underground Mine Sites",
      description:
        "Successfully deployed across deep excavation sites worldwide",
      miningType: "deployment",
      oreGrade: "standard",
    },
    {
      icon: Eye,
      number: "99.9%",
      label: "Geological System Uptime",
      description: "Reliable 24/7 underground monitoring",
      miningType: "reliability",
      oreGrade: "high",
    },
    {
      icon: Layers,
      number: "1M+",
      label: "Geological Data Points",
      description: "Processed daily for underground analysis",
      miningType: "processing",
      oreGrade: "standard",
    },
  ];

  const impactAreas = [
    {
      title: "Safety Improvement",
      description:
        "Dramatic reduction in workplace accidents through predictive analytics and real-time monitoring",
      metrics: [
        { label: "Accident Prevention", value: "95%" },
        { label: "Early Warning Accuracy", value: "98%" },
        { label: "Response Time Improvement", value: "85%" },
      ],
    },
    {
      title: "Operational Efficiency",
      description:
        "Streamlined safety protocols and automated monitoring reduce operational overhead",
      metrics: [
        { label: "Monitoring Automation", value: "100%" },
        { label: "Manual Inspection Reduction", value: "70%" },
        { label: "Operational Cost Savings", value: "60%" },
      ],
    },
    {
      title: "Technology Innovation",
      description:
        "Cutting-edge integration of satellite data, AI, and IoT for comprehensive mine safety",
      metrics: [
        { label: "Real-time Processing", value: "24/7" },
        { label: "Prediction Accuracy", value: "92%" },
        { label: "System Integration", value: "100%" },
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/10">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* Statistics Grid */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Proven <span className="text-primary">Impact</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12">
            Real numbers from real deployments across the global mining industry
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/30 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-card-foreground mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Areas */}
        <div className="grid md:grid-cols-3 gap-8">
          {impactAreas.map((area, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/30"
            >
              <h3 className="text-xl font-bold text-card-foreground mb-4">
                {area.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {area.description}
              </p>
              <div className="space-y-4">
                {area.metrics.map((metric, metricIndex) => (
                  <div
                    key={metricIndex}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Global Reach */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Global Mining Safety Leadership
            </h3>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              Trusted by mining companies across 6 continents, MineSafe.ai is
              setting new standards for workplace safety in the extractive
              industries.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Continents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">25</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">
                  Mining Companies
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Active Sites
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
