# TORR EC — Master Task List

**Last updated:** June 11, 2026

This is the list of open bugs/tasks for the Test of Relational Reasoning (Early Childhood). This list consolidates earlier bugs identified in previous bug bashes, the February implementation guidance, and notes from the recent UNF testing sessions.

Live preview: https://torr-ec-test.muhammadfusenig.com/

---

## Section 1

- [x] **Duplicate Antinomy block at the end of the problem set.** *(Fixed June 8.)*
  `js/problems.js` was running the four games in order (Analogy → Anomaly → Antinomy → Antithesis) but had a second copy of Antinomy Questions 1–6 appended after Antithesis (old lines 681–799), so finishing the last game started Antinomy a second time. Duplicate block removed.

- [x] **Game-type switcher is visible and tappable during the task.** *(Fixed June 8.)*
  The four buttons (Analogy / Anomaly / Antinomy / Antithesis) in the top-left corner are a developer convenience that were on screen the whole time and only hidden below 480px, so on any iPad a child could tap one and jump games mid-session. They're now hidden for participants by default (`setupGameSwitcher` in `js/main.js`). **Developer mode:** add `?dev=1` to the URL to reveal both the game switcher *and* the problem-number counter ("Antinomy - Question 3 (4 of 7)") in the header and bottom-left. Live Server preserves the query string across reloads, so it's set once per session. Participants (no flag) see neither.

- [x] **Verify data export against a real run.**
  The CSV export (`js/data/export.js`) looks complete and matches the agreed columns (seconds elapsed, full option descriptor, total selections, total clicks, total time, time-from-last-selection, correctness). Before real collection, run a full session end to end, download the CSV, and confirm every column reads sensibly, especially `total_clicks` and `time_from_last_selection_ms`, which depend on event tracking in `main.js`.

---

## Section 2 — Visual / layout bugs by game

Most of these are carried over from the Apr 7 and Apr 23 bug bash sessions that we did in the lab. I've marked what issues are still open. The placement work lives in the per-game CSS files under `css/game-modes/` and, for Analogy, partly in `js/renderers/AnalogyRenderer.js` (the `forceAnimalSizes` function sets sizes inline).

### Analogy
- [ ] **Large sheep clips out of the final answer box** (was ANAL-0-02). `css/game-modes/analogy.css`.
- [ ] **Large yellow dog sits lower than the large red cow** in the right-hand problem pen (was ANAL-5-02). `analogy.css`.
- [ ] **C-box large sheep doesn't render at the standard large size.** Related to the `28vh` height cap in `forceAnimalSizes` in `AnalogyRenderer.js`. 
- [ ] **Next button overlaps animals on iPad** (around 1194×834). Needs an iPad-specific spacing pass in `analogy.css` / `responsive.css`.
- [x] Choices box enlarged (~75%) and capped below the Antinomy green box size.
- [x] Baseline/overlap fixes for mixed-size rows; choice-box stagger; question-mark box padding.
- [x] Animation jump before the final lock removed (clone now stays put instead of reparenting).
- [ ] **Tune category-pen (AB/C) baselines per animal size.** Three places must stay in sync — see guide below.

  #### Baseline Tuning Guide — Category Pens (AB & C boxes)

  **How `bottom` works:** `0%` = feet at content-area floor. **Positive** = lifts animal up. **Negative** = sinks animal below floor.

  **① CSS — `css/game-modes/analogy.css` ~line 248**
  This is the source of truth. CSS `!important` overrides the JS inline styles.
  ```css
  /* LARGE animals in AB/C pens */
  .analogy-layout .category-row .animal-slot .animal-image--large {
      bottom: 0% !important;   /* ← MODIFY THIS */
  }

  /* MEDIUM animals in AB/C pens */
  .analogy-layout .category-row .animal-slot .animal-image--medium {
      bottom: 32% !important;  /* ← MODIFY THIS */
  }

  /* SMALL animals in AB/C pens */
  .analogy-layout .category-row .animal-slot .animal-image--small {
      bottom: 10% !important;  /* ← MODIFY THIS */
  }
  ```

  **② JS inline fail-safe — `js/renderers/AnalogyRenderer.js` `forceAnimalSizes()` ~line 311**
  Keep these values identical to ① so they don't cause confusion (CSS wins but these should match).
  ```js
  if (isLarge) {
      img.style.bottom = '0%';   // ← MUST MATCH CSS
  } else if (isMedium) {
      img.style.bottom = '32%';  // ← MUST MATCH CSS
  } else if (isSmall) {
      img.style.bottom = '10%';  // ← MUST MATCH CSS
  }
  ```

  **③ JS animation landing offsets — `js/renderers/AnalogyRenderer.js` ~line 138**
  These control where the flying animal lands in the C-box. The percentage is `bottom / 100` with sign flipped (positive sinks, negative lifts).
  ```js
  const LANDING_OFFSET_LARGE_PCT = 0.0;    // bottom: 0%  → 0.0
  const LANDING_OFFSET_MEDIUM_PCT = -0.32;  // bottom: 32% → -0.32
  const LANDING_OFFSET_SMALL_PCT = -0.10;   // bottom: 10% → -0.10
  ```
  **Formula:** if CSS `bottom` = N%, then `LANDING_OFFSET = -(N / 100)`.

### Anomaly
- [x] Global spacing pass: baselines raised, stagger increased for the taller animals, more horizontal spacing.
- [x] Sample and Questions 2 and 3 specific perch/overlap fixes.
- [x] Choice-box sizing, off-center selected animal, animation lag, and hitbox fixes.
- [x] **Final sweep for fence/animal overlap** The big fixes are pretty much done, just check to make sure that everything operates as expected.

### Antinomy
- [x] Animation smoothed; question mark repositioned; green/red baselines aligned; boxes and choices resized; spacing and stagger fixes.
- [x] **Slight overlap on the large blue animals in the first real problem.** Minor. May just need the pens a touch larger.

### Antithesis
- [x] Box 1 / Box 3 baseline standardization; choice alignment; pen enlarged to hold three large animals; arrows removed; double-tap duplication debounced; proportional-distortion and Chrome-centering fixes.
- [ ] **Replace the large blue cow with the correctly colored asset.** Carried over from Apr 23; this is an image/asset issue, not layout. Confirm which SVG under `images/website_selection_clean/cow/02_no_stripe_large/` is wrong and swap it. Update (dthieu Jun15): the SVG file name is correct, but blue.svg file is about 2.7 MB while the other colors are around 500–700 KB, which is unusual. Need to look into that.  
- [ ] **Pinch-zoom sends the selected animal to the top-left corner.** Edge case in `AntithesisRenderer.js` flying-clone positioning when the viewport scale changes mid-animation. Low frequency; note it but don't block on it. Update for more info (dthieu Jun15): when someone pinch-zooms on an iPad during an animation, the flying animal lands in the wrong spot. This should be tested in iPad, but try to click around to find out if similar thing happens. 

---

## Section 3 — Onboarding, instructions

Meghan and Eric's feedback was mostly about knowing *how* to interact and *what the rules are* for the games.

- [ ] **Add short on-screen instructions for how to interact.** The first instinct was to drag the animals; the task is click-to-place. This was chosen deliberately because we just want decisions, and motor skill issues are not part of the study. A one-line instruction or a tiny animated hand demo on the first sample of each game would cover it.

- [ ] **Make the "tap back" function consistent.** Right now you can undo a selection: in Analogy, Antinomy, and Antithesis by tapping the placed animal and it returns; in Anomaly, it was discovered that this is not always the case. Need to look into this. Two things here: (a) say it in the instructions, and (b) confirm the behavior is the same across all four games (the Anomaly mechanism is built differently from the other three — see Section 5).

- [~] **Drag-to-place added alongside tapping (needs iPad testing).** *(Added June 8.)* Meghan's child's first instinct was to drag the animals. Tapping is still the primary interaction, but you can now also press-and-drag an animal onto the target pen to place it; the drop zone glows while you're over it and we should change this, and releasing elsewhere snaps it back without placing. **Still open:** (a) Anomaly is not yet drag-enabled (its swap/return logic rebuilds the choice slots, which drops the drag listeners, so it needs a small amount of extra wiring in `selection.js`); (b) This hasn't been tried on a real iPad yet. Verify.

- [ ] **Explain the green / red rule in Antinomy.** Meghan wasn't sure a child would understand that the green and red pens are a fixed rule (a constant) rather than just decoration, or whether kids would read into the colors. The current instruction is "Choose the option that matches the green box rule." Need to add this to walk through.

- [x] The between-game celebration screens are in and working well — keep them.

---

## Section 5 — Code and interaction internals

These are developer items — they touch shared logic, so they shouldn't be a first task for someone new.

- [ ] **Unify the return-to-choices interaction across games.** Anomaly uses a real DOM move into an "out pen" with a swap animation (`js/interactions/selection.js` + `AnomalyRenderer.js`), while Analogy, Antinomy, and Antithesis use a "flying clone" that stays clickable at its landing spot (`js/renderers/*Renderer.js`). They feel different and need to be aligned.

- [ ] **Double-trigger guard in the renderers.** Antithesis checks both the per-slot flag and the global `isAnimating` flag before starting a selection; Antinomy and Analogy only check the per-slot flag. Make them consistent to avoid any rapid double-tap edge case.

- [ ] **The "hidden populate button" from the Feb spec was never built.** We originally wanted to add a hidden button researchers could tap to force the choice animals to appear. This still needs to be added.

---

## Section 6 — Data, logging, and storage

- [x] CSV export overhauled to the agreed columns (summary export and a detailed one-row-per-selection export both exist in `js/data/export.js`).
- [x] Raw click tracking and selection tracking wired through `state.js` / `main.js`.
- [ ] **Confirm where the data actually needs to go.** Right now everything is local: progress is kept in `localStorage` and the researcher downloads a CSV at the end. 
- [ ] **Add a participant/session identifier the researcher can set** (instead of the auto-generated `session_…` id), if the study design needs it for matching.

---

## Section 7 — Repo housekeeping

Small, safe, and easy to hand off.

- [x] **Add a `.gitignore`.** *(Fixed June 8.)* Added a `.gitignore` covering `.wrangler/`, OS junk (`.DS_Store`/`Thumbs.db`/etc.), editor folders, and `node_modules/`, and untracked the previously committed `.wrangler/cache/` (including `wrangler-account.json`) with `git rm --cached`. Staged, not yet committed.
- [ ] **Tidy the docs.** The file named `TORR_EC_Bug_Bash_Agenda_03_22_2026.md` actually contains the April 7 revision inside it, and an `..._04_07_…` file shows up in the git history but isn't present now. Consolidate the agenda docs so the filenames match their contents. (This master list is meant to replace the scattered agendas going forward.)
- [ ] **Audit the image assets.** There are leftover/working files in `images/elements/` (for example `pen_1 - Copy.svg`, a couple of `Gemini_Generated_Image_…png` files, and several near-duplicate fence PNGs). Confirm which are actually referenced in `js/config.js` and remove the rest so the asset folder reflects what ships.

## Section 8 — Additional Bug
Additional tasks -- updated Jun 15, 2026
- [ ] **Downloading twice.** The download button in the result screen will download the .csv files twice. This is because the download button hsa two handlers attached to it (one in HTML and the other is JS)
- [ ] **Antinomy bug.** After choosing 1+ time for some animal options in the game, users are unable to select those option for the next time. Usually the first three options are not selectable if the users already chosen those options once. This may have something to do with the cloning logic used in a number of the games. 