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

            // Optional drag-to-place (coexists with tap). Drop onto the C box.
            if (typeof DragHandler !== 'undefined') {
                DragHandler.makeDraggable(slot, {
                    item,
                    slotIndex: index,
                    onDrop: handleAnalogySelection,
                    getTargetEl: () => document.querySelector('.analogy-layout .pen--c')
                });
            }
        });

        // ── ASSEMBLE ───────────────────────────────────────────────────────────
        layout.appendChild(categoryRow);
        layout.appendChild(choicesPen);

        container.appendChild(layout);
    }

    /**
     * Handle selection in Analogy mode.
     * Mirrors AntinomyRenderer.handleAntinomySelection exactly,
     * targeting pen--c .question-mark-slot instead of pen--green.
     */
    function handleAnalogySelection(slotElement, choice, slotIndex) {
        // Clear previous selections
        document.querySelectorAll('.pen--choices .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
            const image = slot.querySelector('.animal-image');
            if (image) image.style.opacity = '';
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Prevent double-clicks
        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        // --- ANIMATION START ---

        // ── ANSWER SLOT LANDING OFFSETS (%) ──────────────────────────────────
        // These MUST match the bottom percentages defined in analogy.css for .category-row
        // Positive = lower on screen (sinks below baseline). Negative = higher on screen
        const LANDING_OFFSET_LARGE_PCT = 0.0;    // corresponds to bottom: 0%
        const LANDING_OFFSET_MEDIUM_PCT = -0.32;  // corresponds to bottom: 32%
        const LANDING_OFFSET_SMALL_PCT = -0.10;   // corresponds to bottom: 10%
        // ─────────────────────────────────────────────────────────────────────
        const targetContainer = document.querySelector('.analogy-layout .category-row .pen--c .question-mark-slot');
        const sourceImage = slotElement.querySelector('.animal-image');

        if (sourceImage && targetContainer) {
            // Remove any existing clones
            document.querySelectorAll('.analogy-flying-animal').forEach(el => el.remove());

            // Hide original immediately
            sourceImage.style.opacity = '0';

            // Create clone
            const clone = sourceImage.cloneNode(true);
            clone.style.opacity = '';
            clone.classList.add('analogy-flying-animal');

            // FIX: Lock animal image to its current rendered pixel size
            // so CSS rules don't resize it when the clone moves to a different context
            const imgRect = sourceImage.getBoundingClientRect();
            clone.style.width = `${imgRect.width}px`;
            clone.style.height = `${imgRect.height}px`;
            clone.style.maxWidth = 'none';
            clone.style.maxHeight = 'none';

            document.body.appendChild(clone);

            // Get positions
            const startRect = sourceImage.getBoundingClientRect();
            const endRect = targetContainer.getBoundingClientRect();

            // Initial position — top-based, mirrors AntinomyRenderer exactly
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '99999';
            clone.style.pointerEvents = 'none';

            // Force reflow to lock in start position
            void clone.offsetWidth;

            // No cap — use the animal's full natural rendered size from the choices pen
            const landingHeight = startRect.height;
            const landingWidth = startRect.width;

            // Set explicit dimensions to the natural values
            clone.style.width = `${landingWidth}px`;
            clone.style.height = `${landingHeight}px`;

            // NOW enable transition and set destination
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

            // Destination: center horizontally in the question-mark-slot
            const left = endRect.left + (endRect.width - landingWidth) / 2;

            // Use the target container's bottom edge as the strict absolute floor line
            // This guarantees uniform landing height regardless of the C-Box animal's size
            const floorY = endRect.bottom;

            // Calculate dynamic vertical offset based on the slot's actual rendered height
            // to perfectly match the CSS percentages used by the static animals.
            const slotHeight = endRect.height;
            const isLarge = sourceImage.classList.contains('animal-image--large');
            const isMedium = sourceImage.classList.contains('animal-image--medium');
            
            const landingOffset = isLarge ? (slotHeight * LANDING_OFFSET_LARGE_PCT)
                : isMedium ? (slotHeight * LANDING_OFFSET_MEDIUM_PCT)
                    : (slotHeight * LANDING_OFFSET_SMALL_PCT);

            const top = floorY - landingHeight + landingOffset;

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

                // Enable clicking clone to return animal
                clone.style.pointerEvents = 'auto';
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Show original again
                    sourceImage.style.opacity = '1';

                    // Show question mark again
                    if (qmSpan) qmSpan.style.opacity = '1';

                    // Remove selection state
                    slotElement.classList.remove('animal-slot--selected');

                    // Remove clone
                    clone.remove();

                    // Disable Next button
                    SelectionHandler.disableNextButton();
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

            if (isLarge) {
                img.style.height = '28vh';
                img.style.maxHeight = '28vh';
                img.style.bottom = '0%'; // tune in analogy.css .category-row .animal-slot .animal-image--large
                if (isCat) {
                    img.style.transform = 'translateX(-50%) scale(1.125)';
                } else {
                    img.style.transform = 'translateX(-50%) scale(1.25)';
                }
                img.style.transformOrigin = 'bottom center';
            } else if (isMedium) {
                img.style.height = '22vh';
                img.style.maxHeight = '22vh';
                img.style.bottom = '32%'; // tune via .category-row .animal-slot .animal-image--medium in analogy.css
                if (isCat) {
                    img.style.transform = 'translateX(-50%) scale(0.9)';
                    img.style.transformOrigin = 'bottom center';
                } else {
                    img.style.transform = 'translateX(-50%)';
                }
            } else if (isSmall) {
                img.style.height = '13vh';
                img.style.maxHeight = '13vh';
                img.style.bottom = '10%'; // tune via .category-row .animal-slot .animal-image--small in analogy.css
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
