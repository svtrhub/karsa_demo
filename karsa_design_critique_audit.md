# 🎨 Karsa & Prestasi.id — Master Design Critique & Anti-Generic Audit Report

**Project:** Karsa & Prestasi.id (Belimpact Global Competition 2026)  
**Audited Codebase Surfaces:**
1. Onboarding Flow (`src/components/onboarding/OnboardingFlow.tsx` — Steps 0–4)
2. FTUX Tour Overlay (`src/components/ftux/FTUXSequence.tsx` — Door, Coin Claim, 4-Beat Station Tour)
3. Persona Chat Modal & Thread UI (`src/components/chat/ChatModal.tsx` — All 5 Sobat Karsa personas)

**Design Evaluation Frameworks Applied:**
- `/impeccable`: Craft Floor Standards, Anti-Generic Detectors, Visitor Mode (Operate + Experience)
- `/ui-ux-pro-max`: Hierarchy, Color Token Mapping, Spatial Personality, Touch & Motion Standards
- `/web-design-guidelines`: Accessibility, Typography (`…` vs `...`), Focus Ringing, Semantic DOM

---

## 1. Executive Summary & Diagnostic Verdict

### Overall Diagnosis: *"An AI Chat Template with a Mascot Bolted On"*

While the project specification (`karsa_ui_feature.md`) describes a rich cultural synthesis of **Cosmic Batik** spatial computing and cute **Seki Chibi Doodle** character copilots, the current code implementation falls into the classic **Generic AI Wrapper Anti-Pattern**:

```
[CURRENT STATUS QUO]
• Default shadcn `rounded-xl` / `rounded-2xl` glass panels without custom geometry.
• Copy mentions character names ("Ara akan membagi jadwal..."), but the UI displays NO visual faces.
• FTUX Tour renders single letter initials ("A", "R", "S", "A") inside colored squares instead of character artwork.
• Chat Modal uses generic ChatGPT/Claude-style bubbles with a 3px colored left border strip and generic Lucide icons.
```

### The Fix Principle: **Specificity over Decoration**
The solution is **not** adding more background radial gradients or random glassmorphism. The solution is **character presence and spatial specificity**: making every screen feel like walking into a specific station in *Rumah Karsa*, hosted by a real, visible Sobat Karsa companion carrying their unique visual identity.

---

## 2. Granular Surface Audit & Defect Breakdown

### Surface A: Onboarding Flow (Steps 0 – 4) (`OnboardingFlow.tsx`)

| Step | Current Code Implementation | "Generic AI Product" Defect | Impeccable / UI-UX Pro Max Violation | Recommended Specificity Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Step 0: Welcome Gate** | Generic `Sparkles` icon in gold box. Copy says *"Sobat Karsa Pit Crew"*. | **Names Without Faces.** No visual presence of Karsa or the 5 Sobat Karsa agents. Feels like a generic SaaS landing page modal. | `impeccable:rule-generic-ai-wrapper`<br>`impeccable:rule-missing-character-anchor` | Embed Karsa's **WebP Chibi Character (`karsa_pose_1.webp`)** directly hosting the welcome card with a floating speech bubble greeting. |
| **Step 1: Jenjang Kelas** | Copy says *"Biar Karsa bisa nyariin lomba..."*. Grid of generic buttons with `CheckCircle2` icons. | **Disembodied Copy.** Karsa is mentioned in text but absent visually. Options look like a standard Google Form radio list. | `ui-ux-pro-max:style-selection`<br>`impeccable:rule-form-lack-of-personality` | Display **Karsa holding his Golden Compass (`karsa_pose_3.webp`)** at the top header, adjusting the grade selector based on competition eligibility. |
| **Step 2: Keahlian & Minat** | Text labels for *"Keahlian Dimiliki"* & *"Ingin Dikuasai"*. Standard pill chips with `+` and `★`. | **Generic Pill Grid.** Looks like a generic onboarding survey. Arka (researcher) and Sekar (scout) are missing. | `web-design-guidelines:content-handling`<br>`impeccable:rule-unanchored-choice` | Feature **Arka with his Magnifying Glass (`arka_pose_3.webp`)** evaluating research/science skills, and **Sekar with her Tablet (`sekar_pose_3.webp`)** scouting interest tags. |
| **Step 3: Ritme & Target** | Copy says *"Ara akan membagi jadwal belajarmu agar kamu tidak perlu begadang."* Lucide `Clock` icon. | **Phantom Character Mention.** Ara is explicitly named as the time keeper, but the UI shows a plain Lucide clock. | `impeccable:rule-phantom-copy-character` | Feature **Ara proudly holding her Stopwatch (`ara_pose_1.webp`)** actively configuring the 20-minute daily sprint timer options. |
| **Step 4: Summary & Consent** | Generic gray table box, Lucide `ShieldCheck`, standard browser checkbox. | **Corporate Legal Disclaimer.** Destroys the warm "Rumah Karsa" sanctuary vibe right before entry. | `impeccable:rule-cold-summary-card`<br>`web-design-guidelines:forms` | Feature **Radit holding the Karsa Coin (`radit_pose_3.webp`)** presenting the 250 Coin Welcome Bonus and the zero-ghostwriting covenant card. |

---

### Surface B: FTUX Sequence (`FTUXSequence.tsx`)

| Phase | Current Code Implementation | "Generic AI Product" Defect | Impeccable / UI-UX Pro Max Violation | Recommended Specificity Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Door Open** | Glowing Lucide `Compass` icon inside a circle. | **Icon Placeholder.** Opening the door to "Rumah Karsa" shows a Lucide vector line icon instead of Karsa or the house exterior. | `impeccable:rule-abstract-placeholder`<br>`ui-ux-pro-max:spatial-continuity` | Display **`rumah_karsa_exterior.webp` background** with **Karsa floating at the open doorway (`karsa_pose_2.webp`)** extending a warm hand. |
| **Phase 2: Coin Claim** | Bouncing Lucide `Coins` icon inside an amber circle. | **Generic Gamification Badge.** Standard coin reward popup found in cheap mobile apps. | `impeccable:rule-generic-reward-modal` | Display **Radit presenting the 3D-styled `koin_karsa.svg`** with a coin counter animation and his coin safe in the background. |
| **Phase 3: Station Tour** | Renders `{currentTourAgent.name[0]}` (single letter initials "A", "R", "S", "A") inside a colored box. | **CRITICAL DEFECT: Initial Letters as Avatars.** Showing single letter text initials instead of character portraits is unacceptable for a character-driven app. | `impeccable:rule-letter-avatar-ban`<br>`ui-ux-pro-max:touch-interaction` | Replace single letter boxes with **full 100px Seki Chibi WebP character portraits** (`ara.webp`, `radit.webp`, `sekar.webp`, `arka.webp`) anchored to their actual station room backdrop. |

---

### Surface C: Dashboard Chat Modal & Thread UI (`ChatModal.tsx`)

| Component | Current Code Implementation | "Generic AI Product" Defect | Impeccable / UI-UX Pro Max Violation | Recommended Specificity Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | Lucide icons (`Compass`, `Timer`, `Coins`, `Users`, `BookOpen`) inside colored rounded boxes. | **SaaS Icon Header.** The chat header looks like an admin tool selecting a category icon. | `impeccable:rule-icon-as-avatar`<br>`ui-ux-pro-max:brand-identity` | Replace Lucide icons with **the active agent's WebP portrait (`portrait/{persona}.webp`)** with a glowing persona-colored border ring (`#F4D06F`, `#FF9F1C`, `#2EC4B6`, `#48CAE4`, `#A594F9`). |
| **Persona Switcher** | Horizontal row of plain text pill buttons: `[Karsa] [Ara] [Radit] [Sekar] [Arka]`. | **LLM Model Selector Wrapper.** Mimics ChatGPT's GPT-3.5/GPT-4 dropdown or Claude's model picker. | `impeccable:rule-llm-wrapper-tell`<br>`ui-ux-pro-max:navigation-patterns` | Replace text pills with a **Station Quick-Jump Bar** featuring mini character face thumbnails and station titles (*Ruang Tengah*, *Studio Pacing*, *Brankas*, *Lounge*, *Meja Riset*). |
| **Agent Messages** | 8x8 rounded box with tiny Lucide icon inside (`<PersonaIcon />`). Chat bubble is `bg-slate-900` with a 3px colored left border strip. | **The Ultimate Generic AI Chat Bubble.** Every generic AI wrapper uses a gray card with a 3px left border. It completely lacks Cosmic Batik identity. | `impeccable:rule-3px-border-chat-tell`<br>`impeccable:rule-missing-avatar-message` | **Persona Signature Chat Cards:**<br>• Real WebP character face thumbnail (`36x36`) next to every message.<br>• Persona-themed background tints and Cosmic Batik corner motifs.<br>• Active state-driven sprite poses (`karsa_pose_3.webp` for Karsa, `arka_pose_3.webp` for Arka). |
| **User Messages** | Right-aligned dark box with generic Lucide `<User />` icon. | **Cold User Avatar.** Does not display student's name or custom persona accent. | `ui-ux-pro-max:touch-interaction` | Display student's name badge (*"Siswa"* / `{nama}`), Cyan accent halo (`#48CAE4`), and clean rounded message tail. |
| **Input Bar & Chips** | Generic input field `Kirim pesan ke {Name}...` + Lucide `Send` button. Text prompts in straight quotes (`""`). | **Generic Input Bar.** No persona-specific tool shortcuts or Indonesian typographic quotes (`“…”`). | `web-design-guidelines:typography`<br>`impeccable:rule-generic-input-bar` | Add **Persona Tool Action Chips** (e.g. Ara: `[⏱️ Buatkan Sprint 20 Min]`, Arka: `[🔍 Uji Draf Proposal]`, Radit: `[🪙 Hitung Biaya Lomba]`). Use proper curly quotes (`“…”`). |

---

## 3. Design Taste Guidelines & Rules Enforced

### From `/impeccable`:
1. `rule-generic-ai-wrapper`: Eradicate UIs that look like ChatGPT or Claude clones with a mascot logo attached. The UI must feel natively constructed inside *Rumah Karsa*.
2. `rule-letter-avatar-ban`: Never render single text initials (e.g., `A`, `R`, `S`) as character avatars when real artwork exists.
3. `rule-3px-border-chat-tell`: Eliminate flat dark gray chat bubbles with thin 3px left borders. Use rich persona-colored cards with translucent glassmorphic borders and Batik constellation patterns.

### From `/ui-ux-pro-max`:
1. `priority-4-style-selection`: Enforce the committed design language (**Cosmic Batik & Seki Chibi**) consistently across all touchpoints.
2. `priority-6-typography-color`: Map exact color tokens per persona:
   - **Karsa**: Celestial Gold (`#F4D06F`) & Galactic Violet (`#6A2C91`)
   - **Ara**: Orange Pacing (`#FF9F1C`) & Cyan (`#48CAE4`)
   - **Radit**: Emerald/Teal Financial (`#2EC4B6`) & Maroon (`#800020`)
   - **Sekar**: Cyan Networker (`#48CAE4`) & White Sweater
   - **Arka**: Academic Gold (`#F4D06F`) & Purple/Navy (`#A594F9`)

### From `/web-design-guidelines`:
1. `typography`: Use true curly quotes (`“…”`) and proper ellipsis (`…`), not straight quotes (`""`) or triple dots (`...`).
2. `accessibility`: Ensure image alt tags (`alt="Ara Pacing Enforcer"`), visible focus rings (`focus-visible:ring-2 focus-visible:ring-karsa-gold`), and proper ARIA labels on all icon action triggers.

---

## 4. How to Proceed: Step-by-Step Refactoring Plan

### Phase 1: Asset Transfer & Data Mapping
1. Execute the PowerShell asset migration script to populate `public/assets/` with:
   - `public/assets/sobat_karsa/portrait/*.webp`
   - `public/assets/sobat_karsa/sprite_pose/*/*.webp`
   - `public/assets/rumah_karsa/*.webp`
   - `public/assets/koins/koin_karsa.svg`
2. Update `src/lib/personas.ts` to include `avatarImage` and `poses` paths for all 5 personas.

---

### Phase 2: Refactor Onboarding Flow (`OnboardingFlow.tsx`)
1. **Step 0**: Add `karsa_pose_1.webp` avatar image beside the title, welcoming the student into *Rumah Karsa*.
2. **Step 1**: Add `karsa_pose_3.webp` (Karsa holding compass) to the header of the Jenjang Kelas card.
3. **Step 2**: Add `arka_pose_3.webp` (Arka with magnifying glass) to the Keahlian section header.
4. **Step 3**: Add `ara_pose_1.webp` (Ara holding stopwatch) to the Ritme & Waktu section header.
5. **Step 4**: Add `radit_pose_3.webp` (Radit holding coin) beside the summary and consent card.

---

### Phase 3: Refactor FTUX Sequence (`FTUXSequence.tsx`)
1. **Phase 1 (Door)**: Replace generic `Compass` icon with `rumah_karsa_exterior.webp` background and `karsa_pose_2.webp` character image.
2. **Phase 2 (Coin Reward)**: Replace Lucide coin icon with `koin_karsa.svg` vector and `radit_pose_3.webp` character image.
3. **Phase 3 (Tour)**: Replace letter avatar text box (`currentTourAgent.name[0]`) with `<img src={currentTourAgent.avatarImage} alt={currentTourAgent.name} className="w-16 h-16 object-contain" />`.

---

### Phase 4: Refactor Chat Modal & Threads (`ChatModal.tsx`)
1. **Header**: Replace Lucide icons with character WebP portrait `<img src={persona.avatarImage} />` with persona-colored glowing ring.
2. **Persona Switcher**: Replace text pills with a mini avatar thumbnail bar showing face icons of all 5 Sobat Karsa agents.
3. **Chat Thread Bubbles**:
   - Replace 8x8 Lucide icon box with character WebP portrait thumbnail (`w-9 h-9`).
   - Replace 3px left border with bespoke persona glass card:
     - Karsa: Violet-gold gradient border with celestial star accent.
     - Ara: Orange pacing border with timer badge.
     - Radit: Emerald ledger border with coin badge.
     - Sekar: Cyan networker border with music note accent.
     - Arka: Academic purple border with fountain pen badge.
4. **Input Bar**: Add persona shortcut action buttons above input (e.g. `[⏱️ Sprint 20 Min]`, `[🔍 Uji Draf]`, `[🪙 Hitung Biaya]`). Replace straight quotes with curly quotes (`“…”`).

---

## 5. Verification Checklist

- [ ] Onboarding Step 0 through 4 feature visible Seki Chibi WebP character artwork hosting each step.
- [ ] FTUX sequence displays real character artwork and `koin_karsa.svg` graphic (zero initial letter boxes).
- [ ] Chat Modal header displays WebP character portrait with persona accent ring.
- [ ] Chat thread messages display WebP character headshots and persona-specific card styling (no 3px gray borders).
- [ ] Code passes all `web-design-guidelines` typography and accessibility checks.

*Audit Report compiled for Karsa UI/UX Refactoring Execution.*
