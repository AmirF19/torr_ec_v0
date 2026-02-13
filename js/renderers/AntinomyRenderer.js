const AntinomyRenderer = (function () {

    function render(problemData, container) {
        container.innerHTML = '';

        const layout = document.createElement('div');
        layout.className = 'antinomy-layout';

        document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

        const greenSection = problemData.sections.find(s => s.label === 'Green Box');
        const redSection = problemData.sections.find(s => s.label === 'Red Box');
        const choicesSection = problemData.sections.find(s => s.label === 'Choices Box');

        if (!greenSection || !redSection || !choicesSection) {
            console.error('Missing sections in Antinomy problem');
            return;
        }

        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';

        const { pen: greenPen, grid: greenGrid } = Pen.createCategoryPen('green', 'Green Box');
        greenPen.classList.add('pen--green');

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

        greenGrid.appendChild(createQuestionMarkAttributes());

        const vsIndicator = document.createElement('span');
        vsIndicator.className = 'vs-indicator';
        vsIndicator.textContent = 'VS';

        const { pen: redPen, grid: redGrid } = Pen.createCategoryPen('red', 'Red Box');
        redPen.classList.add('pen--red');

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

        redGrid.appendChild(createQuestionMarkAttributes());

        categoryRow.appendChild(greenPen);
        categoryRow.appendChild(vsIndicator);
        categoryRow.appendChild(redPen);

        const { pen: choicesPen, grid: choicesGrid } = Pen.createChoicesPen('Choices');
        choicesPen.classList.add('pen--choices');

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

        layout.appendChild(categoryRow);
        layout.appendChild(choicesPen);

        container.appendChild(layout);
    }

    function handleAntinomySelection(slotElement, choice, slotIndex) {
        document.querySelectorAll('.pen--choices .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
            const image = slot.querySelector('.animal-image');
            if (image) image.style.opacity = '';
        });

        slotElement.classList.add('animal-slot--selected');

        if (slotElement.dataset.isAnimating === 'true') return;
        slotElement.dataset.isAnimating = 'true';

        const targetContainer = document.querySelector('.antinomy-layout .category-row .pen--green .question-mark-slot');
        const sourceImage = slotElement.querySelector('.animal-image');

        if (sourceImage && targetContainer) {
            document.querySelectorAll('.antinomy-flying-animal').forEach(el => el.remove());

            sourceImage.style.opacity = '0';

            const clone = sourceImage.cloneNode(true);
            clone.style.opacity = '';
            clone.classList.add('antinomy-flying-animal');
            document.body.appendChild(clone);

            const startRect = sourceImage.getBoundingClientRect();
            const endRect = targetContainer.getBoundingClientRect();

            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '99999';
            clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            clone.style.pointerEvents = 'none';

            void clone.offsetWidth;

            const targetWidth = endRect.width;
            const targetHeight = endRect.height;

            const left = endRect.left + (targetWidth - startRect.width) / 2;

            let sizeOffset = 0;
            if (sourceImage.classList.contains('animal-image--large')) {
                sizeOffset = startRect.height * 0.5;
            } else if (sourceImage.classList.contains('animal-image--medium')) {
                sizeOffset = startRect.height * 0.42;
            } else {
                sizeOffset = startRect.height * 0.23;
            }

            const globalBaseOffset = targetHeight * 0.05;

            const top = endRect.top + (targetHeight - startRect.height) + sizeOffset + globalBaseOffset;

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

                    sourceImage.style.opacity = '1';
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

    function createQuestionMarkAttributes() {
        const div = document.createElement('div');
        div.className = 'question-mark-slot';

        const span = document.createElement('span');
        span.className = 'question-mark-text';
        span.textContent = '?';

        div.appendChild(span);
        return div;
    }

    return {
        render
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntinomyRenderer;
}
