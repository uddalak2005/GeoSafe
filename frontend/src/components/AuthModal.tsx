"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  HardHat,
  Pickaxe,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Shield,
  Mountain,
  Layers,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    company: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log("Auth form submitted:", formData);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      company: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="relative w-full max-w-md">
              {/* Underground Mining Auth Panel */}
              <div className="mining-panel depth-layer-1 rounded-2xl p-8 border-2 border-primary/30 relative overflow-hidden">
                {/* Underground background patterns */}
                <div className="absolute inset-0 bg-pattern-ore opacity-20"></div>
                <div className="absolute inset-0 bg-pattern-seismic opacity-10"></div>
                
                {/* Ore veins */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-secondary/50 to-transparent"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-primary/50 to-transparent"></div>

                {/* Close Button */}
                <motion.button
                  className="absolute top-4 right-4 mining-panel depth-layer-2 p-2 rounded-lg border border-primary/30 hover:border-primary/50 transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-secondary" />
                </motion.button>

                {/* Header */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-ore rounded-lg flex items-center justify-center shadow-ore">
                      <HardHat className="w-7 h-7 text-background" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        MineSafe.ai
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <Pickaxe className="w-3 h-3" />
                        <span className="uppercase font-bold">
                          Underground Access
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {isLogin ? "Enter Underground System" : "Join Mining Operations"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isLogin 
                      ? "Access your underground command center" 
                      : "Create your mining safety account"}
                  </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                  {!isLogin && (
                    <>
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-secondary" />
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 mining-panel depth-layer-2 rounded-lg border border-primary/30 focus:border-primary/50 focus:outline-none text-foreground placeholder-muted-foreground"
                            placeholder="Enter your full name"
                            required={!isLogin}
                          />
                        </div>
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-secondary" />
                          Mining Company
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 mining-panel depth-layer-2 rounded-lg border border-primary/30 focus:border-primary/50 focus:outline-none text-foreground placeholder-muted-foreground"
                            placeholder="Enter your company name"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-secondary" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 mining-panel depth-layer-2 rounded-lg border border-primary/30 focus:border-primary/50 focus:outline-none text-foreground placeholder-muted-foreground"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-secondary" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 mining-panel depth-layer-2 rounded-lg border border-primary/30 focus:border-primary/50 focus:outline-none text-foreground placeholder-muted-foreground"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password for Sign Up */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4 text-secondary" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 mining-panel depth-layer-2 rounded-lg border border-primary/30 focus:border-primary/50 focus:outline-none text-foreground placeholder-muted-foreground"
                          placeholder="Confirm your password"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-ore text-background font-semibold rounded-lg hover:shadow-ore transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Layers className="w-4 h-4" />
                    {isLogin ? "Enter Underground System" : "Join Mining Operations"}
                  </motion.button>

                  {/* Toggle Auth Mode */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "New to underground operations?" : "Already have access?"}
                    </p>
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      {isLogin ? "Create Mining Account" : "Enter Existing System"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
