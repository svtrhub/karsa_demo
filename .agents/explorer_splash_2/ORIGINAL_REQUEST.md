## 2026-09-21T14:10:55Z

You are Explorer 2 (Onboarding Visual Polish Explorer).
Your working directory is: C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_2
Your task is to explore and specify the implementation strategy for Requirement R2: Darkened Exterior Onboarding Background in OnboardingFlow.tsx.

Read the following reference files:
1. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\PROJECT.md
2. C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\orchestrator\ORIGINAL_REQUEST.md
3. C:\Users\laptop~1\Code\PROJECT\karsa_demo\src\components\onboarding\OnboardingFlow.tsx

Specifically investigate:
- How OnboardingFlow.tsx currently renders its background (look at outer container, batik overlay, existing background image or gradient).
- How to swap/integrate rumah_karsa_exterior.webp as the ambient background with opacity-30 and a gradient scrim so onboarding cards, text, buttons, and chips maintain hyper-legibility and pass contrast standards.
- Ensuring no regression to previously implemented features (spotlight reveal beam, 2-tier SMP/SMA segmented class selector, step navigation).
- Exact Tailwind CSS classes or inline style structure for the darkened exterior layer.

Deliverables:
- Write comprehensive findings and concrete code diff plan to C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_2\analysis.md
- Write a structured handoff report to C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\explorer_splash_2\handoff.md
- Update your progress.md with completion status.
- Send a message to orchestrator when finished.
