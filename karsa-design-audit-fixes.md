# Karsa — Design Audit Fixes: Home Seats, Hover Preview, Scale, Onboarding Identity
**Context:** Current build technically passes its own checklist but reads generic —
characters are oversized, permanently scattered at solo stations instead of feeling
like a lived-in crew, onboarding never shows a face, and the exterior background
regression from an earlier spec was never actually verified. This fixes all four.

---

## 0. New character state model (this is the core change)

Characters now have TWO position states, not one static station:

- **Home seat** (default, ambient, all 5 present simultaneously): seated together
  around the tea table on their color-matched cushion
- **Work station** (only while actively engaged — chat open on that persona):
  their existing thematic spot (Ara/whiteboard, Radit/vault, Sekar/balcony,
  Arka/bookshelf; Karsa can stay at the table or move to the loft for
  vision/strategy framing — your call)

Transition: on chat-open, that persona's sprite animates home-seat → station.
On chat-close, it animates back. Camera pan (STATIONS) is unaffected by this —
the camera still zooms to wherever the persona currently is.

```typescript
// Placeholder coordinates — eyeballed from the reference image, NOT measured
// pixel-precise. Measure against the actual 6000x3375 master before shipping,
// same caveat as STATIONS originally had.
export const HOME_SEATS = {
  radit: { x: 50.5, y: 65.0 }, // purple cushion, back/head seat
  arka:  { x: 42.0, y: 71.0 }, // yellow cushion, left
  ara:   { x: 59.0, y: 71.0 }, // blue cushion, right
  sekar: { x: 45.0, y: 79.0 }, // white cushion, foreground-left
  karsa: { x: 57.0, y: 80.0 }, // magenta cushion, foreground-right
} as const;

// Confirm before wiring: Karsa=magenta and Sekar=white were given explicitly;
// Ara=blue, Arka=yellow, Radit=purple were inferred by elimination against
// each character's signature color. Flag any that are wrong.
```

---

## AGENT PROMPT — `frontend` thread

```
Four fixes, in priority order:

1. ONBOARDING EXTERIOR BACKGROUND (regression — this was already specced and
   didn't land)
   Step 0 of onboarding must render ASSETS.roomExterior as its background via
   next/image fill. Debug why it's currently showing a generic/placeholder
   background instead — check whether the component is even importing ASSETS
   from constants.ts, or whether a fallback/default style is overriding it.

2. CHARACTER PRESENCE IN ONBOARDING (this is a chunk of the "generic AI" feel)
   Wherever a Sobat Karsa persona is named in onboarding/FTUX copy, show their
   portrait (ASSETS.portrait(name)), not just their name as plain text:
   - FTUX coin-claim modal ("Hadiahmu dari Radit") — show Radit's portrait
     next to that line, not just the name
   - The 4-beat station tour — each beat should show that persona's portrait
     alongside their callout, not a plain text card
   - Consider a brief character-lineup beat during onboarding itself (e.g. on
     the summary step) so the student sees who they're about to meet before
     hitting the dashboard cold

3. HOME SEAT / WORK STATION STATE MACHINE
   Add HOME_SEATS to constants.ts (see locked reference above). Default sprite
   position (no chat open) is HOME_SEATS[persona], not the old solo STATIONS
   position. Add a state transition: on chat open, animate top/left from
   HOME_SEATS to STATIONS coordinates (translate transition, reuse the existing
   700ms cubic-bezier(0.22,1,0.36,1) easing so it matches the camera pan feel).
   On chat close, animate back to HOME_SEATS. All 5 characters should be visible
   at their home seats simultaneously in the default/no-selection view — this
   is what makes the room read as lived-in rather than a menu of 5 solo icons.

4. CHARACTER SCALE CORRECTION
   Characters currently read as too large for the room. Don't pick an arbitrary
   pixel size — size them against a reference prop in the room art:
   - A character seated at the tea table should not be taller (head to cushion)
     than the round table itself
   - A character standing at their work station (e.g. Ara at the whiteboard)
     should read roughly desk-lamp height, not taller than the bookshelf behind
     them
   Measure the actual room-master's furniture proportions and set sprite width/
   height as a % of room-master dimensions, not a fixed px value that ignores
   the background's actual scale. Re-check at all zoom levels (home view AND
   station-focused zoom), since it needs to look right at both.

5. DESKTOP HOVER PREVIEW (new feature, not in the original click-only spec)
   On pointer devices with real hover (@media (hover: hover) and (pointer: fine)
   — gate this explicitly, don't let it fire on touch), track mousemove over
   .room-viewport and drive a lightweight PREVIEW pan/zoom toward whichever
   station the cursor is nearest — lower zoom than the commit state (~1.1-1.15x
   vs. the existing 1.35-1.45x), faster/lighter transition (150-300ms, less
   easing lag than the commit pan, since it needs to feel responsive to the
   mouse, not deliberate like a click).
   Click still performs the existing full commit-zoom + opens that persona's
   chat. Hover is a free-look preview only, it doesn't open anything.
   On touch devices, behavior is unchanged (tap = commit, no hover state) —
   explicitly gate this so you don't get a "sticky hover" bug on mobile taps.
```

---

## AGENT PROMPT — `visual_asset` / design-taste thread

```
Run a design critique pass specifically targeting "generic AI product" feel on
the onboarding flow and dashboard chat UI (use /impeccable critique or /impeccable
audit if available in this environment). Scope the critique explicitly to:
- Onboarding screens 0-4 and the FTUX sequence
- The chat modal/thread UI for all 5 personas

What "generic" concretely means here, so the critique targets the right thing:
default shadcn spacing/radii with no bespoke touches, no character presence in
onboarding copy (names with no faces), chat bubbles that could belong to any AI
chat product rather than carrying Cosmic Batik + Seki chibi identity (color-
accent per persona's signature color on their chat bubbles/borders, portrait
next to their messages, not just a text label).

Don't just re-skin with more gradients — the fix is specificity (this looks like
Karsa's room, not an AI chat template with a mascot bolted on), not decoration.
```

---

## AGENT PROMPT — `builder` thread

```
Verify, in order, before the next judge run-through:

1. Onboarding Step 0 actually renders ASSETS.roomExterior (screenshot-check this
   specifically — it silently regressed once already)
2. Every mention of a named persona in onboarding/FTUX copy has that persona's
   portrait rendered alongside it, not just text
3. Default dashboard view (no chat open) shows all 5 characters together at
   HOME_SEATS, not scattered at their solo STATIONS positions
4. Opening a chat animates that persona from their home seat to their station;
   closing it animates them back
5. Character sprite size reads proportionate to room furniture at both the home
   view and the station-focused zoom — no character should tower over the
   bookshelf or dwarf the tea table
6. Hover preview works on desktop (mouse move pans/zooms lightly toward the
   nearest station without opening chat) and is completely inert on touch —
   confirm no stuck-hover state after a mobile tap
7. Confirm the HOME_SEATS cushion-color assignments match what Davy confirms
   (Karsa/magenta and Sekar/white are locked; Ara/blue, Arka/yellow, Radit/
   purple are pending confirmation — don't ship silently if any come back wrong)
```
