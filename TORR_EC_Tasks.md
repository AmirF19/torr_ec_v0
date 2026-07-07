# TORR EC -- Task List

**Updated:** July 7, 2026

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

## Antinomy

- [x] **(M)** Choices-pen stagger. The margin-based stagger was drowned out by
  animal size and SVG padding differences, so no up/down pattern was visible.
  Drawn feet now alternate between a back line and a front line inside the
  dirt (`staggerChoiceBaselines()` in `AntinomyRenderer.js`).

---

## Animal placement -- overlap fixes (T)

Animals overlap each other or the fences in these problems. Fix by adjusting
the per-problem slot spacing/insets in the game-mode CSS (and grid gaps),
not the baselines -- the vertical placement is now handled in the renderers
and should not be touched.

- [ ] **(T)** Antithesis Question 3 (4 of 7): options-pen groups overlap each other.
- [ ] **(T)** Antithesis Question 6 (7 of 7): options-pen overlap.
- [ ] **(T)** Anomaly Question 2 (3 of 7): main-pen animals overlap.
- [ ] **(T)** Anomaly Question 3 (4 of 7): main-pen animals overlap.
- [ ] **(T)** Anomaly Question 4 (5 of 7): main-pen animals overlap.
- [ ] **(T)** Anomaly Question 5 (6 of 7): main-pen animals overlap.
- [ ] **(T)** Antinomy: the 4th choice slot sits close to the right fence
  post; check spacing across all problems after the overlap passes above.

---

## Performance (from the Jul 7 audit)

Measured on a full local playthrough: **208 MB downloaded across 227
requests** for one session. The welcome screen alone is 25 MB; the first
problem 37 MB. The JS runtime is healthy (1.3 MB heap, ~900 DOM nodes, 41
listeners) -- the cost is almost entirely image assets.

- [ ] **(T)** Re-export the animal images at sane sizes. The 99 animal
  "SVGs" (88 MB total, avg 914 KB) are base64 raster images wrapped in an
  SVG tag, at 1696x2528 px, displayed at 100-300 px. Export each as a
  compressed PNG or WebP at roughly 2x display size (~600 px tall); target
  under 60 KB per file. This also replaces the corrupt 2.7 MB blue cow.
- [ ] **(T)** Re-export the backgrounds and elements. tree_1.png is 13 MB,
  barn.png 9 MB, white_gate.png 8 MB, ground_1.svg 6 MB, opening_page.png
  7 MB. Same treatment: WebP/PNG at display resolution. Target: whole
  `images/` folder under ~15 MB (currently 212 MB).
- [ ] **(T)** Delete unused assets while re-exporting: the
  `Gemini_Generated_Image_*.png` files (5.5 MB), `imageedit_*.png` copies
  (3.4 MB), duplicate fence/pen files. Confirm against `js/config.js`.
- [ ] **(M)** After the assets shrink: preload the full animal set at the
  welcome screen so problems appear instantly with no image pop-in.
- [ ] **(M)** Replace the body-wide MutationObserver at the bottom of
  `main.js` (hides the next button on the Super Work screen by watching
  every DOM change) with a direct check in `showWelcomeScreen()`.
- [ ] **(M)** Check the cache headers on the live host. If it is GitHub
  Pages, assets expire after 10 minutes, so the iPad re-downloads them
  between sessions. Less important once the assets are small.

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
