# Forensic Audit Handoff Report: Milestone 1 Integrity Audit

**Auditor**: Forensic Auditor (`auditor_splash`)  
**Target Milestone**: Milestone 1 (Initial Splash Screen & Darkened Exterior Onboarding Background)  
**Recipient**: Project Orchestrator (`58f0852b-63ce-4e1d-8430-490cf1c0b0bc`)  
**Date**: 2026-09-21T14:29:00Z  
**Working Directory**: `C:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\auditor_splash`  
**Verdict**: **CLEAN**

---

## Forensic Audit Report

**Work Product**: Milestone 1 Implementation (`src/components/splash/AppSplashScreen.tsx`, `src/components/onboarding/OnboardingFlow.tsx`, `src/app/page.tsx`, `tests/m1_verification.mjs`)  
**Profile**: General Project  
**Integrity Mode**: Development (Observed across Development, Demo, and Benchmark)  
**Verdict**: **CLEAN**

### Phase Results
- **Hardcoded Test Results**: PASS — Zero hardcoded test outputs, strings, or mocked return gates found in application source code.
- **Facade Implementations**: PASS — Authentic functional components with real lifecycle management, timers, and animations.
- **Fabricated Verification Outputs**: PASS — Verification scripts (`m1_verification.mjs` and `verify_splash_and_onboarding.mjs`) and screenshots were empirically executed and verified live.
- **Hardware-Accelerated Animation**: PASS — Framer Motion exit animation uses `willChange: "transform"` and `transform: "translateZ(0)"` with fluid cubic-bezier curve; measured CLS = 0.0000.
- **Redaction 35 Font Application**: PASS — Real `@fontsource/redaction-35` npm dependency installed and referenced via `.font-logo` in both Tailwind config and `globals.css`.
- **Next/Image Asset Loading**: PASS — `rumah_karsa_exterior.webp` (404 KB) loaded via Next.js `<Image fill priority sizes="100vw" />`.
- **Optical Dual Scrim & Opacity-30**: PASS — Onboarding background applies `opacity-30` exterior image with dual scrim (vertical linear gradient + radial vignette).
- **Independent TypeScript Check**: PASS — `npx tsc --noEmit` exited code 0 with 0 errors.
- **Regression Test Suite**: PASS — `node tests/m1_verification.mjs` passed all 5 test suites.

---

## 1. Observation

### 1.1 Source Code Forensic Analysis
1. **`src/components/splash/AppSplashScreen.tsx`** (Lines 1–108):
   - Client component with real timer state:
     ```tsx
     const timer = setTimeout(() => {
       onDismiss?.();
     }, minDisplayTime);
     return () => clearTimeout(timer);
     ```
   - Hardware-accelerated Framer Motion container (Lines 50–69):
     ```tsx
     <motion.div
       key="app-splash-screen"
       data-testid="app-splash-screen"
       initial={{ y: 0 }}
       exit={{
         y: "-100%",
         transition: {
           duration: 0.85,
           ease: [0.22, 1, 0.36, 1],
         },
       }}
       style={{
         willChange: "transform",
         transform: "translateZ(0)",
       }}
       className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto"
       role="dialog"
       aria-modal="true"
       aria-label="Karsa Splash Screen"
     >
     ```
   - Authentic asset loading via Next.js `Image` (Lines 71–78):
     ```tsx
     <Image
       src={ASSETS.roomExterior}
       alt="Rumah Karsa Exterior"
       fill
       priority
       sizes="100vw"
       className="object-cover opacity-50 select-none pointer-events-none -z-20"
     />
     ```
   - Dead-centered brand typography with Redaction 35 (Lines 94–102):
     ```tsx
     <div className="relative z-10 flex flex-col items-center justify-center text-center select-none px-6">
       <h1
         data-testid="splash-logo"
         className="font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]"
       >
         KARSA
       </h1>
     </div>
     ```

2. **`src/components/onboarding/OnboardingFlow.tsx`** (Lines 214–236):
   - Authentic ambient darkened exterior with optical dual scrim stack:
     ```tsx
     <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
       {/* Exterior Image at opacity-30 */}
       <Image
         src={ASSETS.roomExterior}
         alt="Rumah Karsa Exterior"
         fill
         priority
         sizes="100vw"
         className="object-cover opacity-30 select-none pointer-events-none"
       />

       {/* Scrim A (vertical linear depth scrim) */}
       <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90 pointer-events-none" />

       {/* Scrim B (radial vignette shield) */}
       <div
         className="absolute inset-0 pointer-events-none"
         style={{
           background:
             "radial-gradient(ellipse at center, rgba(11,19,43,0.5) 0%, rgba(8,13,26,0.88) 100%)",
         }}
       />
     </div>
     ```

3. **`src/app/page.tsx`** (Lines 16–35):
   - Clean Vercel React Best Practices integration with `<AnimatePresence>` wrapping `<AppSplashScreen />`:
     ```tsx
     export default function Home() {
       const { state } = useDemo();
       const [showSplash, setShowSplash] = useState(true);
       const isProfileCompleted = state.profile.isCompleted;

       return (
         <>
           {/* Initial Loading Splash Screen with hardware-accelerated up-slide exit */}
           <AnimatePresence mode="wait">
             {showSplash && (
               <AppSplashScreen onDismiss={() => setShowSplash(false)} />
             )}
           </AnimatePresence>

           {/* Pre-settled underlying views behind z-50 splash overlay (zero CLS, zero camera jumps) */}
           {!isProfileCompleted ? (
             <OnboardingFlow />
           ) : (
     ```

4. **Typography & Font Integrity**:
   - `package.json`: `"@fontsource/redaction-35": "^5.3.0"` is an installed dependency.
   - `node_modules/@fontsource/redaction-35`: Genuine font source containing CSS and WOFF2/WOFF files.
   - `src/app/globals.css`: `@import "@fontsource/redaction-35";` at line 1 and `.font-logo { font-family: 'Redaction 35', serif; }` at lines 6–8.
   - `tailwind.config.js`: `fontFamily.logo = ["'Redaction 35'", "serif"]` at line 28.

### 1.2 Empirical Execution Outputs

1. **TypeScript Typecheck Command**:
   - Command: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npx tsc --noEmit`
   - Exit Code: `0`
   - Stdout: `(empty)`
   - Stderr: `(empty)`

2. **Milestone 1 Test Suite**:
   - Command: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; node tests/m1_verification.mjs`
   - Result:
     ```
     ==========================================
     Running Milestone 1 Verification Suite...
     ==========================================

     [Test 1] Verifying top-left redundant logo removal...
     ✅ PASS: Redundant logo removed, central card logo preserved.

     [Test 2] Verifying 4-layer optical spotlight reveal...
     ✅ PASS: 4-layer optical spotlight reveal beam correctly implemented at z-0.

     [Test 3] Verifying Tier 1 Segmented Switcher...
     ✅ PASS: Tier 1 Segmented Switcher fully verified.

     [Test 4] Verifying Tier 2 Sub-Class Chips & State Mapping...
     ✅ PASS: Tier 2 Sub-Class Chips and canonical string mappings verified.

     [Test 5] Verifying UI/UX Pro Max & Accessibility Standards...
     ✅ PASS: UI/UX Pro Max accessibility, focus rings, touch targets, and tokens verified.

     ==========================================
     All Milestone 1 Verification Checks PASSED!
     ==========================================
     ```

3. **Independent Playwright Browser Verification**:
   - Command: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; node tests/verify_splash_and_onboarding.mjs`
   - Result:
     ```
     [TEST-SERVER] Spawning Next.js dev server on port 3006...
     [SERVER] ✓ Ready in 2.5s
     [SERVER] ✓ Compiled / in 4.3s (1510 modules)
     [TEST-SERVER] Dev server ready at http://localhost:3006 (attempt 1)
     [PLAYWRIGHT] Launching Chromium browser...

     [PHASE 1] Navigating to ?splash=hold to capture splash loading screen...
     [SERVER] ✓ Compiled in 4s (717 modules)
     [VERIFY] Brand logo text found: "KARSA"
     ✅ [1/2] Saved splash screenshot to:
       - C:\Users\laptop~1\Code\PROJECT\karsa_demo\audit_screenshots\splash_loading_screen.png
       - C:\Users\laptop~1\Code\PROJECT\karsa_demo\splash_loading_screen.png

     [PHASE 2] Testing up-slide exit transition & darkened onboarding background...
     Waiting for splash screen exit animation to complete and detach...
     ✅ Splash screen successfully completed up-slide exit and detached from DOM.
     [PERF] Cumulative Layout Shift (CLS) during transition: 0
     ✅ [2/2] Saved onboarding screenshot to:
       - C:\Users\laptop~1\Code\PROJECT\karsa_demo\audit_screenshots\onboarding_darkened_bg.png
       - C:\Users\laptop~1\Code\PROJECT\karsa_demo\onboarding_darkened_bg.png
     ✅ Zero hydration errors detected in browser console.

     ========================================================
     All Splash & Onboarding Visual Checks PASSED with 100%!
     ========================================================
     [TEST-SERVER] Terminating test server process...
     ```

4. **Visual Artifact Inspection**:
   - Inspected `splash_loading_screen.png`: Dimly lit exterior island with dead-centered Redaction 35 white logo at 85% opacity, deep vignette, zero artifacts.
   - Inspected `onboarding_darkened_bg.png`: Darkened exterior island (`opacity-30`) with dual scrim stack, theatrical top-right spotlight beam, liquid glass modal, and high legibility text.

---

## 2. Logic Chain

1. **Verification of Non-Hardcoding & Authentic Logic**:
   - *Observation*: Source code was inspected directly; `AppSplashScreen.tsx` contains genuine React state, `useEffect` timer cleanup, URL query parameter parsing, and Framer Motion variants.
   - *Logic*: Because the component uses dynamic props (`minDisplayTime`, `onDismiss`, `holdForTest`) and responds to query parameters (`?splash=hold`), it does not hardcode test outcomes or bypass normal execution paths.
2. **Verification of Hardware Acceleration**:
   - *Observation*: `style={{ willChange: "transform", transform: "translateZ(0)" }}` is applied to `motion.div`, and `exit={{ y: "-100%" }}` is animated with cubic-bezier easing `[0.22, 1, 0.36, 1]`.
   - *Logic*: `transform: translateZ(0)` promotes the element to a dedicated GPU compositor layer in Chromium/WebKit. The `PerformanceObserver` measurement during the live exit animation reported `CLS = 0.0000`, proving the animation does not cause layout recalculations or page shifts.
3. **Verification of Font Legitimacy**:
   - *Observation*: `@fontsource/redaction-35` exists in `node_modules`, is imported into `globals.css`, and configured in `tailwind.config.js`. Screenshots confirm the characteristic bitmap serif glyph rendering of Redaction 35.
   - *Logic*: The font is genuinely bundled locally and applied through standard CSS/Tailwind rules, avoiding unstyled text flashes (FOUT) or external CDN dependencies.
4. **Verification of Dual Scrim & Legibility**:
   - *Observation*: Onboarding exterior image is rendered with `opacity-30` inside `fixed inset-0 z-0`, overlaid by vertical linear gradient `bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90` and radial vignette `radial-gradient(ellipse at center, rgba(11,19,43,0.5) 0%, rgba(8,13,26,0.88) 100%)`.
   - *Logic*: This dual optical stack attenuates background luminance while preserving contextual depth, allowing the liquid glass modal card to achieve high contrast text readability.
5. **Verification of Screenshot Authenticity**:
   - *Observation*: The Playwright test script `tests/verify_splash_and_onboarding.mjs` was executed live against a freshly spawned Next.js server on port 3006.
   - *Logic*: The test captured both screenshots in real-time, verifying DOM element states, text contents, unmount events, and console logs. The screenshots are authentic browser captures, not pre-fabricated static mockups.

---

## 3. Caveats

- **No caveats**: All 6 forensic audit questions were thoroughly investigated and independently verified with empirical evidence.

---

## 4. Conclusion

Milestone 1 is **CLEAN**.
- There are no hardcoded test results, fake mocks, or dummy implementations.
- The Framer Motion up-slide exit transition is authentic and hardware-accelerated (`translateZ(0)`, CLS = 0).
- The Redaction 35 font is legitimately loaded via `@fontsource/redaction-35` and applied via `font-logo`.
- `rumah_karsa_exterior.webp` is legitimately loaded via `next/image` with priority and fill.
- The optical dual scrim stack and `opacity-30` in `OnboardingFlow.tsx` are authentically rendered.
- Both screenshots (`splash_loading_screen.png` and `onboarding_darkened_bg.png`) were produced by an authentic live Playwright browser run.
- TypeScript typecheck passes with 0 errors.

**Definitive Verdict**: **CLEAN**

---

## 5. Verification Method

To independently reproduce this forensic audit:

1. **TypeScript Typecheck**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npx tsc --noEmit
   ```
2. **Static Assertion Suite**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH; node tests/m1_verification.mjs
   ```
3. **End-to-End Playwright Screenshot & Transition Suite**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH; node tests/verify_splash_and_onboarding.mjs
   ```
4. **Visual Inspection**:
   - Inspect `splash_loading_screen.png`
   - Inspect `onboarding_darkened_bg.png`
