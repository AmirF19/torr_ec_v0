/**
 * Antithesis Renderer Module
 * Renders the Antithesis game type layout
 */

const AntithesisRenderer = (function () {

    /**
     * Render Antithesis problem
     */
    function render(problemData, container) {
        container.innerHTML = '';

        // Create layout container
        const layout = document.createElement('div');
        layout.className = 'antithesis-layout';

        // SCOPED LAYOUT: Apply Flex Group layout for Question 3 onwards (where multi-animal groups appear)
        if (problemData.questionIndex >= 3) {
            layout.classList.add('antithesis-group-layout');
        }

        // CLEANUP: Remove any lingering flying animals from previous renders/sessions
        document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

        // Find sections
        const box1Section = problemData.sections.find(s => s.label === 'Box 1');
        const box3Section = problemData.sections.find(s => s.label === 'Box 3');
        const optionsSection = problemData.sections.find(s => s.label === 'Options Box');

        if (!box1Section || !box3Section || !optionsSection) {
            console.error('Missing sections in Antithesis problem');
            return;
        }

        // Create box row container
        const boxRow = document.createElement('div');
        boxRow.className = 'box-row';

        // Create Box 1
        const box1 = createSequenceBox('Box 1', box1Section.items[0], 1);

        // Create arrow
        const arrow1 = document.createElement('span');
        arrow1.className = 'arrow-indicator';
        arrow1.textContent = '→';

        // Create Box 2 (question mark - empty middle)
        const box2 = createQuestionMarkBox('?', 2);

        // Create arrow
        const arrow2 = document.createElement('span');
        arrow2.className = 'arrow-indicator';
        arrow2.textContent = '→';

        // Create Box 3
        const box3 = createSequenceBox('Box 3', box3Section.items[0], 3);

        // Add to box row
        boxRow.appendChild(box1);
        boxRow.appendChild(arrow1);
        boxRow.appendChild(box2);
        boxRow.appendChild(arrow2);
        boxRow.appendChild(box3);

        // Create options pen
        const { pen: optionsPen, grid: optionsGrid } = Pen.createChoicesPen('Options');
        optionsPen.classList.add('pen--options');

        // Add option slots (selectable)
        optionsSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: true,
                slotIndex: index,
                penId: 'options',
                onClick: handleAntithesisSelection
            });
            optionsGrid.appendChild(slot);
        });

        // Add to layout
        layout.appendChild(boxRow);
        layout.appendChild(optionsPen);

        container.appendChild(layout);
    }

    /**
     * Create a sequence box with animals
     */
    function createSequenceBox(label, item, boxNum) {
        const { pen, content } = Pen.createBoxPen(boxNum, label, false);
        pen.classList.add(`pen--box${boxNum}`);

        // Add animal slot
        const slot = AnimalSlot.create({
            item,
            selectable: false,
            slotIndex: 0,
            penId: `box-${boxNum}`
        });

        content.appendChild(slot);

        return pen;
    }

    /**
     * Create question mark placeholder box
     */
    function createQuestionMarkBox(label, boxNum) {
        const { pen, content, surface } = Pen.createBoxPen(boxNum, label, true);
        pen.classList.add(`pen--box${boxNum}`, 'pen--box-question');

        // OLD: CSS ::after based question mark
        // NEW: Real DOM element matching Antinomy

        // Ensure content is empty of default placeholders if any
        content.innerHTML = '';

        // Append Question Mark Slot
        content.appendChild(createQuestionMarkAttributes());

        return pen;
    }

    /**
     * Helper to create Question Mark slot (Matching Antinomy)
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

    /**
     * Handle selection in Antithesis mode
     * ADAPTED FROM ANTINOMY RENDERER
     */
    function handleAntithesisSelection(slotElement, choice, slotIndex) {
        // Clear previous selections
        document.querySelectorAll('.pen--options .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
            // Restore visibility of deselected item
            const group = slot.querySelector('.animal-group');
            if (group) group.style.opacity = '';
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Prevent double-clicks / rapid-fire triggers
        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        // --- ANIMATION START ---
        // STRICT TARGETING: Box 2 (Middle Box) Question Mark
        const targetContainer = document.querySelector('.antithesis-layout .pen--box2 .question-mark-slot');
        const sourceGroup = slotElement.querySelector('.animal-group');

        if (sourceGroup && targetContainer) {
            // Remove ALL existing animated clones
            document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

            // Hide original immediately
            sourceGroup.style.opacity = '0';

            // Get START position BEFORE cloning (crucial for correct rect)
            const startRect = sourceGroup.getBoundingClientRect();

            // Create clone of the GROUP
            const clone = sourceGroup.cloneNode(true);
            clone.style.opacity = ''; // Ensure clone is visible
            clone.classList.add('antinomy-flying-animal'); // Re-use Antinomy class for flying style

            // Check if we are in Group Layout (Q3+)
            const isGroupLayout = document.querySelector('.antithesis-layout').classList.contains('antithesis-group-layout');
            if (isGroupLayout) {
                clone.classList.add('antithesis-flying-group');

                // IMPORTANT: Ensure the clone's physical dimensions match the source 
                // exactly so that the flex children (which are now position: relative) 
                // render in the same arrangement as they did in the source slot.
                clone.style.display = 'flex';
                clone.style.flexDirection = 'row';
                clone.style.flexWrap = 'nowrap';
                clone.style.justifyContent = 'center';
                clone.style.alignItems = 'flex-end';
            }

            // FIX: Remove Flexbox overrides. Let CSS (.antinomy-flying-animal) handle layout.
            // The CSS creates a specific "Flying Context" matching the "Absolute Truth" of the pens.

            // Initial Position (Absolute on screen) - APPLY BEFORE APPENDING to avoid flash at 0,0
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '99999';
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy ease
            clone.style.pointerEvents = 'none';

            document.body.appendChild(clone);

            // Get END positions
            const endRect = targetContainer.getBoundingClientRect();

            // Force reflow
            void clone.offsetWidth;

            // Move to Target
            const targetWidth = endRect.width;
            const targetHeight = endRect.height;

            // Center the group in the target
            const left = endRect.left + (targetWidth - startRect.width) / 2;

            // Determine size category from children (assume uniform or take largest)
            // NO LONGER NEEDED FOR CENTERING LOGIC
            // let sizeOffset = 0;
            // ...

            // Fix for Height Alignment: CENTER-TO-CENTER
            // We want the animal to float in the exact center of the Question Box

            const centerY_Target = endRect.top + (targetHeight / 2);
            const centerY_Animal = startRect.height / 2;

            // Shift down by 20% of target height per user request (Total 20%)
            const verticalOffset = targetHeight * 0.20;

            const top = centerY_Target - centerY_Animal + verticalOffset;

            // Enforce final dimensions to prevent stacking or squishing in the new container
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            // On Finish
            clone.addEventListener('transitionend', () => {
                // Hide Question Mark
                targetContainer.style.opacity = '0';

                // Unlock animation lock
                slotElement.dataset.isAnimating = 'false';

                // Ensure the layout remains correct statically
                clone.style.display = 'flex';
                clone.style.flexDirection = 'row';
                clone.style.flexWrap = 'nowrap';
                clone.style.justifyContent = 'center';
                clone.style.alignItems = 'flex-end';

                // === INTERACTION: CLICK TO RETURN ===
                clone.style.pointerEvents = 'auto'; // Enable clicking
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    // 1. Show original again
                    sourceGroup.style.opacity = '1';

                    // 2. Show Question Mark again
                    targetContainer.style.opacity = '1';

                    // 3. Remove selection state
                    slotElement.classList.remove('animal-slot--selected');

                    // 4. Remove clone
                    clone.remove();

                    // 5. Disable Next Button
                    SelectionHandler.disableNextButton();
                };

                clone.addEventListener('click', returnHandler, { once: true });

            }, { once: true });
        }

        // Record selection
        GameState.recordSelection(choice, slotIndex);

        // Enable next button
        SelectionHandler.enableNextButton();

        // Update data panel
        SelectionHandler.updateDataPanel();
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
    module.exports = AntithesisRenderer;
}
