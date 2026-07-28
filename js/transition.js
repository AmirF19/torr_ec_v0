/**
 * ScreenTransition
 *
 * Two jobs, both aimed at the same problem: screens used to assemble in front
 * of the participant, with animals popping in one at a time as each PNG
 * decoded.
 *
 *   1. preload()  - fetch and decode images before they are needed, so the
 *                   browser has them in cache and can paint them instantly.
 *   2. run()      - fade to black, rebuild the screen behind the cover, wait
 *                   for its images, then fade back in.
 *
 * Together these mean the participant never watches a screen build itself.
 */

const ScreenTransition = (function () {

    // Every URL we have already started loading, so repeat visits to a screen
    // (and the second run of a game) cost nothing.
    const requested = new Set();

    // Timings live in transition.css so there is one place to tune them.
    // Read at call time rather than cached, so tweaking the CSS (or overriding
    // the variables from devtools) takes effect without touching this file.
    function cssMs(name, fallback) {
        try {
            const raw = getComputedStyle(document.documentElement)
                .getPropertyValue(name).trim();
            if (!raw) return fallback;
            // Accept both "420ms" and "0.42s"
            const value = parseFloat(raw);
            if (Number.isNaN(value)) return fallback;
            return raw.endsWith('ms') ? value : value * 1000;
        } catch (e) {
            return fallback;
        }
    }

    const fadeOutMs = () => cssMs('--veil-fade-out', 420);
    const fadeInMs = () => cssMs('--veil-fade-in', 520);
    const holdMs = () => cssMs('--veil-hold', 120);

    const MAX_WAIT_MS = 2500;  // never hold the veil longer than this, even on a slow network

    /**
     * Ensure the veil element exists. Created lazily so this module does not
     * depend on markup living in index.html.
     */
    function getVeil() {
        let veil = document.getElementById('screen-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.id = 'screen-veil';
            veil.setAttribute('aria-hidden', 'true');
            document.body.appendChild(veil);
        }
        return veil;
    }

    /**
     * Start loading a list of image URLs. Returns a promise that resolves when
     * they have all finished - but resolves on error too, because a missing
     * image must never wedge the transition. Decoding (not just downloading) is
     * awaited where supported, since a decoded image is what paints instantly.
     */
    function preload(urls) {
        const list = (urls || []).filter(Boolean);
        if (!list.length) return Promise.resolve();

        return Promise.all(list.map(url => new Promise(resolve => {
            // Already fetched in this session: nothing to wait for.
            if (requested.has(url)) return resolve();
            requested.add(url);

            const img = new Image();
            img.onload = () => {
                // decode() moves the expensive work off the paint that follows.
                if (typeof img.decode === 'function') {
                    img.decode().then(resolve).catch(resolve);
                } else {
                    resolve();
                }
            };
            img.onerror = () => {
                // Let it fail quietly - AnimalSlot has its own fallback, and a
                // broken asset should not block the whole screen.
                requested.delete(url);
                resolve();
            };
            img.src = url;
        })));
    }

    /**
     * Collect every animal image URL used by a problem.
     */
    function imagesForProblem(problemData) {
        // ProblemSet/Config are script-scoped consts, not window properties,
        // so test them with typeof rather than reaching through window.
        if (!problemData || typeof ProblemSet === 'undefined') return [];
        try {
            return ProblemSet.collectProblemAnimals(problemData)
                .map(a => a && a.image)
                .filter(Boolean);
        } catch (e) {
            return [];
        }
    }

    /**
     * Every image needed for the first problem of a given game type, plus the
     * scenery that game draws. Used to warm the cache while the participant is
     * still reading an interstitial.
     */
    function imagesForGameType(problemSet, gameType) {
        if (!Array.isArray(problemSet)) return [];
        const first = problemSet.find(p =>
            (p.type || '').toLowerCase() === (gameType || '').toLowerCase()
        );
        return first ? imagesForProblem(first) : [];
    }

    /**
     * The backdrop and pen art shared by every screen.
     */
    function sceneryImages() {
        if (typeof Config === 'undefined' || !Config.images) return [];
        const { backgrounds = {}, elements = {} } = Config.images;
        return [...Object.values(backgrounds), ...Object.values(elements)];
    }

    /**
     * Wait for images currently in the DOM to finish loading, so we do not
     * lift the veil onto a half-drawn screen. Capped by MAX_WAIT_MS.
     */
    function waitForVisibleImages() {
        const imgs = [...document.querySelectorAll('#game-container img, #start-container img')]
            .filter(img => !img.complete);

        if (!imgs.length) return Promise.resolve();

        return Promise.race([
            Promise.all(imgs.map(img => new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            }))),
            new Promise(resolve => setTimeout(resolve, MAX_WAIT_MS))
        ]);
    }

    function nextFrame() {
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    function fadeOut() {
        const veil = getVeil();
        // Force a style read so the browser registers opacity:0 before the
        // class flips it to 1 - without this the very first fade can jump.
        void veil.offsetWidth;
        veil.classList.add('is-covering');
        return new Promise(resolve => setTimeout(resolve, fadeOutMs()));
    }

    function fadeIn() {
        const veil = getVeil();
        veil.classList.remove('is-covering');
        return new Promise(resolve => setTimeout(resolve, fadeInMs()));
    }

    /**
     * The main entry point: fade to black, run `build` (which swaps/renders the
     * screen), wait for its images, then fade back in.
     *
     * `build` may be sync or async. If it throws, the veil is still lifted -
     * a broken transition must never leave the participant staring at black.
     *
     * @param {Function} build          does the actual screen change
     * @param {Object}   [opts]
     * @param {string[]} [opts.preload] URLs to have ready before fading in
     */
    async function run(build, opts = {}) {
        try {
            await fadeOut();

            if (opts.preload && opts.preload.length) {
                // Bounded so a slow asset cannot strand us behind the veil.
                await Promise.race([
                    preload(opts.preload),
                    new Promise(resolve => setTimeout(resolve, MAX_WAIT_MS))
                ]);
            }

            if (typeof build === 'function') await build();

            // Let the new DOM lay out, then give its images a chance to arrive.
            await nextFrame();
            await waitForVisibleImages();

            // A short beat at full cover. Without it, a board that happens to
            // be cached is revealed the instant it is built, which reads as a
            // flicker rather than a transition.
            const hold = holdMs();
            if (hold > 0) await new Promise(resolve => setTimeout(resolve, hold));
        } catch (err) {
            console.warn('Screen transition failed, revealing anyway:', err);
        } finally {
            await fadeIn();
        }
    }

    // ====================
    // PUBLIC API
    // ====================

    return {
        run,
        preload,
        imagesForProblem,
        imagesForGameType,
        sceneryImages
    };
})();

// A top-level `const` in a classic script is script-scoped, not a property of
// window, so publish it explicitly for the `window.ScreenTransition` guards in
// main.js (which let the app run normally if this file ever fails to load).
window.ScreenTransition = ScreenTransition;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenTransition;
}
