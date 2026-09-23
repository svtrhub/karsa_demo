# Original User Request

## 2026-09-20T10:13:16Z

You are the Project Orchestrator for Karsa Demo.
Your working directory is: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\
The project root is: c:\Users\laptop~1\Code\PROJECT\karsa_demo\
Authoritative user request file: c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\ORIGINAL_REQUEST.md

Please review ORIGINAL_REQUEST.md, decompose the tasks according to the requirements:
1. R1: Onboarding visual polish & spotlight reveal (remove duplicate logo, add spotlight beam)
2. R2: Intuitive SMP/SMA 2-tier segmented class selector (SMP 7/8/9, SMA/SMK 10/11/12, ui-ux-pro-max audit)
3. R3: Dashboard settings layout & camera stabilization (TopBar & Sidebar positioning, prevent layout shift and camera recalculation)
4. R4: Multi-agent verification pipeline (TypeScript tsc, Next compilation, Playwright visual tests)

Coordinate specialist subagents to implement, verify against acceptance criteria, and ensure high code quality. Keep your progress.md and BRIEFING.md continuously updated. When all milestones are complete, report victory back to Sentinel with evidence so the mandatory victory audit can be triggered.

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

