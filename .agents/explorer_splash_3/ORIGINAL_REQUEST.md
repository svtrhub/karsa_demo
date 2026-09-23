## 2026-09-21T14:11:30Z
You are Explorer 3 (Vercel Practices & QA Explorer).
Your working directory is: C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3
Your task is to explore and specify the implementation strategy for Requirement R3: Vercel React Best Practices Integration in src/app/page.tsx, and define the verification strategy for acceptance criteria.

Read the following reference files:
1. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\PROJECT.md
2. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\ORIGINAL_REQUEST.md
3. C:\Users\laptop~1\Code\PROJECT\karsa_demo\src\app\page.tsx
4. C:\Users\laptop~1\Code\PROJECT\karsa_demo\src\hooks\useCameraViewport.ts
5. Existing test scripts in C:\Users\laptop~1\Code\PROJECT\karsa_demo\tests\ or C:\Users\laptop~1\Code\PROJECT\karsa_demo\scripts\

Specifically investigate:
- How page.tsx mounts and initializes client state: How to integrate <AppSplashScreen /> so that:
  a) It avoids Next.js 15 / React 19 SSR hydration mismatches (client-only mounting state vs SSR placeholder).
  b) When the splash screen slides up and dismisses, it triggers zero layout shifts (CLS = 0) and zero recalculations of useCameraViewport or room canvas dimensions.
- How the timing/transition between AppSplashScreen and OnboardingFlow/RumahKarsaRoom operates smoothly.
- Playwright visual test design:
  - How to capture splash_loading_screen.png showing dimly lit exterior and dead-centered KARSA logo (opacity 85%).
  - How to capture onboarding_darkened_bg.png showing the darkened exterior background (opacity-30 + scrim).
  - Exact command line to run typechecking (npx tsc --noEmit) and visual testing.

Deliverables:
- Write comprehensive findings and concrete integration/QA blueprint to C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\analysis.md
- Write a structured handoff report to C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_3\handoff.md
- Update your progress.md with completion status.
- Send a message to orchestrator when finished.
