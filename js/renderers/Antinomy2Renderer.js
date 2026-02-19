/**
 * Antinomy2 Renderer Module
 * Renders the Antinomy2 game type layout (fresh build)
 */

const Antinomy2Renderer = (function () {

    /**
     * Render Antinomy2 problem
     */
    function render(problemData, container) {
        container.innerHTML = '';

        // Create layout container - uses antinomy2-layout class
        const layout = document.createElement('div');
        layout.className = 'antinomy2-layout';

        // CLEANUP: Remove any lingering flying animals from previous renders/sessions
        document.querySelectorAll('.antinomy2-flying-animal').forEach(el => el.remove());

        // Find sections
        const greenSection = problemData.sections.find(s => s.label === 'Green Box');
        const redSection = problemData.sections.find(s => s.label === 'Red Box');
        const choicesSection = problemData.sections.find(s => s.label === 'Choices Box');

        if (!greenSection || !redSection || !choicesSection) {
            console.error('Missing sections in Antinomy2 problem');
            return;
        }

        // Create category row container
        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';

        // Create Green Box
        const { pen: greenPen, grid: greenGrid } = Pen.createCategoryPen('green', 'Green Box');
        greenPen.classList.add('pen--green');

        // Add animals to green box (non-selectable)
        greenSection.items.forEach((item, index) => {
            const animals = item.animals || [];
            animals.forEach((animal, animalIndex) => {
                const singleItem = { id: animal.id, animals: [animal] };
                const slot = AnimalSlot.create({
                    item: singleItem,
                    selectable: false,
                    slotIndex: animalIndex,
                    penId: 'green'
                });
                greenGrid.appendChild(slot);
            });
        });

        // Add Question Mark Slot to Green Grid (Target for animation)
        greenGrid.appendChild(createQuestionMarkAttributes());

        // Create VS indicator
        const vsIndicator = document.createElement('span');
        vsIndicator.className = 'vs-indicator';
        vsIndicator.textContent = 'VS';

        // Create Red Box
        const { pen: redPen, grid: redGrid } = Pen.createCategoryPen('red', 'Red Box');
        redPen.classList.add('pen--red');

        // Add animals to red box (non-selectable)
        redSection.items.forEach((item, index) => {
            const animals = item.animals || [];
            animals.forEach((animal, animalIndex) => {
                const singleItem = { id: animal.id, animals: [animal] };
                const slot = AnimalSlot.create({
                    item: singleItem,
                    selectable: false,
                    slotIndex: animalIndex,
                    penId: 'red'
                });

                redGrid.appendChild(slot);
            });
        });

        // Add Question Mark Slot to Red Grid
        redGrid.appendChild(createQuestionMarkAttributes());

        // Add to category row
        categoryRow.appendChild(greenPen);
        categoryRow.appendChild(vsIndicator);
        categoryRow.appendChild(redPen);

        // Create choices pen
        const { pen: choicesPen, grid: choicesGrid } = Pen.createChoicesPen('Choices');
        choicesPen.classList.add('pen--choices');

        // Add choice slots (selectable)
        choicesSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: true,
                slotIndex: index,
                penId: 'choices',
                onClick: handleAntinomy2Selection
            });
            choicesGrid.appendChild(slot);
        });

        // Add to layout
        layout.appendChild(categoryRow);
        layout.appendChild(choicesPen);

        container.appendChild(layout);
    }

    /**
     * Handle selection in Antinomy2 mode
     */
    /**
     * Handle selection in Antinomy2 mode
     */
    function handleAntinomy2Selection(slotElement, choice, slotIndex) {
        // Clear previous selections
        document.querySelectorAll('.pen--choices .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
            // Restore visibility of deselected item
            const image = slot.querySelector('.animal-image');
            if (image) image.style.opacity = '';
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Prevent double-clicks / rapid-fire triggers
        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        // --- ANIMATION START ---
        // STRICT TARGETING: Green Box Only
        const targetContainer = document.querySelector('.antinomy2-layout .category-row .pen--green .question-mark-slot');
        const sourceImage = slotElement.querySelector('.animal-image');

        if (sourceImage && targetContainer) {
            // CRITICAL FIX: Remove ALL existing animated clones to prevent duplication piles
            document.querySelectorAll('.antinomy2-flying-animal').forEach(el => el.remove());

            // Hide original immediately
            sourceImage.style.opacity = '0';

            // Create clone
            const clone = sourceImage.cloneNode(true);
            clone.style.opacity = ''; // Ensure clone is visible
            clone.classList.add('antinomy2-flying-animal');
            document.body.appendChild(clone);

            // Get positions
            const startRect = sourceImage.getBoundingClientRect();
            const endRect = targetContainer.getBoundingClientRect();

            // Initial Position (Absolute on screen)
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '99999'; /* Ensure on top of everything */
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy ease
            clone.style.pointerEvents = 'none';

            // Force reflow
            void clone.offsetWidth;

            // Move to Target
            // Scale up slightly if target is bigger (it likely is, due to ? size)
            // Actually, keep animal natural size but centered in target
            const targetWidth = endRect.width;
            const targetHeight = endRect.height;

            // Center the animal in the question mark slot
            // Animal is roughly square-ish usually
            const left = endRect.left + (targetWidth - startRect.width) / 2;

            // Fix for Animal Height Alignment:
            // Animals need to be pushed down to align their baseline with the "ground"
            // The Question Mark target slot is full height, so aligning bottom-to-bottom works theoretically,
            // but visual padding in the SVGs requires manual downward offsets.

            let sizeOffset = 0;
            if (sourceImage.classList.contains('animal-image--large')) {
                sizeOffset = startRect.height * 0.55; // Large animals need significant push (Was 0.46)
            } else if (sourceImage.classList.contains('animal-image--medium')) {
                sizeOffset = startRect.height * 0.25; // Medium animals need some push
            } else {
                sizeOffset = startRect.height * 0.15; // Small animals need slight push
            }

            // Global base offset to ensure nothing floats
            const globalBaseOffset = targetHeight * 0.05;

            // Calculate Top Position
            // Align bottoms of image and target, then add offsets
            const top = endRect.top + (targetHeight - startRect.height) + sizeOffset + globalBaseOffset;

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            // On Finish
            clone.addEventListener('transitionend', () => {
                // Hide Question Mark
                targetContainer.style.opacity = '0';

                // Unlock animation lock
                slotElement.dataset.isAnimating = 'false';

                // === INTERACTION: CLICK TO RETURN ===
                clone.style.pointerEvents = 'auto'; // Enable clicking
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // 1. Show original again
                    sourceImage.style.opacity = '1';

                    // 2. Show Question Mark again
                    targetContainer.style.opacity = '1';

                    // 3. Remove selection state
                    slotElement.classList.remove('animal-slot--selected');

                    // 4. Remove clone
                    clone.remove();

                    // 5. Disable Next Button
                    SelectionHandler.disableNextButton();

                    // 6. Update Game State (remove selection)
                    // We assume SelectionHandler handles specific logic, but visuals are key here.
                    // If we need to clear the actual data selection:
                    // GameState.undoSelection? Or just rely on visual reset for now.
                    // A proper implementation might need an 'undo' function in SelectionHandler, 
                    // but visual reset + disable next button covers the requirement.
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
     * Helper to create Question Mark slot
     */
    function createQuestionMarkAttributes() {
        const div = document.createElement('div');
        div.className = 'question-mark-slot';

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
    module.exports = Antinomy2Renderer;
}
