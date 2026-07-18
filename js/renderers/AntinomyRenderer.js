/**
 * Antinomy Renderer Module
 * Renders the Antinomy game type layout (MIGRATED FROM ANTINOMY2)
 */

const AntinomyRenderer = (function () {

    /**
     * Render Antinomy problem
     */
    function render(problemData, container) {
        container.innerHTML = '';

        // Create layout container - uses antinomy-layout class
        const layout = document.createElement('div');
        layout.className = 'antinomy-layout';

        // CLEANUP: Remove any lingering flying animals from previous renders/sessions
        document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

        // Find sections
        const greenSection = problemData.sections.find(s => s.label === 'Green Box');
        const redSection = problemData.sections.find(s => s.label === 'Red Box');
        const choicesSection = problemData.sections.find(s => s.label === 'Choices Box');

        if (!greenSection || !redSection || !choicesSection) {
            console.error('Missing sections in Antinomy problem');
            return;
        }

        // Create category row container
        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';

        // Create Green Box
        // Create Green Box
        const { pen: greenPen, grid: greenGrid } = Pen.createCategoryPen('green', 'Green Box', Config.images.elements.penGreen);

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
        // Create Red Box
        const { pen: redPen, grid: redGrid } = Pen.createCategoryPen('red', 'Red Box', Config.images.elements.penRed);

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

        // Add Question Mark Slot to Red Grid - REMOVED per user request
        // redGrid.appendChild(createQuestionMarkAttributes());

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
                onClick: handleAntinomySelection
            });
            choicesGrid.appendChild(slot);
        });

        // Add to layout
        layout.appendChild(categoryRow);
        layout.appendChild(choicesPen);

        container.appendChild(layout);

        // Runs after attach so rects are measurable
        staggerChoiceBaselines(layout);
    }

    /**
     * Stagger the choices-pen animals into a clear zig-zag: drawn feet
     * alternate between a back line and a front line inside the dirt.
     * The old margin-based stagger got drowned out by animal size and SVG
     * padding differences.
     */
    function staggerChoiceBaselines(layout) {
        const pen = layout.querySelector('.pen-surface--choices');
        const ground = pen ? pen.querySelector('.pen-ground') : null;
        if (!ground) return;
        const slots = [...pen.querySelectorAll('.animal-slot')];
        slots.forEach((slot, i) => {
            const img = slot.querySelector('.animal-image');
            if (!img) return;
            // Hidden until aligned in its own load event, so it never paints
            // at the CSS fallback position and then moves
            img.style.visibility = 'hidden';
            AnimalBaseline.whenLoaded(img, () => {
                const g = ground.getBoundingClientRect();
                // 1st, 3rd, ... slot on the back line; 2nd, 4th, ... in front.
                // The dirt is drawn in perspective and its front edge rises
                // toward the right corner, so the last (far-right) slot uses a
                // higher front line to stay on the dirt instead of the fence.
                let frac = i % 2 === 0 ? 0.38 : 0.66;
                if (i === slots.length - 1 && frac === 0.66) frac = 0.5;
                const line = g.top + g.height * frac;
                const feet = img.getBoundingClientRect().bottom - AnimalBaseline.padPx(img);
                const current = parseFloat(getComputedStyle(img).bottom) || 0;
                img.style.transition = 'none'; // the base .animal-image transition:all would animate this
                img.style.setProperty(
                    'bottom',
                    `${Math.round((current + (feet - line)) * 10) / 10}px`,
                    'important'
                );
                img.style.visibility = '';
            });
        });
    }

    /**
     * Handle selection in Antinomy mode
     */
    function handleAntinomySelection(slotElement, choice, slotIndex) {
        // Clear previous selections. Visibility of the deselected animal is
        // restored by the clone handling below (fly-back or instant cleanup).
        document.querySelectorAll('.pen--choices .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Prevent double-clicks / rapid-fire triggers
        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        // --- ANIMATION START ---
        // STRICT TARGETING: Green Box Only (Updated for .antinomy-layout)
        const targetContainer = document.querySelector('.antinomy-layout .category-row .pen--green .question-mark-slot');
        const sourceImage = slotElement.querySelector('.animal-image');

        if (sourceImage && targetContainer) {
            // Send any previously placed animal back to its choice slot.
            // Landed clones fly back (mirrors Anomaly's swap animation);
            // mid-flight clones are cleaned up instantly, restoring their source.
            document.querySelectorAll('.antinomy-flying-animal').forEach(el => {
                if (el.dataset.landed === 'true') {
                    targetContainer.style.opacity = '1';
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
            const endRect = targetContainer.getBoundingClientRect();

            // Create clone
            const clone = sourceImage.cloneNode(true);
            clone.style.opacity = ''; // Ensure clone is visible
            clone.classList.add('antinomy-flying-animal');

            // Lock the clone to its rendered pixel size so CSS rules don't
            // resize it when it moves to a different context
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.maxWidth = 'none';
            clone.style.maxHeight = 'none';

            // Fixed at the start position before appending, so the clone
            // never participates in layout
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.zIndex = '99999'; /* Ensure on top of everything */
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy ease
            clone.style.pointerEvents = 'none';

            // Remember where the clone came from so it can fly back on undo/switch
            clone._returnInfo = {
                sourceEl: sourceImage,
                slotEl: slotElement,
                startLeft: startRect.left,
                startTop: startRect.top
            };

            document.body.appendChild(clone);

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
            // "Feet should be aligned with the feet of the lowest animal"
            // The lowest animal is on the baseline (bottom of the slot).
            // We align the bottom of the flying image to the bottom of the target slot.

            // 1. Calculate Base Top (Align Bottoms)
            // endRect.bottom is the bottom of the slot.
            // startRect.height is the height of the animal.
            const baseTop = endRect.bottom - startRect.height;

            // 2. Size Offsets (Match CSS values in antinomy.css)
            // Large: bottom: -15% (pushes down) -> add 15% of slot height
            // Small: bottom: 8% (pushes up) -> subtract 8% of slot height
            // Medium: bottom: 0% -> 0

            let sizeOffset = 0;
            const slotHeight = targetHeight; // endRect.height

            if (sourceImage.classList.contains('animal-image--large')) {
                sizeOffset = slotHeight * 0.15;
            } else if (sourceImage.classList.contains('animal-image--small')) {
                sizeOffset = -1 * (slotHeight * 0.12);
            } else {
                // Medium or default
                sizeOffset = 0;
            }

            // 3. Stagger Offsets (Match CSS values in antinomy.css)
            // .animal-slot:nth-child(odd) .animal-image { margin-bottom: 35% !important; }
            // If target slot is Odd (1st, 3rd...), it is lifted UP by 35%.
            // We need to find the index of targetContainer to know if it's odd or even.

            let staggerOffset = 0;

            // Find index of targetContainer in its parent
            const parent = targetContainer.parentElement;
            if (parent) {
                const children = Array.from(parent.children);
                const index = children.indexOf(targetContainer);

                // CSS nth-child is 1-based. JS index is 0-based.
                // If index is 0 (1st child) -> Odd -> Lift
                // If index is 1 (2nd child) -> Even -> No Lift
                // If index is 2 (3rd child) -> Odd -> Lift
                // So if (index % 2 === 0), it corresponds to Odd nth-child.

                if (index % 2 === 0) {
                    // Only apply stagger if it's NOT the question mark slot
                    // The Question Mark slot sits on the baseline (flex-end), so we shouldn't lift the animation.
                    if (!targetContainer.classList.contains('question-mark-slot')) {
                        staggerOffset = -1 * (slotHeight * 0.35);
                    }
                }
            }

            // Global base offset
            // Reset to 0 as we want to align with the "lower animals" (baseline)
            const globalBaseOffset = 0;

            // Calculate Final Top Position
            const top = baseTop + sizeOffset + staggerOffset + globalBaseOffset;

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            // On Finish
            clone.addEventListener('transitionend', () => {
                // Hide Question Mark
                targetContainer.style.opacity = '0';

                // Unlock animation lock
                slotElement.dataset.isAnimating = 'false';
                clone.dataset.landed = 'true';

                // === INTERACTION: CLICK TO RETURN ===
                clone.style.pointerEvents = 'auto'; // Enable clicking
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // Show Question Mark again and clear the selection state
                    targetContainer.style.opacity = '1';
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
     * Helper to create Question Mark slot
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
    module.exports = AntinomyRenderer;
}
