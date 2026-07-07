/**
 * AnimalBaseline Component
 * Finds where an animal's drawn feet are inside its image.
 *
 * The animal SVGs have 15-20% empty space below the feet, and the amount
 * varies per asset and scales with rendered size. Renderers use this to
 * align drawn feet to a ground line instead of aligning image boxes.
 */
const AnimalBaseline = (function () {

    // Empty-space-below-feet ratio per image src (0..1 of image height)
    const cache = new Map();
    const FALLBACK_RATIO = 0.17; // typical for these assets

    /**
     * Ratio of image height that is empty space below the drawn feet.
     * Cached per src. Falls back to a typical value if the image isn't
     * loaded yet.
     */
    function padRatio(img) {
        const src = img.currentSrc || img.src;
        if (cache.has(src)) return cache.get(src);
        if (!img.complete || !img.naturalWidth) return FALLBACK_RATIO;

        let ratio = FALLBACK_RATIO;
        try {
            const W = 160;
            const H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth));
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, W, H);
            const data = ctx.getImageData(0, 0, W, H).data;

            // Scan up from the bottom for the lowest row with an opaque pixel
            let lowest = -1;
            outer: for (let y = H - 1; y >= 0; y--) {
                for (let x = 0; x < W; x++) {
                    if (data[(y * W + x) * 4 + 3] > 10) {
                        lowest = y;
                        break outer;
                    }
                }
            }
            if (lowest >= 0) {
                ratio = 1 - (lowest + 1) / H;
            }
        } catch (e) {
            // canvas unavailable or tainted, keep the fallback
        }
        cache.set(src, ratio);
        return ratio;
    }

    /**
     * Pixels of empty space below the drawn feet at the current rendered
     * size (rect-based, so transforms are included).
     */
    function padPx(img) {
        return img.getBoundingClientRect().height * padRatio(img);
    }

    /**
     * Run cb once the image has loaded (immediately if it already has).
     */
    function whenLoaded(img, cb) {
        if (img.complete && img.naturalWidth) {
            cb(img);
            return;
        }
        img.addEventListener('load', () => cb(img), { once: true });
    }

    // ====================
    // PUBLIC API
    // ====================

    return {
        padRatio,
        padPx,
        whenLoaded
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalBaseline;
}
