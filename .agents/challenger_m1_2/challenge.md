# Empirical Challenge Report: Milestone 1 (Visual Layout, Spotlight Beam, & Responsiveness)

**Author**: Challenger 2 (`teamwork_preview_challenger`)  
**Parent Conversation ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Working Directory**: `c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\challenger_m1_2`  
**Date**: 2026-09-20  
**Verification Method**: Headless Chromium via Playwright, layout dimension metrics, DOM elementFromPoint hit-testing, visual screenshot inspection across 4 viewports (375x667, 768x1024, 1280x800, 1920x1080).

---

## Challenge Summary

**Overall risk assessment**: **HIGH**  
While Reviewer 1, Reviewer 2, and the Forensic Auditor issued ACCEPT / CLEAN verdicts based on high-resolution desktop environments (1440x900), empirical stress-testing across mobile and developer build environments revealed **one critical mobile viewport obstruction defect** and **one blocking CSS specification / bundler error**.

---

## Challenges

### [Critical] Challenge 1: Mobile 375x667 Viewport Vertical Clipping & Progression Trap

- **Assumption challenged**: "The Milestone 1 2-tier selector fits seamlessly across all devices and mobile users can freely navigate the onboarding flow."
- **Attack scenario**: A user opens Karsa on a standard mobile device (iPhone SE, iPhone 8, or standard Android 360x640 / 375x667). 
  - On Step 0, the card fits (`cardHeight: 462px < 667px`).
  - Upon advancing to Step 1, the 2-tier selector renders Tier 1 segmented tabs (`min-h-[48px]`) plus 3 vertically stacked Tier 2 sub-class cards (`min-h-[56px]` each), header sprite banner, and footer navigation.
  - Empirical measurement: **`cardHeight: 804px`**, with the bottom of the card reaching **`y = 860px`**, extending **193px beyond the 667px viewport bottom**.
  - Crucially, `src/app/globals.css` (lines 23–26) enforces:
    ```css
    html, body {
      overflow: hidden;
      height: 100vh;
      width: 100vw;
    }
    ```
    and `OnboardingFlow.tsx` (line 214) applies:
    ```tsx
    <div className="min-h-screen ... relative overflow-hidden ...">
    ```
  - Because `overflow: hidden` strictly prevents document and viewport scrolling, the entire navigation footer ("Kembali" and "Lanjut" buttons) is pushed off-screen to `y ~ 810–854px`.
- **Blast radius**: **100% of users on viewports $\le 750\text{px}$ height are permanently trapped on Step 1**. They cannot see or click "Lanjut" or "Kembali" and cannot complete onboarding.
- **Empirical Proof**: Inspect `audit_screenshots/stress_test/mobile_375x667_step1_sma.png`. Kelas 11 is cut off, Kelas 12 is clipped at the word "Kelas", and the footer buttons are completely absent.
- **Mitigation**:
  1. Replace `overflow: hidden` on the onboarding wrapper with `overflow-y-auto min-h-screen py-6 px-4` to allow natural touch scrolling when content exceeds viewport height.
  2. Implement a responsive max-height container with internal scroll: `max-h-[calc(100dvh-3rem)] overflow-y-auto pr-1` on `.liquid-glass-modal` for compact mobile screens.
  3. Reduce mobile padding on Step 1 from `p-6 md:p-8` to `p-4 sm:p-6` and reduce the sprite banner height to preserve vertical budget.

---

### [High] Challenge 2: CSS `@import` Ordering Violation Breaking Next.js Turbopack & Production Compilation

- **Assumption challenged**: "`npm run build` compiled all routes cleanly in 12.2s and the project builds without errors."
- **Attack scenario**: Running Next.js with Turbopack (`next dev --turbo`) or clean production bundling. In `src/app/globals.css` lines 1–4:
  ```css
  1: @import "tailwindcss/base";
  2: @import "tailwindcss/components";
  3: @import "tailwindcss/utilities";
  4: @import "@fontsource/redaction-35";
  ```
  - CSS specification (and PostCSS/Turbopack parsers) strictly mandates:
    `@import rules must precede all rules aside from @charset and @layer statements`.
  - When Tailwind directives are expanded into base CSS rules (hundreds of lines of reset rules), `@import "@fontsource/redaction-35"` ends up placed after standard rules (at generated line 2135).
  - Turbopack compiler crashes with:
    `⨯ ./src/app/globals.css:2135:8 Parsing CSS source code failed: @import rules must precede all rules aside from @charset and @layer statements`
  - In addition, production `next build` triggers route data collection errors on `/api/chat` and missing `/_document` due to Pages/App router manifest lookup mismatches.
- **Blast radius**: Prevents development with Turbopack and breaks CI/CD automated production builds.
- **Empirical Proof**: Verbatim log from `tests/test_dev_modes.mjs` running Turbopack on port 3006.
- **Mitigation**:
  - Move `@import "@fontsource/redaction-35";` to line 1 of `src/app/globals.css`, ahead of all Tailwind imports:
    ```css
    @import "@fontsource/redaction-35";
    @import "tailwindcss/base";
    @import "tailwindcss/components";
    @import "tailwindcss/utilities";
    ```
  - Or import the font in `src/app/layout.tsx` via JavaScript: `import "@fontsource/redaction-35";`.

---

### [Medium] Challenge 3: Jarring Blank "Ghost Card" During Step 0 → Step 1 AnimatePresence Exit

- **Assumption challenged**: "The transition between Step 0 and Step 1 is visually smooth and polished."
- **Attack scenario**: `OnboardingFlow.tsx` wraps step steps in `<AnimatePresence mode="wait">`. In `mode="wait"`, the outgoing component (Step 0) must fully animate its exit (`opacity: 0, y: -15`) before the incoming component (Step 1) begins mounting.
  - During this window (~300–500ms), the modal card becomes a blank dark blue rectangle with no text, buttons, or loading indicator.
  - Empirically captured in `audit_screenshots/stress_test/desktop_1280x800_step1_sma.png`, showing a completely empty glass container in mid-transition.
- **Blast radius**: Low-to-medium cosmetic flaw that undermines perceived responsiveness and performance polish.
- **Mitigation**: Switch `<AnimatePresence>` to `mode="popLayout"` or apply parallel crossfade transitions so the user does not perceive a blank frame.

---

## Verified Robust Areas (Passed Stress Tests)

Despite the challenges above, the following Milestone 1 features are robust and passed all empirical checks:

1. **Spotlight Reveal Beam Optical Stack & Pointer-Events**:
   - The 4-layer spotlight reveal beam (`Apex Luminaire`, `God-Ray Shaft`, `Soft Wash Beam`, `Backlight Halo`) is positioned at `z-0` behind the modal (`z-10`).
   - Every beam element correctly enforces `mix-blend-screen` and `pointer-events-none`.
   - `document.elementFromPoint(x, y)` testing confirmed 100% pointer pass-through:
     - Center of "Mulai perjalanan!" button resolved directly to the button element.
     - Center of name input resolved to `INPUT#input-nama-panggilan`, and typing test ("EmpiricalChallenger") succeeded with 0 obstruction.
     - Center of `#tab-smp` and `#tab-sma` resolved directly to tabs without interference.
   - The spotlight beam introduced **0 horizontal or vertical scrollbars** across all 4 viewports (`htmlScrollWidth == windowInnerWidth` in all viewports).

2. **Top-Left Redundant Logo Removal**:
   - On Step 0: The old `absolute top-6 left-6` header logo is completely eliminated. Exactly one central `KARSA` logo is displayed inside the card.
   - Top-left coordinates check (`x < 250, y < 150`): Found 0 logo instances on Step 0.
   - On Step 1: Exactly 0 duplicate logos exist. The only instance of "Karsa" is the semantic persona speaker tag (`<GraduationCap>` + text "Karsa") in the character dialog header.

3. **2-Tier Selector & Category Memory Pattern**:
   - Tier 1 segmented control cleanly switches between SMP and SMA/SMK.
   - Tier 2 sub-class selection updates `profile.jenjangKelas` correctly.
   - Category memory retention confirmed: selecting "Kelas 8" in SMP, switching to SMA (which defaults to Kelas 10), and returning to SMP reliably retained "Kelas 8" with `aria-checked="true"`.
   - Downstream canonical strings (`"SMP Kelas 7"`, `"SMP Kelas 8"`, `"SMP Kelas 9"`, `"SMA/SMK Kelas 10"`, `"SMA/SMK Kelas 11"`, `"SMA/SMK Kelas 12"`) are 100% preserved.

4. **Touch Target Dimensions on Tablet & Desktop**:
   - Tier 1 tabs meet `min-h-[48px]`.
   - Tier 2 chips meet `min-h-[56px]` (mobile) and `min-h-[96px]` (tablet/desktop).
   - Navigation buttons meet `min-h-[44px]`.

---

## Stress Test Results Matrix

| Viewport | Device Type | Step 0 Scrollbars | Step 0 Logo Count | Step 0 Pointer Pass-Through | Step 1 Card Height vs Viewport | Step 1 Navigation Accessible? | Category Memory | Overall Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **375x667** | Mobile (iPhone SE) | 0 overflow | 1 (central) | PASS (Typing OK) | **804px vs 667px** (+193px) | **FAIL (Clipped off-screen)** | PASS | **FAIL ❌** |
| **768x1024** | Tablet (iPad Portrait) | 0 overflow | 1 (central) | PASS (Typing OK) | 557px vs 1024px | PASS | PASS | **PASS ✅** |
| **1280x800** | Desktop (13-inch) | 0 overflow | 1 (central) | PASS (Typing OK) | 572px vs 800px | PASS | PASS | **PASS ✅** |
| **1920x1080** | Large Desktop (1080p) | 0 overflow | 1 (central) | PASS (Typing OK) | 557px vs 1080px | PASS | PASS | **PASS ✅** |

---

## Unchallenged Areas

- **Step 3 (Ara & Ritme Belajar)**: Beyond the scope of Milestone 1 R1/R2.
- **Step 4 (Summary & Persona Calibration)**: Tested downstream string contract only; full calibration logic belongs to Milestone 2.
