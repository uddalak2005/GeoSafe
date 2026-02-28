import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Users,
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

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Underground Communication",
      value: "contact@minesafe.ai",
      description:
        "Get in touch for underground system demos and geological inquiries",
      miningType: "communication",
    },
    {
      icon: Radio,
      title: "Surface Control Center",
      value: "+1 (555) 123-MINE",
      description:
        "Speak with our underground safety experts and geological engineers",
      miningType: "control",
    },
    {
      icon: Mountain,
      title: "Mining Operations HQ",
      value: "Underground Technology Center",
      description: "123 Excavation Drive, Mining District",
      miningType: "headquarters",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Mining Support",
      value: "24/7 Underground Emergency",
      description:
        "Round-the-clock geological monitoring and cave-in response assistance",
      miningType: "emergency",
    },
  ];

  const ctaOptions = [
    {
      icon: Shield,
      title: "Request Demo",
      description:
        "See MineSafe.ai in action with a personalized demonstration",
      buttonText: "Schedule Demo",
      buttonStyle: "bg-primary hover:bg-primary-dark text-primary-foreground",
    },
    {
      icon: Users,
      title: "Consultation",
      description:
        "Discuss your specific mine safety requirements with our experts",
      buttonText: "Book Consultation",
      buttonStyle:
        "bg-secondary hover:bg-secondary-light text-secondary-foreground",
    },
    {
      icon: Zap,
      title: "Quick Start",
      description: "Get started immediately with our rapid deployment package",
      buttonText: "Start Now",
      buttonStyle: "bg-accent hover:bg-accent-light text-accent-foreground",
    },
  ];

  const getMiningTypeIcon = (miningType: string) => {
    switch (miningType) {
      case "communication":
        return Layers;
      case "control":
        return Monitor;
      case "headquarters":
        return Eye;
      case "emergency":
        return AlertTriangle;
      default:
        return Layers;
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-depth geological-layer relative overflow-hidden"
    >
      {/* Underground mining command center background */}
      <div className="absolute inset-0 bg-pattern-ore opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-seismic opacity-15"></div>

      {/* Mining shaft communication lines */}
      <div className="absolute top-0 left-1/6 w-1 h-full bg-gradient-to-b from-primary/40 to-secondary/40 opacity-70"></div>
      <div className="absolute top-0 right-1/6 w-1 h-full bg-gradient-to-b from-secondary/40 to-accent/40 opacity-70"></div>
      <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-secondary/30 opacity-50"></div>
      <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-secondary/30 to-accent/30 opacity-50"></div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Underground Command Center Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Radio className="w-10 h-10 text-primary mr-4" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Underground <span className="text-primary">Command</span> Center
            </h2>
            <Radio className="w-10 h-10 text-primary ml-4 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Connect with our underground mining safety experts and geological
            engineers who understand the depths of excavation operations and the
            critical importance of miner protection
          </p>
        </div>

        {/* CTA Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {ctaOptions.map((option, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/30 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <option.icon className="w-8 h-8 text-primary-foreground" />
              </div>

              <h3 className="text-xl font-bold text-card-foreground mb-4">
                {option.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {option.description}
              </p>

              <button
                type="button"
                className={`${option.buttonStyle} px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center gap-2 mx-auto`}
              >
                {option.buttonText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Underground Communication Network */}
        <div className="bg-blue-900 rounded-xl p-8 mb-16 relative overflow-hidden border-2 border-primary/30">
          {/* Mining communication background */}
          <div className="absolute inset-0 bg-pattern-seismic opacity-10"></div>
          <div className="absolute top-0 right-0 w-6 h-full bg-gradient-mineral opacity-30"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center mb-4">
              <HardHat className="w-8 h-8 text-background mr-3" />
              <h3 className="text-2xl font-bold text-background">
                Underground Communication Network
              </h3>
              <HardHat className="w-8 h-8 text-background ml-3" />
            </div>
            <p className="text-background/90 max-w-2xl mx-auto">
              Our team of underground mining safety experts and geological
              engineers is ready to help you implement the most advanced
              underground safety monitoring system in the mining industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {contactInfo.map((info, index) => {
              const MiningIcon = getMiningTypeIcon(info.miningType);
              return (
                <div
                  key={index}
                  className="mining-panel depth-layer-3 rounded-lg p-6 text-center border border-primary/20 relative overflow-hidden"
                >
                  {/* Mining type indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <Layers className="w-3 h-3" />
                      <span className="uppercase font-bold">
                        {info.miningType}
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-ore">
                    <info.icon className="w-8 h-8 text-background" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                    <MiningIcon className="w-4 h-4 text-primary" />
                    {info.title}
                  </h4>
                  <div className="text-foreground font-semibold mb-1">
                    {info.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {info.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Mining Support */}
        <div className="mining-panel depth-layer-2 border border-accent/30 rounded-xl p-8 text-center relative overflow-hidden">
          {/* Emergency mining background */}
          <div className="absolute inset-0 bg-pattern-seismic opacity-10"></div>
          <div className="absolute top-0 right-0 w-4 h-full bg-gradient-mineral opacity-30"></div>

          <div className="flex items-center justify-center mb-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-ore rounded-lg flex items-center justify-center mr-4 shadow-ore">
              <AlertTriangle className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Emergency Underground Support
            </h3>
          </div>
          <p className="text-foreground mb-6 max-w-2xl mx-auto relative z-10">
            For urgent underground safety incidents or geological emergencies,
            our 24/7 mining support team is always available to provide
            immediate cave-in response assistance and emergency guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              type="button"
              className="bg-gradient-ore text-background hover:shadow-ore px-8 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              Emergency Hotline: +1 (555) 911-SAFE
            </button>
            <button
              type="button"
              className="mining-panel depth-layer-3 border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Live Underground Support
            </button>
          </div>
        </div>

        {/* Underground Newsletter Signup */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center mb-4">
            <Pickaxe className="w-6 h-6 text-secondary mr-3" />
            <h3 className="text-xl font-bold text-foreground">
              Stay Updated on Underground Safety Innovation
            </h3>
            <Pickaxe className="w-6 h-6 text-secondary ml-3" />
          </div>
          <p className="text-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to receive the latest updates on underground mining safety
            technology, geological insights, and MineSafe.ai underground
            developments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your underground communication email"
              className="flex-1 px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:outline-none mining-panel depth-layer-1"
            />
            <button
              type="button"
              className="bg-gradient-ore text-background hover:shadow-ore px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <HardHat className="w-4 h-4" />
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
