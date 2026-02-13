const SelectionHandler = (function () {

    let selectionDebounceTimer = null;

    function handleSelection(slotElement, choice, slotIndex) {
        if (selectionDebounceTimer) {
            return;
        }

        selectionDebounceTimer = setTimeout(() => {
            selectionDebounceTimer = null;
        }, Config.timing.selectionDebounce);

        if (GameState.getUI('isAnimating')) {
            return;
        }

        const currentOutAnimal = GameState.get('outPenAnimal');
        const outPenSlot = document.getElementById('out-pen-slot');

        if (!outPenSlot) {
            console.error('Out pen slot not found');
            return;
        }

        GameState.setUI('isAnimating', true);

        if (currentOutAnimal) {
            const originalPos = GameState.getOriginalPosition(
                currentOutAnimal.id || currentOutAnimal.animals?.[0]?.id
            );

            if (originalPos) {
                const originalSlot = document.querySelector(
                    `.pen--main [data-slot-index="${originalPos.slotIndex}"]`
                );

                if (originalSlot) {
                    AnimationHandler.swapAnimals(
                        slotElement,
                        outPenSlot,
                        originalSlot,
                        choice,
                        currentOutAnimal,
                        () => {
                            completeSelection(slotElement, choice, slotIndex, outPenSlot, originalSlot, currentOutAnimal);
                        }
                    );
                    return;
                }
            }
        }

        AnimationHandler.moveToOutPen(slotElement, outPenSlot, choice, () => {
            completeSimpleSelection(slotElement, choice, slotIndex, outPenSlot);
        });
    }

    function completeSelection(sourceSlot, choice, slotIndex, outPenSlot, returnSlot, returningAnimal) {
        AnimalSlot.clear(sourceSlot);
        sourceSlot.classList.remove('animal-slot--selectable');

        AnimalSlot.updateContent(returnSlot, returningAnimal);
        returnSlot.classList.add('animal-slot--selectable', 'animal-slot--populated');
        returnSlot.dataset.choiceData = JSON.stringify(returningAnimal);
        returnSlot.dataset.choiceId = returningAnimal.id;

        reattachClickHandler(returnSlot);

        AnimalSlot.updateContent(outPenSlot, choice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');

        const outPenSurface = outPenSlot.closest('.pen-surface');
        if (outPenSurface) {
            Pen.setEmpty(outPenSurface, false);
        }

        GameState.setOutPenAnimal(choice, slotIndex);
        GameState.recordSelection(choice, slotIndex);

        clearAllSelections();

        AnimalSlot.pop(outPenSlot);

        enableNextButton();

        updateDataPanel();

        GameState.setUI('isAnimating', false);
    }

    function completeSimpleSelection(sourceSlot, choice, slotIndex, outPenSlot) {
        AnimalSlot.clear(sourceSlot);
        sourceSlot.classList.remove('animal-slot--selectable');

        AnimalSlot.updateContent(outPenSlot, choice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');

        const outPenSurface = outPenSlot.closest('.pen-surface');
        if (outPenSurface) {
            Pen.setEmpty(outPenSurface, false);
        }

        GameState.setOutPenAnimal(choice, slotIndex);
        GameState.recordSelection(choice, slotIndex);

        clearAllSelections();

        AnimalSlot.pop(outPenSlot);

        enableNextButton();

        updateDataPanel();

        GameState.setUI('isAnimating', false);
    }

    function reattachClickHandler(slot) {
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);

        newSlot.addEventListener('click', (e) => {
            e.preventDefault();
            const choiceData = JSON.parse(newSlot.dataset.choiceData || 'null');
            const slotIndex = parseInt(newSlot.dataset.slotIndex);
            if (choiceData && !newSlot.classList.contains('animal-slot--animating')) {
                handleSelection(newSlot, choiceData, slotIndex);
            }
        });

        newSlot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const choiceData = JSON.parse(newSlot.dataset.choiceData || 'null');
                const slotIndex = parseInt(newSlot.dataset.slotIndex);
                if (choiceData && !newSlot.classList.contains('animal-slot--animating')) {
                    handleSelection(newSlot, choiceData, slotIndex);
                }
            }
        });

        return newSlot;
    }

    function clearAllSelections() {
        document.querySelectorAll('.animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });
    }

    function enableNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.add('arrow-btn--pulse');

            setTimeout(() => {
                nextBtn.classList.remove('arrow-btn--pulse');
            }, 1600);
        }

        GameState.setUI('nextButtonEnabled', true);
    }

    function disableNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.classList.remove('arrow-btn--pulse');
        }

        GameState.setUI('nextButtonEnabled', false);
    }

    function updateDataPanel() {
        const panel = document.getElementById('current-data');
        if (!panel) return;

        const progress = GameState.getProgress();
        const selectionCount = GameState.get('selectionCount');
        const problemStartTime = GameState.get('problemStartTime');
        const currentProblem = GameState.get('currentProblem');

        const elapsedTime = problemStartTime ?
            Math.round((Date.now() - problemStartTime) / 1000) : 0;

        panel.innerHTML = `
            <p><strong>Problems completed:</strong> ${progress.completed}</p>
            <p><strong>Current selections:</strong> ${selectionCount}</p>
            <p><strong>Current time:</strong> ${elapsedTime}s</p>
            ${currentProblem ? `<p><strong>Anomaly type:</strong> ${currentProblem.type} - ${currentProblem.label}</p>` : ''}
        `;
    }

    function bindToContainer(container) {
        const selectableSlots = container.querySelectorAll('.animal-slot--selectable');

        selectableSlots.forEach((slot, index) => {
            slot.addEventListener('click', (e) => {
                e.preventDefault();
                const choiceData = JSON.parse(slot.dataset.choiceData || 'null');
                const slotIndex = parseInt(slot.dataset.slotIndex);
                if (choiceData && !slot.classList.contains('animal-slot--animating')) {
                    handleSelection(slot, choiceData, slotIndex);
                }
            });

            slot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const choiceData = JSON.parse(slot.dataset.choiceData || 'null');
                    const slotIndex = parseInt(slot.dataset.slotIndex);
                    if (choiceData && !slot.classList.contains('animal-slot--animating')) {
                        handleSelection(slot, choiceData, slotIndex);
                    }
                }
            });
        });
    }

    return {
        handleSelection,
        clearAllSelections,
        enableNextButton,
        disableNextButton,
        updateDataPanel,
        bindToContainer,
        reattachClickHandler
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionHandler;
}
