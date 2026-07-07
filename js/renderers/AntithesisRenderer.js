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

        // SCOPED LAYOUT: Apply Flex Group layout for Question 2 onwards (where multi-animal groups appear)
        // Note: questionIndex is 1-based and includes the Sample problem.
        // Sample = 1, Question 1 = 2, Question 2 = 3. 
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

        // Create Box 2 (question mark - empty middle)
        const box2 = createQuestionMarkBox('?', 2);

        // Create Box 3
        const box3 = createSequenceBox('Box 3', box3Section.items[0], 3);

        // Add to box row (no arrows - hidden per user request)
        boxRow.appendChild(box1);
        boxRow.appendChild(box2);
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

        // Runs after attach so rects are measurable
        finalizeBaselines(layout);
    }

    /**
     * Align all baselines once every image is loaded, then reveal the
     * animals together. A late-loading image reflows the content-sized pens
     * and moves animals that are already visible, so nothing is shown until
     * the layout is final.
     */
    function finalizeBaselines(layout) {
        const imgs = [...layout.querySelectorAll('.animal-image')];
        if (!imgs.length) return;
        imgs.forEach(img => { img.style.visibility = 'hidden'; });

        let pending = imgs.length;
        let finished = false;
        const done = () => {
            if (finished) return;
            finished = true;
            alignBoxBaselines(layout);
            levelGroupBaselines(layout);
            imgs.forEach(img => { img.style.visibility = ''; });
        };
        imgs.forEach(img => AnimalBaseline.whenLoaded(img, () => {
            if (--pending === 0) done();
        }));
        // Safety net: never leave the problem hidden if an image fails to load
        setTimeout(done, 4000);
    }

    /**
     * Pin every box-pen animal's drawn feet to the vertical middle of the
     * pen ground, same as the Analogy pens. Applied as a delta on top of the
     * CSS position so it works in both the absolute single-animal context
     * and the relative flex group context.
     */
    function alignBoxBaselines(layout) {
        ['.pen--box1', '.pen--box2', '.pen--box3'].forEach(penSel => {
            const pen = layout.querySelector(penSel);
            const ground = pen ? pen.querySelector('.pen-ground') : null;
            if (!ground) return;
            const gRect = ground.getBoundingClientRect();
            const groundMid = gRect.top + gRect.height / 2;
            pen.querySelectorAll('.animal-image').forEach(img => {
                const feet = img.getBoundingClientRect().bottom - AnimalBaseline.padPx(img);
                const current = parseFloat(getComputedStyle(img).bottom) || 0;
                img.style.transition = 'none'; // the base .animal-image transition:all would animate this
                // positive delta = feet currently below the line
                img.style.setProperty(
                    'bottom',
                    `${Math.round((current + (feet - groundMid)) * 10) / 10}px`,
                    'important'
                );
            });
        });
    }

    /**
     * Level the drawn feet of every multi-animal group. Aligning the image
     * boxes (flex-end) is not enough: each SVG carries a different amount of
     * empty space below the drawn feet, so box alignment leaves visible steps
     * between group members. This measures each member's actual feet line
     * (AnimalBaseline) and equalizes the group at its average line, composing
     * with whatever offsets the CSS already applies.
     */
    function levelGroupBaselines(layout) {
        // Options pen only; the box pens are pinned by alignBoxBaselines
        layout.querySelectorAll('.pen--options .animal-group').forEach(group => {
            const imgs = [...group.querySelectorAll('.animal-image')];
            if (imgs.length < 2) return;
            levelGroup(imgs);
        });
    }

    /**
     * Equalize the drawn-feet line of a set of sibling images in place.
     * Also run on the flying clone, whose flex context differs from the
     * options pen the offsets were computed in.
     */
    function levelGroup(imgs) {
        const feet = imgs.map(im =>
            im.getBoundingClientRect().bottom - AnimalBaseline.padPx(im)
        );
        const target = feet.reduce((a, b) => a + b, 0) / feet.length;

        imgs.forEach((im, i) => {
            const current = parseFloat(getComputedStyle(im).bottom) || 0;
            // positive lift = feet currently below the target line
            const lift = feet[i] - target;
            im.style.transition = 'none'; // the base .animal-image transition:all would animate this
            im.style.setProperty(
                'bottom',
                `${Math.round((current + lift) * 10) / 10}px`,
                'important'
            );
        });
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
        // Clear previous selections. Visibility of the deselected animal is
        // restored by the clone handling below (fly-back or instant cleanup).
        document.querySelectorAll('.pen--options .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Prevent double-clicks / rapid-fire triggers
        if (slotElement.dataset.isAnimating === 'true' || GameState.getUI('isAnimating')) return;
        slotElement.dataset.isAnimating = 'true';
        GameState.setUI('isAnimating', true);

        // --- ANIMATION START ---
        // STRICT TARGETING: Box 2 (Middle Box) Question Mark
        const targetContainer = document.querySelector('.antithesis-layout .pen--box2 .question-mark-slot');
        const sourceGroup = slotElement.querySelector('.animal-group');

        if (sourceGroup && targetContainer) {
            // Send any previously placed animal back to its option slot.
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
            sourceGroup.style.opacity = '0';

            // Get START position BEFORE cloning (crucial for correct rect)
            const startRect = sourceGroup.getBoundingClientRect();

            // Create clone of the GROUP
            const clone = sourceGroup.cloneNode(true);
            clone.style.opacity = ''; // Ensure clone is visible
            clone.classList.add('antinomy-flying-animal'); // Re-use Antinomy class for flying style

            // FIX: Lock each animal image to its current rendered pixel size
            // so CSS rules don't resize it when the clone moves to a different context
            const sourceImages = sourceGroup.querySelectorAll('.animal-image');
            const cloneImages = clone.querySelectorAll('.animal-image');
            sourceImages.forEach((srcImg, idx) => {
                const imgRect = srcImg.getBoundingClientRect();
                if (cloneImages[idx]) {
                    cloneImages[idx].style.width = `${imgRect.width}px`;
                    cloneImages[idx].style.height = `${imgRect.height}px`;
                    cloneImages[idx].style.maxWidth = 'none';
                    cloneImages[idx].style.maxHeight = 'none';
                }
            });

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

            // Remember where the clone came from so it can fly back on undo/switch
            clone._returnInfo = {
                sourceEl: sourceGroup,
                slotEl: slotElement,
                startLeft: startRect.left,
                startTop: startRect.top
            };

            document.body.appendChild(clone);

            // Get END positions
            const endRect = targetContainer.getBoundingClientRect();

            // Force reflow
            void clone.offsetWidth;

            // Re-level inside the clone's own flex context; the offsets
            // copied from the options pen don't transfer 1:1
            const cloneImgList = [...clone.querySelectorAll('.animal-image')];
            if (cloneImgList.length > 1) {
                levelGroup(cloneImgList);
            }

            // Move to Target
            const targetWidth = endRect.width;

            // Center the group horizontally in the target
            const left = endRect.left + (targetWidth - startRect.width) / 2;

            // Land the DRAWN feet on the Box 2 baseline: the vertical middle
            // of its ground (the same line alignBoxBaselines pins the Box 1
            // and Box 3 animals to). The feet line is measured on the clone
            // at its start position; after levelGroup all members share it.
            const cloneRect = clone.getBoundingClientRect();
            const feetY = Math.max(...cloneImgList.map(im =>
                im.getBoundingClientRect().bottom - AnimalBaseline.padPx(im)
            ));
            const feetOffsetFromTop = feetY - cloneRect.top;
            const box2Ground = document
                .querySelector('.antithesis-layout .pen--box2 .pen-ground')
                .getBoundingClientRect();
            const top = (box2Ground.top + box2Ground.height / 2) - feetOffsetFromTop;

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
                GameState.setUI('isAnimating', false);
                clone.dataset.landed = 'true';

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

                    // Show Question Mark again and clear the selection state
                    targetContainer.style.opacity = '1';
                    slotElement.classList.remove('animal-slot--selected');
                    SelectionHandler.disableNextButton();

                    // Fly the animal back to its option slot (matches Anomaly's
                    // animated return); visibility is restored when it lands.
                    GameState.setUI('isAnimating', true);
                    AnimationHandler.flyCloneBack(clone, () => {
                        GameState.setUI('isAnimating', false);
                    });
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
