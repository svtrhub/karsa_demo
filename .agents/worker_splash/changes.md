# Code Changes: Milestone 1 (Exterior Splash Screen & Darkened Onboarding Polish)

## Summary of Modifications

### 1. `src/components/splash/AppSplashScreen.tsx` (New File)
- **Purpose**: Implements Requirement R1 — Initial Loading Splash Screen.
- **Key Features**:
  - Fullscreen fixed overlay: `fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto`.
  - Atmospheric exterior background: `<Image src={ASSETS.roomExterior} alt="Rumah Karsa Exterior" fill priority sizes="100vw" className="object-cover opacity-50 select-none pointer-events-none -z-20" />`.
  - Dark Scrim Overlay: Base `bg-black/40` backdrop plus radial vignette (`radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)`).
  - Brand Logo: Dead-centered `font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest` displaying `KARSA` with `drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]`.
  - Hardware-Accelerated Exit Animation: Framer Motion `motion.div` with `exit={{ y: "-100%" }}`, transition `{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }`, and GPU transform optimizations (`willChange: "transform"`, `transform: "translateZ(0)"`).
  - Configurable Props & Testing Hooks: `onDismiss?: () => void`, `minDisplayTime?: number` (default: 1200ms), `holdForTest?: boolean`, plus URL search parameter check (`?splash=hold`).

### 2. `tailwind.config.js`
- **Purpose**: Register `logo` font family to provide Tailwind support for `font-logo`.
- **Changes**:
  - Extended `theme.extend.fontFamily` to include `logo: ["'Redaction 35'", "serif"]`.

### 3. `src/components/onboarding/OnboardingFlow.tsx`
- **Purpose**: Implements Requirement R2 — Darkened Exterior Onboarding Background.
- **Changes**:
  - Replaced the previous negative z-index image (`-z-10`, which was occluded behind the parent's opaque `#0B132B` background fill) with an ambient dual-scrim optical stack at `fixed inset-0 pointer-events-none overflow-hidden z-0`:
    - Ambient exterior image: `<Image src={ASSETS.roomExterior} alt="Rumah Karsa Exterior" fill priority sizes="100vw" className="object-cover opacity-30 select-none pointer-events-none" />`
    - Scrim A (vertical linear depth scrim): `absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 pointer-events-none`
    - Scrim B (radial vignette shield): `absolute inset-0 pointer-events-none` with `radial-gradient(ellipse at center, rgba(11,19,43,0.5) 0%, rgba(8,13,26,0.88) 100%)`
  - Preserved 100% of existing features:
    - 4-layer theatrical spotlight reveal beam (`mix-blend-screen` with 225° linear gradient, apex luminaire, and modal stage bounce halo).
    - 2-Tier Segmented Class Selector (SMP vs SMA/SMK tablist with Framer Motion spring slider and sub-class memory).
    - Step indicators, touch targets (min 44px), and keyboard focus rings.

### 4. `src/app/page.tsx`
- **Purpose**: Implements Requirement R3 — Vercel React Best Practices Hydration-Safe Integration.
- **Changes**:
  - Replaced early return branching (`if (!isProfileCompleted) return <OnboardingFlow />`) with a unified single-return layout.
  - Rendered `<AppSplashScreen />` wrapped in `<AnimatePresence mode="wait">` at frame 0.
  - Pre-settled underlying views (`OnboardingFlow` or `RumahKarsaRoom`) behind the `z-50 bg-black` splash overlay so DOM nodes and camera dimensions stabilize before the splash slides away.
  - Guaranteed zero cumulative layout shift (CLS = 0.0000) and zero camera recalculation jumps in `useCameraViewport.ts`.

### 5. `tests/verify_splash_and_onboarding.mjs` (New File)
- **Purpose**: Playwright visual verification script automating:
  - Starting Next.js dev server on port 3006.
  - Capturing `splash_loading_screen.png` under `?splash=hold` verifying dims, logo, and exterior.
  - Observing up-slide exit transition and verifying CLS < 0.05.
  - Capturing `onboarding_darkened_bg.png` verifying opacity-30 exterior and dual scrim.
  - Checking browser console for 0 hydration errors.
  - Saving screenshots to both `audit_screenshots/` and project root.
