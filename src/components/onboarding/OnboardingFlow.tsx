"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/context/DemoContext";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  GraduationCap,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { ASSETS, PERSONA_POSES } from "@/lib/constants";

export type JenjangCategory = "SMP" | "SMA";

export interface SubClassOption {
  value: string;
  grade: string;
  fase: string;
  focus: string;
}

export interface Tier1Category {
  id: JenjangCategory;
  label: string;
  badge: string;
  description: string;
}

export const TIER1_CATEGORIES: Tier1Category[] = [
  {
    id: "SMP",
    label: "SMP",
    badge: "Kelas 7–9",
    description: "Sekolah Menengah Pertama",
  },
  {
    id: "SMA",
    label: "SMA / SMK",
    badge: "Kelas 10–12",
    description: "Sekolah Menengah Atas & Kejuruan",
  },
];

export const SUB_CLASSES_BY_CATEGORY: Record<JenjangCategory, SubClassOption[]> = {
  SMP: [
    {
      value: "SMP Kelas 7",
      grade: "Kelas 7",
      fase: "Fase D",
      focus: "Eksplorasi Minat & Riset Dasar",
    },
    {
      value: "SMP Kelas 8",
      grade: "Kelas 8",
      fase: "Fase D",
      focus: "Penguatan Riset & Lomba OSN",
    },
    {
      value: "SMP Kelas 9",
      grade: "Kelas 9",
      fase: "Fase D",
      focus: "Persiapan Masuk SMA & Portofolio",
    },
  ],
  SMA: [
    {
      value: "SMA/SMK Kelas 10",
      grade: "Kelas 10",
      fase: "Fase E",
      focus: "Fondasi Portofolio SNBP",
    },
    {
      value: "SMA/SMK Kelas 11",
      grade: "Kelas 11",
      fase: "Fase F",
      focus: "Puncak Prestasi OPSI & OSN",
    },
    {
      value: "SMA/SMK Kelas 12",
      grade: "Kelas 12",
      fase: "Fase F",
      focus: "Finalisasi Prestasi & SNBP",
    },
  ],
};



const KEAHLIAN_OPTIONS = [
  "Sains & Riset (OSN / OPSI: Eksperimen & Penelitian)",
  "Teknologi & Coding (Aplikasi, Web & Game)",
  "Seni & Desain (FLS2N: Visual & Musik)",
  "Debat & Bahasa (Debat Bahasa Indonesia / Inggris)",
  "Esai & Karya Tulis (Gagasan Tertulis & Opini)",
  "Bisnis & Kewirausahaan (Rencana Usaha & Inovasi)",
];

const RITME_OPTIONS = [
  "15-20 Menit (Santai)",
  "30-45 Menit (Fokus)",
  "60+ Menit (Serius)",
];

const TARGET_OPTIONS = [
  "Menang OSN/OPSI",
  "Bangun Portofolio SNBP",
  "Cari Teman Tim Lomba",
  "Riset & Publikasi Karya",
  "Persiapan Beasiswa",
];

// Floating character sprite used in step headers — state-driven pose via PERSONA_POSES
interface StepSpriteProps {
  personaId: "karsa" | "ara" | "radit" | "sekar" | "arka";
  poseState: "idle" | "working" | "active" | "celebrate";
  alt: string;
  className?: string;
}

const StepSprite: React.FC<StepSpriteProps> = ({ personaId, poseState, alt, className = "" }) => {
  const poseName = PERSONA_POSES[personaId][poseState];
  return (
    <div className={`relative shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${className}`}>
      <Image
        src={ASSETS.pose(personaId, poseName)}
        alt={alt}
        width={72}
        height={92}
        className="object-contain w-[56px] h-[72px] sm:w-[72px] sm:h-[92px]"
        priority
      />
    </div>
  );
};

export const OnboardingFlow: React.FC = () => {
  const { state, setProfileData, setOnboardingStep, completeOnboarding } = useDemo();
  const step = state.onboardingStep;
  const profile = state.profile;

  const [inputNama, setInputNama] = useState(profile.nama || "Budi");
  const [isTermsGiven, setIsTermsGiven] = useState(true);


  // Tier 1 & 2 state management for Step 1 (derived from context profile)
  const activeCategory: JenjangCategory = profile.jenjangKelas?.startsWith("SMP") ? "SMP" : "SMA";
  const [lastSmpClass, setLastSmpClass] = useState<string>(() =>
    profile.jenjangKelas?.startsWith("SMP") ? profile.jenjangKelas : "SMP Kelas 7"
  );
  const [lastSmaClass, setLastSmaClass] = useState<string>(() =>
    profile.jenjangKelas?.startsWith("SMA") ? profile.jenjangKelas : "SMA/SMK Kelas 10"
  );

  const handleCategoryChange = (category: JenjangCategory) => {
    const targetClass = category === "SMP" ? lastSmpClass : lastSmaClass;
    setProfileData({ jenjangKelas: targetClass });
  };

  const handleSubClassSelect = (val: string) => {
    setProfileData({ jenjangKelas: val });
    if (val.startsWith("SMP")) {
      setLastSmpClass(val);
    } else {
      setLastSmaClass(val);
    }
  };


  const toggleArrayItem = (
    currentList: string[],
    item: string,
    maxLimit: number = 3
  ): string[] => {
    if (currentList.includes(item)) {
      return currentList.filter((i) => i !== item);
    }
    if (currentList.length >= maxLimit) {
      return [...currentList.slice(1), item];
    }
    return [...currentList, item];
  };

  const handleNext = () => {
    if (step === 0) {
      if (!inputNama.trim()) return;
      setProfileData({ nama: inputNama.trim() });
      setOnboardingStep(1);
    } else if (step < 4) {
      setOnboardingStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) setOnboardingStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-karsa-bg text-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-y-auto batik-overlay">
      {/* Ambient Darkened Exterior Background with Optical Dual-Scrim Stack (Requirement R2) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Exterior Image at opacity-30 */}
        <Image
          src={ASSETS.roomExterior}
          alt="Rumah Karsa Exterior"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-30 select-none pointer-events-none"
        />


        {/* Scrim A (vertical linear depth scrim) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 pointer-events-none" />

        {/* Scrim B (radial vignette shield) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(11,19,43,0.5) 0%, rgba(8,13,26,0.88) 100%)",
          }}
        />
      </div>

      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-karsa-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-karsa-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theatrical Spotlight Reveal (Top-Right Show Beam focused on Central Modal) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Apex Luminaire Emitter */}
        <div className="absolute -top-28 -right-28 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-white/50 via-[#F4D06F]/35 to-transparent blur-3xl opacity-90 animate-pulse-glow pointer-events-none" />

        {/* Core Theatrical God-Ray Shaft */}
        <div
          className="absolute -top-10 right-0 w-[1350px] h-[1050px] opacity-75 mix-blend-screen pointer-events-none"
          style={{
            clipPath: "polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)",
            background:
              "linear-gradient(225deg, rgba(255, 255, 255, 0.5) 0%, rgba(244, 208, 111, 0.32) 28%, rgba(72, 202, 228, 0.16) 60%, transparent 90%)",
            filter: "blur(36px)",
          }}
        />

        {/* Secondary Soft Wash Beam */}
        <div
          className="absolute -top-10 right-0 w-[1400px] h-[1100px] opacity-45 mix-blend-screen pointer-events-none"
          style={{
            clipPath: "polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)",
            background:
              "linear-gradient(225deg, rgba(244, 208, 111, 0.2) 0%, rgba(72, 202, 228, 0.12) 45%, transparent 85%)",
            filter: "blur(65px)",
          }}
        />

        {/* Modal Stage Bounce / Backlight Halo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-65 mix-blend-screen pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(244, 208, 111, 0.24) 0%, rgba(72, 202, 228, 0.14) 45%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Progress Dots */}
      <div
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuetext={`Langkah ${step + 1} dari 5`}
        className="mb-4 sm:mb-8 flex items-center gap-2 z-10 shrink-0"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-amber-300 shadow-[0_0_12px_rgba(230,194,128,0.5)]"
                : i < step
                ? "w-2 bg-cyan-400"
                : "w-2 bg-slate-700/60"
            }`}
          />
        ))}
      </div>

      {/* Main Liquid Glass Card Container */}
      <div className="w-full max-w-xl liquid-glass-modal rounded-3xl p-4 sm:p-6 md:p-8 z-10 shadow-2xl relative border border-white/15 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome Gate */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              {/* Karsa enlarged sprite & right-positioned speech bubble */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="relative shrink-0 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
                  <Image
                    src={ASSETS.pose("karsa", PERSONA_POSES.karsa.idle)}
                    alt="Karsa menyambut"
                    width={100}
                    height={130}
                    className="object-contain w-[100px] h-[130px]"
                    priority
                  />
                </div>
                {/* Speech bubble to the right */}
                <div className="relative liquid-glass rounded-2xl rounded-tl-none p-3.5 max-w-xs text-left shadow-xl border border-violet-400/30">
                  <p className="text-xs md:text-sm font-semibold text-slate-100 leading-snug text-pretty">
                    &#8220;Halo! Namaku Karsa, selamat datang!&#8221;
                  </p>
                </div>
              </div>

              {/* Big White KARSA Logo in Redaction 35 Font (90% opacity) */}
              <div className="py-4 flex justify-center select-none">
                <span className="font-logo font-bold text-5xl md:text-6xl text-white tracking-widest opacity-90 drop-shadow-[0_4px_30px_rgba(255,255,255,0.35)] uppercase">
                  KARSA
                </span>
              </div>

              <div className="pt-2 max-w-sm mx-auto space-y-3 text-left">
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="input-nama-panggilan"
                    type="text"
                    name="namaPanggilan"
                    autoComplete="given-name"
                    spellCheck={false}
                    value={inputNama}
                    onChange={(e) => setInputNama(e.target.value)}
                    placeholder="Nama panggilanmu"
                    aria-label="Nama panggilanmu"
                    className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-slate-950/70 border border-white/20 text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!inputNama.trim()}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] text-slate-950 font-bold text-base shadow-[0_0_24px_rgba(230,194,128,0.35)] hover:shadow-[0_0_32px_rgba(230,194,128,0.5)] hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span>Mulai Perjalanan</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
                <p className="text-xs text-slate-500 text-center">
                  Demo Kompetisi Pitch Belimpact Global 2026
                </p>
              </div>
            </motion.div>
          )}


          {/* STEP 1: Jenjang Kelas (2-Tier Segmented Control) */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Karsa Header Banner */}
              <div className="flex items-center gap-3 sm:gap-4 border-b border-white/10 pb-3 sm:pb-4">
                <StepSprite personaId="karsa" poseState="active" alt="Karsa dengan kompas" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Karsa</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 text-pretty">Kamu kelas berapa sekarang?</h2>
                  <p className="text-xs text-slate-400 text-pretty">
                    Biar Karsa bisa nyariin lomba dan pendampingan yang pas sama jenjangmu.
                  </p>
                </div>
              </div>

              {/* TIER 1: Category Segmented Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Jenjang Pendidikan</label>
                <div
                  role="tablist"
                  aria-label="Pilih Jenjang Pendidikan"
                  className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md relative gap-1.5"
                >
                  {TIER1_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        role="tab"
                        id={`tab-${cat.id.toLowerCase()}`}
                        aria-selected={isActive}
                        aria-controls="tier2-subclasses-panel"
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`relative z-10 py-2.5 px-3 sm:px-6 rounded-xl text-center transition-colors duration-200 flex flex-col items-center justify-center min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isActive ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeJenjangTier1"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] shadow-[0_0_20px_rgba(230,194,128,0.45)] -z-10"
                          />
                        )}
                        <span className="text-sm md:text-base tracking-wide">{cat.label}</span>
                        <span className={`text-[10px] font-medium tracking-tight ${isActive ? "text-slate-900/80" : "text-slate-500"}`}>
                          {cat.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIER 2: Sub-Class Selection Panel */}
              <div
                id="tier2-subclasses-panel"
                role="tabpanel"
                aria-labelledby={`tab-${activeCategory.toLowerCase()}`}
                className="space-y-2 pt-1"
              >
                <div className="px-0.5">
                  <label className="text-xs font-semibold text-slate-400">Pilih Kelas</label>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    role="radiogroup"
                    aria-label={`Pilih Kelas ${activeCategory}`}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
                  >
                    {SUB_CLASSES_BY_CATEGORY[activeCategory].map((subClass) => {
                      const isSelected = profile.jenjangKelas === subClass.value;
                      return (
                        <button
                          key={subClass.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSubClassSelect(subClass.value)}
                          className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex items-center justify-between min-h-[52px] sm:min-h-[64px] relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                            isSelected
                              ? "liquid-glass border-amber-400/70 shadow-[0_0_24px_rgba(230,194,128,0.25)] text-amber-300 ring-1 ring-amber-400/40 font-bold"
                              : "liquid-glass-card text-slate-300 hover:text-white hover:border-amber-400/30"
                          }`}
                        >
                          <div className="text-sm sm:text-base font-bold tracking-tight text-white">
                            {subClass.grade}
                          </div>

                          <div>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(230,194,128,0.6)]" aria-hidden="true" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 group-hover:border-white/40 transition-colors" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>

                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[44px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800/60 text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#E6C280] to-[#D4AF37] text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(230,194,128,0.3)] hover:brightness-105 active:scale-[0.99] flex items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Keahlian & Minat */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Arka evaluating research skills */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <StepSprite personaId="arka" poseState="working" alt="Arka mengevaluasi keahlian" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#A594F9" }}>Arka</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 text-pretty">Bidang apa yang ingin kamu coba?</h2>
                  <p className="text-xs text-slate-400 text-pretty">
                    Pilih 1 sampai 3 minat awal. Kamu bisa menggantinya kapan saja.
                  </p>
                </div>
              </div>

              {/* Group 1: Keahlian Sudah Dimiliki */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-karsa-cyan uppercase tracking-wider block">
                  Keahlian yang Sudah Dimiliki (Maks 3):
                </label>
                <div role="group" aria-label="Keahlian yang sudah dimiliki" className="flex flex-wrap gap-2">
                  {KEAHLIAN_OPTIONS.map((item) => {
                    const isSelected = profile.keahlianSudah.includes(item);
                    return (
                      <button
                        key={`sudah-${item}`}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`${item} (${isSelected ? "dipilih" : "belum dipilih"})`}
                        onClick={() =>
                          setProfileData({
                            keahlianSudah: toggleArrayItem(profile.keahlianSudah, item),
                          })
                        }
                        className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                            : "liquid-glass-card text-slate-300 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Keahlian Ingin Dikuasai */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Keahlian yang Ingin Dikuasai (Maks 3):
                </label>
                <div role="group" aria-label="Keahlian yang ingin dikuasai" className="flex flex-wrap gap-2">
                  {KEAHLIAN_OPTIONS.map((item) => {
                    const isSelected = profile.keahlianIngin.includes(item);
                    return (
                      <button
                        key={`ingin-${item}`}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`${item} (${isSelected ? "dipilih" : "belum dipilih"})`}
                        onClick={() =>
                          setProfileData({
                            keahlianIngin: toggleArrayItem(profile.keahlianIngin, item),
                          })
                        }
                        className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400/60 text-amber-300 font-bold shadow-[0_0_12px_rgba(230,194,128,0.2)]"
                            : "liquid-glass-card text-slate-300 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>


              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800/60 text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E6C280] to-[#D4AF37] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(230,194,128,0.3)] hover:brightness-105 active:scale-[0.99] flex items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Ritme Belajar & Target */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Ara holding stopwatch */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <StepSprite personaId="ara" poseState="idle" alt="Ara mengatur jadwal belajar" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Ara</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 text-pretty">Berapa waktu luangmu per hari?</h2>
                  <p className="text-xs text-slate-400 text-pretty">
                    Ara akan membagi jadwal belajarmu agar kamu tidak perlu begadang.
                  </p>
                </div>
              </div>

              {/* Single Select Ritme */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Alokasi Waktu Harian:</label>
                <div role="radiogroup" aria-label="Alokasi Waktu Harian" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {RITME_OPTIONS.map((item) => {
                    const isSelected = profile.ritmeBelajar === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setProfileData({ ritmeBelajar: item })}
                        className={`min-h-[48px] p-3.5 rounded-2xl text-center border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.3)] font-bold"
                            : "liquid-glass-card text-slate-300 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>



              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800/60 text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E6C280] to-[#D4AF37] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(230,194,128,0.3)] hover:brightness-105 active:scale-[0.99] flex items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span>Ringkasan</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Summary Card + Mandatory Consent */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Radit presenting the coin bonus */}
              <div className="flex items-center gap-4">
                <StepSprite personaId="radit" poseState="working" alt="Radit mempresentasikan koin" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Image src={ASSETS.koin} alt="Koin Karsa" width={18} height={18} className="w-4.5 h-4.5" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Radit</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 text-pretty">Profil belajarmu sudah siap</h2>
                  {/* Welcome coin preview */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mt-1 shadow-[0_0_12px_rgba(230,194,128,0.2)]">
                    <Image src={ASSETS.koin} alt="Koin" width={14} height={14} />
                    +250 Koin Karsa menunggumu!
                  </div>
                </div>
              </div>

              {/* Liquid Glass Summary Box */}
              <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Nama Panggilan:</span>
                  <span className="font-bold text-amber-300">{profile.nama || "Siswa"}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Jenjang & Kelas:</span>
                  <span className="font-semibold text-slate-200">{profile.jenjangKelas}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Keahlian Dimiliki:</span>
                  <span className="font-semibold text-cyan-300 truncate max-w-[240px]">
                    {profile.keahlianSudah.join(", ") || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Ingin Dikuasai:</span>
                  <span className="font-semibold text-amber-300 truncate max-w-[240px]">
                    {profile.keahlianIngin.join(", ") || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Alokasi Waktu:</span>
                  <span className="font-semibold text-blue-300">{profile.ritmeBelajar}</span>
                </div>
              </div>

              {/* Mandatory Consents Stack */}
              <div className="space-y-2">
                {/* 1. Komitmen Belajar Consent */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl liquid-glass-card cursor-pointer hover:border-amber-400/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={profile.isConsentGiven}
                    onChange={(e) => setProfileData({ isConsentGiven: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-amber-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-snug text-pretty">
                    Saya menyetujui komitmen belajar 20 menit harian dan pengelolaan koin transparan bersama 5 Sobat Karsa.
                  </span>
                </label>

                {/* 2. Syarat & Ketentuan Consent */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl liquid-glass-card cursor-pointer hover:border-amber-400/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={isTermsGiven}
                    onChange={(e) => setIsTermsGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-snug text-pretty">
                    Saya menyetujui syarat dan ketentuan Karsa dalam pengolahan data dan layanan pembelajaran.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800/60 text-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!profile.isConsentGiven || !isTermsGiven}
                  className="min-h-[48px] py-3 px-8 rounded-2xl bg-gradient-to-r from-[#E6C280] via-[#D4AF37] to-[#C59B27] text-slate-950 font-bold text-base shadow-[0_0_24px_rgba(230,194,128,0.35)] hover:shadow-[0_0_32px_rgba(230,194,128,0.5)] hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  <span>Masuk ke Rumah Karsa</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

