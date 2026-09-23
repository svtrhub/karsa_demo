"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/context/DemoContext";
import { PERSONAS } from "@/lib/personas";
import { ASSETS, PERSONA_POSES } from "@/lib/constants";
import Image from "next/image";
import confetti from "canvas-confetti";
import { ArrowRight, Check, X } from "lucide-react";

export const FTUXSequence: React.FC = () => {
  const { state, advanceFTUX, skipFTUX } = useDemo();
  const { ftuxPhase, ftuxTourIndex, profile } = state;

  const tourAgents = [PERSONAS.ara, PERSONAS.radit, PERSONAS.sekar, PERSONAS.arka];
  const currentTourAgent = tourAgents[ftuxTourIndex] || tourAgents[0];

  // Fire confetti when coin claim modal appears
  useEffect(() => {
    if (ftuxPhase === "modal") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F4D06F", "#48CAE4", "#FF9F1C", "#2EC4B6"],
        });
      } catch {
        console.error("Confetti trigger failed");
      }
    }
  }, [ftuxPhase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
      <AnimatePresence mode="wait">
        {/* PHASE 1: Door Open — exterior background + Karsa at doorway */}
        {ftuxPhase === "door" && (
          <motion.div
            key="ftux-door"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg liquid-glass-modal rounded-3xl overflow-hidden relative text-center shadow-2xl border border-white/20"
          >
            {/* Exterior background */}
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src={ASSETS.roomExterior}
                alt="Pintu Rumah Karsa terbuka"
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />
              {/* Overlay tint */}
              <div className="absolute inset-0 bg-slate-950/40" />
              {/* Karsa sprite at doorway */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                <Image
                  src={ASSETS.pose("karsa", PERSONA_POSES.karsa.working)}
                  alt="Karsa membuka pintu Rumah Karsa"
                  width={110}
                  height={140}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Content below image */}
            <div className="p-8 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-100 leading-snug text-pretty">
                Selamat Datang, <span className="text-amber-300">{profile.nama || "Teman"}</span>!
              </h2>

              <button
                onClick={advanceFTUX}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] text-slate-950 font-bold text-base shadow-[0_0_24px_rgba(230,194,128,0.35)] hover:shadow-[0_0_32px_rgba(230,194,128,0.5)] hover:brightness-105 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Masuk ke Ruang Utama</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}


        {/* PHASE 2: Coin Claim — koin_karsa.svg + Radit presenting */}
        {ftuxPhase === "modal" && (
          <motion.div
            key="ftux-modal"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md liquid-glass-modal rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_32px_rgba(230,194,128,0.3)]"
          >
            {/* Radit sprite banner */}
            <div className="relative h-36 flex items-end justify-center bg-gradient-to-b from-emerald-900/40 to-slate-950/70 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80" />
              <Image
                src={ASSETS.pose("radit", PERSONA_POSES.radit.working)}
                alt="Radit mempresentasikan koin"
                width={100}
                height={128}
                className="object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                priority
              />
              {/* Big koin floating */}
              <div className="absolute top-4 right-8 animate-bounce z-10">
                <Image
                  src={ASSETS.koin}
                  alt="Koin Karsa"
                  width={52}
                  height={52}
                  className="drop-shadow-[0_4px_12px_rgba(244,208,111,0.6)]"
                />
              </div>
            </div>

            <div className="p-8 text-center space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Hadiahmu dari Radit
                </span>
                <h3 className="text-3xl font-black text-amber-300 tabular-nums">+250 Koin Karsa</h3>
                <p className="text-slate-300 text-sm leading-relaxed text-pretty">
                  Kamu dapet 250 Koin Karsa karena udah selesain profil awal.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-white/15 text-xs text-slate-300 text-center">
                Pakai koin ini untuk membuka panduan lomba eksklusif.
              </div>

              <button
                onClick={advanceFTUX}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] text-slate-950 font-bold text-base shadow-[0_0_24px_rgba(230,194,128,0.35)] hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Ambil Koin</span>
                <Check className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: 4-Beat Station Tour — portrait thumbnails, no letter initials */}
        {ftuxPhase === "tour" && (
          <motion.div
            key={`ftux-tour-${ftuxTourIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg liquid-glass-modal rounded-3xl p-8 space-y-6 relative border border-white/20"
          >
            {/* Tour Stepper Indicator */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tur Sobat Karsa</span>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                  {ftuxTourIndex + 1} / 4
                </span>
              </div>
              <button
                onClick={skipFTUX}
                className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
              >
                Lewati Tur
              </button>
            </div>

            {/* Persona Highlight Card — portrait thumbnail replaces letter initial */}
            <div className="flex items-start gap-4 p-4 rounded-2xl liquid-glass border border-white/15">
              {/* Real character standing sprite — non-transparent head pose_1 */}
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/15 flex items-center justify-center relative"
                style={{ backgroundColor: `${currentTourAgent.accentColor}25` }}
              >
                <Image
                  src={ASSETS.pose(currentTourAgent.id, PERSONA_POSES[currentTourAgent.id].idle)}
                  alt={`Sprite ${currentTourAgent.name}`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-slate-100">{currentTourAgent.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentTourAgent.badgeBg}`}>
                    {currentTourAgent.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentTourAgent.stationName}</p>
              </div>
            </div>

            {/* Tour Callout text — curly quotes */}
            <div className="p-4 rounded-2xl liquid-glass-card border border-cyan-400/30">
              <p className="text-slate-200 text-sm leading-relaxed text-pretty">
                &#8220;{currentTourAgent.tourCallout}&#8221;
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === ftuxTourIndex ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "w-2 bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={advanceFTUX}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#E6C280] to-[#D4AF37] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(230,194,128,0.3)] hover:brightness-105 transition-all flex items-center gap-2"
              >
                <span>{ftuxTourIndex < 3 ? "Berikutnya" : "Mulai di Rumah Karsa!"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
