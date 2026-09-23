# Project: Karsa Demo UX Polish & Exterior Splash Screen

## Architecture
Karsa Demo is an interactive gamified web application built with Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, and Playwright.
The frontend features:
1. **Initial Loading Splash Screen (`src/components/splash/AppSplashScreen.tsx`)**:
   - Hardware-accelerated full-viewport splash overlay.
   - Background: `public/assets/rumah_karsa/rumah_karsa_exterior.webp` dimly lit (`opacity-50` with subtle dark scrim).
   - Brand Logo: Dead-centered `KARSA` in `Redaction 35` font (`font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest`).
   - Transition: Hardware-accelerated up-slide exit animation (`y: "-100%"` with Framer Motion `AnimatePresence`) upon client state loading completion.
2. **Onboarding Flow (`src/components/onboarding/OnboardingFlow.tsx`)**:
   - Multi-step modal onboarding (welcome gate, grade selection, skills & interests, rhythm, summary).
   - Background: `public/assets/rumah_karsa/rumah_karsa_exterior.webp` darkened with `opacity-30` and gradient scrim for hyper-legibility.
3. **Dashboard View (`src/app/page.tsx`)**:
   - Root dashboard integrating `<AppSplashScreen />`, `<OnboardingFlow />`, `<RumahKarsaRoom />`, `<TopBar />`, `<Sidebar />`.
   - Hydration-safe client initialization without room viewport or camera recalculation layout shifts.
4. **Assets**:
   - Exterior image: `/assets/rumah_karsa/rumah_karsa_exterior.webp`.
   - Redaction font: defined in Tailwind config (`font-logo` / Redaction 35).

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Exterior Splash Screen & Darkened Onboarding Polish | AppSplashScreen (R1), OnboardingFlow background polish (R2), page.tsx integration (R3), TypeCheck & Playwright visual verification | None | DONE |


## Interface Contracts

### R1: Initial Loading Splash Screen (`AppSplashScreen.tsx`)
- Component Location: `src/components/splash/AppSplashScreen.tsx` (or imported cleanly into `src/app/page.tsx`).
- Visual & Styling Contract:
  - Fullscreen fixed overlay: `fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black`.
  - Dimly lit exterior background: Background image using `/assets/rumah_karsa/rumah_karsa_exterior.webp`, rendered with `opacity-50` and an overlaying dark scrim (`bg-black/40` or gradient) to maintain mystery and contrast.
  - Centered Brand Logo: Centered text `KARSA` using `font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest`.
- Exit Transition Contract:
  - Hardware-accelerated exit using Framer Motion `AnimatePresence` and `motion.div`.
  - Exit animation: `exit={{ y: "-100%" }}` with smooth cubic bezier / ease transition (e.g. `transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}`).
  - Triggered when client initialization completes (e.g. after mounting/loading signal, minimum aesthetic display time if desirable, then dismisses).

### R2: Darkened Exterior Onboarding Background (`OnboardingFlow.tsx`)
- Asset: Use `/assets/rumah_karsa/rumah_karsa_exterior.webp` as the full-viewport ambient background for `OnboardingFlow.tsx`.
- Darkening Contract:
  - Darkened background with `opacity-30`.
  - Subtle gradient scrim (e.g., `radial-gradient` or layered dark scrim) ensuring onboarding cards, text, and chips maintain contrast and hyper-legibility without visually clashing with the exterior structure.

### R3: Vercel React Best Practices Integration (`src/app/page.tsx`)
- Hydration Contract:
  - Must avoid hydration mismatch between server-rendered HTML and client-rendered state.
  - Safe client state initialization (e.g., `isClientReady` state pattern or mounted check).
  - No layout shift or unexpected re-triggering of `useCameraViewport` or room canvas dimensions when the splash screen dismisses.

### Quality & Verification Acceptance Criteria
- `npx tsc --noEmit` builds cleanly with 0 TypeScript errors.
- Playwright verification script generates visual screenshots:
  - `audit_screenshots/splash_loading_screen.png` (or root `splash_loading_screen.png`)
  - `audit_screenshots/onboarding_darkened_bg.png` (or root `onboarding_darkened_bg.png`)

## Code Layout
- `src/components/splash/AppSplashScreen.tsx`: Loading splash screen component.
- `src/components/onboarding/OnboardingFlow.tsx`: Onboarding flow with darkened exterior background.
- `src/app/page.tsx`: Root dashboard page coordinating splash screen and onboarding.
- `public/assets/rumah_karsa/rumah_karsa_exterior.webp`: Exterior image asset.
- `tailwind.config.js`: Tailwind typography and font configurations.
- `tests/` or `scripts/`: Playwright visual verification tests.

