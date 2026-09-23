## 2026-09-20T10:22:04Z

You are the Implementer Worker for Milestone 1 (Onboarding Overhaul — R1 & R2) of Karsa Demo.
Your identity: teamwork_preview_worker
Your working directory: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\worker_m1
Your parent conversation ID: 38295144-392e-4ba7-8ad0-30884ae5d797

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Task:
Implement the complete Milestone 1 overhaul in `src/components/onboarding/OnboardingFlow.tsx` combining the specifications from Explorers 1, 2, and 3:

1. R1: Visual Polish & Theatrical Spotlight Reveal
   - Remove the redundant top-left KARSA logo (lines 128–133) while preserving the central card logo at step 0.
   - Implement the 4-layer optical spotlight reveal beam at z-0 behind the modal card (apex luminaire at top-right ceiling, directional god-ray shaft angled 225°, secondary atmospheric wash, and modal backlight stage bounce) using `mix-blend-screen`, `pointer-events-none`, and `overflow-hidden`.
   - Ensure compatibility with `ASSETS.roomExterior` (-z-10), ambient glows, and `batik-overlay`.

2. R2: Intuitive SMP/SMA 2-Tier Segmented Class Selector
   - Refactor Step 1 into a 2-tier segmented control:
     * Tier 1: Primary category tabs [SMP] and [SMA / SMK] with Framer Motion `layoutId="activeJenjangTier1"` sliding pill indicator.
     * Tier 2: Sub-class chips (Kelas 7, 8, 9 for SMP; Kelas 10, 11, 12 for SMA/SMK) wrapped in `<AnimatePresence mode="wait">`.
     * State mapping: preserve exact canonical strings (`"SMP Kelas 7"`, `"SMP Kelas 8"`, `"SMP Kelas 9"`, `"SMA/SMK Kelas 10"`, `"SMA/SMK Kelas 11"`, `"SMA/SMK Kelas 12"`) in `profile.jenjangKelas` for full downstream compatibility with `DemoContext.tsx` and personas.
     * Implement active category detection and sub-class memory so switching between SMP and SMA/SMK remembers the last chosen grade.

3. UI/UX Pro Max Standards & Accessibility
   - Enforce minimum touch target heights: all chips ≥ 44px (`min-h-[44px]`), navigation buttons ≥ 44px (`min-h-[44px]`), Tier 1 tabs ≥ 48px (`min-h-[48px]`), Tier 2 chips ≥ 52px (`min-h-[52px]`).
   - Add accessible ARIA attributes: `role="tablist"`, `role="tab"`, `aria-selected`, `role="progressbar"` on step indicators, `role="checkbox"` / `aria-checked` on multi-select skill chips, `role="radio"` inside `role="radiogroup"` on rhythm options, `htmlFor="input-nama-panggilan"` and `id="input-nama-panggilan"` on name input, `aria-hidden="true"` on decorative icons.
   - Enforce consistent `focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` across all interactive elements.
   - Clean up token styling (replace raw hex `#0283D6` with semantic Tailwind `cyan-400` / `amber-400`).

Input Documentation & References:
- Project Scope: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\PROJECT.md
- Explorer 1 Analysis: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_m1_1\analysis.md
- Explorer 2 Analysis: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_m1_2\analysis.md
- Explorer 3 Analysis: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_m1_3\analysis.md
- UI/UX skill reference: C:\Users\laptop~1\.gemini\config\skills\ui-ux-pro-max\SKILL.md

Verification Requirements:
After modifying `src/components/onboarding/OnboardingFlow.tsx`, you MUST:
1. Run `npx tsc --noEmit` and ensure 0 errors.
2. Run `npm run build` and ensure clean production build succeeds.
3. Document all changes in `c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\worker_m1\changes.md` and write a self-contained 5-component `handoff.md`.
4. Update `progress.md` with timestamps and send a completion message back to parent.
