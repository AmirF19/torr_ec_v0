/**
 * Drag Interaction Module
 *
 * Adds optional drag-and-drop placement on top of the existing tap-to-place.
 * Tapping still works exactly as before — this only kicks in once the pointer
 * actually moves.
 *
 * Why pointer events (not the HTML5 drag-and-drop API): HTML5 drag doesn't fire
 * on touchscreens, and this runs on an iPad. Pointer events behave the same for
 * touch, pen, and mouse, so one code path covers all of them.
 *
 * Flow:
 *   - pointerdown on a selectable choice slot records the start point.
 *   - if the pointer moves past a small threshold, we treat it as a drag: a
 *     clone of the animal follows the finger and the original dims.
 *   - on release over the target pen, we place it by calling the SAME handler a
 *     tap uses, so the end state (and the tap-to-return behavior) is identical.
 *   - on release anywhere else, the clone snaps back and nothing is placed.
 *
 * A drag never double-fires placement: the click the browser sends after the
 * release is swallowed.
 */
const DragHandler = (function () {

    const MOVE_THRESHOLD = 10;   // px the pointer must move before a press becomes a drag
    const DROP_PADDING = 24;     // px of slack around the target pen so drops are forgiving

    /**
     * Enable drag-to-place on a selectable choice slot.
     * @param {HTMLElement} slot           the choice slot element
     * @param {Object}   opts
     * @param {Object}   opts.item         the choice data (single animal or group)
     * @param {number}   opts.slotIndex    index within the choices pen
     * @param {Function} opts.onDrop       placement handler, called as (slot, item, slotIndex)
     * @param {Function} opts.getTargetEl  returns the drop-target element (evaluated on release)
     */
    function makeDraggable(slot, opts) {
        const { item, slotIndex, onDrop, getTargetEl } = opts || {};
        if (!slot || typeof onDrop !== 'function') return;

        let startX = 0, startY = 0;
        let pointerId = null;
        let dragging = false;
        let clone = null;
        let sourceVisual = null;
        let originRect = null;
        let originalOpacity = '';

        slot.style.touchAction = 'none';
        slot.addEventListener('pointerdown', onPointerDown);

        function onPointerDown(e) {
            // Primary button / single touch only
            if (e.button && e.button !== 0) return;
            if (GameState.getUI('isAnimating')) return;
            if (slot.dataset.isAnimating === 'true') return;
            if (!slot.classList.contains('animal-slot--selectable')) return;

            startX = e.clientX;
            startY = e.clientY;
            pointerId = e.pointerId;
            dragging = false;

            slot.addEventListener('pointermove', onPointerMove);
            slot.addEventListener('pointerup', onPointerUp);
            slot.addEventListener('pointercancel', onPointerCancel);
        }

        function onPointerMove(e) {
            if (e.pointerId !== pointerId) return;

            if (!dragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.hypot(dx, dy) < MOVE_THRESHOLD) return;
                beginDrag(e);
                if (!dragging) return; // beginDrag bailed (nothing to drag)
            }

            if (clone) {
                clone.style.left = `${e.clientX}px`;
                clone.style.top = `${e.clientY}px`;
                updateTargetHighlight(e.clientX, e.clientY);
            }
        }

        function beginDrag(e) {
            sourceVisual = slot.querySelector('.animal-group') || slot.querySelector('.animal-image');
            if (!sourceVisual) return;

            dragging = true;
            try { slot.setPointerCapture(pointerId); } catch (_) { /* not fatal */ }

            originRect = sourceVisual.getBoundingClientRect();
            originalOpacity = sourceVisual.style.opacity;

            // Build a clone that follows the finger.
            clone = sourceVisual.cloneNode(true);
            clone.classList.add('drag-clone');
            clone.style.position = 'fixed';
            clone.style.left = `${e.clientX}px`;
            clone.style.top = `${e.clientY}px`;
            clone.style.width = `${originRect.width}px`;
            clone.style.height = `${originRect.height}px`;
            clone.style.transform = 'translate(-50%, -50%) scale(1.05)';
            clone.style.transformOrigin = 'center center';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = '100000';
            clone.style.opacity = '0.92';
            clone.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))';

            // Lock inner image pixel sizes so CSS in the new context can't resize them.
            const srcImgs = sourceVisual.querySelectorAll('.animal-image');
            const cloneImgs = clone.querySelectorAll('.animal-image');
            srcImgs.forEach((img, i) => {
                const r = img.getBoundingClientRect();
                if (cloneImgs[i]) {
                    cloneImgs[i].style.width = `${r.width}px`;
                    cloneImgs[i].style.height = `${r.height}px`;
                    cloneImgs[i].style.maxWidth = 'none';
                    cloneImgs[i].style.maxHeight = 'none';
                }
            });

            document.body.appendChild(clone);

            sourceVisual.style.opacity = '0.3';
            slot.classList.add('animal-slot--dragging');
        }

        function onPointerUp(e) {
            if (e.pointerId !== pointerId) return;
            cleanupListeners();

            if (!dragging) {
                // Never moved — leave it to the normal click handler.
                return;
            }
            dragging = false;

            const target = typeof getTargetEl === 'function' ? getTargetEl() : null;
            const onTarget = isPointInside(e.clientX, e.clientY, target, DROP_PADDING);

            // Prevent the post-release click from also firing placement.
            swallowNextClick();
            clearHighlight();

            if (onTarget) {
                removeClone();
                restoreSource();
                slot.classList.remove('animal-slot--dragging');
                if (slot.dataset.isAnimating !== 'true') {
                    onDrop(slot, item, slotIndex);
                }
            } else {
                snapBackAndCancel();
            }
        }

        function onPointerCancel(e) {
            if (e.pointerId !== pointerId) return;
            cleanupListeners();
            if (dragging) {
                dragging = false;
                clearHighlight();
                snapBackAndCancel();
            }
        }

        function snapBackAndCancel() {
            slot.classList.remove('animal-slot--dragging');
            if (clone && originRect) {
                const c = clone;
                clone = null;
                c.style.transition = 'left 0.18s ease, top 0.18s ease, transform 0.18s ease';
                c.style.left = `${originRect.left + originRect.width / 2}px`;
                c.style.top = `${originRect.top + originRect.height / 2}px`;
                c.style.transform = 'translate(-50%, -50%) scale(1)';
                setTimeout(() => c.remove(), 200);
            } else {
                removeClone();
            }
            restoreSource();
        }

        function restoreSource() {
            if (sourceVisual) sourceVisual.style.opacity = originalOpacity;
        }

        function removeClone() {
            if (clone) { clone.remove(); clone = null; }
        }

        function updateTargetHighlight(x, y) {
            const target = typeof getTargetEl === 'function' ? getTargetEl() : null;
            if (!target) return;
            target.classList.toggle('drop-target--active', isPointInside(x, y, target, DROP_PADDING));
        }

        function clearHighlight() {
            const target = typeof getTargetEl === 'function' ? getTargetEl() : null;
            if (target) target.classList.remove('drop-target--active');
        }

        function cleanupListeners() {
            slot.removeEventListener('pointermove', onPointerMove);
            slot.removeEventListener('pointerup', onPointerUp);
            slot.removeEventListener('pointercancel', onPointerCancel);
            try { slot.releasePointerCapture(pointerId); } catch (_) { /* already released */ }
        }

        function swallowNextClick() {
            const swallow = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            };
            slot.addEventListener('click', swallow, { capture: true, once: true });
            // In case no click is generated, clean the listener up shortly after.
            setTimeout(() => slot.removeEventListener('click', swallow, true), 400);
        }
    }

    /**
     * Is (x, y) inside element's box, expanded by `pad` pixels on each side?
     */
    function isPointInside(x, y, el, pad = 0) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left - pad && x <= r.right + pad &&
               y >= r.top - pad && y <= r.bottom + pad;
    }

    // ====================
    // PUBLIC API
    // ====================

    return { makeDraggable };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragHandler;
}
