# Original User Request

## 2026-09-20T10:12:41Z

Enhancing Karsa Demo onboarding visual polish (spotlight reveal, removing double logo), refactoring class selection to an intuitive 2-tier SMP/SMA segmented selector, fixing settings dropdown layout shifts, and establishing a multi-agent verification pipeline.

Working directory: c:\Users\laptop~1\Code\PROJECT\karsa_demo
Integrity mode: development

## Requirements

### R1. Onboarding Visual Polish & Spotlight Reveal
- Remove the redundant top-left KARSA logo text from OnboardingFlow.tsx (keeping only the main centered card logo).
- Implement a dramatic top-right show reveal spotlight beam focused on the onboarding modal card (radial-gradient / blurred directional beam).

### R2. Intuitive SMP/SMA 2-Tier Segmented Class Selector
- Refactor the class selection in Step 1 of OnboardingFlow.tsx into a 2-tier segmented control:
  - Tier 1: Primary category selector buttons [SMP] and [SMA / SMK].
  - Tier 2: Sub-class chips (Kelas 7, Kelas 8, Kelas 9 when SMP is selected; Kelas 10, Kelas 11, Kelas 12 when SMA/SMK is selected).
- Audit the full onboarding flow against ui-ux-pro-max standards (touch target sizes, micro-animations, clear aria-labels, readable typography).

### R3. Dashboard Settings Layout & Camera Stabilization
- Fix TopBar.tsx and Sidebar.tsx element positioning so that opening the Settings dropdown in TopBar.tsx does NOT alter the document flow, shift the sidebar, or cause useCameraViewport to recalculate camera target coordinates.

### R4. Multi-Agent Verification Pipeline
- Set up a dedicated cross-checker agent workflow to run TypeScript type checking, Next.js compilation, and Playwright visual screenshot tests before flagging the task complete.

## Acceptance Criteria

### Visual & UX Standards
- [ ] Onboarding header has zero duplicate logo text at top-left.
- [ ] Top-right spotlight beam is visible behind the onboarding card.
- [ ] Primary buttons [SMP] and [SMA / SMK] cleanly toggle between class options (7, 8, 9 vs 10, 11, 12).
- [ ] Clicking Settings button on the main dashboard opens the dropdown smoothly without moving the logo, sidebar, or camera zoom/pan.

### Code Quality & Verification
- [ ] tsc --noEmit passes with 0 errors.
- [ ] Playwright screenshots verify clean rendering across onboarding and dashboard views.

## 2026-09-21T14:07:37Z

Add an exterior loading splash screen with centered KARSA logo text (Redaction 35 font, 85% opacity) that reveals the app via a smooth up-slide transition, and darken the exterior background in OnboardingFlow for maximum legibility.

Working directory: C:\Users\laptop~1\Code\PROJECT\karsa_demo
Integrity mode: development

## Requirements

### R1. Initial Loading Splash Screen (`AppSplashScreen.tsx`)
- Display `rumah_karsa_exterior.webp` as a dimly lit background (`opacity-50` with subtle dark scrim).
- Render `KARSA` brand logo in `Redaction 35` font (`font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest`) dead-centered.
- Perform a hardware-accelerated up-slide exit transition (`y: "-100%"` with Framer Motion) when client state finish loading.

### R2. Darkened Exterior Onboarding Background (`OnboardingFlow.tsx`)
- Use `rumah_karsa_exterior.webp` as the background in `OnboardingFlow.tsx`.
- Darken background with `opacity-30` and gradient scrim so onboarding cards and text remain hyper-legible.

### R3. Vercel React Best Practices Integration (`src/app/page.tsx`)
- Integrate `<AppSplashScreen />` in `page.tsx` without triggering hydration mismatch or layout shifts in room viewport or camera hooks.

## Acceptance Criteria

### Visual & Technical Integrity
- [ ] Initial load shows dimly lit exterior with dead-centered KARSA logo (opacity 85%).
- [ ] App transition performs smooth up-slide reveal to Onboarding or Dashboard.
- [ ] Onboarding background features darkened exterior image (`opacity-30` + dark scrim).
- [ ] `npx tsc --noEmit` builds cleanly with 0 TypeScript errors.
- [ ] Playwright verification script generates screenshots (`splash_loading_screen.png`, `onboarding_darkened_bg.png`).

