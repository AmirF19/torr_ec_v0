# TORR EC Tasks

Updated 07.18.2026
Live: https://torr-ec-test.muhammadfusenig.com/


***Overview***
Below is the consolidated open task list. These tasks are primarily related to addressing bugs identified in DRLRL lab sessions.

Previous open tasks can be found here: TORR_EC_Tasks_v0.md in previous commits.

## Muhammad

- [ ] Test on the actual iPad - Pinch zoom, downloaded CSV, yellow flash, and placeholders.
- [ ] Preload the full animal set on the welcome screen (feasible now that the compressed PNGs are in - the .svg to .png switch itself is done, see the July record).
- [ ] Remove the MutationObserver at the bottom of main.js.
- [ ] Check the cache headers on the host to address website loading issues on the iPad. If we're on GitHub Pages, assets expire every 10 minutes and the iPad re-downloads them between sessions.
- [ ] Analogy - C-box large sheep doesn't render at the standard large size. Related to the 28vh cap in forceAnimalSizes in AnalogyRenderer.js.
- [ ] Next button overlaps animals on the iPad - Spacing pass in analogy.css / responsive.css.
- [ ] Add the global isAnimating check to the Antinomy and Analogy selection handlers - Copy the pattern from Antithesis.
- [ ] Retest the two rapid-clicking bugs on the iPad (options going unselectable, duplicate images in Antithesis) - The July fixes should have killed both. If they're gone, close them out.
- [ ] Delete the unused images - copies (fence and pen files). Check js/config.js before deleting anything.

## Thuy

- [ ] Re-export the animal images as PNGs around 600 px tall. Make sure to keep the following unchanged: folder, same name, but the files should be .png instead of .svg. Compress each file (using either tinypng.com or squoosh.app), target under 60 KB per animal. ----- How about the imageedit.png files?
- [ ] Re-export images/background_images and images/elements at roughly on-screen size - Largest offenders are tree_1.png (13 MB), barn.png (9 MB), and white_gate.png (8 MB). ----- Compressed. The "compressed objs look weird/don't follow old scale" issue was NOT the exports - it was a code bug uncovered by the PNG switch, fixed 07.18 (see the July record).
- [ ] Message Muhammad once the new files are in so the code can be switched to .png.

- [ ] Fix animal overlap in Antithesis question 3 (4 of 7) and question 6 (7 of 7) in the options pen.
- [ ] Fix animal overlap in Anomaly questions 2 through 5 - main pen.
- [ ] Antinomy - Check spacing everywhere after the overlap fixes above. (The 4th choice perching on the right fence was fixed in code 07.18 - see the July record.)
- [ ] Analogy - Large sheep clips out of the answer box (analogy.css).

## Data, storage, and management

- [ ] Reach out to UMD IT again (Kevin Shivers) about web hosting and data transfer.

---

## Record of completed work

Running record of what has been done and roughly when, pulled from the bug bash agendas and prior task lists. Refer back here instead of digging through old commits.

**February 2026**
- First lab bug bash (02.26). Identified the initial working list: test order, CSV columns, overlap/baseline problems in all four games, hidden populate button, iPad layout concerns.
- Started the IT compliance conversation with UMD (domain, hosting, data security).

**March 2026** (through the 04.07 agenda revision)
- Test order set to Analogy, Anomaly, Antinomy, Antithesis.
- Medium animals scaled up; Antinomy large sizing standardized to match the other games.
- Between-game celebration screens and end-of-test screen added.
- Anomaly - choices box sizing and spacing, off-center selected animal, animation lag and overshoot rebuilt. Additionally addressed staggered load, per-size landing positions, answer pen sizing, selection boundary boxes.
- Antithesis - fence perching, scrollable background, pens enlarged to hold three large animals, arrows removed, group spacing, and baselines.
- Antinomy - animation smoothing, question mark position, green/red baseline alignment.
- Analogy - choices box enlarged ~75%, mixed-size baseline and overlap fixes, choice-box stagger, question mark padding, animation jump before final lock removed.
- CSV overhaul (summary + one-row-per-selection exports).

**April 2026**
- Second bug bash (04.23). Anomaly global spacing pass: baselines raised, stagger increased, more horizontal room between large animals. Sample and Questions 2-3 perch/overlap fixes.
- Analogy problem 4 baseline issue fixed.
- Antithesis Box 1 and 3 baselines re-standardized.

**June 2026**
- Duplicate Antinomy block removed.
- Game switcher hidden from participants.
- Double CSV download fixed.
- Results screen hidden from participants.
- .gitignore added, wrangler cache untracked.
- Antithesis 7/7 blue cow overlap fixed; Super Work screen title fixed.

**July 2026**
- Task docs consolidated into this file; old agendas removed.
- Tap-only: the drag implementation removed.
- Session ids automatic (date + time + short code), written into the CSV rows and filename.
- Hidden populate button (triple tap, bottom right corner).
- Undo unified across all four games (the animal flies back to its slot on undo and on switching choices).
- Pinch zoom blocked.
- Flying clone landing bug fixed.
- Baselines restructed.
- Leftover animal on the interstitial fixed.
- Splash and report cards restyled.
- Researcher script written.
- Performance audit: a full run downloads ~208 MB, images are the whole problem. Re-export plan is in Thuy's list.
- Animals and backgrounds re-exported and compressed (Thuy). Code switched from .svg to .png; a full run now downloads ~14 MB, down from 208. This also fixed the Anomaly flying-clone bug (the old .svg paths were 404ing and limping through an error fallback the animation couldn't handle).
- Pens no longer fit the ground after the PNG switch (all four games). Root cause: the pen SVGs carried preserveAspectRatio="xMidYMid meet" internally, so they letterboxed themselves and silently ignored the object-fit: fill !important rules in the game CSS - the layouts were unknowingly built on that. PNGs obey fill and stretched edge-to-edge. Fixed with a high-specificity object-fit: contain override in pen.css for the formerly-svg pen images (pen_1, pen_1a_*, analogy_pen); pen_2 and the gate images keep fill because they were always PNG. Verified pixel-equivalent to the old SVG rendering in all four games. Note: the fill !important rules in analogy.css, antinomy.css, and antithesis.css are now dead weight that the override outranks - a future cleanup could flip them to contain and drop the override.
- Antinomy far-right choice perched on the fence. The choices stagger put front-line animals 66% down the dirt, but the dirt's perspective front edge rises toward the right corner, so the last slot landed on the fence artwork. The last slot now uses a 50% line (AntinomyRenderer.js staggerChoiceBaselines).
- A committed Zone.Identifier file removed and the pattern gitignored - the colon in those filenames breaks git checkout/pull on Windows.