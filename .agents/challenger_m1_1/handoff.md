# Handoff Report: Milestone 1 Empirical Challenge

**Author**: Challenger 1 (`teamwork_preview_challenger`)  
**Directory**: `c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\challenger_m1_1`  
**Parent Conversation ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Milestone**: Milestone 1 (Onboarding Overhaul — R1 & R2)  
**Date**: 2026-09-20  
**Verdict**: ⚠️ **CONDITIONAL PASS / BUGS DETECTED**

---

## 1. Observation

1. **Category Memory & Single-Session State Integrity**:
   - Executing `tests/stress_test_m1.mjs` against Chromium via Playwright confirmed that within an active session:
     * Switching from SMA to SMP preserves `SMP Kelas 8` when toggling back and forth across 20 rapid bursts (Suite 2 & 3).
     * `profile.jenjangKelas` strictly holds canonical strings matching `CANONICAL_JENJANG` (`"SMP Kelas 7"`, `"SMP Kelas 8"`, `"SMP Kelas 9"`, `"SMA/SMK Kelas 10"`, `"SMA/SMK Kelas 11"`, `"SMA/SMK Kelas 12"`).
     * Step 4 summary renders the exact string chosen in Step 1 (`SMP Kelas 9` and `SMA/SMK Kelas 12` tested).
     * Exhaustive 3x3 combinatorial matrix (all 9 pairs of SMP and SMA classes) passed with 100% memory retention.
     * Zero `NaN`, `undefined`, or `null` were detected in the rendered DOM (Suite 8).
2. **Rehydration Desynchronization Bug on Page Reload**:
   - In `src/components/onboarding/OnboardingFlow.tsx`, lines 158–166 initialize category state via local `useState`:
     ```tsx
     const initialCategory: JenjangCategory = profile.jenjangKelas?.startsWith("SMP") ? "SMP" : "SMA";
     const [activeCategory, setActiveCategory] = useState<JenjangCategory>(initialCategory);
     const [lastSmpClass, setLastSmpClass] = useState<string>(() =>
       profile.jenjangKelas?.startsWith("SMP") ? profile.jenjangKelas : "SMP Kelas 7"
     );
     ```
   - In `src/context/DemoContext.tsx`, lines 53–75, `state` initializes to `INITIAL_DEMO_STATE` (`profile.jenjangKelas: "SMA/SMK Kelas 10"`), while `localStorage` is loaded asynchronously in `useEffect`.
   - Executing `tests/repro_bug.mjs` with `localStorage` set to `profile.jenjangKelas = "SMP Kelas 8"` on Step 1 yielded:
     ```
     Context profile.jenjangKelas: SMP Kelas 8
     Tab SMP aria-selected: false
     Tab SMA aria-selected: true
     Radiogroup label: Pilih Kelas SMA
     Visible radio options: [ 'Kelas 10', 'Kelas 11', 'Kelas 12' ]
     Number of checked radio buttons: 0
     ```
   - Verified in `audit_screenshots/bug_reproduction_desync.png`.
3. **Production Build Failure**:
   - Running `$env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build` failed with exit code 1:
     ```
     Creating an optimized production build ...
     ✓ Compiled successfully in 21.1s
     Linting and checking validity of types ...
     Collecting page data ...
     unhandledRejection [Error [PageNotFoundError]: Cannot find module for page: /_document] {
       type: 'PageNotFoundError',
       code: 'ENOENT'
     }
     ```
   - This invalidates Worker M1's claim in `worker_m1/handoff.md` line 31 that "`npm run build` compiled all routes cleanly in 12.2s."
4. **Turbopack CSS `@import` Spec Violation**:
   - Running `npx next dev --turbo` failed on `src/app/globals.css:4`:
     ```
     ⨯ ./src/app/globals.css:2135:8
     Parsing CSS source code failed
     > @import "@fontsource/redaction-35";
     @import rules must precede all rules aside from @charset and @layer statements
     ```
     Because `@import "@fontsource/redaction-35"` appears after `@import "tailwindcss/base"` which expands into raw CSS rules.
5. **Step 1 Sub-class Copy Collision with Navigation Button**:
   - In `src/components/onboarding/OnboardingFlow.tsx:68`, SMP Kelas 9 focus copy is `"Persiapan Lanjutan & Portofolio"`. Because `"Lanjutan"` contains `"Lanjut"`, generic text locators match the radio card instead of the navigation button (`<span>Lanjut</span>`).

---

## 2. Logic Chain

1. **From Observation 1**: In a continuous browser lifecycle without full page refresh, the 2-tier segmented selector functions properly: Framer Motion sliding pill updates correctly, sub-classes map accurately, and category memory preserves choices across tab switches. Downstream synchronization to Step 4 is 100% consistent with the selected option.
2. **From Observation 2**: React's `useState` only runs its initializer during component mount. When a user reloads the page on Step 1, `OnboardingFlow` mounts while `DemoContext` is still on `INITIAL_DEMO_STATE` (`"SMA/SMK Kelas 10"`). When the context later updates with the rehydrated `localStorage` value (`"SMP Kelas 8"`), `activeCategory` does not update because there is no synchronization effect. This produces a split-brain state where the context holds `SMP Kelas 8` but the UI renders the SMA tab with 0 selected chips. Touching the UI then overwrites the user's saved choice with default values.
3. **From Observation 3 & 4**: Worker M1's handoff claim of a clean production build is factually incorrect. The project fails Next.js build during static collection due to an unresolved `/_document` page lookup in the App Router setup, and Turbopack is blocked by an out-of-order CSS `@import`.
4. **From Observation 5**: Interactive elements must not contain ambiguous target labels that collide with primary action buttons in the accessibility tree.

---

## 3. Caveats

- Tests were conducted using Chromium in headless mode via Playwright at standard viewport (1440x900).
- Backend AI chat completion streaming was not evaluated as it is designated for Milestone 3.
- All defects were reproduced empirically with automated scripts and zero modifications were made to production source code in accordance with reviewer constraints.

---

## 4. Conclusion

The 2-tier segmented class selector state machine is **functionally sound during active sessions (36/38 tests passing)**, but possesses a **CRITICAL rehydration desynchronization bug** on page reload and **fails production build compilation**.

### Actionable Recommendations for Worker / Implementer:
1. **Fix Rehydration Desynchronization in `OnboardingFlow.tsx`**:
   Add an effect to synchronize `activeCategory`, `lastSmpClass`, and `lastSmaClass` whenever `profile.jenjangKelas` changes:
   ```tsx
   useEffect(() => {
     if (profile.jenjangKelas) {
       if (profile.jenjangKelas.startsWith("SMP")) {
         setActiveCategory("SMP");
         setLastSmpClass(profile.jenjangKelas);
       } else {
         setActiveCategory("SMA");
         setLastSmaClass(profile.jenjangKelas);
       }
     }
   }, [profile.jenjangKelas]);
   ```
2. **Fix CSS Import Order in `src/app/globals.css`**:
   Move `@import "@fontsource/redaction-35";` to line 1 before `@import "tailwindcss/base";` or import directly in `src/app/layout.tsx`.
3. **Fix Next.js Build `/_document` Failure**:
   Ensure Next.js 15 configuration does not expect legacy Pages router artifacts during static page collection.
4. **Disambiguate Kelas 9 Focus Copy**:
   Change `"Persiapan Lanjutan & Portofolio"` to `"Persiapan Masuk SMA & Portofolio"`.

---

## 5. Verification Method

1. **Execute Full Playwright Stress Test Suite**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; node tests/stress_test_m1.mjs
   ```
   *Expected Output*: 36/38 PASS, with the 2 reload failures highlighting the desync bug.
2. **Execute Standalone Bug Reproduction Script**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; node tests/repro_bug.mjs
   ```
   *Expected Output*: Displays split-brain between `Context profile.jenjangKelas: SMP Kelas 8` and `Tab SMA aria-selected: true`, `Checked: 0`.
3. **Inspect Bug Screenshot**:
   Open `audit_screenshots/bug_reproduction_desync.png`.
4. **Verify Production Build Failure**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build
   ```
   *Expected Output*: Fails with `PageNotFoundError: /_document`.
