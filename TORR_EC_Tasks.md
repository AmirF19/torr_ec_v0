# TORR EC -- Task List

**Updated:** July 6, 2026

Open work for the Test of Relational Reasoning (Early Childhood).
Live preview: https://torr-ec-test.muhammadfusenig.com/

**Assignees:** M = Muhammad (principal), T = Thuy (intern)

Decisions made July 6: the study is tap-only (drag support removed), on-screen
instructions are replaced by the researcher script (see
`TORR_EC_Researcher_Script.md`), and session IDs are auto-generated with a
date/time stamp plus a random identifier.

---

## Analogy -- Layout

- [ ] **(T)** Large sheep clips out of the final answer box. `css/game-modes/analogy.css`.
- [x] **(M)** Large yellow dog sits lower than the large red cow in the right-hand problem pen. Resolved by the Jul 6 baseline unification (below).
- [ ] **(T)** C-box large sheep doesn't render at standard large size. Related to the `28vh` height cap in `forceAnimalSizes` in `AnalogyRenderer.js`. May share a root cause with the sheep clipping issue above.
- [ ] **(T)** Next button overlaps animals on iPad (1194x834). Needs an iPad-specific spacing pass in `analogy.css` / `responsive.css`.
- [x] **(M)** Category-pen (AB/C) baselines. All animals now share one baseline regardless of size: their DRAWN feet sit at the vertical middle of the pen ground. The SVGs carry 15-20% empty space below the feet, which scales with rendered size, so box alignment alone left large animals' feet higher than small ones'. `AnimalBaseline` (`js/components/AnimalBaseline.js`) canvas-measures each asset's real feet line; `alignCategoryBaselines()` in `AnalogyRenderer.js` sets exact per-image offsets, and the landing animation uses the same measurement. The CSS `bottom` values in `analogy.css` are first-paint fallbacks only.
- [x] **(M)** Selected animals landed far above the pen. Root cause: the flying clone was appended to `<body>` as an in-flow element before being given `position: fixed`, which shifted the vertically centered layout during measurement and skewed every landing coordinate by the clone's own height. Fixed in `AnalogyRenderer.js` and `AntinomyRenderer.js` (Antithesis already measured correctly).
- [x] **(M)** Leftover animal floating over the interstitial after finishing a game. Landed clones are fixed-position children of `<body>`, and the between-games interstitial appeared without a problem render to sweep them. `showWelcomeScreen()` in `main.js` now runs `cleanupPreviousProblem()` first.

---

## Antithesis

- [ ] **(T)** Replace the large blue cow with the correctly colored asset. Carried over from Apr 23. The SVG file name under `images/website_selection_clean/cow/02_no_stripe_large/` looks correct, but `blue.svg` is about 2.7 MB while the other colors are around 500-700 KB. Investigate whether the file is corrupted or a wrong export.
- [x] **(M)** Box-pen baselines. Box 1/2/3 animals now sit with their drawn feet on the vertical middle of each pen's ground, matching the Analogy pens (`alignBoxBaselines()` in `AntithesisRenderer.js`), and the selected animal lands on the same line. The options pen keeps its staggered layout; its groups are leveled internally.
- [x] **(M)** Group members misaligned (sheep sat well below its group). Two-part fix. First, the old `margin-bottom: -4vh` sheep yank (and -1.5vh horse) in `antithesis.css` compensated for SVG padding that no longer exists (canvas-measured padding is nearly identical across species) -- removed. Second, `levelGroupBaselines()` in `AntithesisRenderer.js` now measures each group member's actual drawn-feet line (`AnimalBaseline`) and equalizes the group exactly, including mixed sizes (e.g. the small/medium/large dog trio in Box 3). The flying clone is re-leveled in its own context after cloning. Measured spread is 0px in every group across all problems.
- [x] **(M)** Brief yellow flash on the slot box when tapping an animal (all games, most visible in Anomaly). Cause: `responsive.css` gave `:active` slots a gold background on touch devices. Removed; press feedback is now the scale effect only.
- [x] **(M)** Pinch-zoom sends the selected animal to the top-left corner. Fixed by blocking pinch-zoom at the document level (`gesturestart` / `gesturechange` / multi-touch `touchmove` guards in `main.js`); the viewport meta alone is ignored by Safari on iPad. Needs confirmation on a physical iPad.

---

## Onboarding and Instructions

- [x] **(M)** On-screen interaction instructions. Decision: no on-screen element; the researcher reads a script instead. See `TORR_EC_Researcher_Script.md`.
- [x] **(M)** Make the "tap back" / undo function consistent across all four games. The three clone-based games (Antinomy, Antithesis, Analogy) now animate the animal flying back to its slot on undo and on switching choices, matching Anomaly's animated return. Shared helper: `AnimationHandler.flyCloneBack` in `js/interactions/animation.js`.
- [x] **(M)** Drag-to-place. Decision: tap-only. The partial drag implementation (`js/interactions/drag.js` and its wiring in the three clone renderers) has been removed.
- [x] **(M)** Explain the green/red rule in Antinomy. Wording is in `TORR_EC_Researcher_Script.md`, read aloud by the researcher.

---

## Code Internals

- [x] **(M)** Unify the return-to-choices interaction across games. Done together with the undo unification above. Anomaly keeps its real-DOM swap; the clone games now fly the previous selection back instead of deleting it instantly.
- [ ] **(T)** Double-trigger guard: Antithesis already checks both the per-slot flag and the global `isAnimating` flag before starting a selection. Antinomy and Analogy only check the per-slot flag. Add the same guard to both. Note: the undo unification added fly-back handling that resets stuck per-slot flags, which was the cause of the rapid-click unselectable bug -- retest that bug after adding the guards.
- [x] **(M)** Hidden populate button. Built: invisible button in the bottom-right corner (`#hidden-populate-btn` in `index.html`); triple-tap within 1.5 s selects the correct choice for the current problem through the normal click path (`populateCorrectChoice` in `main.js`).

---

## Data and Logging

- [x] **(M)** Session identifier. Decision: auto-generated, not researcher-set. Format `YYYY-MM-DD_HH-MM-SS_XXXX` (`generateSessionId` in `js/state.js`). The ID is now written into every row of both CSV exports (`session_id` column) and into the export filenames.

---

## Bugs

- [ ] **(T)** Antinomy + Analogy: rapid clicking (<1 sec between options) causes previously selected options to become unselectable. The Jul 6 undo unification resets the stuck per-slot animation flags when a mid-flight clone is cleaned up, which should resolve this. Retest on iPad; if confirmed fixed, close this and finish the double-trigger guard task above.
- [ ] **(T)** Antithesis: rapid clicking during the flying animation causes duplicate images (one stays in the option pen, one lands in the question pen). Retest after the Jul 6 changes; the fly-back cleanup now restores the source image visibility explicitly.

---

## Repo Housekeeping

- [x] **(M)** Consolidate task docs and remove superseded bug bash agendas.
- [ ] **(T)** Audit the image assets in `images/elements/`. Confirm which files are actually referenced in `js/config.js` and remove the rest (copies like `pen_1 - Copy.svg`, `Gemini_Generated_Image_...png` files, duplicate fence PNGs).

---

## Testing needed (M, on a physical iPad)

The Jul 6 changes were made without device testing. Before the next study
session, verify on the iPad:

1. Undo tap in all four games: animal animates back to its slot, next button disables.
2. Switching choices in the clone games: old animal flies back while the new one flies in.
3. Pinch gesture does nothing (no zoom, no misplaced animals).
4. Triple-tap bottom-right corner auto-fills the correct answer.
5. Downloaded CSV has the `session_id` column and the ID in the filename.
