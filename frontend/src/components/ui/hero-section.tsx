"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Mail,
  Menu,
  SendHorizontal,
  X,
  Shield,
  MapPin,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "#dashboard" },
  { name: "Technology", href: "#technology" },
  { name: "Safety", href: "#safety" },
  { name: "Contact", href: "#contact" },
];

export function HeroSection() {
  const [menuState, setMenuState] = useState(false);
  return (
    <>
      <header>
        <nav
          data-state={menuState && "active"}
          className="group fixed z-20 w-full border-b border-dashed bg-background/95 backdrop-blur md:relative dark:bg-background/50 lg:dark:bg-transparent"
        >
          <div className="w-full px-0">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <a
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <Logo />
                </a>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button variant="outline" size="sm">
                    <span>Login</span>
                  </Button>

                  <Button size="sm">
                    <span>Request Demo</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="relative w-full px-0 py-36 lg:py-32">
            <div className="lg:flex lg:items-center lg:gap-12">
              <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <a
                  href="/"
                  className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0"
                >
                  <span className="bg-primary/10 text-primary rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs font-medium">
                    AI-Powered
                  </span>
                  <span className="text-sm">Rockfall Prediction System</span>
                  <span className="bg-border block h-4 w-px"></span>
                  <ArrowRight className="size-4" />
                </a>

                <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">
                  Minesafe.ai – Empowering{" "}
                  <span className="text-primary">Safer Mining</span> with
                  Real-Time AI
                </h1>
                <p className="mt-8 text-muted-foreground">
                  Predict, prevent, and protect with our intelligent system
                  combining satellite data, machine learning, and IoT to
                  safeguard mine workers from rockfall risks.
                </p>

                <div>
                  <form
                    action=""
                    className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto"
                  >
                    <div className="bg-background has-[input:focus]:ring-primary/20 relative grid grid-cols-[1fr_auto] items-center rounded-[1rem] border pr-1 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                      <Mail className="text-muted-foreground pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />

                      <input
                        placeholder="Enter your email for demo access"
                        className="h-14 w-full bg-transparent pl-12 focus:outline-none"
                        type="email"
                      />

                      <div className="md:pr-1.5 lg:pr-0">
                        <Button aria-label="submit" variant="hero">
                          <span className="hidden md:block">Request Demo</span>
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
                      <Shield className="size-4 text-primary" />
                      <span>Real-Time Tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      <span>Dynamic Hazard Zones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="size-4 text-primary" />
                      <span>Instant Alerts</span>
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
    </>
  );
}

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold text-foreground">Minesafe.ai</span>
    </div>
  );
};
