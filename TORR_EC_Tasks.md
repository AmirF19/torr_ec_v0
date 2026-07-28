# TORR EC Tasks

Updated 07.28.2026
Live: https://torr-ec-test.muhammadfusenig.com/


***Overview***
Below is the consolidated open task list. These tasks are primarily related to addressing bugs identified in DRLRL lab sessions.

Previous open tasks can be found here: TORR_EC_Tasks_v0.md in previous commits.

## Muhammad

- [ ] Test on the actual iPad - Pinch zoom, downloaded CSV, yellow flash, and placeholders.
- [ ] Preload the full animal set on the welcome screen (feasible now that the compressed PNGs are in - the .svg to .png switch itself is done, see the July record).
- [ ] Remove the MutationObserver at the bottom of main.js.
- [ ] Check the cache headers on the host to address website loading issues on the iPad. (Confirmed: host is Cloudflare Pages, NOT GitHub Pages - so the "10-minute GitHub Pages expiry" theory is moot. Current index.html sends Cache-Control: max-age=0, must-revalidate and the page has no-cache meta tags left over from development. Consider adding a _headers file to cache the static images/CSS/JS so the iPad stops re-downloading them every session.)
- [ ] Analogy - C-box large sheep doesn't render at the standard large size. Related to the 28vh cap in forceAnimalSizes in AnalogyRenderer.js (confirmed present, AnalogyRenderer.js:337). NOTE: likely the same root cause as Thuy's "Large sheep clips out of the answer box" item below - the 28vh cap and the answer-box clipping may be one bug. Worth investigating together / possibly a code task rather than a visual-tweak task.
- [ ] Next button overlaps animals on the iPad - Spacing pass in analogy.css / responsive.css.
- [ ] Add the global isAnimating check to the Antinomy and Analogy selection handlers - Copy the pattern from Antithesis. (PARTIALLY done: both already guard on the per-slot dataset.isAnimating, but unlike Antithesis they do NOT also check GameState.getUI('isAnimating') at the entry gate - AntinomyRenderer.js:173, AnalogyRenderer.js:159 vs AntithesisRenderer.js:246. Add the global OR clause to both.)
- [ ] Retest the two rapid-clicking bugs on the iPad (options going unselectable, duplicate images in Antithesis) - The July fixes should have killed both. If they're gone, close them out.
- [x] Delete the unused images - copies (fence and pen files). (Done by Thuy: images/elements is down to 8 referenced files, and barn.png/tree_1.png/white_gate.png now live only in the original_*/unused archive folders. The ~90 unused imageedit_*.png files still sit in the animal folders - see the note under Thuy's list.)

## Thuy

- [x] Re-export the animal images as PNGs around 600 px tall (folder + name unchanged, .png instead of .svg, compressed under 60 KB each). Done.
- [x] Re-export images/background_images and images/elements at roughly on-screen size (tree_1.png, barn.png, white_gate.png were the offenders). Done. The "compressed objs look weird/don't follow old scale" worry was NOT the exports - it was a code bug uncovered by the PNG switch, fixed 07.18 (see the July record).
- [x] Message Muhammad once the new files are in so the code can be switched to .png. Done.
- [ ] Delete the unused imageedit_*.png files (~90 of them across the animal folders). They are editor leftovers - nothing in js/css/index.html references them, so the game never loads them; they only bloat the repo. Do NOT compress them, just delete. (This answers the "How about the imageedit.png files?" question.)

Overlap items below were re-audited in code on 07.28 (drawn-pixel overlap measured on every
problem in all four games at 1194x834). Screen numbers are the on-screen "Question N (M of 7)"
labels. Results replace the older, partly stale descriptions:

- [ ] Antithesis overlaps - CONFIRMED and worse than previously listed. Present on 5 of 7 screens, not 2: Question 2 (3 of 7), Question 3 (4 of 7), Question 4 (5 of 7), Question 5 (6 of 7), Question 6 (7 of 7). Affects BOTH the top boxes and the choices pen. Worst cases ~20% overlap on Question 5 (6 of 7).
- [ ] Anomaly overlaps - CONFIRMED but the range in the old note was wrong. Clean on screens 1-2; overlaps on Question 2 (3 of 7), Question 3 (4 of 7), Question 4 (5 of 7), Question 5 (6 of 7), Question 6 (7 of 7). All in the main pen. Worst ~17%.
- [ ] Antinomy overlaps - NEW, was not on the list. The red pen has large animals touching on Question 1 (2 of 7) through Question 4 (5 of 7); the choices pen touches on Question 2 (3 of 7). Worst ~11%. Most visible with three large animals in the red pen.
- [x] Analogy overlaps - none found on any screen. The earlier Analogy overlap concerns appear resolved by the March/April baseline work.
- [ ] Analogy - Large sheep clips out of the answer box (analogy.css). Not an overlap; still open, and likely the same root cause as the 28vh cap item in Muhammad's list.

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
- Live-site slowness + fan + intermittent crashing (Thuy: ~70% of sessions). Two compounding causes, both invisible on local dev servers. (1) The animal-image onerror fallback had a broken guard: it compared the img's absolute src against a relative path, which is never equal, so a failing .svg fallback re-fired onerror forever - one simulated network blip produced 805 requests in 4 seconds. Fixed by nulling onerror after the first retry (AnimalSlot.js). (2) Cloudflare Pages was in SPA-fallback mode, returning index.html with a 200 for every missing path - missing images got HTML (browser ERR_FAILED), the .png->.svg fallback could never see a true failure, and opening a folder URL like /images/elements/ produced the nested-path errors in Thuy's console screenshot. Fixed by adding a root 404.html, which switches Cloudflare Pages to real 404s. Both only take effect once deployed.