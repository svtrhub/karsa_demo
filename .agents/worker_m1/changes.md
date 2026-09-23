# Milestone 1 Code Changes Report

**File Modified**: `src/components/onboarding/OnboardingFlow.tsx`  
**Worker**: `teamwork_preview_worker` (`worker_m1`)  
**Parent Conversation ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Date**: 2026-09-20  

---

## Summary of Changes

### 1. R1: Visual Polish & Theatrical Spotlight Reveal
- **Removed Redundant Top-Left KARSA Logo**: Deleted lines 128–133 (`Header Brand`), eliminating brand clash with the central card logo on Step 0 and removing orphaned static header on steps 1–4.
- **Implemented 4-Layer Optical Spotlight Reveal Beam**:
  - Inserted behind the modal card at `z-0` with `mix-blend-screen`, `pointer-events-none`, and `overflow-hidden`.
  - **Layer 1 (Apex Luminaire Emitter)**: `-top-28 -right-28 w-[520px] h-[520px]` with radial gold-white gradient and `animate-pulse-glow`.
  - **Layer 2 (Core Theatrical God-Ray Shaft)**: High-intensity directional beam with `clipPath: polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)`, 225° linear gradient, and 36px Gaussian blur.
  - **Layer 3 (Secondary Soft Wash Beam)**: Atmospheric particulate diffusion beam with `clipPath: polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)`, 225° gradient, and 65px blur.
  - **Layer 4 (Modal Stage Bounce / Backlight Halo)**: Centered `radial-gradient` behind the Liquid Glass card (`w-[700px] h-[500px] blur-[40px]`), producing inner refraction and crystalline glow through the modal's `backdrop-filter: blur(36px) saturate(190%)`.
- **Background Compatibility Verified**: Seamless integration with `ASSETS.roomExterior` (`-z-10`), ambient cyan and gold glow spots, and `.batik-overlay`.

---

### 2. R2: Intuitive SMP/SMA 2-Tier Segmented Class Selector
- **Refactored Step 1 from Flat 6-Button Grid to 2-Tier Control**:
  - **Tier 1 (Category Segmented Switcher)**:
    - Primary category buttons: `[SMP]` (`Kelas 7–9`) and `[SMA / SMK]` (`Kelas 10–12`).
    - Sliding pill indicator with Framer Motion `layoutId="activeJenjangTier1"`.
    - Meets touch target height of 48px (`min-h-[48px]`).
  - **Tier 2 (Sub-Class Selection Panel)**:
    - Wrapped in `<AnimatePresence mode="wait">` for crossfade transitions.
    - SMP sub-classes: `Kelas 7` (Eksplorasi Minat & Riset Dasar), `Kelas 8` (Penguatan Riset & Lomba OSN), `Kelas 9` (Persiapan Lanjutan & Portofolio).
    - SMA/SMK sub-classes: `Kelas 10` (Fondasi Portofolio SNBP), `Kelas 11` (Puncak Prestasi OPSI & OSN), `Kelas 12` (Finalisasi Prestasi & SNBP).
    - Includes *Kurikulum Merdeka* badges (`Fase D`, `Fase E`, `Fase F`).
    - Desktop card height `sm:min-h-[96px]`, mobile touch height `min-h-[56px]`.
- **Full Contract & Downstream Compatibility**:
  - Exactly one of the 6 canonical strings (`"SMP Kelas 7"`, `"SMP Kelas 8"`, `"SMP Kelas 9"`, `"SMA/SMK Kelas 10"`, `"SMA/SMK Kelas 11"`, `"SMA/SMK Kelas 12"`) is written to `profile.jenjangKelas`.
  - Category memory pattern implemented: tracks `lastSmpClass` and `lastSmaClass` so toggling between SMP and SMA tabs preserves previously selected grade.
  - Full compatibility maintained with `DemoContext.tsx`, `localStorage["karsa_demo_state_v1"]`, `personas.ts` LLM prompt generator, and Step 4 summary.

---

### 3. UI/UX Pro Max Accessibility & Design Standards
- **Touch Targets**:
  - Tier 1 tabs: `min-h-[48px]`.
  - Tier 2 chips: `min-h-[56px]` mobile, `sm:min-h-[96px]` desktop.
  - Step 2 skill chips: upgraded from 32px to `min-h-[44px] px-4 py-2.5`.
  - Step 3 rhythm and target options: upgraded to `min-h-[48px]`.
  - Navigation buttons across all steps: upgraded to `min-h-[44px]`.
- **ARIA Semantics**:
  - Added `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` to progress dots.
  - Added `htmlFor="input-nama-panggilan"` and `id="input-nama-panggilan"` to Step 0 name field.
  - Added `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` to Tier 1 category tabs.
  - Added `role="tabpanel"`, `aria-labelledby`, `role="radiogroup"`, `role="radio"`, `aria-checked` to Tier 2 sub-classes.
  - Added `role="group"`, `role="checkbox"`, `aria-checked` to Step 2 skill chips and Step 3 target options.
  - Added `role="radiogroup"` and `role="radio"` to Step 3 rhythm options.
  - Added `aria-hidden="true"` to all decorative SVGs (`ArrowRight`, `ChevronLeft`, `CheckCircle2`, `GraduationCap`, `Clock`, `ShieldCheck`).
- **Focus Indicators & Token Styling**:
  - Consistent keyboard focus ring `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` across buttons, inputs, tabs, and checkboxes.
  - Cleaned up hardcoded hex `#0283D6` in Step 3 in favor of semantic Tailwind `cyan-400` tokens.
