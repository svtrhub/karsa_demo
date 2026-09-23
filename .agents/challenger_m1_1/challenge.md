# Milestone 1 Empirical Challenge Report: 2-Tier Segmented Class Selector & Category Memory

**Agent**: Challenger 1 (`teamwork_preview_challenger`)  
**Directory**: `c:\Users\laptop~1\Code\PROJECT\karsa_demo\.agents\challenger_m1_1`  
**Parent Conversation ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Date**: 2026-09-20  
**Target Components**: `src/components/onboarding/OnboardingFlow.tsx`, `src/context/DemoContext.tsx`  
**Verdict**: ⚠️ **CONDITIONAL PASS / BUGS DETECTED** (36/38 assertions PASS; 2 critical edge-case flaws identified)

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

While the runtime in-memory category switching, canonical string persistence, Step 4 summary synchronization, and rapid 20-click alternating hammer passed successfully in an active browser session, **two critical defects** were uncovered through empirical stress-testing:

1. **Rehydration State Desynchronization Bug (CRITICAL)**: On page reload when the user has selected an SMP class (e.g. `SMP Kelas 8`), the UI active tab desynchronizes from `profile.jenjangKelas`. The SMA tab is displayed with 0 radio buttons checked, while the underlying context retains `SMP Kelas 8`. If the user touches any tab, their SMP choice is destroyed.
2. **Production Build Failure & Turbopack CSS Syntax Error (HIGH)**: `npm run build` fails with `PageNotFoundError: /_document` during page data collection, contradicting Worker M1's claim of a clean 12.2s production build. Furthermore, `@import "@fontsource/redaction-35"` in `src/app/globals.css:4` violates CSS spec by appearing after Tailwind rule expansion, breaking Turbopack compilation.
3. **Substring Ambiguity in UI/Accessibility Locators (MEDIUM)**: SMP Kelas 9 focus description contains `"Persiapan Lanjutan & Portofolio"`. Because `"Lanjutan"` contains `"Lanjut"`, substring queries match the sub-class chip instead of the primary navigation button.

---

## Challenges

### [CRITICAL] Challenge 1: Component Local `useState` Desynchronization on Page Reload (Rehydration Bug)

- **Assumption Challenged**: Reviewer 1 and Worker M1 assumed that `activeCategory`, `lastSmpClass`, and `lastSmaClass` are safely initialized from `profile.jenjangKelas` via `useState(initialCategory)` in `OnboardingFlow.tsx`.
- **Attack Scenario**:
  1. A user in Step 1 selects `SMP` and clicks `Kelas 8`.
  2. `profile.jenjangKelas` is saved to `localStorage` as `"SMP Kelas 8"`.
  3. The user reloads or navigates back to the page.
  4. On initial client mount, `DemoProvider` initializes with `INITIAL_DEMO_STATE` (`profile.jenjangKelas: "SMA/SMK Kelas 10"`).
  5. `OnboardingFlow` mounts, evaluating `initialCategory` as `"SMA"`, and initializes React local state:
     - `activeCategory = "SMA"`
     - `lastSmpClass = "SMP Kelas 7"`
     - `lastSmaClass = "SMA/SMK Kelas 10"`
  6. Asynchronously, `DemoProvider`'s `useEffect` reads `localStorage` and updates `state.profile.jenjangKelas = "SMP Kelas 8"`.
  7. React re-renders `OnboardingFlow`. However, `useState` initializers **never re-run on subsequent renders**.
- **Empirical Evidence**:
  Reproduced via `tests/repro_bug.mjs` and verified in Playwright:
  ```
  Context profile.jenjangKelas: SMP Kelas 8
  Tab SMP aria-selected: false
  Tab SMA aria-selected: true
  Radiogroup label: Pilih Kelas SMA
  Visible radio options: [ 'Kelas 10', 'Kelas 11', 'Kelas 12' ]
  Number of checked radio buttons: 0
  ```
- **Blast Radius**:
  - The UI presents the wrong educational tier (SMA instead of SMP).
  - No radio chip is selected (`aria-checked="true"` count is 0).
  - Any user interaction (clicking SMP tab or selecting a class) overwrites the user's previously saved `SMP Kelas 8` with default `SMP Kelas 7`.
- **Mitigation**:
  Add an explicit synchronization effect in `OnboardingFlow.tsx`:
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
  Or gate `OnboardingFlow` rendering in `DemoProvider` until `isLoaded === true`.

---

### [HIGH] Challenge 2: Next.js Production Build Failure & Invalid CSS `@import` Order

- **Assumption Challenged**: Worker M1 claimed in `handoff.md`: "`npm run build` compiled all routes cleanly in 12.2s."
- **Attack Scenario**:
  Execute `$env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build` on a clean build.
- **Empirical Evidence**:
  ```
  > next build
     ▲ Next.js 15.5.25
     Creating an optimized production build ...
   ✓ Compiled successfully in 21.1s
     Linting and checking validity of types ...
     Collecting page data ...
  unhandledRejection [Error [PageNotFoundError]: Cannot find module for page: /_document] {
    type: 'PageNotFoundError',
    code: 'ENOENT'
  }
  The command failed with exit code: 1
  ```
  Additionally, running `npx next dev --turbo` outputs:
  ```
  ⨯ ./src/app/globals.css:2135:8
  Parsing CSS source code failed
  > @import "@fontsource/redaction-35";
  @import rules must precede all rules aside from @charset and @layer statements
  ```
- **Blast Radius**:
  The application fails CI/CD production build pipelines. Developers cannot use Next.js Turbopack mode.
- **Mitigation**:
  1. Relocate `@import "@fontsource/redaction-35";` in `src/app/globals.css` to line 1 before `@import "tailwindcss/base";` or import directly in `layout.tsx`: `import "@fontsource/redaction-35";`.
  2. Resolve App Router `/_document` resolution in `next.config.js` or clean build configuration.

---

### [MEDIUM] Challenge 3: Ambiguous Button Text Matching in Accessibility Tree

- **Assumption Challenged**: Sub-class chips and navigation buttons have orthogonal accessibility names and text content.
- **Attack Scenario**:
  SMP Kelas 9 sub-class chip defines `focus: "Persiapan Lanjutan & Portofolio"`. Any query targeting the text `"Lanjut"` (such as assistive tech voice navigation or test selectors matching `"Lanjut"`) resolves to the radio chip rather than the primary navigation button.
- **Blast Radius**:
  Voice control users saying "Click Lanjut" may inadvertently re-select Kelas 9 instead of proceeding to Step 2.
- **Mitigation**:
  Add an explicit `aria-label="Lanjut ke langkah berikutnya"` to the navigation button and change focus copy to `"Persiapan Masuk SMA & Portofolio"` to eliminate collisions with `"Lanjut"`.

---

## Stress Test Results

Executed via automated Playwright test suite `tests/stress_test_m1.mjs`:

| Test Suite | Scenario / Invariant | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **Suite 1** | Initial Step 1 State | Tab=SMA, Selected=Kelas 10, Storage="SMA/SMK Kelas 10" | Matched canonical contracts | **PASS** |
| **Suite 2** | Category Memory (Canonical) | SMP Kelas 8 selected, toggle SMA Kelas 11, return SMP | Kelas 8 preserved, SMA Kelas 11 preserved | **PASS** |
| **Suite 3** | Rapid Tab Switch (20 clicks in burst) | Exactly 1 tab active, 1 radio checked, zero crashes | Animations settled cleanly, DOM matches state | **PASS** |
| **Suite 4** | Step 4 Summary Sync | SMP Kelas 9 chosen in Step 1 | Step 4 renders exact "SMP Kelas 9", no NaN/undefined | **PASS** |
| **Suite 5** | Reverse Navigation (Step 4 -> 1 -> 4) | Return to Step 1, select SMA Kelas 12, forward to Step 4 | Step 4 dynamically updates to "SMA/SMK Kelas 12" | **PASS** |
| **Suite 6** | Reload Rehydration on Step 4 | Page reload on Step 4 | Step 4 renders "SMA/SMK Kelas 12" accurately | **PASS** |
| **Suite 6** | Reload Rehydration on Step 1 (SMP) | Page reload on Step 1 with "SMP Kelas 8" | Active tab shows SMP, Kelas 8 radio checked | ❌ **FAIL** (Desync to SMA, 0 checked) |
| **Suite 7** | Exhaustive 3x3 Combinatorial Matrix | All 9 pairs of SMP (7,8,9) $\times$ SMA (10,11,12) | Category memory holds for all 9 pairs | **PASS** |
| **Suite 8** | DOM Corruption & Console Error Scan | Scan DOM for NaN/undefined/null, zero console errors | Zero NaN/undefined, zero console runtime errors | **PASS** |

**Summary**: 36 / 38 passed (94.7%).

---

## Test Code Artifacts

- `tests/stress_test_m1.mjs`: Full 8-suite automated Playwright test harness (555 lines).
- `tests/repro_bug.mjs`: Standalone deterministic reproduction harness for Rehydration Desync Bug.
- `tests/repro_tab_switch.mjs`: Frame-by-frame 100ms interval timing sampler for tab transitions.
- `tests/stress_test_m1_results.json`: Machine-readable audit results with exact DOM strings and state logs.
- `audit_screenshots/bug_reproduction_desync.png`: Visual proof of reload desync showing SMA tab with 0 checked radio chips while context holds `SMP Kelas 8`.

---

## Unchallenged Areas

- **Backend API streaming for chat personas**: Out of scope for Milestone 1 (Milestone 3 focus).
- **FTUX Tour coordinate precision**: Evaluated by Challenger 2 in parallel.
