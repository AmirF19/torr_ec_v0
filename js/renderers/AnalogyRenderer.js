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

            // Use the existing animal in the C pen as the floor reference
            // Its bottom edge IS the visual floor line because it is locked by CSS bottom: 0% !important
            const cPenAnimal = document.querySelector('.analogy-layout .pen--c .animal-image');
            const floorY = cPenAnimal
                ? cPenAnimal.getBoundingClientRect().bottom
                : endRect.bottom;

            const top = floorY - landingHeight;

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            // On animation finish
            clone.addEventListener('transitionend', () => {
                // Hide question mark span, keep container visible
                const qmSpan = targetContainer.querySelector('.question-mark-text');
                if (qmSpan) qmSpan.style.opacity = '0';

                // Reparent the clone into the slot so CSS size alignments apply natively!
                targetContainer.appendChild(clone);

                // Clear the inline inline animation styles so CSS takes over
                clone.style.position = '';
                clone.style.left = '';
                clone.style.top = '';
                clone.style.width = '';
                clone.style.height = '';
                clone.style.transition = '';

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
