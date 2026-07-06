# TORR EC -- Task List

**Updated:** July 6, 2026

Open work for the Test of Relational Reasoning (Early Childhood).
Live preview: https://torr-ec-test.muhammadfusenig.com/

**Assignees:** M = Muhammad (principal), T = Thuy (intern)

---

## Analogy -- Layout

- [ ] **(T)** Large sheep clips out of the final answer box. `css/game-modes/analogy.css`.
- [ ] **(T)** Large yellow dog sits lower than the large red cow in the right-hand problem pen. `analogy.css`.
- [ ] **(T)** C-box large sheep doesn't render at standard large size. Related to the `28vh` height cap in `forceAnimalSizes` in `AnalogyRenderer.js`. May share a root cause with the sheep clipping issue above.
- [ ] **(T)** Next button overlaps animals on iPad (1194x834). Needs an iPad-specific spacing pass in `analogy.css` / `responsive.css`.
- [ ] **(T)** Tune category-pen (AB/C) baselines per animal size. Three places must stay in sync:
  1. CSS -- `css/game-modes/analogy.css` (~line 248). This is the source of truth.
  2. JS inline fail-safe -- `js/renderers/AnalogyRenderer.js`, `forceAnimalSizes()` (~line 311). Keep values identical to CSS.
  3. JS animation landing offsets -- `js/renderers/AnalogyRenderer.js` (~line 138). Formula: if CSS `bottom` = N%, then `LANDING_OFFSET = -(N / 100)`.

---

## Antithesis

- [ ] **(T)** Replace the large blue cow with the correctly colored asset. Carried over from Apr 23. The SVG file name under `images/website_selection_clean/cow/02_no_stripe_large/` looks correct, but `blue.svg` is about 2.7 MB while the other colors are around 500-700 KB. Investigate whether the file is corrupted or a wrong export.
- [ ] **(M)** Pinch-zoom sends the selected animal to the top-left corner. Edge case in `AntithesisRenderer.js` flying-clone positioning when the viewport scale changes mid-animation. Low frequency. Needs iPad testing to reproduce. Not blocking.

---

## Onboarding and Instructions

- [ ] **(M)** Add short on-screen instructions for how to interact (tap to select, not drag). Decide format: text overlay, animated hand demo, or something else.
- [ ] **(M)** Make the "tap back" / undo function consistent across all four games. Anomaly uses a different mechanism than the other three (real DOM move vs. flying clone). Needs a design decision and work in `selection.js`.
- [ ] **(M)** Drag-to-place: partially implemented but not tested on iPad. Anomaly is not yet drag-enabled because its swap/return logic drops the drag listeners. Decide whether drag is still in scope for the study.
- [ ] **(M)** Explain the green/red rule in Antinomy to the participant. Decide what the walkthrough should say.

---

## Code Internals

- [ ] **(M)** Unify the return-to-choices interaction across games. Anomaly uses real DOM moves into an "out pen" with a swap animation (`selection.js` + `AnomalyRenderer.js`). The other three use a flying clone (`*Renderer.js`). They feel different and need to be aligned.
- [ ] **(T)** Double-trigger guard: Antithesis already checks both the per-slot flag and the global `isAnimating` flag before starting a selection. Antinomy and Analogy only check the per-slot flag. Add the same guard to both.
- [ ] **(M)** Build the "hidden populate button" from the Feb spec. Decide if this is still required for the study protocol.

---

## Data and Logging

- [ ] **(M)** Add a participant/session identifier the researcher can set (instead of the auto-generated `session_...` id). Decide format: prompt at session start, URL parameter, or something else.

---

## Bugs

- [ ] **(T)** Antinomy + Analogy: rapid clicking (<1 sec between options) causes previously selected options to become unselectable. Related to cloning logic. The intern's Jul 1 notes say the game runs fine if the participant takes a normal amount of time (~1 sec+) between selections. Determine if this needs a fix or just documentation.
- [ ] **(T)** Antithesis: rapid clicking during the flying animation causes duplicate images (one stays in the option pen, the other lands in the question pen). Same rapid-click family. Low priority if participants interact at a normal pace.

---

## Repo Housekeeping

- [x] **(M)** Consolidate task docs and remove superseded bug bash agendas.
- [ ] **(T)** Audit the image assets in `images/elements/`. Confirm which files are actually referenced in `js/config.js` and remove the rest (copies like `pen_1 - Copy.svg`, `Gemini_Generated_Image_...png` files, duplicate fence PNGs).
