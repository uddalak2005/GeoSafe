import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Underground Systems",
      icon: Layers,
      links: [
        { name: "Mining Shafts of Safety", href: "#features" },
        { name: "Underground Technology Arsenal", href: "#technology" },
        { name: "Mining Operations Workflow", href: "#how-it-works" },
        { name: "Excavation Pricing", href: "#pricing" },
        { name: "Underground Demo", href: "#demo" },
      ],
    },
    {
      title: "Mining Solutions",
      icon: Mountain,
      links: [
        { name: "Open-Pit Excavation", href: "#open-pit" },
        { name: "Deep Underground Mining", href: "#underground" },
        { name: "Geological Quarries", href: "#quarries" },
        { name: "Surface Construction Sites", href: "#construction" },
        { name: "Enterprise Mining Operations", href: "#enterprise" },
      ],
    },
    {
      title: "Geological Resources",
      icon: Eye,
      links: [
        { name: "Underground Documentation", href: "#docs" },
        { name: "Mining API Reference", href: "#api" },
        { name: "Excavation Case Studies", href: "#case-studies" },
        { name: "Geological White Papers", href: "#white-papers" },
        { name: "Mining Safety Blog", href: "#blog" },
      ],
    },
    {
      title: "Mining Company",
      icon: HardHat,
      links: [
        { name: "About Underground Operations", href: "#about" },
        { name: "Mining Careers", href: "#careers" },
        { name: "Geological News", href: "#news" },
        { name: "Mining Partners", href: "#partners" },
        { name: "Underground Contact", href: "#contact" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  return (
    <footer className="bg-gradient-depth geological-layer relative overflow-hidden">
      {/* Underground mining footer background */}
      <div className="absolute inset-0 bg-pattern-ore opacity-25"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-seismic opacity-20"></div>

      {/* Mining shaft foundation lines */}
      <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-primary/50 to-secondary/50 opacity-80"></div>
      <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-secondary/50 to-accent/50 opacity-80"></div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Underground Mining Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Underground Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-ore rounded-lg flex items-center justify-center shadow-ore">
                  <HardHat className="w-7 h-7 text-background" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    MineSafe.ai
                  </span>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <Pickaxe className="w-3 h-3" />
                    <span className="uppercase font-bold">
                      Underground Operations
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                Revolutionizing underground mine safety through AI-powered
                geological prediction, real-time miner tracking, and automated
                underground safety protocols. Protecting miners' lives with
                cutting-edge geological technology.
              </p>

              {/* Underground Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">
                    contact@minesafe.ai
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">
                    +1 (555) 123-MINE
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mountain className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">
                    Underground Technology Center, Mining District
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">
                    24/7 Emergency Mining Support
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Underground Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-bold text-foreground">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-secondary hover:text-primary transition-colors duration-300 text-sm font-medium flex items-center gap-2 hover:translate-x-1"
                      >
                        <div className="w-1 h-1 bg-secondary rounded-full"></div>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-primary-foreground/20 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
              <p className="text-primary-foreground/80 text-sm">
                Get the latest updates on mine safety technology and industry
                insights
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder-primary-foreground/60 focus:border-secondary focus:outline-none"
              />
              <button className="bg-secondary hover:bg-secondary-light text-secondary-foreground px-6 py-2 rounded-lg font-semibold transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-primary-foreground/80">
              © 2024 MineSafe.ai. All rights reserved.
            </div>

            <div className="flex gap-6 text-sm">
              <a
                href="#privacy"
                className="text-primary-foreground/80 hover:text-secondary transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-primary-foreground/80 hover:text-secondary transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-primary-foreground/80 hover:text-secondary transition-colors duration-300"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>

        {/* Emergency Contact Banner */}
        <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold">
              24/7 Emergency Support:
            </span>
            <a
              href="tel:+15559115233"
              className="text-accent hover:text-accent-light font-bold"
            >
              +1 (555) 911-SAFE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
