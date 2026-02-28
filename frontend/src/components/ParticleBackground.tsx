// Particle background for all pages
"use client";
import React from "react";
import { Particles } from "./Particles";

const ParticleBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Particles quantity={100} color="#f3f3e7" />
    </div>
  );
};

export default ParticleBackground;
