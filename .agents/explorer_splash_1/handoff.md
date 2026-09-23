# Handoff Report: Splash Architecture Explorer (Explorer 1)

## 1. Observation
- **Exterior Asset**:
  - Found at `public/assets/rumah_karsa/rumah_karsa_exterior.webp` (size: 404,502 bytes).
  - Aliased in `src/lib/constants.ts` line 73:
    ```typescript
    roomExterior: '/assets/rumah_karsa/rumah_karsa_exterior.webp',
    ```
- **Redaction 35 Font**:
  - Installed in `package.json` line 13: `"@fontsource/redaction-35": "^5.3.0"`.
  - Imported and declared in `src/app/globals.css` lines 1, 6–8:
    ```css
    @import "@fontsource/redaction-35";
    ...
    .font-logo {
      font-family: 'Redaction 35', serif;
    }
    ```
  - In `tailwind.config.js` lines 26–28, only `sans` is currently registered under `fontFamily`:
    ```javascript
    fontFamily: {
      sans: ["var(--font-plus-jakarta)", "Inter", "sans-serif"],
    },
    ```
- **Framer Motion**:
  - Installed in `package.json` line 17: `"framer-motion": "^12.4.7"`.
- **Current Root Page Flow (`src/app/page.tsx`)**:
  - Lines 18–20:
    ```tsx
    if (!isProfileCompleted) {
      return <OnboardingFlow />;
    }
    return <main className="...">...</main>;
    ```
  - State `isProfileCompleted` begins as `false` on initial SSR/render, then updates in `DemoContext` `useEffect` when reading `localStorage`.
- **TypeScript & Build Status**:
  - Executed: `cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npx tsc --noEmit"`
  - Result: Exit code 0, 0 compilation errors.

---

## 2. Logic Chain
1. **Asset Rendering**:
   - Because `public/assets/rumah_karsa/rumah_karsa_exterior.webp` is mapped to `/assets/rumah_karsa/rumah_karsa_exterior.webp` and `ASSETS.roomExterior` already exists in `src/lib/constants.ts`, the component can import `ASSETS` directly.
   - Using Next.js `<Image src={ASSETS.roomExterior} alt="Rumah Karsa Exterior" fill priority className="object-cover opacity-50 select-none pointer-events-none -z-20" />` backed by a `bg-black` container with a dark scrim layer (`bg-black/40` + gradient vignette) guarantees the dimly lit exterior appearance while preventing layout shifts.
2. **Typography & Brand Logo**:
   - The class requirement is `font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest`.
   - `.font-logo` already exists in `globals.css` pointing to `Redaction 35, serif`.
   - Registering `logo: ["'Redaction 35'", "serif"]` in `tailwind.config.js` provides first-class Tailwind support for `font-logo`.
   - Centering via `fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black` ensures the logo is dead-centered in any viewport.
3. **Hardware-Accelerated Up-Slide**:
   - Framer Motion 12 `AnimatePresence` and `motion.div` support `exit={{ y: "-100%" }}`.
   - Animating `y` in Framer Motion modifies CSS `transform: translateY()`, which runs on the compositor thread without layout recalculation.
   - Adding `style={{ willChange: "transform", transform: "translateZ(0)" }}` triggers GPU layer promotion ahead of animation.
   - Cubic-bezier easing `[0.22, 1, 0.36, 1]` with `duration: 0.85` yields a smooth, Apple-grade reveal.
4. **State Control & Zero Layout Shifts in `page.tsx`**:
   - Rendering `<AppSplashScreen />` at the root of `src/app/page.tsx` above conditional rendering ensures that both new users (`OnboardingFlow`) and returning users (`main` room) experience the splash.
   - Because the splash is `fixed inset-0 z-50`, the underlying DOM elements render at full viewport size immediately.
   - By the time the splash exits after its minimum display timer (e.g. 1200ms), `DemoContext` has settled from `localStorage` and `useCameraViewport` has completed initialization without any visual jump or camera reset.

---

## 3. Caveats
- `minDisplayTime` is set to a default of 1200ms so users perceive the logo and exterior atmosphere before the transition triggers. If a faster or slower reveal is desired, it is configurable via prop.
- In Playwright headless testing on slower CI environments, tests capturing the splash screen must query `page.waitForSelector('text=KARSA')` immediately before timeout triggers the exit transition.

---

## 4. Conclusion
The implementation of Requirement R1 should proceed as follows:
1. Create `src/components/splash/AppSplashScreen.tsx` following the complete component specification in `analysis.md` Section 6.
2. Update `tailwind.config.js` to add `logo: ["'Redaction 35'", "serif"]` to `theme.extend.fontFamily`.
3. Update `src/app/page.tsx` to mount `<AppSplashScreen />` at the root level, preserving existing conditional views without layout shifts.

---

## 5. Verification Method
1. **Type Checking**:
   Run:
   ```cmd
   cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npx tsc --noEmit"
   ```
   Must pass with 0 errors.
2. **Visual Inspection & Test**:
   Run the test script to verify screenshots:
   ```cmd
   cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && node scripts/test_splash_and_onboarding.js"
   ```
   Inspect generated screenshots:
   - `audit_screenshots/splash_loading_screen.png`: Verify dimly lit exterior with dead-centered `KARSA` logo (opacity 85%, Redaction 35 font).
   - `audit_screenshots/onboarding_darkened_bg.png`: Verify smooth transition to the underlying interface.
