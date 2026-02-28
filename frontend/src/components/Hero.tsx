import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Mail,
  SendHorizontal,
  HardHat,
  Pickaxe,
  Mountain,
  AlertTriangle,
} from "lucide-react";
import { Navbar1 } from "./Navbar1";

const Hero = () => {
  return (
    <header>
      <Navbar1 />

      <main>
        <section
          className="overflow-hidden w-full 
        bg-gradient-to-r from-black/50 to-black/10 relative"
        >
          {/* Mining shaft background elements */}
          <div
            className="absolute inset-0 
          bg-black opacity-10"
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full 
          bg-black opacity-5"
          ></div>

          {/* Ore veins */}
          {/* <div
            className="absolute top-0 left-1/6 w-px h-full 
          bg-gradient-to-b from-black/50 to-transparent"
          ></div>
          <div
            className="absolute top-0 right-1/6 w-px h-full 
          bg-gradient-to-b from-black/50 to-transparent"
          ></div> */}

          <div className="relative w-full px-4 md:px-8 lg:px-12 xl:px-16 py-36 lg:py-32 z-10">
            <div className="lg:flex lg:items-center lg:gap-12 w-full">
              <div className="relative z-10 text-center lg:ml-8 xl:ml-16 lg:w-1/2 lg:text-left w-full md:ml-12">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <HardHat className="w-6 h-6 text-secondary mr-3" />
                  <div className="rounded-lg flex items-center gap-2 border border-primary/30 p-1 pr-3 bg-background/20 backdrop-blur-sm">
                    <span className="bg-primary text-primary-foreground rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs font-medium">
                      AI-POWERED
                    </span>
                    <span className="text-sm text-foreground">
                      Underground Intelligence System
                    </span>
                    <span className="bg-border block h-4 w-px"></span>
                    <ArrowRight className="size-4 text-primary" />
                  </div>
                  <Pickaxe className="w-6 h-6 text-secondary ml-3" />
                </div>

                <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl text-foreground">
                  <span className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <Mountain className="w-12 h-12 text-primary" />
                    <span>GeoSafe.ai</span>
                    <Mountain className="w-12 h-12 text-primary scale-x-[-1]" />
                  </span>
                  AI Driven Rockfall{" "}
                  <span className="text-primary">Prediction for</span> for
                  <span className="text-secondary"> Open-pit Mines</span>
                </h1>
                <p className="mt-8 text-muted-foreground">
                  From the deepest excavations to surface operations - our
                  AI-powered geological monitoring system combines satellite
                  InSAR technology, real-time worker tracking, and predictive
                  rockfall analysis to create an impenetrable safety shield
                  around your mining operations.
                </p>

                <div>
                  <form
                    action=""
                    className="mx-auto my-10 max-w-sm 
                    lg:my-12 lg:ml-0 lg:mr-auto"
                  >
                    <div className="bg-background has-[input:focus]:ring-primary/20 relative grid grid-cols-[1fr_auto] items-center rounded-[1rem] border pr-1 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                      <Mail className="text-muted-foreground pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />

                      <input
                        placeholder="Enter your email to access the underground system"
                        className="h-14 w-full bg-transparent pl-12 focus:outline-none"
                        type="email"
                      />

                      <div className="md:pr-1.5 lg:pr-0">
                        <Button aria-label="submit" variant="hero">
                          <span className="hidden md:block">
                            Enter Mine Shaft
                          </span>
                          <SendHorizontal
                            className="relative mx-auto size-5 md:hidden"
                            strokeWidth={2}
                          />
                        </Button>
                      </div>
                    </div>
                  </form>

                  <ul className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <HardHat className="size-4 text-secondary" />
                      <span>Underground Tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mountain className="size-4 text-secondary" />
                      <span>Geological Monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-secondary" />
                      <span>Seismic Alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
              <div
                aria-hidden
                className="absolute z-[1] inset-0 bg-gradient-to-r from-background from-35%"
              />
              <div className="relative">
                <img
                  className="hidden dark:block"
                  src="/src/assets/hero-mining-safety.jpg"
                  alt="Mining safety monitoring dashboard"
                  width={2796}
                  height={2008}
                />
                <img
                  className="dark:hidden"
                  src="/src/assets/hero-mining-safety.jpg"
                  alt="Mining safety monitoring dashboard"
                  width={2796}
                  height={2008}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </header>
  );
};

export default Hero;
