# Handoff Report: Explorer 2 (R2 2-Tier Segmented Class Selector)

**Agent ID**: `teamwork_preview_explorer` (Explorer 2)  
**Task**: R2 (Intuitive SMP/SMA 2-Tier Segmented Class Selector in `OnboardingFlow.tsx`)  
**Parent ID**: `38295144-392e-4ba7-8ad0-30884ae5d797`  
**Handoff Type**: Hard (Investigation complete)  

---

## 1. Observation

1. **Current Step 1 Implementation in `src/components/onboarding/OnboardingFlow.tsx`**:
   - Lines 19–26:
     ```tsx
     const JENJANG_OPTIONS = [
       "SMP Kelas 7",
       "SMP Kelas 8",
       "SMP Kelas 9",
       "SMA/SMK Kelas 10",
       "SMA/SMK Kelas 11",
       "SMA/SMK Kelas 12",
     ];
     ```
   - Lines 264–282:
     ```tsx
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
       {JENJANG_OPTIONS.map((item) => {
         const isSelected = profile.jenjangKelas === item;
         return (
           <button
             key={item}
             onClick={() => setProfileData({ jenjangKelas: item })}
             className={`p-4 rounded-2xl text-left transition-all flex items-center justify-between ${
               isSelected
                 ? "liquid-glass border-amber-400/60 shadow-[0_0_20px_rgba(230,194,128,0.2)] text-amber-300 font-semibold"
                 : "liquid-glass-card text-slate-300 hover:text-white"
             }`}
           >
             <span className="text-sm font-medium">{item}</span>
             {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
           </button>
         );
       })}
     </div>
     ```

2. **Downstream Consumers of `profile.jenjangKelas`**:
   - `src/lib/types.ts:23`: `jenjangKelas: string;` in `UserProfile`.
   - `src/lib/domainEngine.ts:6`: `INITIAL_PROFILE` sets `jenjangKelas: "SMA/SMK Kelas 10"`.
   - `src/context/DemoContext.tsx:66,95`: Persisted to `localStorage["karsa_demo_state_v1"]`.
   - `src/components/onboarding/OnboardingFlow.tsx:531`: Step 4 renders `<span className="font-semibold text-slate-200">{profile.jenjangKelas}</span>`.
   - `src/lib/personas.ts:87`: LLM system prompt uses `Jenjang & Kelas: ${userProfile.jenjangKelas || "Belum diisi"}` to adapt competition recommendations.
   - `src/components/ftux/FTUXSequence.tsx`, `src/components/dashboard/TopBar.tsx`, `src/components/dashboard/Sidebar.tsx`: Do not consume `jenjangKelas`.

3. **Compilation & Type Status**:
   - Command: `$env:PATH = "C:\Program Files\nodejs;$env:PATH"; npx tsc --noEmit`
   - Result: Exit code 0, zero errors.

---

## 2. Logic Chain

1. **Premise 1 (Observation 1)**: The current UI presents all 6 class choices in a flat grid. This causes repetitive text ("SMP Kelas...", "SMA/SMK Kelas..."), lack of educational structure, and excessive height on mobile viewports.
2. **Premise 2 (Observation 2)**: All downstream consumers (`DemoContext`, `localStorage`, Step 4 summary, `personas.ts` LLM prompt generator) strictly expect `profile.jenjangKelas` to match one of the 6 canonical string values (`"SMP Kelas 7"`, `"SMP Kelas 8"`, `"SMP Kelas 9"`, `"SMA/SMK Kelas 10"`, `"SMA/SMK Kelas 11"`, `"SMA/SMK Kelas 12"`).
3. **Inference 1**: By structuring the selector into Tier 1 (`[SMP]` vs `[SMA / SMK]`) and Tier 2 (`Kelas 7, 8, 9` vs `Kelas 10, 11, 12`), the visible options at any moment decrease from 6 to 3, cutting visual clutter by 50% and grouping by natural educational stage (*Kurikulum Merdeka*).
4. **Inference 2**: By storing the canonical string on sub-class selection and remembering the user's last selection per category (`lastSmpClass` and `lastSmaClass`), switching tabs never leaves an unselected or mismatched state and preserves previously chosen classes.
5. **Inference 3**: Integrating Framer Motion `layoutId="activeJenjangTier1"` gives a native-feeling sliding pill effect, while `<AnimatePresence mode="wait">` smoothly cross-fades the Tier 2 chips.

---

## 3. Caveats

- **Network Mode**: Codebase investigated in CODE_ONLY mode without external network access.
- **Scope Boundary**: Read-only exploration. No source files were modified; implementation will be executed by the designated Implementer agent.
- **R1 Coordination**: Explorer 1 is designing R1 (removing top-left redundant logo, adding top-right spotlight beam in `OnboardingFlow.tsx`). Both R1 and R2 edits target `OnboardingFlow.tsx` but in distinct sections (Header lines 128–133 and Step 1 lines 240–300), preventing merge conflicts if applied sequentially.

---

## 4. Conclusion

1. **Implementation Strategy**:
   - Add `TIER1_CATEGORIES` and `SUB_CLASSES_BY_CATEGORY` to `src/components/onboarding/OnboardingFlow.tsx`.
   - Add `activeCategory`, `lastSmpClass`, and `lastSmaClass` hooks inside `OnboardingFlow` (initialized from `profile.jenjangKelas`).
   - Replace Step 1 JSX with the 2-tier segmented control incorporating `layoutId="activeJenjangTier1"`, Kurikulum Merdeka Fase badges (`Fase D`, `Fase E`, `Fase F`), and touch targets exceeding $48\text{px}$.
2. **Full Code Blueprint**: Documented completely in `.agents/explorer_m1_2/analysis.md` (Section 6).

---

## 5. Verification Method

To verify the implementation once applied:
1. **TypeScript Type Check**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npx tsc --noEmit
   ```
   *Expected result*: Exit code 0, 0 errors.
2. **Next.js Production Build**:
   ```powershell
   $env:PATH = "C:\Program Files\nodejs;$env:PATH"; npm run build
   ```
   *Expected result*: Successful build with all routes compiled.
3. **Interactive & Visual Testing**:
   - Start dev server: `npm run dev`.
   - On Step 1:
     - Verify default category is `SMA / SMK` with `Kelas 10` active.
     - Click `SMP`: Verify sliding pill animates to `SMP`, and `Kelas 7` is selected.
     - Click `Kelas 8`: Verify `Kelas 8` is selected.
     - Click `SMA / SMK`: Verify `Kelas 10` is active.
     - Click `SMP`: Verify `Kelas 8` is remembered and active.
     - Click `Lanjut` through to Step 4: Verify Summary Card displays `Jenjang & Kelas: SMP Kelas 8`.
