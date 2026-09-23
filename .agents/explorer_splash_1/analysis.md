# Architecture & Implementation Analysis: Initial Loading Splash Screen (AppSplashScreen)

## Executive Summary
This document provides the definitive architectural blueprint and technical specification for **Requirement R1: Initial Loading Splash Screen (`AppSplashScreen.tsx`)** in the Karsa Demo application. 

The splash screen serves as the visual prologue to the Karsa universe: presenting a dimly lit, atmospheric exterior view of Rumah Karsa with a dead-centered `KARSA` brand logo rendered in Redaction 35 font at 85% opacity, followed by a hardware-accelerated up-slide exit transition (`y: "-100%"`) that unveils either the darkened Onboarding Flow (for new students) or the interactive 2.5D Rumah Karsa room (for returning students).

---

## 1. Asset & Background Layering Architecture

### 1.1 Asset Discovery & Path Resolution
- **Filesystem Location**: `public/assets/rumah_karsa/rumah_karsa_exterior.webp` (Size: ~404 KB, WebP format with native transparency/high dynamic range).
- **Public URL**: `/assets/rumah_karsa/rumah_karsa_exterior.webp`
- **Constants Registry**: Already registered in `src/lib/constants.ts`:
  ```typescript
  export const ASSETS = {
    roomInterior: '/assets/rumah_karsa/rumah_karsa_interior_fullisland.webp',
    spaceBg: '/assets/rumah_karsa/space_bg.webp',
    roomExterior: '/assets/rumah_karsa/rumah_karsa_exterior.webp', // <--- Reusable asset constant
    // ...
  } as const;
  ```
- **Next.js Image Integration**:
  To prevent unstyled layout flashes and optimize Web Vitals (Largest Contentful Paint), use `next/image` with the `priority` flag:
  ```tsx
  <Image
    src={ASSETS.roomExterior}
    alt="Rumah Karsa Exterior"
    fill
    priority
    className="object-cover opacity-50 select-none pointer-events-none -z-20"
  />
  ```

### 1.2 Viewport Overlay & Dark Scrim Architecture
To evoke mystery, drama, and architectural gravitas while ensuring high contrast for the brand mark:
1. **Parent Screen Container**:
   - `fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto`
   - Setting `bg-black` guarantees that the `opacity-50` of the exterior image is backed by pure pitch black.
2. **Layering Matrix (Z-Index Stack)**:
   - Base layer (`-z-20`): `next/image` of `rumah_karsa_exterior.webp` with `opacity-50 object-cover`.
   - Dark Scrim Layer (`-z-10`):
     ```tsx
     {/* Base ambient dark scrim */}
     <div 
       className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none -z-10" 
       aria-hidden="true" 
     />
     {/* Vignette depth gradient */}
     <div 
       className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none -z-10" 
       aria-hidden="true" 
     />
     ```
   - Content Layer (`z-10`): Dead-centered brand typography.

---

## 2. Typography & Brand Logo Styling

### 2.1 Font Verification & Registration
- `@fontsource/redaction-35` is installed in `package.json` (`^5.3.0`).
- `src/app/globals.css` line 1 imports `@import "@fontsource/redaction-35";` and lines 6–8 declare:
  ```css
  .font-logo {
    font-family: 'Redaction 35', serif;
  }
  ```
- **Recommended Tailwind Configuration Enhancement**:
  In `tailwind.config.js`, update `theme.extend.fontFamily` so that `font-logo` is a first-class utility alongside `font-sans`:
  ```javascript
  fontFamily: {
    sans: ["var(--font-plus-jakarta)", "Inter", "sans-serif"],
    logo: ["'Redaction 35'", "serif"],
  },
  ```

### 2.2 Exact Typography Classes & Centering
- **Specification**: `font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest`
- **Dead-Centering Strategy**:
  Dead-centering in viewport is achieved cleanly using CSS Flexbox on the fixed parent container:
  ```tsx
  <div className="relative z-10 flex flex-col items-center justify-center text-center select-none px-6">
    <h1 className="font-logo font-bold text-6xl text-white opacity-[0.85] tracking-widest drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
      KARSA
    </h1>
  </div>
  ```
  - `drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]` ensures hyper-crisp contrast against any architectural highlights in the background image.
  - Responsive adjustment: `text-5xl sm:text-6xl` preserves layout integrity on small mobile devices while strictly delivering `text-6xl` on desktop.

---

## 3. Hardware-Accelerated Up-Slide Exit Transition

### 3.1 Framer Motion Stack
- `framer-motion` is installed at version `^12.4.7` (`framer-motion` v12).
- Framer Motion provides `AnimatePresence` and `motion.div`.

### 3.2 Animation Timing & Curve Parameters
- **Exit Transformation**: `exit={{ y: "-100%" }}`
- **Timing Curve**: Cubic Bézier `[0.22, 1, 0.36, 1]` (Fluid Apple-style ease-out deceleration curve).
- **Duration**: `0.85s` (850ms) provides an elegant, cinematic upward slide.
- **Hardware Acceleration Parameters**:
  - `willChange: "transform"`: Pre-allocates GPU compositor texture layer.
  - `transform: "translateZ(0)"`: Promotes element to a 3D hardware-accelerated rendering layer.
  - Framer Motion's `y` property animates CSS `transform: translateY()`, which operates entirely off the main thread in the browser's compositor process, avoiding layout reflows (reflow-free) and avoiding paint invalidations.

```tsx
<motion.div
  key="app-splash-screen"
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
>
```

---

## 4. State Management & Component Lifecycle Contract

### 4.1 Encapsulation Pattern
Instead of forcing parent pages to manage low-level Framer Motion timers and unmount states, `AppSplashScreen` encapsulates its display timer and unmount lifecycle, while optionally accepting controlled triggers.

```typescript
export interface AppSplashScreenProps {
  /**
   * Minimum duration (in milliseconds) the splash screen remains visible 
   * before starting the slide-up animation. Defaults to 1200ms.
   */
  minDisplayTime?: number;

  /**
   * Optional external readiness signal (e.g. data loaded, assets preloaded).
   * Defaults to true.
   */
  isReady?: boolean;

  /**
   * Optional callback invoked immediately after the up-slide animation 
   * has completed and the component has unmounted from DOM.
   */
  onDismiss?: () => void;
}
```

### 4.2 Lifecycle Flowchart
```
1. SSR / Initial Render
   └─ isVisible: true, isFinished: false
   └─ Renders fixed black splash overlay with dimly lit exterior & KARSA logo

2. Client Mount (Hydration)
   └─ useEffect triggers setTimeout(minDisplayTime) (default: 1200ms)
   └─ In parallel, DemoContext reads localStorage (~1ms)
   └─ Underlying view settles (Onboarding or Dashboard Room) behind splash

3. Timer Elapses (t = 1200ms)
   └─ setIsVisible(false)
   └─ Framer Motion executes exit={{ y: "-100%" }} (850ms)

4. Animation Complete (t = 2050ms)
   └─ onExitComplete triggered
   └─ setIsFinished(true) -> returns null (DOM node completely purged)
   └─ onDismiss?.() fired
```

---

## 5. Integration Blueprint for `src/app/page.tsx`

### 5.1 Hydration & Zero Layout-Shift Architecture
In `src/app/page.tsx`, the component structure should mount `<AppSplashScreen />` at the root alongside the conditional content.

```tsx
"use client";

import React from "react";
import { useDemo } from "@/context/DemoContext";
import { AppSplashScreen } from "@/components/splash/AppSplashScreen";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { FTUXSequence } from "@/components/ftux/FTUXSequence";
import { TopBar } from "@/components/dashboard/TopBar";
import { RumahKarsaRoom } from "@/components/dashboard/RumahKarsaRoom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloatingCommandCenter } from "@/components/dashboard/FloatingCommandCenter";
import { ChatModal } from "@/components/chat/ChatModal";
import { ComingSoonModal } from "@/components/dashboard/ComingSoonModal";

export default function Home() {
  const { state } = useDemo();
  const isProfileCompleted = state.profile.isCompleted;

  return (
    <>
      {/* Hardware-Accelerated Initial Loading Splash Screen */}
      <AppSplashScreen />

      {/* Main Viewport Content */}
      {!isProfileCompleted ? (
        <OnboardingFlow />
      ) : (
        <main className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden select-none">
          {/* Full-screen Background Canvas (Space BG + Floating Island) */}
          <RumahKarsaRoom />

          {/* Floating Top Header (Big KARSA Logo Top-Left, Settings Button Top-Right) */}
          <TopBar />

          {/* Floating Left Sidebar */}
          <Sidebar />

          {/* Floating Bottom Command Center (Hidden when chat modal is open) */}
          {!state.activePersona && <FloatingCommandCenter />}

          {/* FTUX Tour Modal Overlay (plays once after onboarding) */}
          {!state.ftuxCompleted && <FTUXSequence />}

          {/* Active Persona Chat Modal */}
          {state.activePersona && <ChatModal />}

          {/* Out-of-Scope Coming Soon Modal */}
          {state.activeComingSoon && <ComingSoonModal />}
        </main>
      )}
    </>
  );
}
```

### 5.2 Prevention of Camera Shift (`useCameraViewport`)
- `RumahKarsaRoom` binds its camera transform calculations to `window.innerWidth` and `window.innerHeight`.
- Because `<AppSplashScreen />` uses `fixed inset-0` with independent z-index, the underlying DOM hierarchy is already rendered at full screen dimensions from frame 0.
- When `AppSplashScreen` exits via `y: "-100%"`, zero layout recalculations occur on `RumahKarsaRoom`. The room is revealed in a fully stabilized state.

---

## 6. Complete Component Code Reference (`src/components/splash/AppSplashScreen.tsx`)

```tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ASSETS } from "@/lib/constants";

export interface AppSplashScreenProps {
  /**
   * Minimum duration (in ms) the splash screen stays visible before initiating exit.
   * Default: 1200ms.
   */
  minDisplayTime?: number;

  /**
   * Optional external readiness signal. If provided, splash screen will only dismiss
   * when both minDisplayTime has elapsed AND isReady is true. Default: true.
   */
  isReady?: boolean;

  /**
   * Optional callback fired once the exit slide animation finishes and component unmounts.
   */
  onDismiss?: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  minDisplayTime = 1200,
  isReady = true,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, isReady]);

  // If unmounted post-transition, render nothing
  if (isFinished) return null;

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        setIsFinished(true);
        onDismiss?.();
      }}
    >
      {isVisible && (
        <motion.div
          key="app-splash-screen"
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1], // Fluid cubic-bezier
            },
          }}
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black select-none pointer-events-auto"
          aria-label="Karsa Splash Screen"
          role="dialog"
          aria-modal="true"
        >
          {/* Dimly lit Rumah Karsa Exterior Background */}
          <Image
            src={ASSETS.roomExterior}
            alt="Rumah Karsa Exterior"
            fill
            priority
            className="object-cover opacity-50 select-none pointer-events-none -z-20"
          />

          {/* Dark Scrim Overlay (base darkness + subtle vignette) */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none -z-10"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none -z-10"
            aria-hidden="true"
          />

          {/* Dead-Centered KARSA Brand Logo */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center select-none px-6">
            <h1 className="font-logo font-bold text-5xl sm:text-6xl text-white opacity-[0.85] tracking-widest drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              KARSA
            </h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

---

## 7. Quality Assurance & Verification Methodology

### 7.1 Static Typing & Compilation
- Verified via `npx tsc --noEmit` using node binary at `C:\Program Files\nodejs\node.exe`.
- Existing codebase currently passes with 0 TypeScript compilation errors.
- Component adheres strictly to React 19 / Next.js 15 type definitions.

### 7.2 Playwright Visual Test Strategy
To verify Acceptance Criteria:
```javascript
// Test script: scripts/test_splash_and_onboarding.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // 1. Capture Splash Screen
  await page.goto('http://localhost:3000');
  await page.waitForSelector('text=KARSA', { timeout: 3000 });
  await page.screenshot({ path: 'audit_screenshots/splash_loading_screen.png' });

  // 2. Wait for Splash Screen exit animation to complete
  await page.waitForTimeout(2200);

  // 3. Verify underlying screen (Onboarding Flow with Darkened Exterior)
  await page.screenshot({ path: 'audit_screenshots/onboarding_darkened_bg.png' });

  await browser.close();
})();
```
