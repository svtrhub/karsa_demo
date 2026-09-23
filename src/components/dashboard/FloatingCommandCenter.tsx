"use client";

import React, { useState } from "react";
import { useDemo } from "@/context/DemoContext";
import { Send, Compass, BookOpen, Clock } from "lucide-react";
import { PersonaKey } from "@/lib/types";

export const FloatingCommandCenter: React.FC = () => {
  const { openChat, state } = useDemo();
  const [inputText, setInputText] = useState("");

  const quickActionChips: Array<{
    label: string;
    personaKey: PersonaKey;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    promptText: string;
    accentColor: string;
  }> = [
    {
      label: "Cari Lomba",
      personaKey: "karsa",
      icon: Compass,
      promptText: "Cari Lomba: bantu aku carikan lomba yang sesuai dengan minat dan jenjangku",
      accentColor: "#6A2C91",
    },
    {
      label: "Review Tulisan",
      personaKey: "arka",
      icon: BookOpen,
      promptText: "Review Tulisan: periksa alur argumen draf saya",
      accentColor: "#A594F9",
    },
    {
      label: "Jadwal Hari Ini",
      personaKey: "ara",
      icon: Clock,
      promptText: "Jadwal Hari Ini: buatkan target belajar 20 menit untuk hari ini",
      accentColor: "#0283D6",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const targetPersona = state.activePersona || "karsa";
    const textToSend = inputText.trim();
    setInputText("");

    openChat(targetPersona, textToSend);
  };

  const handleChipClick = (personaKey: PersonaKey, promptText: string) => {
    openChat(personaKey, promptText);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-40">
      {/* Liquid Glass Architecture Dock */}
      <div className="liquid-glass-dock p-2 md:p-2.5 rounded-2xl md:rounded-3xl border border-white/25 shadow-2xl backdrop-blur-3xl">
        {/* Scrim layer for legibility */}
        <div className="glass-scrim" />

        {/* Liquid Glass Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanya Karsa soal lomba, atau ketik rencana belajarmu…"
            aria-label="Tanya Karsa soal lomba"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            className="w-full py-3.5 pl-4 pr-12 rounded-xl liquid-glass border border-white/20 text-white placeholder-slate-400 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Kirim pertanyaan"
            className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:hover:brightness-100 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};

