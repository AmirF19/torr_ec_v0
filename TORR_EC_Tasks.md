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

## Thuy

- [ ] Re-export the animal images as PNGs around 600 px tall - Same folder, same name, .png instead of .svg. Compress each export (tinypng.com or squoosh.app), target under 60 KB per animal. This also replaces the broken blue cow file.
- [ ] Re-export images/background_images and images/elements at roughly on-screen size - Largest offenders are tree_1.png (13 MB), barn.png (9 MB), and white_gate.png (8 MB).
- [ ] Delete the unused images - Gemini_Generated_Image files, imageedit copies, duplicate fence and pen files. Check js/config.js before deleting anything.
- [ ] Message Muhammad once the new files are in so the code can be switched to .png.
- [ ] Fix animal overlap in Antithesis question 3 (4 of 7) and question 6 (7 of 7) - options pen. Horizontal spacing only (slot gaps, grid gaps, content insets in the game css). Vertical placement is set by the renderers now, leave it alone. Same applies to the two bullets below.
- [ ] Fix animal overlap in Anomaly questions 2 through 5 - main pen.
- [ ] Antinomy - The 4th choice sits close to the right fence post. Check spacing everywhere after the overlap fixes above.
- [ ] Analogy - Large sheep clips out of the answer box (analogy.css).
- [ ] Analogy - C-box large sheep doesn't render at the standard large size. Related to the 28vh cap in forceAnimalSizes in AnalogyRenderer.js.
- [ ] Next button overlaps animals on the iPad - Spacing pass in analogy.css / responsive.css.
- [ ] Add the global isAnimating check to the Antinomy and Analogy selection handlers - Copy the pattern from Antithesis.
- [ ] Retest the two rapid-clicking bugs on the iPad (options going unselectable, duplicate images in Antithesis) - The July fixes should have killed both. If they're gone, close them out.
