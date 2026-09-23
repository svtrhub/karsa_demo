"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ASSETS } from "@/lib/constants";

export interface AppSplashScreenProps {
  /**
   * Callback invoked when minDisplayTime elapses to initiate the up-slide exit animation.
   */
  onDismiss?: () => void;

  /**
   * Minimum duration (in milliseconds) the splash screen remains visible.
   * Default is 1200ms.
   */
  minDisplayTime?: number;

  /**
   * Optional manual hold override for testing / screenshot auditing.
   */
  holdForTest?: boolean;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onDismiss,
  minDisplayTime = 1200,
  holdForTest = false,
}) => {
  useEffect(() => {
    // Check URL parameters for test triggers (e.g. ?splash=hold or ?hold=true)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("splash") === "hold" || params.get("hold") === "true") {
        return;
      }
    }

    if (holdForTest) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onDismiss, holdForTest]);

  return (
    <motion.div
      key="app-splash-screen"
      data-testid="app-splash-screen"
      initial={{ y: 0 }}
      exit={{
        y: "-100%",
        transition: {
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1], // Fluid Apple-style cubic-bezier
        },
      }}
      style={{
        willChange: "transform",
        transform: "translateZ(0)", // GPU compositor layer promotion
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Karsa Splash Screen"
    >
      {/* Dimly lit exterior background */}
      <Image
        src={ASSETS.roomExterior}
        alt="Rumah Karsa Exterior"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover opacity-50 select-none pointer-events-none -z-20"
      />


      {/* Dark scrim overlay (bg-black/40 + radial vignette) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.85) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Brand Logo: Dead-centered font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center select-none px-6">
        <h1
          data-testid="splash-logo"
          className="font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]"
        >
          KARSA
        </h1>
      </div>
    </motion.div>
  );
};

export default AppSplashScreen;
