const AnalogyRenderer = (function () {

    function render(problemData, container) {
        container.innerHTML = '';

        const layout = document.createElement('div');
        layout.className = 'analogy-layout';

        const questionSection = problemData.sections.find(s => s.label === 'Question Box');
        const answersSection = problemData.sections.find(s => s.label === 'Answer Choices');

        if (!questionSection || !answersSection) {
            console.error('Missing sections in Analogy problem');
            return;
        }

        const { pen: questionPen, grid: questionGrid } = Pen.createQuestionPen('Question Box');
        questionPen.classList.add('pen--question');

        questionSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: false,
                slotIndex: index,
                penId: 'question'
            });
            questionGrid.appendChild(slot);
        });

        const gateContainer = document.createElement('div');
        gateContainer.className = 'gate-container';

        const gateImg = document.createElement('img');
        gateImg.className = 'gate-image';
        gateImg.src = Config.images.elements.gateRight;
        gateImg.alt = 'Arrow pointing to answer';
        gateImg.draggable = false;

        gateContainer.appendChild(gateImg);

        const { pen: answerPen, grid: answerGrid } = Pen.createAnswerPen('Answer Choices');
        answerPen.classList.add('pen--answer');

        answersSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: true,
                slotIndex: index,
                penId: 'answer',
                onClick: handleAnalogySelection
            });
            answerGrid.appendChild(slot);
        });

        layout.appendChild(questionPen);
        layout.appendChild(gateContainer);
        layout.appendChild(answerPen);

        container.appendChild(layout);
    }

    function handleAnalogySelection(slotElement, choice, slotIndex) {
        document.querySelectorAll('.pen--answer .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        slotElement.classList.add('animal-slot--selected');

        GameState.recordSelection(choice, slotIndex);

        SelectionHandler.enableNextButton();

        SelectionHandler.updateDataPanel();
    }

    return {
        render
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalogyRenderer;
}
