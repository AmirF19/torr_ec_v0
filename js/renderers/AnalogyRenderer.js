/**
 * Analogy Renderer Module
 * Renders the Analogy game type: A:B :: C:?
 * Layout mirrors AntinomyRenderer — two top pens + choices bottom pen.
 */

const AnalogyRenderer = (function () {

    /**
     * Render Analogy problem
     */
    function render(problemData, container) {
        container.innerHTML = '';

        // Create layout container
        const layout = document.createElement('div');
        layout.className = 'analogy-layout';

        // CLEANUP: Remove any lingering flying animals from previous renders
        document.querySelectorAll('.analogy-flying-animal').forEach(el => el.remove());

        // Find sections
        const abSection = problemData.sections.find(s => s.label === 'AB Box');
        const cSection = problemData.sections.find(s => s.label === 'C Box');
        const choicesSection = problemData.sections.find(s => s.label === 'Choices Box');

        if (!abSection || !cSection || !choicesSection) {
            console.error('Missing sections in Analogy problem. Expected: AB Box, C Box, Choices Box.');
            return;
        }

        // Create category row container
        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';

        // ── AB PEN (left) ──────────────────────────────────────────────────────
        const { pen: abPen, grid: abGrid } = Pen.createCategoryPen('ab', 'AB Box', Config.images.elements.penAnalogy);
        abPen.classList.add('pen--ab');

        abSection.items.forEach((item, index) => {
            const animals = item.animals || [];
            animals.forEach((animal, animalIndex) => {
                const singleItem = { id: animal.id, animals: [animal] };
                const slot = AnimalSlot.create({
                    item: singleItem,
                    selectable: false,
                    slotIndex: animalIndex,
                    penId: 'ab'
                });
                abGrid.appendChild(slot);
            });
        });

        // ── C PEN (right) ──────────────────────────────────────────────────────
        const { pen: cPen, grid: cGrid } = Pen.createCategoryPen('c', 'C Box', Config.images.elements.penAnalogy);
        cPen.classList.add('pen--c');

        cSection.items.forEach((item, index) => {
            const animals = item.animals || [];
            animals.forEach((animal, animalIndex) => {
                const singleItem = { id: animal.id, animals: [animal] };
                const slot = AnimalSlot.create({
                    item: singleItem,
                    selectable: false,
                    slotIndex: animalIndex,
                    penId: 'c'
                });
                cGrid.appendChild(slot);
            });
        });

        // Add question mark slot to C pen (the animation target)
        cGrid.appendChild(createQuestionMarkAttributes());

        // ── FORCE ANIMAL SIZES ON CATEGORY PEN IMAGES ──
        // Inline styles bypass all CSS specificity issues
        forceAnimalSizes(abGrid);
        forceAnimalSizes(cGrid);

        // ── CATEGORY ROW ───────────────────────────────────────────────────────
        categoryRow.appendChild(abPen);
        categoryRow.appendChild(cPen);

        // ── CHOICES PEN (bottom) ───────────────────────────────────────────────
        const { pen: choicesPen, grid: choicesGrid } = Pen.createChoicesPen('Choices');
        choicesPen.classList.add('pen--choices');

        choicesSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: true,
                slotIndex: index,
                penId: 'choices',
                onClick: handleAnalogySelection
            });
            choicesGrid.appendChild(slot);
        });

        // ── ASSEMBLE ───────────────────────────────────────────────────────────
        layout.appendChild(categoryRow);
        layout.appendChild(choicesPen);

        container.appendChild(layout);

        // Runs after attach so rects are measurable
        alignCategoryBaselines(layout);
    }

    /**
     * Pin every AB/C pen animal's drawn feet to the vertical middle of the
     * pen ground. Box alignment is not enough: the SVGs have 15-20% empty
     * space below the feet and it scales with rendered size, so per-size
     * CSS constants leave large animals higher than small ones.
     */
    function alignCategoryBaselines(layout) {
        layout.querySelectorAll('.category-row .animal-slot .animal-image').forEach(img => {
            // Hidden until aligned in its own load event, so it never paints
            // at the CSS fallback position and then moves
            img.style.visibility = 'hidden';
            AnimalBaseline.whenLoaded(img, () => {
                const pen = img.closest('.pen--ab, .pen--c');
                const ground = pen ? pen.querySelector('.pen-ground') : null;
                const slot = img.closest('.animal-slot');
                if (!ground || !slot) {
                    img.style.visibility = '';
                    return;
                }

                const groundRect = ground.getBoundingClientRect();
                const slotRect = slot.getBoundingClientRect();
                const groundMid = groundRect.top + groundRect.height / 2;

                // Lift so the drawn feet (box bottom minus intrinsic padding)
                // sit exactly on the mid-ground line
                const bottomPx = (slotRect.bottom - groundMid) - AnimalBaseline.padPx(img);
                img.style.transition = 'none'; // the base .animal-image transition:all would animate this
                img.style.setProperty('bottom', `${Math.round(bottomPx * 10) / 10}px`, 'important');
                img.style.visibility = '';
            });
        });
    }

    /**
     * Handle selection in Analogy mode.
     * Mirrors AntinomyRenderer.handleAntinomySelection exactly,
     * targeting pen--c .question-mark-slot instead of pen--green.
     */
    function handleAnalogySelection(slotElement, choice, slotIndex) {
        // A placed option's slot stays in the DOM invisibly (opacity 0) and
        // still receives clicks; re-selecting it would fly the placed clone
        // back while launching a duplicate. Ignore clicks on it - the undo
        // affordance is clicking the placed animal in the box.
        if (slotElement.classList.contains('animal-slot--selected')) return;

        // Prevent double-clicks. Checked before any class changes so an
        // ignored click can't leave a stale selection.
        if (slotElement.dataset.isAnimating === 'true') return;

        // Clear previous selections. Visibility of the deselected animal is
        // restored by the clone handling below (fly-back or instant cleanup).
        document.querySelectorAll('.pen--choices .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        slotElement.dataset.isAnimating = 'true';

        // --- ANIMATION START ---
        const targetContainer = document.querySelector('.analogy-layout .category-row .pen--c .question-mark-slot');
        const sourceImage = slotElement.querySelector('.animal-image');

        if (sourceImage && targetContainer) {
            // Send any previously placed animal back to its choice slot.
            // Landed clones fly back (mirrors Anomaly's swap animation);
            // mid-flight clones are cleaned up instantly, restoring their source.
            document.querySelectorAll('.analogy-flying-animal').forEach(el => {
                if (el.dataset.landed === 'true') {
                    const qm = targetContainer.querySelector('.question-mark-text');
                    if (qm) qm.style.opacity = '1';
                    AnimationHandler.flyCloneBack(el);
                } else {
                    if (el._returnInfo) {
                        el._returnInfo.sourceEl.style.opacity = '';
                        el._returnInfo.slotEl.dataset.isAnimating = 'false';
                    }
                    el.remove();
                }
            });

            // Hide original immediately
            sourceImage.style.opacity = '0';

            // Measure before the clone enters the document: an in-flow
            // clone at the end of body shifts the centered layout and skews
            // every rect measured while it is attached
            const startRect = sourceImage.getBoundingClientRect();

            // Create clone
            const clone = sourceImage.cloneNode(true);
            clone.style.opacity = '';
            clone.classList.add('analogy-flying-animal');

            // Lock the clone to its rendered pixel size so CSS rules don't
            // resize it outside the choices-pen context
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.maxWidth = 'none';
            clone.style.maxHeight = 'none';

            // Fixed at the start position before appending, so the clone
            // never participates in layout
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.zIndex = '99999';
            clone.style.pointerEvents = 'none';

            // Remember where the clone came from so it can fly back on undo/switch
            clone._returnInfo = {
                sourceEl: sourceImage,
                slotEl: slotElement,
                startLeft: startRect.left,
                startTop: startRect.top
            };

            document.body.appendChild(clone);

            // Force reflow to lock in start position
            void clone.offsetWidth;

            // NOW enable transition and set destination
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

            const endRect = targetContainer.getBoundingClientRect();

            // Destination: center horizontally in the question-mark-slot
            const left = endRect.left + (endRect.width - startRect.width) / 2;

            // Land the drawn feet on the C pen baseline (mid-ground), the
            // same line alignCategoryBaselines uses
            const groundRect = document
                .querySelector('.analogy-layout .pen--c .pen-ground')
                .getBoundingClientRect();
            const groundMid = groundRect.top + groundRect.height / 2;
            const top = groundMid + AnimalBaseline.padPx(sourceImage) - startRect.height;

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            // On animation finish
            clone.addEventListener('transitionend', () => {
                // Hide question mark span
                const qmSpan = targetContainer.querySelector('.question-mark-text');
                if (qmSpan) qmSpan.style.opacity = '0';

                // FIX (ANAL-0-01): Do NOT reparent the clone into the slot.
                // Reparenting shifts the positioning context from fixed (viewport)
                // to absolute (slot), and clearing inline top/left causes a visible
                // snap-jump as CSS takes over. Keeping the clone fixed at its final
                // screen position eliminates the jump entirely.
                clone.style.transition = 'none'; // freeze — prevent any further drift

                // Unlock animation lock
                slotElement.dataset.isAnimating = 'false';
                clone.dataset.landed = 'true';

                // Enable clicking clone to return animal
                clone.style.pointerEvents = 'auto';
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Show question mark again and clear the selection state
                    if (qmSpan) qmSpan.style.opacity = '1';
                    slotElement.classList.remove('animal-slot--selected');
                    SelectionHandler.disableNextButton();

                    // Fly the animal back to its choice slot (matches Anomaly's
                    // animated return); visibility is restored when it lands.
                    GameState.setUI('isAnimating', true);
                    AnimationHandler.flyCloneBack(clone, () => {
                        GameState.setUI('isAnimating', false);
                    });
                };

                clone.addEventListener('click', returnHandler, { once: true });

            }, { once: true });
        }
        // --- ANIMATION END ---

        // Record selection
        GameState.recordSelection(choice, slotIndex);

        // Enable next button
        SelectionHandler.enableNextButton();

        // Update data panel
        SelectionHandler.updateDataPanel();
    }

    /**
     * Helper to create Question Mark slot (mirrors AntinomyRenderer)
     */
    function createQuestionMarkAttributes() {
        const div = document.createElement('div');
        div.className = 'animal-slot animal-slot--empty question-mark-slot';

        const span = document.createElement('span');
        span.className = 'question-mark-text';
        span.textContent = '?';

        div.appendChild(span);
        return div;
    }

    /**
     * Force correct sizes on all animal images in a grid via inline styles.
     * This is a fail-safe that bypasses all CSS specificity issues.
     */
    function forceAnimalSizes(grid) {
        const images = grid.querySelectorAll('.animal-image');
        images.forEach(img => {
            // Determine size category
            const isLarge = img.classList.contains('animal-image--large');
            const isMedium = img.classList.contains('animal-image--medium');
            const isSmall = img.classList.contains('animal-image--small');
            const isCat = img.classList.contains('animal-image--cat');

            // Base positioning
            img.style.position = 'absolute';
            img.style.left = '50%';
            img.style.width = 'auto';
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
            img.style.display = 'block';

            // Baseline offsets here are first-paint fallbacks; the real
            // per-image value comes from alignCategoryBaselines()
            if (isLarge) {
                img.style.height = '28vh';
                img.style.maxHeight = '28vh';
                img.style.bottom = '22.3%';
                if (isCat) {
                    img.style.transform = 'translateX(-50%) scale(1.125)';
                } else {
                    img.style.transform = 'translateX(-50%) scale(1.25)';
                }
                img.style.transformOrigin = 'bottom center';
            } else if (isMedium) {
                img.style.height = '22vh';
                img.style.maxHeight = '22vh';
                img.style.bottom = '22.3%';
                if (isCat) {
                    img.style.transform = 'translateX(-50%) scale(0.9)';
                    img.style.transformOrigin = 'bottom center';
                } else {
                    img.style.transform = 'translateX(-50%)';
                }
            } else if (isSmall) {
                img.style.height = '13vh';
                img.style.maxHeight = '13vh';
                img.style.bottom = '22.3%';
                img.style.transform = 'translateX(-50%)';
            }
        });
    }

    // ====================
    // PUBLIC API
    // ====================

    return {
        render
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalogyRenderer;
}
