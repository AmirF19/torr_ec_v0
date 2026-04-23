# TORR EC: Bug Bash Agenda (Revised 04.07.2026)

## Part 1: What we have done

### Global / All Tests
- [x] Change test order in `problems.js` to: Analogy → Anomaly → Antinomy → Antithesis
- [x] Remove "Name of Test" and "Item Number" text from all visible UI (`main.js`)
- [x] Scale medium animals up marginally (all 4 stylesheets + `AnalogyRenderer.js` `forceAnimalSizes`)
- [x] Standardize Antinomy large animals to match L/M/S sizing of other tests (`antinomy.css`)
- [x] Add end-of-test confetti screen in `main.js` (between tests)
- [x] Add end-of-final-test fun screen in `main.js` (after last test)
- [x] Suppress native long-press highlight on `.animal-slot` (CSS user-select/highlight)
- [x] Fix scroll: `base.css` `overflow: hidden` + `touch-action: none` on html/body

### Anomaly
- [x] Fix choices box size and spacing (Verified most recent tweaks)
- [x] Fix off-center selected animal in choice box (ANOM-0-03) — `AnomalyRenderer.js` / `anomaly.css`
- [x] Fix abrupt animation lag (ANOM-0-04, ANOM-3-02) — `animation.js` / `AnomalyRenderer.js`
- [x] Fix staggered animal population load order (ANOM-2-01) — render all choices at once
- [x] Fix different landing positions per size class in answer pen (ANOM-2-02) — `anomaly.css`
- [x] Fix answer pen too small / compressing large animals (ANOM-3-03) — `anomaly.css`
- [x] Fix selection hitbox to match actual animal image bounds (ANOM-3-04/05) — `AnimalSlot.js` / `anomaly.css`
- [x] Fix jarring animation overshoot/snap — rebuild `animation.js` for pixel interpolation
- [x] Add per-size manual placement controls (bottom, left) for answer pen animals — `anomaly.css`

### Antithesis
- [x] Fix medium green cat sitting on fence (ANTITH-01-01)
- [x] Fix scrollable/moveable background + pinned selected animal (ANTITH-01-02)
- [x] Fix large pig placement overlap with third pen (ANTITH-04-02)
- [x] Remove arrows from Antithesis layout — `AntithesisRenderer.js`
- [x] Add per-size manual placement controls (bottom, left) for box AND choice pens (Q1-Q2)
- [x] Fix small cats off-center / scale controls
- [x] Fix spacing between paired/grouped animals (Q3+)
- [x] Fix baselines across paired grouped animals
- [x] Enlarge problem pens to hold 3 large animals
- [x] Fix proportional distortion (resizing logic)
- [x] Fix Chrome centering bug

### Antinomy
- [x] Fix animation inconsistency (jumpy, not smooth) — `AntinomyRenderer.js`
- [x] Fix Question Mark positioned too far right — `antinomy.css`
- [x] Fix Green Box baseline higher than Red Box — `antinomy.css`

---

## Part 2: What we have yet to do

### Global / Data
- [x] Data CSV overhaul (`state.js` + `main.js` `downloadData`): add seconds elapsed, full descriptor, total selections, total clicks, time on problem, time-from-last-selection

### Analogy
- [x] Fix animation jump before final lock (ANAL-0-01) — `AnalogyRenderer.js` (removed reparenting; clone stays fixed)
- [ ] Fix large sheep clipping out of Final Answer Box (ANAL-0-02) — `analogy.css`
- [x] Fix baseline misalignment / animal overlap for mixed-size animals (ANAL-0-03) — `analogy.css` (gap 0.5vw→2.5vw)
- [x] Fix choice box stagger algorithm (ANAL-0-04, ANAL-2-01) — `analogy.css` (per-size :has() stagger + padding/inset fix)
- [ ] Fix Large Yellow Dog lower than Large Red Cow in right problem pen (ANAL-5-02) — `analogy.css`
- [ ] Fix iPad overlap with Next button (layout) — `analogy.css` responsive 1194×834
- [ ] Fix C-Box large sheep not rendering at standard large size — `AnalogyRenderer.js`
- [x] Increase Analogy Choices Box size ~75% — `analogy.css`
- [x] Fix Question Mark box padding for uniform base line — `analogy.css`

### Antithesis
- [x] Fix animal duplication on double-tap (ANTITH-01-03, ANTITH-02-01) — `AntithesisRenderer.js` debounce
- [x] Fix screen persistence: clear flying clones + selections on test end — `main.js`
- [ ] Fix zoom-sends-selected-animal-to-top-left — `AntithesisRenderer.js`

### Antinomy
- [x] Resize Choices Box
- [x] Resize Green and Red Boxes
- [x] Replace red ground with regular ground color (from Alina Fork)
- [x] Increase animal spacing gap in green box
- [x] Fix stagger on all questions

### Anomaly
- [ ] Fix animals overlapping with fence svg (check each problem)
- [ ] Fix animals overlapping with each other (check each problem)
