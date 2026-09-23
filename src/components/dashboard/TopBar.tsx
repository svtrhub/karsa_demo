"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useDemo } from "@/context/DemoContext";
import { COMING_SOON_FEATURES } from "@/lib/constants";
import { ComingSoonFeature } from "@/lib/types";
import {
  Settings,
  Coins,
  MapPin,
  FileText,
  Palette,
  RotateCcw,
  Lock,
  ChevronRight,
} from "lucide-react";

export const TopBar: React.FC = () => {
  const { state, resetDemo, openComingSoon, closeChat } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowConfirmReset(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const comingSoonFeatures = COMING_SOON_FEATURES.map((item) => ({
    ...item,
    desc: item.id === "brankas" ? `Saldo: ${state.koinBalance} Koin` : item.desc,
    badge: item.id === "brankas" ? `${state.koinBalance} Koin` : undefined,
  }));


  return (
    <header className="fixed top-0 left-0 right-0 px-4 md:px-6 pt-5 pb-2 flex items-center justify-end z-30 pointer-events-none">

      {/* Floating Settings Dropdown Container (Top-Right) */}
      <div className="relative pointer-events-auto shrink-0 flex flex-col items-end" ref={dropdownRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowConfirmReset(false);
          }}
          aria-label="Pengaturan & Menu Features"
          className={`p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border transition-colors duration-150 shadow-xl ${
            isOpen
              ? "border-cyan-400/80 text-cyan-300 shadow-[0_0_16px_rgba(72,202,228,0.3)]"
              : "border-white/20 text-slate-300 hover:text-white hover:border-white/40"
          }`}
          title="Pengaturan & Menu"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 liquid-glass-card p-3 rounded-2xl border border-white/20 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header info */}
            <div className="px-2 py-1.5 border-b border-white/10 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pengaturan & Fitur
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold">
                {state.profile.nama || "Siswa"}
              </span>
            </div>

            {/* Coming Soon Features */}
            <div className="space-y-1">
              {comingSoonFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      openComingSoon(feat.id);
                      setIsOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left transition-all flex items-center justify-between group hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-105 transition-transform shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                        {feat.label}
                      </span>
                    </div>
                    {feat.badge ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                        {feat.badge}
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reset Demo Option */}
            <div className="pt-2 mt-2 border-t border-white/10">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40 text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ) : (
                <div className="p-2 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-1.5 text-center">
                  <p className="text-[11px] text-rose-200 font-medium">
                    Reset seluruh progres demo?
                  </p>
                  <div className="flex items-center gap-1.5 justify-center">
                    <button
                      onClick={() => {
                        resetDemo();
                        setIsOpen(false);
                      }}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 shadow-sm flex-1"
                    >
                      Ya, Reset
                    </button>
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 flex-1"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
