const AntithesisRenderer = (function () {

    function render(problemData, container) {
        container.innerHTML = '';

        const layout = document.createElement('div');
        layout.className = 'antithesis-layout';

        document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

        const box1Section = problemData.sections.find(s => s.label === 'Box 1');
        const box3Section = problemData.sections.find(s => s.label === 'Box 3');
        const optionsSection = problemData.sections.find(s => s.label === 'Options Box');

        if (!box1Section || !box3Section || !optionsSection) {
            console.error('Missing sections in Antithesis problem');
            return;
        }

        const boxRow = document.createElement('div');
        boxRow.className = 'box-row';

        const box1 = createSequenceBox('Box 1', box1Section.items[0], 1);

        const arrow1 = document.createElement('span');
        arrow1.className = 'arrow-indicator';
        arrow1.textContent = '\u2192';

        const box2 = createQuestionMarkBox('?', 2);

        const arrow2 = document.createElement('span');
        arrow2.className = 'arrow-indicator';
        arrow2.textContent = '\u2192';

        const box3 = createSequenceBox('Box 3', box3Section.items[0], 3);

        boxRow.appendChild(box1);
        boxRow.appendChild(arrow1);
        boxRow.appendChild(box2);
        boxRow.appendChild(arrow2);
        boxRow.appendChild(box3);

        const { pen: optionsPen, grid: optionsGrid } = Pen.createChoicesPen('Options');
        optionsPen.classList.add('pen--options');

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

        layout.appendChild(boxRow);
        layout.appendChild(optionsPen);

        container.appendChild(layout);
    }

    function createSequenceBox(label, item, boxNum) {
        const { pen, content } = Pen.createBoxPen(boxNum, label, false);
        pen.classList.add(`pen--box${boxNum}`);

        const slot = AnimalSlot.create({
            item,
            selectable: false,
            slotIndex: 0,
            penId: `box-${boxNum}`
        });

        content.appendChild(slot);

        return pen;
    }

    function createQuestionMarkBox(label, boxNum) {
        const { pen, content, surface } = Pen.createBoxPen(boxNum, label, true);
        pen.classList.add(`pen--box${boxNum}`, 'pen--box-question');

        content.innerHTML = '';
        content.appendChild(createQuestionMarkAttributes());

        return pen;
    }

    function createQuestionMarkAttributes() {
        const div = document.createElement('div');
        div.className = 'question-mark-slot';

        const span = document.createElement('span');
        span.className = 'question-mark-text';
        span.textContent = '?';

        div.appendChild(span);
        return div;
    }

    function handleAntithesisSelection(slotElement, choice, slotIndex) {
        document.querySelectorAll('.pen--options .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
            const group = slot.querySelector('.animal-group');
            if (group) group.style.opacity = '';
        });

        slotElement.classList.add('animal-slot--selected');

        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        const targetContainer = document.querySelector('.antithesis-layout .pen--box2 .question-mark-slot');
        const sourceGroup = slotElement.querySelector('.animal-group');

        if (sourceGroup && targetContainer) {
            document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

            sourceGroup.style.opacity = '0';

            const startRect = sourceGroup.getBoundingClientRect();

            const clone = sourceGroup.cloneNode(true);
            clone.style.opacity = '';
            clone.classList.add('antinomy-flying-animal');

            clone.style.display = 'flex';
            clone.style.flexDirection = 'row';
            clone.style.alignItems = 'flex-end';
            clone.style.justifyContent = 'center';

            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '99999';
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            clone.style.pointerEvents = 'none';

            document.body.appendChild(clone);

            const endRect = targetContainer.getBoundingClientRect();

            void clone.offsetWidth;

            const targetWidth = endRect.width;
            const targetHeight = endRect.height;

            const left = endRect.left + (targetWidth - startRect.width) / 2;
            const top = endRect.top + (targetHeight - startRect.height);

            clone.style.left = `${left}px`;
            clone.style.top = `${top}px`;

            clone.addEventListener('transitionend', () => {
                targetContainer.style.opacity = '0';
                slotElement.dataset.isAnimating = 'false';

                clone.style.pointerEvents = 'auto';
                clone.style.cursor = 'pointer';

                const returnHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    sourceGroup.style.opacity = '1';
                    targetContainer.style.opacity = '1';
                    slotElement.classList.remove('animal-slot--selected');
                    clone.remove();
                    SelectionHandler.disableNextButton();
                };

                clone.addEventListener('click', returnHandler, { once: true });

            }, { once: true });
        }

        GameState.recordSelection(choice, slotIndex);

        SelectionHandler.enableNextButton();

        SelectionHandler.updateDataPanel();
    }

    return {
        render
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntithesisRenderer;
}
