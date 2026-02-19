/**
 * Anomaly Renderer Module
 * Renders the Anomaly game type layout
 */

const AnomalyRenderer = (function() {
    
    /**
     * Render Anomaly problem
     */
    function render(problemData, container) {
        container.innerHTML = '';
        
        // Create layout container
        const layout = document.createElement('div');
        layout.className = 'anomaly-layout';
        
        // Get the animals section
        const animalsSection = problemData.sections.find(s => s.selectable);
        if (!animalsSection) {
            console.error('No selectable section found in Anomaly problem');
            return;
        }
        
        // Determine grid columns based on number of animals
        const numAnimals = animalsSection.items.length;
        const gridClass = numAnimals <= 4 ? 'animal-grid--4col' : 'animal-grid--anomaly';
        
        // Create main pen with label "Pen"
        const { pen: mainPen, grid: mainGrid } = Pen.createMainPen('Pen');
        mainGrid.className = `animal-grid ${gridClass}`;
        mainPen.classList.add('pen--main');
        
        // Add animal slots to main pen
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
        
        // Create out pen with label "Does Not Belong"
        const { pen: outPen, outSlot } = Pen.createOutPen('Does Not Belong');
        outPen.classList.add('pen--out');
        
        // Make out pen slot clickable to return animal to main pen
        outSlot.addEventListener('click', handleOutPenClick);
        
        // Add pens to layout
        layout.appendChild(mainPen);
        layout.appendChild(outPen);
        
        container.appendChild(layout);
    }
    
    /**
     * Handle click on out pen - return animal to original position
     */
    function handleOutPenClick(e) {
        const outSlot = e.currentTarget;
        
        // Only handle if there's an animal in the out pen
        if (!outSlot.classList.contains('animal-slot--populated')) {
            return;
        }
        
        // Check if animating
        if (GameState.getUI('isAnimating')) {
            return;
        }
        
        const currentOutAnimal = GameState.get('outPenAnimal');
        if (!currentOutAnimal) return;
        
        // Get original position
        const originalPos = GameState.getOriginalPosition(
            currentOutAnimal.id || currentOutAnimal.animals?.[0]?.id
        );
        
        if (!originalPos) return;
        
        const originalSlot = document.querySelector(
            `.pen--main [data-slot-index="${originalPos.slotIndex}"]`
        );
        
        if (!originalSlot) return;
        
        // Set animating state
        GameState.setUI('isAnimating', true);
        
        // Animate return
        AnimationHandler.returnToOriginal(outSlot, originalSlot, currentOutAnimal, () => {
            // Update original slot with returning animal
            AnimalSlot.updateContent(originalSlot, currentOutAnimal);
            originalSlot.classList.add('animal-slot--selectable', 'animal-slot--populated');
            originalSlot.dataset.choiceData = JSON.stringify(currentOutAnimal);
            originalSlot.dataset.choiceId = currentOutAnimal.id;
            
            // Re-attach click handler
            SelectionHandler.reattachClickHandler(originalSlot);
            
            // Clear out pen
            AnimalSlot.clear(outSlot);
            outSlot.classList.add('animal-slot--empty');
            outSlot.classList.remove('animal-slot--populated');
            
            // Update pen surface state
            const outPenSurface = outSlot.closest('.pen-surface');
            if (outPenSurface) {
                Pen.setEmpty(outPenSurface, true);
            }
            
            // Clear out pen animal from state
            GameState.setOutPenAnimal(null, null);
            
            // Disable next button since no selection
            SelectionHandler.disableNextButton();
            
            // Update data panel
            SelectionHandler.updateDataPanel();
            
            // Clear animating state
            GameState.setUI('isAnimating', false);
        });
    }
    
    /**
     * Get number of columns for grid
     */
    function getGridColumns(numAnimals) {
        if (numAnimals <= 3) return 3;
        if (numAnimals <= 4) return 4;
        return 5;
    }
    
    // ==================== 
    // PUBLIC API
    // ====================
    
    return {
        render,
        getGridColumns
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnomalyRenderer;
}
