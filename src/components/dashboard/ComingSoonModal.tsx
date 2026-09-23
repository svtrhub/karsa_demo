"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/context/DemoContext";
import { Lock, X, ShieldCheck } from "lucide-react";

export const ComingSoonModal: React.FC = () => {
  const { state, closeComingSoon } = useDemo();
  const feature = state.activeComingSoon;

  if (!feature) return null;

  const featureTitles: Record<string, string> = {
    roadmap: "Feed Lomba & Roadmap",
    brankas: "Brankas Koin Detail & Buku Kas",
    snbp: "Dokumen & Penilaian SNBP",
    ruangan: "Kustomisasi Dekorasi Ruangan",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm liquid-glass-modal rounded-3xl p-6 sm:p-8 relative border border-white/20 shadow-2xl overflow-hidden text-center"
        >
          {/* Top-Left Anchored Circle Close 'X' Button */}
          <button
            onClick={closeComingSoon}
            aria-label="Tutup modal"
            className="absolute top-5 left-5 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(72,202,228,0.3)] transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center justify-center text-center space-y-4 pt-3 pb-1">
            {/* Lock Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-[0_0_24px_rgba(230,194,128,0.25)]">
              <Lock className="w-8 h-8" />
            </div>

            {/* Text Content */}
            <div className="space-y-2 max-w-[260px] mx-auto">
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight">Terkunci...</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Fitur ini lagi kami poles biar rapi, tunggu aja yaaa!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
