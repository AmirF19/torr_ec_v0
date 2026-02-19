/**
 * Analogy Renderer Module
 * Renders the Analogy game type layout
 */

const AnalogyRenderer = (function() {
    
    /**
     * Render Analogy problem
     */
    function render(problemData, container) {
        container.innerHTML = '';
        
        // Create layout container
        const layout = document.createElement('div');
        layout.className = 'analogy-layout';
        
        // Find sections
        const questionSection = problemData.sections.find(s => s.label === 'Question Box');
        const answersSection = problemData.sections.find(s => s.label === 'Answer Choices');
        
        if (!questionSection || !answersSection) {
            console.error('Missing sections in Analogy problem');
            return;
        }
        
        // Create question pen
        const { pen: questionPen, grid: questionGrid } = Pen.createQuestionPen('Question Box');
        questionPen.classList.add('pen--question');
        
        // Add question items (non-selectable)
        questionSection.items.forEach((item, index) => {
            const slot = AnimalSlot.create({
                item,
                selectable: false,
                slotIndex: index,
                penId: 'question'
            });
            questionGrid.appendChild(slot);
        });
        
        // Create gate/arrow element
        const gateContainer = document.createElement('div');
        gateContainer.className = 'gate-container';
        
        const gateImg = document.createElement('img');
        gateImg.className = 'gate-image';
        gateImg.src = Config.images.elements.gateRight;
        gateImg.alt = 'Arrow pointing to answer';
        gateImg.draggable = false;
        
        gateContainer.appendChild(gateImg);
        
        // Create answer pen
        const { pen: answerPen, grid: answerGrid } = Pen.createAnswerPen('Answer Choices');
        answerPen.classList.add('pen--answer');
        
        // Add answer slots (selectable)
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
        
        // Add to layout
        layout.appendChild(questionPen);
        layout.appendChild(gateContainer);
        layout.appendChild(answerPen);
        
        container.appendChild(layout);
    }
    
    /**
     * Handle selection in Analogy mode
     * (Different from Anomaly - selections stay in place, just mark selected)
     */
    function handleAnalogySelection(slotElement, choice, slotIndex) {
        // Clear previous selections
        document.querySelectorAll('.pen--answer .animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });
        
        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');
        
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
    module.exports = AnalogyRenderer;
}
