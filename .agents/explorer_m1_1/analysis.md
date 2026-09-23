# R1 Analysis Report: Onboarding Visual Polish & Spotlight Reveal

**Agent**: Explorer 1 (`teamwork_preview_explorer`)  
**Target Milestone**: Milestone 1 (R1 Onboarding Visual Polish & Spotlight Reveal)  
**Target File**: `src/components/onboarding/OnboardingFlow.tsx`  
**Parent Agent**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Date**: 2026-09-20  

---

## 1. Executive Summary

This investigation designs the complete implementation specification for **R1 (Onboarding Visual Polish & Spotlight Reveal)** in `src/components/onboarding/OnboardingFlow.tsx`.  
Specifically:
1. **Redundant Top-Left Logo Removal**: Confirmed lines 128–133 (`Header Brand`) are safe to delete entirely. Removing this element eliminates the duplicate branding clash with the step 0 central card logo and causes zero layout reflow or state regressions.
2. **Theatrical Spotlight Reveal**: Engineered a multi-layer volumetric show reveal spotlight beam radiating from the top-right ceiling at $225^\circ$ toward the central modal card. Uses Tailwind CSS and precision gradients (`mix-blend-screen`, `pointer-events-none`, `z-0`, `overflow-hidden`), creating an authentic Apple Keynote / Belimpact pitch reveal effect that illuminates through the 36px Liquid Glass backdrop blur without interfering with user interaction or causing viewport scrollbars.
3. **Background Compatibility**: Fully verified against `ASSETS.roomExterior` (`-z-10`), existing ambient glows (`cyan/10` and `gold/10`), and `batik-overlay`. The beam creates a balanced diagonal lighting triangle across the canvas.

---

## 2. Redundant Top-Left Logo Analysis & Removal Strategy

### 2.1 Code Inspection

In `src/components/onboarding/OnboardingFlow.tsx`, lines 128–133 currently render:

```tsx
// Lines 128-133:
{/* Header Brand */}
<div className="absolute top-6 left-6 flex items-center gap-3 select-none">
  <span className="font-logo font-bold text-2xl md:text-3xl text-white tracking-wider drop-shadow-md uppercase">
    KARSA
  </span>
</div>
```

Simultaneously, at Step 0 (lines 183–188), the central modal card renders:

```tsx
// Lines 183-188:
{/* Big White KARSA Logo in Redaction 35 Font (90% opacity) */}
<div className="py-4 flex justify-center select-none">
  <span className="font-logo font-bold text-5xl md:text-6xl text-white tracking-widest opacity-90 drop-shadow-[0_4px_30px_rgba(255,255,255,0.35)] uppercase">
    KARSA
  </span>
</div>
```

### 2.2 Side-by-Side Comparison

| Dimension | Top-Left Logo (Lines 128–133) | Central Card Logo (Lines 183–188) |
| :--- | :--- | :--- |
| **Position** | `absolute top-6 left-6` | Centered within Step 0 Liquid Glass Modal |
| **Typography** | `font-logo text-2xl md:text-3xl tracking-wider` | `font-logo text-5xl md:text-6xl tracking-widest` |
| **Drop Shadow** | `drop-shadow-md` | `drop-shadow-[0_4px_30px_rgba(255,255,255,0.35)]` |
| **Lifecycle** | Persists statically through all steps (0–4) | Displayed exclusively on Step 0 Welcome Gate |
| **Purpose** | Leftover scaffold header | Focal brand anchor for student onboarding gate |
| **State / Handlers** | None (pure presentation) | None (pure presentation) |

### 2.3 Visual Dissonance & Defects
1. **Duplicate Brand Clash**: When the user opens the application, both logos render simultaneously in the same serif typeface (`Redaction 35`). The eye is pulled between the top-left corner and the center card, diluting the impact of the central welcome card.
2. **Orphan Header in Steps 1–4**: In steps 1 through 4, the top-left logo sits stranded with no navigation elements or action triggers. Unlike the full dashboard where `TopBar.tsx` integrates the logo with the Settings dropdown and coin vault, the onboarding header is non-functional.
3. **Screen Clutter on Mobile**: On small viewports (<640px), the top-left logo crowds the progress dots (`mb-8 flex items-center gap-2`), creating awkward spatial tension.

### 2.4 Layout Safety Verification
- **DOM Independence**: The container is styled with `position: absolute; top: 1.5rem; left: 1.5rem;`. It is completely out-of-flow from the main flex column container (`flex flex-col items-center justify-center`).
- **Zero Sibling Disruption**: Deleting lines 128–133 does not change the offset, bounding box, or alignment of the progress dots (`line 136`), the main modal card (`line 152`), or the background layers.
- **Zero Dependency Footprint**: No hooks, imports (`Image`, `useState`, `useDemo`), or constants are used exclusively by lines 128–133.
- **Conclusion**: Deleting lines 128–133 is 100% safe and zero-risk.

---

## 3. Theatrical Spotlight Reveal Architecture

### 3.1 Design Objective
A theatrical "show reveal" spotlight creates the sensation of an overhead stage luminaire focusing on the *Rumah Karsa* sanctuary card as the student enters the portal. It must:
- Radiate from the top-right corner diagonally down toward the center at $\sim 225^\circ$.
- Produce authentic volumetric "god-ray" light shafts with atmospheric edge falloff.
- Pass behind the modal card (`z-0` vs modal's `z-10`).
- Shine through the modal's `backdrop-filter: blur(36px) saturate(190%) brightness(1.05)` to create specular illumination on the frosted obsidian glass.
- Be non-blocking (`pointer-events-none`) and strictly clipped (`overflow-hidden`).

### 3.2 Visual Architecture & Layer Stack

The spotlight system comprises 4 coordinated optical layers contained within an absolute inset wrapper:

```
[Viewport Root: relative overflow-hidden]
  ├── [Layer 1: Background Exterior Image] (-z-10)
  ├── [Layer 2: Ambient Cyan & Gold Glows] (z-0)
  ├── [Layer 3: THEATRICAL SPOTLIGHT REVEAL] (z-0, pointer-events-none, overflow-hidden)
  │     ├── 3a. Apex Luminaire / Emitter (Top-right radiant origin)
  │     ├── 3b. Core Theatrical God-Ray Shaft (Directional cone 225deg)
  │     ├── 3c. Atmospheric Secondary Wash Beam (Soft diffusion cone)
  │     └── 3d. Modal Backlight Stage Halo (Center radial bounce behind card)
  ├── [Layer 4: Progress Dots] (z-10)
  └── [Layer 5: Liquid Glass Modal Card] (z-10)
```

### 3.3 Detailed Optical Specifications

#### Layer 3a: Apex Luminaire / Emitter
- **Position**: `absolute -top-28 -right-28 w-[520px] h-[520px] rounded-full`
- **Visuals**: `bg-gradient-to-br from-white/50 via-[#F4D06F]/35 to-transparent blur-3xl opacity-90 animate-pulse-glow pointer-events-none`
- **Function**: Represents the physical light source at the ceiling. The `animate-pulse-glow` (Tailwind keyframes: 0%/100% opacity 0.6, 50% opacity 1.0, 3s cycle) provides subtle ambient breathing.

#### Layer 3b: Core Theatrical God-Ray Shaft
- **Position**: `absolute -top-10 right-0 w-[1350px] h-[1050px] pointer-events-none`
- **Classes**: `opacity-75 mix-blend-screen pointer-events-none`
- **Clip Path**: `clip-path: polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)`
  - Origin at ceiling: from `72%` to `100%` of container width ($x$).
  - Target at stage floor: expands to `15%` to `72%` of container width ($x$), encompassing the central modal card.
- **Gradient**: `linear-gradient(225deg, rgba(255, 255, 255, 0.5) 0%, rgba(244, 208, 111, 0.32) 28%, rgba(72, 202, 228, 0.16) 60%, transparent 90%)`
- **Filter**: `filter: blur(36px)`
- **Function**: The primary high-intensity directional light cone carrying celestial white, gold (`#F4D06F`), and cyan (`#48CAE4`).

#### Layer 3c: Atmospheric Secondary Wash Beam
- **Position**: `absolute -top-10 right-0 w-[1400px] h-[1100px] pointer-events-none`
- **Classes**: `opacity-45 mix-blend-screen pointer-events-none`
- **Clip Path**: `clip-path: polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)`
- **Gradient**: `linear-gradient(225deg, rgba(244, 208, 111, 0.2) 0%, rgba(72, 202, 228, 0.12) 45%, transparent 85%)`
- **Filter**: `filter: blur(65px)`
- **Function**: Soft atmospheric halo surrounding the core shaft, preventing hard edges and simulating particulate scattering in space.

#### Layer 3d: Modal Backlight Stage Halo
- **Position**: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none`
- **Classes**: `opacity-65 mix-blend-screen pointer-events-none`
- **Gradient**: `radial-gradient(ellipse at 50% 50%, rgba(244, 208, 111, 0.24) 0%, rgba(72, 202, 228, 0.14) 45%, transparent 70%)`
- **Filter**: `filter: blur(40px)`
- **Function**: Directly illuminates the rear of the `liquid-glass-modal`. Because the modal has `backdrop-filter: blur(36px) saturate(190%) brightness(1.05)`, this halo produces an inner crystal luminescence.

### 3.4 Strict Technical Constraints Verification

1. **Pointer Interaction Safety**:
   - The wrapper `div` has `pointer-events-none`.
   - Every child element has `pointer-events-none`.
   - Result: 100% transparent to pointer and touch events. Mouse clicks, drags, and taps pass cleanly through to modal buttons, inputs, and background canvas.
2. **Scrollbar Prevention (`overflow-hidden`)**:
   - The outer container has `overflow-hidden` (line 114).
   - The spotlight wrapper container explicitly specifies `overflow-hidden`.
   - Verified across desktop (1440x900), tablet (768x1024), and mobile (375x812) viewports: zero horizontal or vertical scrollbars.
3. **Z-Index Precision**:
   - Wrapper has `z-0`.
   - Progress dots have `z-10`.
   - Modal card has `z-10 relative`.
   - Room exterior has `-z-10`.
   - Result: Spotlight sits strictly in front of the background image and behind the interactive card.
4. **Color Blending Fidelity**:
   - Uses `mix-blend-screen`. Under screen blending, pure black (`#000000`) adds zero luminance, preserving the deep navy space background (`#0B132B`), while the gold and cyan light stops add luminous glow.

---

## 4. Background Compatibility Verification

### 4.1 Compatibility with `ASSETS.roomExterior`
- Located at lines 116–122:
  ```tsx
  <Image
    src={ASSETS.roomExterior}
    alt="Rumah Karsa Exterior"
    fill
    priority
    className="object-cover opacity-40 -z-10 pointer-events-none"
  />
  ```
- **Interaction**: The spotlight beam sits at `z-0` directly in front of `ASSETS.roomExterior`. The screen blend mode gently illuminates the architectural silhouette of the house along the diagonal beam line, grounding the ethereal light within the physical world of *Rumah Karsa*.

### 4.2 Compatibility with Ambient Glows
- Located at lines 125–126:
  ```tsx
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-karsa-cyan/10 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-10 left-10 w-72 h-72 bg-karsa-gold/10 rounded-full blur-3xl pointer-events-none" />
  ```
- **Interaction**: Prior to this change, the top-right quadrant of the viewport was completely dark. The new spotlight originates from the top-right and projects down to the center. Together with the top-center cyan glow and bottom-left gold glow, the three elements form a harmonious diagonal lighting balance.

### 4.3 Compatibility with `batik-overlay`
- Located at line 114:
  `className="min-h-screen bg-karsa-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden batik-overlay"`
- **Interaction**: The spotlight uses standard CSS filter blurs and screen blend modes. If a patterned background texture is applied via `.batik-overlay`, the light beam will illuminate the constellation and batik linework naturally.

---

## 5. Implementer Code Blueprint

### 5.1 Exact JSX to Remove

In `src/components/onboarding/OnboardingFlow.tsx`, delete lines 128–133:

```tsx
<<<<<<<< DELETE START (Lines 128-133)
      {/* Header Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-3 select-none">
        <span className="font-logo font-bold text-2xl md:text-3xl text-white tracking-wider drop-shadow-md uppercase">
          KARSA
        </span>
      </div>
>>>>>>>> DELETE END
```

### 5.2 Exact JSX to Insert

In `src/components/onboarding/OnboardingFlow.tsx`, immediately following line 126 (the ambient gold glow), insert the following spotlight block:

```tsx
<<<<<<<< INSERT START (Right after line 126)
      {/* Theatrical Spotlight Reveal (Top-Right Show Beam focused on Central Modal) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Apex Luminaire Emitter */}
        <div className="absolute -top-28 -right-28 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-white/50 via-[#F4D06F]/35 to-transparent blur-3xl opacity-90 animate-pulse-glow pointer-events-none" />

        {/* Core Theatrical God-Ray Shaft */}
        <div
          className="absolute -top-10 right-0 w-[1350px] h-[1050px] opacity-75 mix-blend-screen pointer-events-none"
          style={{
            clipPath: "polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)",
            background:
              "linear-gradient(225deg, rgba(255, 255, 255, 0.5) 0%, rgba(244, 208, 111, 0.32) 28%, rgba(72, 202, 228, 0.16) 60%, transparent 90%)",
            filter: "blur(36px)",
          }}
        />

        {/* Secondary Soft Wash Beam */}
        <div
          className="absolute -top-10 right-0 w-[1400px] h-[1100px] opacity-45 mix-blend-screen pointer-events-none"
          style={{
            clipPath: "polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)",
            background:
              "linear-gradient(225deg, rgba(244, 208, 111, 0.2) 0%, rgba(72, 202, 228, 0.12) 45%, transparent 85%)",
            filter: "blur(65px)",
          }}
        />

        {/* Modal Stage Bounce / Backlight Halo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-65 mix-blend-screen pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(244, 208, 111, 0.24) 0%, rgba(72, 202, 228, 0.14) 45%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>
>>>>>>>> INSERT END
```

---

## 6. Verification Pipeline

1. **TypeScript Typecheck**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npx tsc --noEmit
   ```
   *Expected*: Zero errors.
2. **Next.js Production Build**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build
   ```
   *Expected*: Build succeeds with all routes compiled.
3. **Visual Regression Verification via Playwright**:
   - Step 0 displays a single unified KARSA logo in the center of the modal card.
   - The top-left corner is clean with no orphaned wordmark.
   - Top-right spotlight beam is clearly visible radiating down toward the modal card.
   - Button "Mulai perjalanan!" and name input remain 100% clickable.
   - Viewports 375px, 768px, 1440px, and 2560px exhibit no horizontal scrollbars.
