# BRIEFING — 2026-09-21T14:15:40Z

## Mission
Explore and specify implementation strategy for Requirement R3 (Vercel React Best Practices Integration in src/app/page.tsx) and define QA / Playwright visual verification strategy.

## 🔒 My Identity
- Archetype: explorer
- Roles: Vercel Practices & QA Explorer
- Working directory: C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3
- Original parent: 58f0852b-63ce-4e1d-8430-490cf1c0b0bc
- Milestone: Splash Screen & Entry Transition (Requirement R3 & Verification)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- CODE_ONLY network mode: no external HTTP/network access

## Current Parent
- Conversation ID: 58f0852b-63ce-4e1d-8430-490cf1c0b0bc
- Updated: 2026-09-21T14:15:40Z

## Investigation State
- **Explored paths**:
  - `src/app/page.tsx`
  - `src/context/DemoContext.tsx`
  - `src/hooks/useCameraViewport.ts`
  - `src/components/dashboard/RumahKarsaRoom.tsx`
  - `src/components/onboarding/OnboardingFlow.tsx`
  - `tests/` & `scripts/` (Playwright runners and dev server lifecycles)
- **Key findings**:
  - `page.tsx` needs a unified single-return layout to prevent unmounting/remounting when `localStorage` updates `profile.isCompleted`.
  - Rendering `<AppSplashScreen />` in both SSR and client initial state avoids FOUC and guarantees 0 hydration mismatch.
  - Camera viewport jerk is prevented by pre-settling `<RumahKarsaRoom />` beneath the `fixed inset-0 z-50` splash overlay before reveal.
  - Windows environment requires `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH;` for CLI operations.
- **Unexplored areas**: None. Analysis and blueprints are complete.

## Key Decisions Made
- Specified single-return layout architecture for `src/app/page.tsx`.
- Designed self-contained Playwright verification script (`tests/verify_splash_and_onboarding.mjs`) testing both screenshots, CLS, and hydration errors.
- Documented exact PowerShell commands with node PATH prepended.

## Artifact Index
- `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\ORIGINAL_REQUEST.md` — Original request dispatch
- `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\BRIEFING.md` — Working memory
- `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\progress.md` — Heartbeat and task progress
- `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\analysis.md` — Comprehensive analysis and blueprints
- `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\handoff.md` — Structured 5-component handoff report
