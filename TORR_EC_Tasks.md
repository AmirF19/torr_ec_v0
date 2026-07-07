# TORR EC Tasks

Updated 07.07.2026
Live: https://torr-ec-test.muhammadfusenig.com/


***Overview***
Below is the consolidated open task list. These tasks are primarily related to addressing bugs identified in DRLRL lab sessions.

Previous open tasks can be found here: TORR_EC_Tasks_v0.md in previous commits.

## Muhammad

- [ ] Test on the actual iPad - Pinch zoom, downloaded CSV, yellow flash, and placeholders.
- [ ] Once the new images are in, switch from .svg to .png (update image extension in problems.js, and paths in config.js). Once that is complete, preload full animal set on the welcome screen.
- [ ] Remove the MutationObserver at the bottom of main.js.
- [ ] Check the cache headers on the host to address website loading issues on the iPad. If we're on GitHub Pages, assets expire every 10 minutes and the iPad re-downloads them between sessions.
- [ ] Analogy - C-box large sheep doesn't render at the standard large size. Related to the 28vh cap in forceAnimalSizes in AnalogyRenderer.js.
- [ ] Next button overlaps animals on the iPad - Spacing pass in analogy.css / responsive.css.
- [ ] Add the global isAnimating check to the Antinomy and Analogy selection handlers - Copy the pattern from Antithesis.
- [ ] Retest the two rapid-clicking bugs on the iPad (options going unselectable, duplicate images in Antithesis) - The July fixes should have killed both. If they're gone, close them out.
- [ ] Delete the unused images - copies (fence and pen files). Check js/config.js before deleting anything.

## Thuy

- [ ] Re-export the animal images as PNGs around 600 px tall - Same folder, same name, .png instead of .svg. Compress each export (tinypng.com or squoosh.app), target under 60 KB per animal. This also replaces the broken blue cow file.
- [ ] Re-export images/background_images and images/elements at roughly on-screen size - Largest offenders are tree_1.png (13 MB), barn.png (9 MB), and white_gate.png (8 MB).
- [ ] Message Muhammad once the new files are in so the code can be switched to .png.

- [ ] Fix animal overlap in Antithesis question 3 (4 of 7) and question 6 (7 of 7) - options pen. Horizontal spacing only (slot gaps, grid gaps, content insets in the game css). Vertical placement is set by the renderers now, leave it alone. Same applies to the two bullets below.
- [ ] Fix animal overlap in Anomaly questions 2 through 5 - main pen.
- [ ] Antinomy - The 4th choice sits close to the right fence post. Check spacing everywhere after the overlap fixes above.
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
- Test order changed to Analogy, Anomaly, Antinomy, Antithesis.
- Test name and item number removed from the participant view.
- Medium animals scaled up; Antinomy large sizing standardized to match the other games.
- Between-game confetti screens and the end-of-test celebration screen added.
- Scrolling and long-press highlight suppressed for the iPad.
- Anomaly - choices box sizing and spacing, off-center selected animal, animation lag and overshoot rebuilt, staggered load fixed, per-size landing positions, answer pen sizing, selection hitboxes.
- Antithesis - fence perching, scrollable background, pens enlarged to hold three large animals, arrows removed, group spacing and baselines, proportional distortion, Chrome centering.
- Antinomy - animation smoothing, question mark position, green/red baseline alignment.
- Analogy - choices box enlarged ~75%, mixed-size baseline and overlap fixes, choice-box stagger, question mark padding, animation jump before final lock removed.
- CSV overhauled to the agreed columns (summary + one-row-per-selection exports).

**April 2026**
- Second bug bash (04.23). Anomaly global spacing pass: baselines raised, stagger increased, more horizontal room between large animals. Sample and Questions 2-3 perch/overlap fixes.
- Analogy problem 4 baseline issue fixed.
- Antithesis Box 1 and 3 baselines re-standardized.

**June 2026**
- Duplicate Antinomy block removed from the problem set.
- Game switcher hidden from participants (dev flag ?dev=1 shows it).
- Double CSV download fixed (two handlers on one button).
- Data export verified against a real run.
- Results screen hidden from participants (Jun 12 mail).
- .gitignore added, wrangler cache untracked.
- Antithesis 7/7 blue cow overlap fixed; Super Work screen title fixed.

**July 2026**
- Task docs consolidated into this file; old agendas removed.
- Tap-only: the drag implementation removed.
- Session ids automatic (date + time + short code), written into the CSV rows and filename.
- Hidden populate button (triple tap, bottom right corner).
- Undo unified across all four games - the animal flies back to its slot on undo and on switching choices.
- Pinch zoom blocked at the document level.
- Flying clone landing bug fixed (clones were measured while sitting in the page layout, which skewed every landing).
- Baselines rebuilt around measured feet: AnimalBaseline reads where the drawn feet are in each image; Analogy AB/C pens and Antithesis boxes pin feet to the middle of the ground, Antithesis groups are leveled exactly, Antinomy choices stagger on two clean lines.
- Yellow flash on tap removed; leftover animal on the interstitial fixed; Antithesis animals no longer settle/move after render.
- Splash and report cards restyled (cream, dots, tan border).
- Researcher script written (TORR_EC_Researcher_Script.md).
- Performance audit: a full run downloads ~208 MB, images are the whole problem. Re-export plan is in Thuy's list.


