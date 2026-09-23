"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDemo } from "@/context/DemoContext";
import { PERSONAS } from "@/lib/personas";
import { ASSETS, PERSONA_POSES, COMING_SOON_FEATURES } from "@/lib/constants";
import { PersonaKey } from "@/lib/types";
import { Lock, Menu, X } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { state, openChat, closeChat, openComingSoon } = useDemo();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const agentKeys: PersonaKey[] = ["karsa", "ara", "radit", "sekar", "arka"];


  return (
    <>
      {/* Mobile Top-Left Header Toggle Button & Wordmark */}
      <div className="md:hidden fixed top-5 left-4 z-40 flex items-center gap-2 pointer-events-auto select-none">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-label={isOpenMobile ? "Tutup menu" : "Buka menu navigation"}
          className={`p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border transition-all duration-150 shadow-xl ${
            isOpenMobile
              ? "border-cyan-400/80 text-cyan-300 shadow-[0_0_16px_rgba(72,202,228,0.3)]"
              : "border-white/20 text-slate-300 hover:text-white hover:border-white/40"
          }`}
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-logo font-bold text-xl text-white tracking-wider uppercase opacity-90 drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]">
          KARSA
        </span>
      </div>

      {/* Mobile Dark Scrim Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Clean ChatGPT-Style Liquid Glass Sidebar Panel */}
      <aside
        onClick={() => {
          if (!isOpenMobile && typeof window !== "undefined" && window.innerWidth < 768) {
            setIsOpenMobile(true);
          }
        }}
        className={`fixed top-1/2 -translate-y-1/2 left-4 z-50 md:z-20 w-64 max-h-[85vh] liquid-glass rounded-3xl flex flex-col justify-between p-4 transition-transform duration-300 shadow-2xl backdrop-blur-2xl pointer-events-auto ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0 cursor-pointer md:cursor-default"
        }`}
      >
        <div className="space-y-4 overflow-y-auto pr-1 select-none">
          {/* Header: Centered KARSA Brand Wordmark */}
          <div
            className="w-full pb-3 border-b border-white/10 flex justify-center items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none opacity-[0.86]"
            onClick={() => {
              closeChat();
              setIsOpenMobile(false);
            }}
            title="Kembali ke Beranda"
          >
            <span className="font-logo font-bold text-2xl md:text-3xl text-white tracking-wider text-center uppercase drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
              KARSA
            </span>
          </div>

          {/* Section 1: Sobat Karsa Threads (Clean Flat Rows) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block text-center opacity-[0.86] mb-1">
              Sobat Karsa
            </span>

            <div className="space-y-0.5">
              {agentKeys.map((key) => {
                const persona = PERSONAS[key];
                const isActive = state.activePersona === key;
                const thread = state.chatThreads[key] || [];
                const lastMsg = thread[thread.length - 1];
                const poseName = PERSONA_POSES[key].idle;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      openChat(key);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-3 text-left group ${
                      isActive
                        ? "bg-white/10 text-white font-semibold shadow-sm border-l-2 border-amber-400 pl-3"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5"
                    }`}
                  >
                    {/* Floating Avatar Circle (No Card Frame) */}
                    <div
                      className={`w-8 h-8 rounded-full relative overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center ${
                        isActive ? "ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(230,194,128,0.4)]" : ""
                      }`}
                      style={{ backgroundColor: `${persona.accentColor}25` }}
                    >
                      <Image
                        src={ASSETS.pose(key, poseName)}
                        alt={persona.name}
                        fill
                        className="object-contain p-0.5"
                        sizes="32px"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="text-xs font-medium truncate group-hover:text-white">
                        {persona.name}
                      </span>
                      {thread.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      )}
                    </div>
                  </button>

                );
              })}
            </div>
          </div>

          {/* Section 2: Fitur Lainnya (Clean Flat Items) */}
          <div className="space-y-1.5 pt-3.5 border-t border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block opacity-[0.86] mb-1">
              Fitur Lainnya
            </span>

            <div className="space-y-0.5">
              {COMING_SOON_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      openComingSoon(feat.id);
                      setIsOpenMobile(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all duration-150 flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-slate-400/80 group-hover:text-cyan-400 shrink-0 transition-colors" />
                      <span className="text-xs font-medium text-slate-300 truncate group-hover:text-white">
                        {feat.label}
                      </span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-500/70 group-hover:text-slate-400 shrink-0 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minimal Footer Badge */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500/80 font-medium">
            Demo Karsa © 2026 Belimpact Global
          </p>
        </div>
      </aside>
    </>
  );
};
