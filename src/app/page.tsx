"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useDemo } from "@/context/DemoContext";
import { AppSplashScreen } from "@/components/splash/AppSplashScreen";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { FTUXSequence } from "@/components/ftux/FTUXSequence";
import { TopBar } from "@/components/dashboard/TopBar";
import { RumahKarsaRoom } from "@/components/dashboard/RumahKarsaRoom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloatingCommandCenter } from "@/components/dashboard/FloatingCommandCenter";
import { ChatModal } from "@/components/chat/ChatModal";
import { ComingSoonModal } from "@/components/dashboard/ComingSoonModal";

export default function Home() {
  const { state } = useDemo();
  const [showSplash, setShowSplash] = useState(true);
  const isProfileCompleted = state.profile.isCompleted;

  return (
    <>
      {/* Initial Loading Splash Screen with hardware-accelerated up-slide exit */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <AppSplashScreen onDismiss={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Pre-settled underlying views behind z-50 splash overlay (zero CLS, zero camera jumps) */}
      {!isProfileCompleted ? (
        <OnboardingFlow />
      ) : (
        <main className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Full-screen Background Canvas (Space BG + Floating Island) */}
      <RumahKarsaRoom />

      {/* Floating Top Header (Big KARSA Logo Top-Left, Settings Button Top-Right) */}
      <TopBar />

      {/* Floating Left Sidebar */}
      <Sidebar />

      {/* Floating Bottom Command Center (Hidden when chat modal is open) */}
      {!state.activePersona && <FloatingCommandCenter />}

      {/* FTUX Tour Modal Overlay (plays once after onboarding) */}
      {!state.ftuxCompleted && <FTUXSequence />}

      {/* Active Persona Chat Modal */}
      {state.activePersona && <ChatModal />}

      {/* Out-of-Scope Coming Soon Modal */}
      {state.activeComingSoon && <ComingSoonModal />}
    </main>
  )}
</>
  );
}
