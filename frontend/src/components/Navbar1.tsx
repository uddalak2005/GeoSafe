"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  HardHat,
  Pickaxe,
  Mountain,
  Eye,
  Layers,
  Radio,
  AlertTriangle,
  Monitor,
} from "lucide-react";
import AuthModal from "./AuthModal";

const Navbar1 = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      // Smooth scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else if (href === "/dashboard") {
      // Navigate to dashboard page
      window.location.href = "/dashboard";
    } else {
      // Navigate to other pages
      window.location.href = href;
    }
  };

  return (
    <div
      className="flex justify-center w-full py-6 px-4 
      relative overflow-hidden"
    >
      {/* Underground mining navbar background */}
      {/* <div className="absolute inset-0 
      bg-pattern-ore opacity-15"></div>
      <div className="absolute top-0 left-0 
      w-full h-full bg-pattern-seismic opacity-10"></div> */}

      <div
        className="mining-panel depth-layer-1 flex 
      items-center justify-between px-4 md:px-10 py-3 
      md:py-4 rounded-full shadow-ore w-full max-w-6xl 
      relative z-10 border-2 border-primary/30"
      >
        {/* Ore vein indicator */}
        <div
          className="absolute top-0 right-0 w-3 h-full 
         opacity-40 rounded-r-full"
        ></div>
        <div className="flex items-center">
          <motion.div
            className="w-8 h-8 md:w-12 md:h-12 mr-2 md:mr-3 bg-gradient-ore rounded-lg flex items-center justify-center shadow-ore"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <HardHat className="w-5 h-5 md:w-7 md:h-7 text-background" />
          </motion.div>
          <div>
            <motion.h1
              className="text-lg md:text-xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              MineSafe.ai
            </motion.h1>
            <div className="hidden sm:flex items-center gap-2 text-xs text-secondary">
              <Pickaxe className="w-3 h-3" />
              <span className="uppercase font-bold">
                Underground Operations
              </span>
            </div>
          </div>
        </div>

        {/* Navigation for Desktop Only */}
        <div className="flex items-center w-full">
          {/* Underground Navigation Links - Hidden on Mobile */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            {[
              { name: "Surface", href: "/", icon: Mountain },
              { name: "Systems", href: "#features", icon: Layers },
              { name: "Operations", href: "#technology", icon: Eye },
              {
                name: "Safety",
                href: "#safety",
                icon: AlertTriangle,
              },
              { name: "Command", href: "#contact", icon: Radio },
              { name: "Dashboard", href: "/dashboard", icon: Monitor },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.1 + 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1"
              >
                <item.icon className="w-3 h-3 text-secondary" />
                <button
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Mobile Spacer - Takes up space where nav links would be */}
          <div className="flex-1 md:hidden"></div>

          {/* Underground Command Buttons */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <motion.div
              whileHover={{ scale: 1.08 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: 0.7 }}
            >
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2 text-xs rounded-full transition-colors border mining-panel depth-layer-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <Monitor className="w-3 h-3 md:w-3 md:h-3 mr-1" />
                <span className="inline">Login</span>
              </button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.08 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: 0.8 }}
            >
              <button
                type="button"
                onClick={() => handleNavClick("/dashboard")}
                className="inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2 text-xs rounded-full transition-colors bg-gradient-ore text-background hover:shadow-ore"
              >
                <HardHat className="w-3 h-3 md:w-3 md:h-3 mr-1" />
                <span className="inline">Enter Mine</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export { Navbar1 };
