# **Karsa \- Visual Asset & UI Master Specification**

**Project:** Karsa & Prestasi.id (Belmpact Global Competition 2026\)  
**Document Type:** Master Visual Asset Bible & Generative Production Roadmap  
Target Platform: Mobile-First Responsive PWA (Next.js / Tailwind CSS / Vercel)  
Visual Theme: Cosmic Batik & Frosted Liquid Glass

# **1\. Executive Summary & Design Philosophy**

## **1.1 Dual-Entity Context**

Karsa operates as an ambient educational copilot and student guild ("Rumah Karsa") powered by a dedicated 5-agent AI pit crew (Sobat Karsa). It prepares Indonesian secondary school students (SMP & SMA/SMK, ages 13–18) for national and international competitions (OPSI, OSN, FLS2N, LKTI, Beasiswa) through 20-minute daily task pacing, rubric-grounded AI defense, and peer matchmaking.

## **1.2 "Cosmic Batik" Design Language**

* **The Philosophy:** Synthesizes cutting-edge spatial computing aesthetics with Indonesian cultural heritage. It communicates that Indonesian students do not need to shed their identity to compete on the global stage.  
* **Global Color Palette:**  
  * **Deep Space Navy (`#0B132B`):** Primary base canvas and cosmic sky.  
  * **Obsidian Slate (`#1C2541`):** Structural container surfaces and secondary panels.  
  * **Celestial Gold (`#F4D06F`):** High-priority callouts, badges, currency indicators, and primary CTAs.  
  * **Astral Cyan (`#48CAE4`):** Telemetry accents, agent highlight rings, and interactive hyperlinks.  
* **Liquid Glass Treatment:** `backdrop-blur-md bg-slate-900/60 border border-white/10 shadow-2xl` applied to floating command bars, KPI cards, and dialog overlays.  
* **Batik Application Rule:** Kept strictly minimal and subtle. Derived from geometric Batik Parang and Kawung structures modernized into constellation lines and graph nodes on card borders, dividers, and corner accents—never overwhelming the UI or characters.

## **1.3 Architectural Decision: Layered DOM over Game Engines**

Rather than using heavy Canvas/WebGL game engines (Phaser/PixiJS), "Rumah Karsa" is engineered with **Layered DOM \+ CSS Scroll-Snap / Framer Motion**. This approach provides zero canvas resize bugs, instant screen reader accessibility, lightweight bundle size for budget Android phones, and seamless native integration with Tailwind CSS glassmorphic modals and Vercel AI SDK real-time streaming chat.

# **2\. Spatial Architecture: "Rumah Karsa" 3-Room Floor Plan**

Rumah Karsa uses a 3-room contiguous horizontal layout. On mobile, the viewport initializes centered on Room 2 (Ruang Tengah) and supports smooth horizontal swiping to adjacent rooms (Pou-style navigation).┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐

&nbsp;

│       ROOM 1 (LEFT)          │       ROOM 2 (CENTER)        │       ROOM 3 (RIGHT)         │

&nbsp;

│   Studio Riset & Pacing      │  Ruang Tengah (Living Room)  │  Lounge Komunitas & Brankas  │

&nbsp;

│                              │                              │                              │

&nbsp;

│ • Ara's Pacing Desk          │ • All 5 Chibis Idle Hangout  │ • Radit's Brass Coin Vault   │

&nbsp;

│ • Sprint Whiteboard & Clock  │ • Low Teak Coffee Table      │ • Financial Ledger Station   │

&nbsp;

│ • Arka's Research Desk       │ • Indigo Batik Floor Rug     │ • Sekar's Balcony Beanbag    │

&nbsp;

│ • Floor-to-Ceiling Bookshelf │ • Celestial Bay Window       │ • Open Terrace Night View    │

&nbsp;

└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▲                               ▲                              ▲

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│◄────────── SWIPE ────────────►│◄────────── SWIPE ───────────►│

## **2.1 Room Detail & Functional Allocation**

1. **Room 2: Center — Ruang Tengah (Default Spawn & Living Room):**  
   * **Function:** Main communal sanctuary.  
   * **Visual Elements:** Circular indigo floor rug with gold batik parang vector accents, low teak wood coffee table with ceramic cups, 5 floor cushions arranged around the table, and a wide celestial bay window overlooking a starry night sky.  
   * **Default Behavior:** All 5 Sobat Karsa agents default to this room in **Pose 1 (Idle Lounging)**.  
2. **Room 1: Left — Studio Riset & Pacing:**  
   * **Function:** Deep academic methodology and daily sprint pacing.  
   * **Visual Elements:** Left half contains Ara's high-energy planning desk with a digital stopwatch and whiteboard milestone tracker. Right half contains Arka's scholarly library nook with mahogany shelves, stacked journals, and a warm banker's lamp.  
3. **Room 3: Right — Lounge Komunitas & Brankas:**  
   * **Function:** Financial stewardship, team matchmaking, and music relaxation.  
   * **Visual Elements:** Left half houses Radit's brass coin safe (Brankas Koin Karsa) and meticulous accounting desk. Right half houses Sekar's networking lounge with an oversized beanbag, headphone wall mount, and open balcony overlooking ambient city lights.

## **2.2 Agent Movement & Doorway Busy Indicator**

* **Movement Trigger:** When an agent is assigned a live task, they exit Ruang Tengah and appear seated at their specialized workstation in Room 1 or Room 3 in **Pose 2 (Working)**.  
* **"Lagi Sibuk..." Indicator:** When an agent has left Ruang Tengah, a stylized 2D sketch-style speech bubble appears at the doorway threshold of Ruang Tengah stating `"{Name} lagi sibuk..."` with a mini progress icon. Tapping this bubble navigates the user directly to the active agent's room.

## **2.3 Tap-to-Zoom Interaction State Machine**

1. **Selection:** Tapping an idle agent in the room triggers a smooth camera scale to `1.35x` centered on the target chibi. Background room softly blurs.  
2. **Greeting Popover:** A frosted liquid-glass bubble pops above the character displaying their unique greeting tone.  
3. **Quick Action Drawer:** Two pill chips slide in beneath the greeting:  
   * **Chip 1 (Contextual Tool):** Direct action shortcut (e.g., Arka: `[Uji Draf Proposal]`).  
   * **Chip 2 (Primary CTA):** `[Mulai percakapan dengan {Name}]`.  
4. **Dismissal:** Tapping anywhere outside the bubble zooms the room back to `1.0x` default view.

# **3\. Mobile UI Architecture**

## **3.1 Vertical Screen Viewport Budget (Standard Mobile 390×844px)**

* **Top Navigation Bar (8% / \~56px):**  
  * Left: Hamburger Drawer Menu `[=]`.  
  * Center: Pill Badge `[+ Upgrade Karsa]` (triggers Tiket Musim Lomba modal).  
  * Right: Refresh / Camera Reset Icon.  
* **Rumah Karsa Viewport (68% / \~480px):**  
  * Houses the 3-room swipeable container.  
  * Bottom-Left Room Overlay: Stacked contextual prompt chips.  
* **Floating Command Bar (14% / \~90px):**  
  * Translucent liquid-glass pill input: `+ Tanya Karsa...`.  
  * Accessories: Add file `(+)`, Microphone `(🎤)`, and audio waveform `(ılılı)`.

## **3.2 Keyboard Focus Behavior**

When the student taps the input bar and the virtual keyboard opens:

&nbsp;

* The room container scales and shifts upward to occupy the top 35% of the screen.  
* The camera automatically pans to keep Karsa or the active conversational agent visible.  
* A subtle cosmic gradient overlay dims the upper room to maximize chat readability.

## **3.3 Left Sidebar Navigation Hierarchy**

* **Header:** Karsa Brand Mark \+ Search Icon \+ New Conversation Button.  
* **Section 1 (Alat & Utilitas):** Dokumen SNBP, Brankas Koin, Kustomisasi, Pengingat, and Kalendermu.  
* **Section 2 (Sobat Karsa Dedicated Threads):** KARSA, ARA, RADIT, SEKAR, ARKA.  
* **Footer:** `[+ Upgrade Karsa]` persistent button \+ Student profile badge (Person, Kelas 11 SMA).

# **4\. Master Visual Asset Matrix & Delivery Specifications**

## **4.1 Environment Assets (WebP / Layered SVG)**

* `ENV_ROOM_02_LIVING_BG.webp` (Center Room base shell, 1920×1080)  
* `ENV_ROOM_01_STUDY_BG.webp` (Left Room base shell, 1920×1080)  
* `ENV_ROOM_03_LOUNGE_BG.webp` (Right Room base shell, 1920×1080)  
* `FURNITURE_CENTRAL_TABLE.webp` (Teak table with indigo batik runner)  
* `FURNITURE_ARA_DESK.webp` (Sprint desk with digital stopwatch)  
* `FURNITURE_ARKA_DESK.webp` (Library desk with banker's lamp)  
* `FURNITURE_RADIT_VAULT.webp` (Brass coin safe & ledger table)  
* `FURNITURE_SEKAR_BEANBAG.webp` (Modern beanbag & vinyl player)

## **4.2 Sobat Karsa Character Sprites**

| Character | Pose 1: Idle Lounging | Pose 2: Working | Signature Micro-Props |
| :---- | :---- | :---- | :---- |
| **Karsa** | Sitting cross-legged, sipping warm tea | Standing tall, holding golden compass | Navy hooded cloak, golden compass |
| **Ara** | Sitting on floor cushion, relaxed stretch | Leaning forward over desk, holding stopwatch | Digital stopwatch, spiral sprint notebook |
| **Radit** | Slouched against cushion, arms folded | Inspecting ledger book with coin in hand | Round wire spectacles, brass coin pouch |
| **Sekar** | Lounging on carpet, listening to music | Tapping tablet screen on beanbag | Oversized over-ear headphones, ID lanyard |
| **Arka** | Lounging casually, skimming paper | Reading research draft with magnifying glass | Vintage fountain pen, magnifying glass |

&nbsp;

&nbsp;

# **5\. Generative AI Production Pipeline & Tooling Research**

To produce studio-grade assets while adhering to the bootstrap budget, we leverage state-of-the-art AI generation platforms combined with precise human vector cleanup.

## **5.1 Tooling Evaluation (2025–2026 SOTA)**

1. **Magnific AI:** Chaining generation and style transfer. Used for upscaling initial character sketches to 4K while maintaining the "Seki" doodle silhouette.  
2. **Recraft V3:** Generates clean, editable SVGs and consistent icon sets. Applied for creating Cosmic Batik vector motifs and currency tokens.  
3. **Flux.1 (Dev / LoRA):** Exceptional prompt fidelity. Combined with ControlNet to generate identical chibi character turnaround sheets across multiple poses.  
4. **Midjourney v6.1:** Rapid visual exploration using Character Reference (`--cref`) and Style Reference (`--sref`) to establish baseline color palettes.

## **5.2 Step-by-Step Generation Execution Roadmap**

1. **Style Anchor:** Upload the "Seki" reference image to Midjourney and Recraft V3. Use anchor tokens focusing on minimalist cute chibi doodles with soft textured charcoal lines.  
2. **Character Sprite Batch:** Generate the 5 characters in Pose 1 and Pose 2 with explicit micro-prop descriptors (e.g., Karsa's brass astrolabe, Sekar's over-ear headphones).  
3. **Magnific Polish:** Import sprites into Magnific Nodes for style consistency and precision upscaling (low creativity slider) to remove pixel artifacts.  
4. **Human Retainer:** Hand upscaled outputs to a freelance illustrator (IDR 1,500,000 allocation) to standardize line weights, verify props, and ground color hex codes.  
5. **WebP Export:** Batch convert all PNGs to WebP with alpha transparency to ensure sub-second paint times on 4G Indonesian mobile connections.

&nbsp;

*Specification compiled for Karsa engineering and art team implementation.*

## **6\. Avatar Design Bible: Sobat Karsa Complete Color Palettes & Prompts**

This section provides the master visual specifications for the Sobat Karsa avatars, grounded in the "Seki" minimalist chibi doodle style and Cosmic Batik design language.

### **6.1 Karsa (The Guide)**

* **Visual Design:** A minimalist chibi in a navy hooded cloak. Signature props include a golden compass and warm tea.  
* **Color Palette:** Main: Galactic Violet \#6A2C91. Base: Deep Space Navy \#0B132B. Accents: Celestial Gold \#F4D06F.  
* **Image Prompt:** Minimalist cute chibi doodle of Karsa, soft textured charcoal lines, "Seki" style, wearing a navy hooded cloak, holding a golden compass, Cosmic Batik constellation accents, Deep Space Navy \#0B132B and Galactic Violet \#6A2C91 theme.

### **6.2 Ara (The Pacer)**

* **Visual Design:** High-energy chibi with a digital stopwatch and spiral sprint notebook.  
* **Color Palette:** Main: Nebula Blue \#0283D6. Accents: Astral Cyan \#48CAE4.  
* **Image Prompt:** Minimalist cute chibi doodle of Ara, soft textured charcoal lines, "Seki" style, holding a digital stopwatch and spiral notebook, high-energy pose, Nebula Blue \#0283D6 theme with Astral Cyan accents.

### **6.3 Radit (The Steward)**

* **Visual Design:** Chibi with round wire spectacles and a brass coin pouch.  
* **Color Palette:** Main: Stellar Magenta \#D12E8F. Accents: Obsidian Slate \#1C2541 and Celestial Gold \#F4D06F.  
* **Image Prompt:** Minimalist cute chibi doodle of Radit, soft textured charcoal lines, "Seki" style, wearing round wire spectacles, carrying a brass coin pouch, Stellar Magenta \#D12E8F and Obsidian Slate \#1C2541 theme.

### **6.4 Sekar (The Social)**

* **Visual Design:** Relaxed chibi with oversized over-ear headphones and an ID lanyard.  
* **Color Palette:** Main: Star White \#FAF6F2. Accents: Astral Cyan \#48CAE4.  
* **Image Prompt:** Minimalist cute chibi doodle of Sekar, soft textured charcoal lines, "Seki" style, wearing oversized over-ear headphones and an ID lanyard, lounging pose, Star White \#FAF6F2 theme.

### **6.5 Arka (The Researcher)**

* **Visual Design:** Scholarly chibi with a vintage fountain pen and magnifying glass.  
* **Color Palette:** Main: Star Light \#F4C542. Accents: Deep Space Navy \#0B132B.  
* **Image Prompt:** Minimalist cute chibi doodle of Arka, soft textured charcoal lines, "Seki" style, holding a vintage fountain pen and magnifying glass, Star Light \#F4C542 and Deep Space Navy \#0B132B theme.

&nbsp;

Simplified:

* Karsa:&nbsp;  
  * Main: Galactic Violet \#6A2C91&nbsp;  
* Ara:&nbsp;  
  * Main: Nebula Blue \#0283D6&nbsp;  
* Radit:&nbsp;  
  * Main: Stellar Magenta \#D12E8F&nbsp;  
* Sekar:&nbsp;  
  * Main: Star White \#FAF6F2  
* Arka:&nbsp;  
  * Main: Star Light \#F4C542&nbsp;

&nbsp;

### **Summary Palette Matrix for Quick Generation Reference**

| Avatar | Main Color | Secondary / Accent Color | Hair Color | Outfit Signature | Signature Prop |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Karsa** | Galactic Violet (\#6A2C91) | Celestial Amber (\#F4D06F) | Violet-Charcoal (\#3D254F) | Hooded Cloak | Golden Compass |
| **Ara** | Nebula Blue (\#0283D6) | Cosmic Coral (\#FF7A59) | Deep Marine (\#0F4C81) | Sporty Crewneck | Digital Stopwatch |
| **Radit** | Stellar Magenta (\#D12E8F) | Antique Brass (\#D4AF37) | Dark Plum (\#421A3B) | Cardigan \+ Spectacles | Pocket Ledger \+ Coin |
| **Sekar** | Star White (\#FAF6F2) | Astral Cyan (\#38BDF8) | Lavender-Plum (\#7E6B8F) | Slouchy Oversized Knit | Cyan DJ Headphones |
| **Arka** | Star Light (\#F4C542) | Scholar Ink Navy (\#111E38) | Intellectual Black (\#20242C) | Navy Turtleneck \+ Gold Vest | Brass Magnifying Glass |

&nbsp;

## **7\. Production Phase: Environment Prompts & Frontend Assembly Spec**

### **7.1 Environment Generation Prompts (3-Room Isometric)**

Matching the "Seki" minimalist chibi doodle style and Cosmic Batik palette:

* **Ruang Tengah (Center):** Isometric room view, minimalist doodle style, circular indigo floor rug with gold batik parang accents, low teak coffee table, celestial bay window with starry night sky, Deep Space Navy \#0B132B and Celestial Gold \#F4D06F palette.  
* **Studio Riset & Pacing (Left):** Isometric room view, academic studio, high-energy planning desk with stopwatch and whiteboard, scholarly library nook with mahogany shelves and banker's lamp, soft charcoal lines, Cosmic Batik theme.  
* **Lounge Komunitas & Brankas (Right):** Isometric room view, brass coin safe and ledger desk, networking lounge with oversized beanbag and headphone wall mount, open balcony with city lights, Astral Cyan \#48CAE4 accents.

### **7.2 Character Sprite Export Specifications**

* **Room Sprite:** Full-body character in Pose 1 or Pose 2, WebP with alpha transparency, optimized for mobile paint times.  
* **Chat Avatar (128x128):** Head-and-shoulders crop of character, circular mask, high-fidelity style from Magnific polish.  
* **Mini Status Icon:** Simplified 2D sketch-style head icon for "Lagi Sibuk..." doorway indicators.

### **7.3 Character Positioning Matrix (Ruang Tengah)**

CSS percentage coordinates for Idle Lounging (Pose 1\) around the central indigo rug:

| Agent | X-Axis (%) | Y-Axis (%) |
| :---- | :---- | :---- |
| Karsa | 50% | 65% |
| Ara | 30% | 70% |
| Radit | 70% | 70% |
| Sekar | 40% | 80% |
| Arka | 60% | 80% |

### **7.4 Frontend Implementation Snippet**

```javascript
// Next.js / Tailwind Snap-Scroll Container
export default function RumahKarsa() {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory h-[480px] w-full">
      {/* Room 1, 2, 3 sections with snap-center */}
      <div className="snap-center shrink-0 w-full bg-[url('/env/study.webp')]" />
      <div className="snap-center shrink-0 w-full bg-[url('/env/living.webp')]">
        {/* Agent with Framer Motion Tap-to-Zoom */}
        <motion.div whileTap={{ scale: 1.35 }} className="cursor-pointer" />
      </div>
      <div className="snap-center shrink-0 w-full bg-[url('/env/lounge.webp')]" />
    </div>
  );
}
```

&nbsp;

# **8\. Google Flow Character Behavior Profiles & Minimalist Body Prompt Engineering**

## **8.1 Character Info Behavior Descriptions**

1. **Karsa (The Guide):** Ambient educational copilot and student guild leader. Calm and wise tone; guides users through national and international competitions using a golden compass.  
2. **Ara (The Pacer):** High-energy academic sprint master. Focused on 20-minute daily task pacing and milestone tracking with a digital stopwatch.  
3. **Radit (The Steward):** Disciplined financial and administrative lead. Manages the "Brankas Koin Karsa" and ledgers with meticulous attention to detail.  
4. **Sekar (The Social):** Community connector and networking specialist. Relaxed and approachable; facilitates peer matchmaking and music-driven relaxation.  
5. **Arka (The Researcher):** Scholarly academic researcher. Grounded in rubric-based AI defense and deep methodology using vintage journals and magnifying tools.

## **8.2 Lower-Body & Feet Prompt Engineering Guide**

To maintain the "Seki" minimalist chibi doodle silhouette across all generative production, use the following prompt constraints:

* **The "Seki" Stubby Leg Rule:** Force "short stubby nub legs, no visible feet, minimalist doodle lower body, clean silhouette" to avoid unwanted shoe generation.  
* **Karsa Floating Cloak Execution:** Use "long flowing navy hooded cloak, bottom of cloak hiding legs, floating ambient pose" to ensure a mystical guide appearance.  
* **Negative Prompt Constraints:** Explicitly exclude "shoes, realistic feet, long legs, toes, complex footwear" to keep the charcoal line weight consistent with the minimalist aesthetic.

## **9\. The 4 Core Rumah Karsa Environment Designs & Google Flow Prompts**

Spatial breakdown, architectural layering, and color tokens for core scenes:

### **9.1 Design 1: Ruang Tengah (Center — Core Living Sanctuary & Communal Hub)**

1. **Spatial Breakdown:** Default spawn point. Features a circular indigo floor rug with gold batik parang accents, low teak coffee table with ceramic cups, 5 floor cushions, and a wide celestial bay window overlooking a starry sky.  
2. **Color Tokens:** Deep Space Navy \#0B132B, Celestial Gold \#F4D06F, Indigo.  
3. **Google Flow Prompt:** Isometric room view, minimalist doodle style, circular indigo floor rug with gold batik parang accents, low teak coffee table, celestial bay window with starry night sky, Deep Space Navy \#0B132B and Celestial Gold \#F4D06F palette.

### **9.2 Design 2: Studio Riset & Pacing (Room 1 Left — Ara & Arka\&apos;s Academic Workstations)**

4. **Spatial Breakdown:** Left half contains Ara\&apos;s high-energy planning desk with a digital stopwatch and whiteboard. Right half contains Arka\&apos;s scholarly library nook with mahogany shelves, stacked journals, and a warm banker\&apos;s lamp.  
5. **Color Tokens:** Nebula Blue \#0283D6, Star Light \#F4C542, Mahogany.  
6. **Google Flow Prompt:** Isometric room view, academic studio, high-energy planning desk with stopwatch and whiteboard, scholarly library nook with mahogany shelves and banker\&apos;s lamp, soft charcoal lines, Cosmic Batik theme.

### **9.3 Design 3: Lounge Komunitas & Brankas (Room 3 Right — Radit\&apos;s Vault & Sekar\&apos;s Balcony Lounge)**

7. **Spatial Breakdown:** Left half houses Radit\&apos;s brass coin safe and ledger desk. Right half houses Sekar\&apos;s networking lounge with an oversized beanbag, headphone wall mount, and open balcony with city lights.  
8. **Color Tokens:** Stellar Magenta \#D12E8F, Astral Cyan \#48CAE4, Brass.  
9. **Google Flow Prompt:** Isometric room view, brass coin safe and ledger desk, networking lounge with oversized beanbag and headphone wall mount, open balcony with city lights, Astral Cyan \#48CAE4 accents.

### **9.4 Design 4: Facade Luar Rumah Karsa (Exterior Night Entrance — Onboarding Screen 0\)**

10. **Spatial Breakdown:** Exterior night entrance featuring cosmic batik constellation lines and the primary base canvas cosmic sky. It establishes the "Cosmic Batik" and "Frosted Liquid Glass" visual theme.  
11. **Color Tokens:** Deep Space Navy \#0B132B, Obsidian Slate \#1C2541, Celestial Gold \#F4D06F, Astral Cyan \#48CAE4.  
12. **Google Flow Prompt:** Minimalist doodle style exterior view, cosmic batik sky background in Deep Space Navy \#0B132B, geometric Batik Parang constellation lines, liquid glass textures, starry night atmosphere.

## **10\. Complete House Expansion: Kitchenette, Sleeping Loft & Master Cutaway Blueprint**

### **10.1 New Expansion Rooms: Dapur & Bar Kopi and Loteng Istirahat & Observatorium**

13. **Dapur & Bar Kopi (Pantry/Coffee Bar):** A functional kitchenette featuring low teak wood counters, ceramic cups, and minimalist "Seki" style kitchen utilities. It maintains the "Cosmic Batik" theme with constellation lines on backsplash tiles and Deep Space Navy \#0B132B surfaces.  
14. **Loteng Istirahat & Observatorium (Sleeping & Stargazing Loft):** A cozy upper-level sleeping area with oversized floor cushions, beanbags, and a large telescope. The room features a celestial bay window with a wide-angle view of the starry night sky and astral cyan \#48CAE4 telemetry accents.

### **10.2 Google Flow Prompts for Expansion Rooms**

15. **Dapur & Bar Kopi Prompt:** Isometric room view, minimalist "Seki" doodle style, low teak wood counters with ceramic coffee cups, kitchenette with liquid glass textures, geometric batik parang backsplash, Deep Space Navy \#0B132B and Celestial Gold \#F4D06F palette.  
16. **Loteng Istirahat Prompt:** Isometric attic loft view, minimalist doodle style, oversized floor cushions and indigo batik beanbags, brass telescope pointing at a wide celestial bay window, starry night atmosphere, Astral Cyan \#48CAE4 and Deep Space Navy \#0B132B palette.

### **10.3 Master Cross-Section Cutaway Prompt (The Dollhouse Build)**

17. **Master Cutaway Prompt:** Full isometric dollhouse cross-section of Rumah Karsa, minimalist "Seki" doodle style under a cosmic sky. Multi-room cohesive build featuring: Ruang Tengah (living room), Studio Riset (study), Lounge Komunitas (vault lounge), Dapur & Bar Kopi (kitchenette), and Loteng Istirahat (attic loft). Features indigo batik rugs, teak furniture, brass coin vault, and liquid glass windows. Global palette: Deep Space Navy \#0B132B, Celestial Gold \#F4D06F, and Astral Cyan \#48CAE4 with constellation line accents.

## **11\. Floor Plan Connectivity & Google Flow Image-to-Image Edit Prompts**

**11.1 Spatial Circulation Diagram**

The spatial layout of Rumah Karsa follows a cohesive horizontal and vertical flow:

Horizontal Axis: Studio Riset (Left Room) connects via a right-side archway to Ruang Tengah (Center Room), which in turn connects via a right-side archway to Lounge Komunitas (Right Room).

Vertical Axis: Ruang Tengah features a central attic ladder leading upward to the Loteng Istirahat (Attic Loft), which is accessed via a floor hatch.

**11.2 Google Flow Image-to-Image Edit Prompts**

**Ruang Tengah Edit:** Add a minimalist "Seki" style left-side open archway leading to a studio, a right-side open archway leading to a lounge, and a central teak wood attic ladder leading to the ceiling, maintaining Deep Space Navy \#0B132B and Cosmic Batik accents.

**Studio Riset Edit:** Add a minimalist "Seki" style right-side open archway connecting to a central living sanctuary, soft charcoal lines, academic studio atmosphere with Nebula Blue \#0283D6 theme.

**Lounge Komunitas Edit:** Add a minimalist "Seki" style left-side open archway connecting to a central living sanctuary, maintaining Astral Cyan \#48CAE4 accents and networking lounge visual elements.

**Loteng Istirahat Edit:** Add a minimalist "Seki" style floor hatch in the corner of the attic loft representing the entrance from the Ruang Tengah ladder, starry night atmosphere, Astral Cyan \#48CAE4 palette.

# **12\. 6-Room Unified Floor Plan Architecture & Targeted Google Flow Edit Prompts**

## **12.1 Architectural Assessment of Generated Assets**

The following six assets establish the spatial foundation of Rumah Karsa:

1. **Exterior Night Entrance:** Established via Onboarding Screen 0, featuring Cosmic Batik constellation lines and Deep Space Navy palette.  
2. **Ruang Tengah (Center):** The core communal sanctuary with an indigo Batik Parang rug and celestial bay window.  
3. **Studio Riset (Left):** Academic workspace housing Ara\&apos;s planning desk and Arka\&apos;s library nook.  
4. **Lounge Komunitas (Right):** Social and financial hub containing Radit\&apos;s brass vault and Sekar\&apos;s networking balcony.  
5. **Dapur & Bar Kopi (Kitchenette):** Functional pantry with teak counters and Batik constellation backsplash tiles.  
6. **Loteng Istirahat (Attic Loft):** Stargazing retreat with floor cushions and a brass telescope.

## **12.2 Floor Plan Circulation Blueprint**

**Ground Floor Layout:** A horizontal contiguous flow where **Ruang Tengah** serves as the central node. The **Studio Riset** is positioned to the left, and the **Lounge Komunitas** is positioned to the right. The **Dapur & Bar Kopi** kitchenette is adjacent to these communal areas, maintaining the "Seki" architectural theme.

**Vertical Access:** A central teak wood attic ladder in the Ruang Tengah provides vertical connectivity to the **Loteng Istirahat** via a dedicated floor hatch.

## **12.3 Targeted Google Flow Edit Prompts**

1. **Ruang Tengah Edit:** Add a minimalist "Seki" style left-side open archway leading to **@Studio Riset**, a right-side open archway leading to **@Lounge Komunitas**, and a central teak wood attic ladder leading to **@Loteng Istirahat**, maintaining Deep Space Navy \#0B132B and Cosmic Batik accents.  
2. **Studio Riset Edit:** Add a minimalist "Seki" style right-side open archway connecting to **@Ruang Tengah**, soft charcoal lines, academic studio atmosphere with Nebula Blue \#0283D6 theme.  
3. **Lounge Komunitas Edit:** Add a minimalist "Seki" style left-side open archway connecting to **@Ruang Tengah**, maintaining Astral Cyan \#48CAE4 accents and networking lounge visual elements.  
4. **Loteng Istirahat Edit:** Add a minimalist "Seki" style floor hatch in the corner of the attic loft representing the entrance from the **@Ruang Tengah** ladder, starry night atmosphere, Astral Cyan \#48CAE4 palette.  
5. **Dapur & Bar Kopi Edit:** Add a minimalist "Seki" style doorway connecting to the main floor plan architecture of **@Ruang Tengah**, maintaining teak textures and liquid glass kitchenette details.