## 2026-09-21T14:17:20Z

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are the Implementation Worker for Milestone 1 (Exterior Splash Screen & Darkened Onboarding Polish).
Your working directory is: C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\worker_splash

You are armed with domain knowledge from:
- C:\Users\laptop~1\.gemini\config\skills\vercel-react-best-practices\SKILL.md
- C:\Users\laptop~1\.gemini\config\skills\webapp-testing\SKILL.md

Read the synthesized handoff specifications:
1. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\PROJECT.md
2. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_1\handoff.md and analysis.md
3. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_2\handoff.md and analysis.md
4. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\handoff.md and analysis.md

Tasks to execute:
1. R1: Implement `src/components/splash/AppSplashScreen.tsx`:
   - Fullscreen fixed overlay: `fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none`.
   - Dimly lit exterior background: Next.js `<Image src={ASSETS.roomExterior} alt="Rumah Karsa Exterior" fill priority sizes="100vw" className="object-cover opacity-50 select-none pointer-events-none -z-20" />` with dark scrim overlay (`bg-black/40` + radial vignette).
   - Brand Logo: Dead-centered `font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest` displaying `KARSA`.
   - Exit Animation: Hardware-accelerated up-slide via Framer Motion `motion.div` with `exit={{ y: "-100%" }}`, transition `{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }`, and GPU transform optimizations (`willChange: "transform"`, `transform: "translateZ(0)"`).
   - Props: `onDismiss?: () => void`, `minDisplayTime?: number` (default 1200ms, support URL search param or test trigger if provided).
2. Update `tailwind.config.js`:
   - Extend `theme.extend.fontFamily` to include `logo: ["'Redaction 35'", "serif"]`.
3. R2: Update `src/components/onboarding/OnboardingFlow.tsx`:
   - Replace the hidden/negative z-index background with the optical dual-scrim stack at `fixed inset-0 pointer-events-none overflow-hidden z-0`:
     - `<Image src={ASSETS.roomExterior} alt="Rumah Karsa Exterior" fill priority sizes="100vw" className="object-cover opacity-30 select-none pointer-events-none" />`
     - Scrim A (vertical linear depth scrim): `absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 pointer-events-none`
     - Scrim B (radial vignette shield): `absolute inset-0 pointer-events-none` with `radial-gradient(ellipse at center, rgba(11,19,43,0.5) 0%, rgba(8,13,26,0.88) 100%)`
   - Preserve existing spotlight beam, 2-tier SMP/SMA class selector, and step handlers with zero regressions.
4. R3: Update `src/app/page.tsx`:
   - Implement the Vercel React Best Practices hydration-safe single-return layout:
     - Render `<AppSplashScreen />` wrapped in `<AnimatePresence mode="wait">` at frame 0.
     - Render underlying app view (`{!isProfileCompleted ? <OnboardingFlow /> : <main ...>...}` pre-settled behind the `z-50 bg-black` splash overlay so dimensions settle before reveal.
     - Guaranteed zero layout shift (CLS = 0.0000) and zero camera recalculation jumps in `useCameraViewport.ts`.
5. Run builds & tests:
   - Run typechecking in PowerShell: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npx tsc --noEmit`. Must pass with 0 errors.
   - Create and run Playwright verification script (e.g. `tests/verify_splash_and_onboarding.mjs` or similar) to capture both screenshots:
     - `splash_loading_screen.png` (dimly lit exterior + dead-centered 85% opacity KARSA logo)
     - `onboarding_darkened_bg.png` (opacity-30 exterior + gradient scrim)
     - Save screenshots in both `audit_screenshots/` and project root (`C:\Users\laptop~1\Code\PROJECT\karsa_demo\`).
6. Deliverables:
   - Document all changes in `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\worker_splash\changes.md`.
   - Write handoff report with exact commands and test results in `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\worker_splash\handoff.md`.
   - Update `progress.md` in your directory.
   - Send completion message to orchestrator.
