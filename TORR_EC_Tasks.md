# TORR EC Tasks

Updated 07.07.2026
Live: https://torr-ec-test.muhammadfusenig.com/

Where things stand: the site is tap-only now, session ids are automatic (date + time + a short code, written into the CSV), the baselines in all four games are handled by the renderers, and the spoken instructions live in TORR_EC_Researcher_Script.md. What's left is split below.

One thing before the tasks. The site currently downloads about 208 MB in a single run because the images are huge. The animal "SVGs" are really 1696x2528 pictures wrapped in an svg tag, close to 1 MB each, and some backgrounds are 9-13 MB. We display all of this at a couple hundred pixels. Shrinking the files changes nothing visually and fixes the load times on the iPad, so that work is at the top of Thuy's list.

## Muhammad

- [ ] Test on the actual iPad. Pinch zoom should do nothing, undo should fly the animal back in every game, triple tap on the bottom right corner should fill in the answer, the downloaded CSV should have the session id in it, and there should be no yellow flash when tapping an animal.
- [ ] Once the new images are in, flip the code from .svg to .png (one line in problems.js, plus the element paths in config.js) and preload the full animal set on the welcome screen so nothing pops in late.
- [ ] Remove the MutationObserver at the bottom of main.js. It watches every DOM change just to hide the next button on the Super Work screen. Do that directly in showWelcomeScreen instead.
- [ ] Check the cache headers on the host. If we're on GitHub Pages, assets expire every 10 minutes and the iPad re-downloads them between sessions. Matters a lot less once the images are small.

## Thuy

The image re-export, step by step:

1. Open each animal file under images/website_selection_clean and export it as a PNG around 600 px tall. Same folder, same name, just .png instead of .svg.
2. Run the exports through a compressor (tinypng.com or squoosh.app work). Aim for under 60 KB per animal.
3. Same treatment for images/background_images and images/elements, sized to roughly what shows on screen. tree_1.png is 13 MB right now, barn.png is 9 MB, white_gate.png is 8 MB.
4. While you're in there, delete what nothing uses: the Gemini_Generated_Image files, the imageedit copies, duplicate fence and pen files. Check js/config.js before deleting anything.
5. Tell me when the files are in and I'll flip the code over to .png.

This also takes care of the broken 2.7 MB blue cow, since it gets re-exported with everything else.

Placement fixes. Animals overlap each other or the fences in these problems. Fix the horizontal spacing (slot gaps, grid gaps, content insets) in the game css. Leave the vertical placement alone, the renderers set that now.

- [ ] Antithesis question 3 (4 of 7) and question 6 (7 of 7), the options pen
- [ ] Anomaly questions 2 through 5, the main pen
- [ ] Antinomy, the 4th choice sits close to the right fence post. Check the spacing everywhere once the above are done.

Leftovers:

- [ ] Analogy, the large sheep clips out of the answer box (analogy.css)
- [ ] Analogy, the C-box large sheep doesn't render at the standard large size. Related to the 28vh cap in forceAnimalSizes in AnalogyRenderer.js.
- [ ] The next button overlaps animals on the iPad, needs a spacing pass in analogy.css / responsive.css
- [ ] Add the global isAnimating check to the Antinomy and Analogy selection handlers. Antithesis already does it, copy that pattern.
- [ ] Retest the two rapid-clicking bugs on the iPad (options going unselectable, duplicate images in Antithesis). The July fixes should have killed both. If they're gone, close them out.
