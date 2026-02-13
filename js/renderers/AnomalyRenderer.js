const AnomalyRenderer = (function () {

    function render(problemData, container) {
        container.innerHTML = '';

        const layout = document.createElement('div');
        layout.className = 'anomaly-layout';

        const animalsSection = problemData.sections.find(s => s.selectable);
        if (!animalsSection) {
            console.error('No selectable section found in Anomaly problem');
            return;
        }

        const numAnimals = animalsSection.items.length;
        const gridClass = numAnimals <= 4 ? 'animal-grid--4col' : 'animal-grid--anomaly';

        const { pen: mainPen, grid: mainGrid } = Pen.createMainPen('Pen');
        mainGrid.className = `animal-grid ${gridClass}`;
        mainPen.classList.add('pen--main');

        animalsSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: true,
                slotIndex: index,
                penId: 'main',
                onClick: SelectionHandler.handleSelection
            });
            mainGrid.appendChild(slot);
        });

        const { pen: outPen, outSlot } = Pen.createOutPen('Does Not Belong');
        outPen.classList.add('pen--out');

        outSlot.addEventListener('click', handleOutPenClick);

        layout.appendChild(mainPen);
        layout.appendChild(outPen);

        container.appendChild(layout);
    }

    function handleOutPenClick(e) {
        const outSlot = e.currentTarget;

        if (!outSlot.classList.contains('animal-slot--populated')) {
            return;
        }

        if (GameState.getUI('isAnimating')) {
            return;
        }

        const currentOutAnimal = GameState.get('outPenAnimal');
        if (!currentOutAnimal) return;

        const originalPos = GameState.getOriginalPosition(
            currentOutAnimal.id || currentOutAnimal.animals?.[0]?.id
        );

        if (!originalPos) return;

        const originalSlot = document.querySelector(
            `.pen--main [data-slot-index="${originalPos.slotIndex}"]`
        );

        if (!originalSlot) return;

        GameState.setUI('isAnimating', true);

        AnimationHandler.returnToOriginal(outSlot, originalSlot, currentOutAnimal, () => {
            AnimalSlot.updateContent(originalSlot, currentOutAnimal);
            originalSlot.classList.add('animal-slot--selectable', 'animal-slot--populated');
            originalSlot.dataset.choiceData = JSON.stringify(currentOutAnimal);
            originalSlot.dataset.choiceId = currentOutAnimal.id;

            SelectionHandler.reattachClickHandler(originalSlot);

            AnimalSlot.clear(outSlot);
            outSlot.classList.add('animal-slot--empty');
            outSlot.classList.remove('animal-slot--populated');

            const outPenSurface = outSlot.closest('.pen-surface');
            if (outPenSurface) {
                Pen.setEmpty(outPenSurface, true);
            }

            GameState.setOutPenAnimal(null, null);

            SelectionHandler.disableNextButton();

            SelectionHandler.updateDataPanel();

            GameState.setUI('isAnimating', false);
        });
    }

    function getGridColumns(numAnimals) {
        if (numAnimals <= 3) return 3;
        if (numAnimals <= 4) return 4;
        return 5;
    }

    return {
        render,
        getGridColumns
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnomalyRenderer;
}
