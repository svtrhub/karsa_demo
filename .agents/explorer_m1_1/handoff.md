# Handoff Report: Explorer 1 (R1 Onboarding Visual Polish & Spotlight Reveal)

**Agent ID**: `teamwork_preview_explorer` (Explorer 1)  
**Task**: R1 (Onboarding Visual Polish & Theatrical Spotlight Reveal in `src/components/onboarding/OnboardingFlow.tsx`)  
**Parent Conversation ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Handoff Type**: Hard (Investigation & Specification complete)  

---

## 1. Observation

1. **Top-Left Redundant Logo in `src/components/onboarding/OnboardingFlow.tsx` (Lines 128–133)**:
   ```tsx
   {/* Header Brand */}
   <div className="absolute top-6 left-6 flex items-center gap-3 select-none">
     <span className="font-logo font-bold text-2xl md:text-3xl text-white tracking-wider drop-shadow-md uppercase">
       KARSA
     </span>
   </div>
   ```
2. **Central Card Logo at Step 0 (Lines 183–188)**:
   ```tsx
   {/* Big White KARSA Logo in Redaction 35 Font (90% opacity) */}
   <div className="py-4 flex justify-center select-none">
     <span className="font-logo font-bold text-5xl md:text-6xl text-white tracking-widest opacity-90 drop-shadow-[0_4px_30px_rgba(255,255,255,0.35)] uppercase">
       KARSA
     </span>
   </div>
   ```
3. **Visual Inspection of Current Screen via Playwright (`audit_screenshots/live_step0.png`)**:
   - Both logos render simultaneously on screen, competing for visual hierarchy and breaking the central portal focal point.
   - The top-right quadrant is completely dark/unilluminated.
   - The background exterior (`ASSETS.roomExterior`) at `opacity-40 -z-10` is flat and lacks directional depth.
4. **Background Element Hierarchy**:
   - `ASSETS.roomExterior` (`line 116`): `object-cover opacity-40 -z-10 pointer-events-none`.
   - Ambient glow 1 (`line 125`): `absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-karsa-cyan/10 rounded-full blur-3xl pointer-events-none`.
   - Ambient glow 2 (`line 126`): `absolute bottom-10 left-10 w-72 h-72 bg-karsa-gold/10 rounded-full blur-3xl pointer-events-none`.
   - Progress dots (`line 136`): `z-10`.
   - Main card (`line 152`): `liquid-glass-modal ... z-10`.
5. **Tailwind Config & Styling Capabilities**:
   - `tailwind.config.js:41,49`: `pulse-glow` keyframes (`0%, 100% { opacity: 0.6, transform: scale(1) }, 50% { opacity: 1, transform: scale(1.03) }`) and `animate-pulse-glow` are natively registered.
   - `globals.css:172`: `.liquid-glass-modal` uses `backdrop-filter: blur(36px) saturate(190%) brightness(1.05)`. Any light layer placed behind the card is diffused and refracted through the glass.
6. **Spotlight Prototypes Evaluated**:
   - Tested 3 candidate spotlight implementations via Playwright (`audit_screenshots/test_spotlight_v1.png`, `v2.png`, `v3.png`).
   - Variant 2 (Directional dual clip-path god-ray shaft + apex luminaire + modal stage bounce) proved decisively superior in theatrical definition, volumetric depth, and harmony with the room exterior.

---

## 2. Logic Chain

1. **From Observation 1 & 2**: Having two identical wordmarks ("KARSA") in Redaction 35 font rendered simultaneously on step 0 produces brand dissonance. In steps 1–4, the top-left logo becomes an orphaned static element without interactive controls.
2. **From Observation 1 & 4**: Lines 128–133 are positioned `absolute top-6 left-6` and are decoupled from the flex flow. Deleting lines 128–133 causes zero layout shift, zero sibling reflow, and introduces zero orphan references.
3. **From Observation 3 & 4**: The top-right quadrant lacks illumination, while the bottom-left features an ambient gold pool (`bg-karsa-gold/10`). Introducing a directional spotlight from top-right down toward the central card creates an aesthetically balanced diagonal lighting triangle.
4. **From Observation 4 & 5**: Positioning the spotlight layer at `z-0` places it strictly in front of the `-z-10` room exterior and behind the `z-10` modal card. Using `mix-blend-screen` allows the beam to illuminate the architectural lines of *Rumah Karsa* in the background while shining through the modal's 36px Liquid Glass backdrop blur.
5. **From Observation 5 & 6**: Constructing the spotlight with `pointer-events-none` on all elements and enclosing it within `overflow-hidden` ensures 100% click pass-through and zero scrollbars across all screen widths.

---

## 3. Caveats

- **Scope Constraint**: Read-only exploration. No source files were modified; implementation will be executed by the Implementer agent.
- **Coordination with R2**: Explorer 2 has specified the 2-tier segmented class selector for lines 240–300. R1 edits lines 124–133. Because these edits target completely separate regions of `OnboardingFlow.tsx`, they can be merged with zero merge conflict.
- **Batik Overlay Note**: `batik-overlay` class is currently a semantic placeholder in `OnboardingFlow.tsx`. The spotlight beam design is fully compatible with both the plain background and any future SVG pattern overlay.

---

## 4. Conclusion

1. **Safe Removal of Redundant Logo**:
   - Delete lines 128–133 in `src/components/onboarding/OnboardingFlow.tsx`.
2. **Theatrical Spotlight Reveal Specification**:
   - Insert the 4-layer optical spotlight stack right after line 126 in `src/components/onboarding/OnboardingFlow.tsx`:
     - Layer 1: Apex Luminaire (`absolute -top-28 -right-28 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-white/50 via-[#F4D06F]/35 to-transparent blur-3xl opacity-90 animate-pulse-glow pointer-events-none`).
     - Layer 2: Core Theatrical God-Ray Shaft (`clipPath: polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)`, `linear-gradient(225deg, ...)`, `blur(36px)`, `mix-blend-screen`, `opacity-75`).
     - Layer 3: Secondary Atmospheric Wash Beam (`clipPath: polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)`, `linear-gradient(225deg, ...)`, `blur(65px)`, `mix-blend-screen`, `opacity-45`).
     - Layer 4: Modal Backlight Stage Bounce (`radial-gradient(ellipse at 50% 50%, ...)`, `blur(40px)`, `mix-blend-screen`, `opacity-65`).
3. **Full Blueprint**: Complete diff and rationale recorded in `.agents/explorer_m1_1/analysis.md`.

---

## 5. Verification Method

Once implemented by the Implementer:
1. **TypeScript Type Safety**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npx tsc --noEmit
   ```
   *Pass criteria*: Exit code 0, zero errors.
2. **Next.js Production Build**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build
   ```
   *Pass criteria*: Build succeeds with all pages static/SSR compiled cleanly.
3. **Interactive & Visual Regression Check**:
   - Navigate to `http://localhost:3000` on Step 0.
   - Confirm: Top-left corner has NO "KARSA" logo; only the centered card wordmark is visible.
   - Confirm: Top-right spotlight beam is visible, radiating down through the modal card.
   - Confirm: Clicking "Mulai perjalanan!" and typing in the name input field works without obstruction.
   - Confirm: Resizing viewport between 375px and 2560px produces no scrollbars.
