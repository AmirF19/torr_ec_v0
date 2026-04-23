/**
 * Selection Interaction Module
 * Handles animal selection, swapping, and state updates
 */

const SelectionHandler = (function() {
    
    // Debounce timer
    let selectionDebounceTimer = null;
    
    /**
     * Handle animal selection in main pen
     */
    function handleSelection(slotElement, choice, slotIndex) {
        // Debounce rapid clicks (min 350ms between selections on iPad)
        if (selectionDebounceTimer) {
            return;
        }
        
        selectionDebounceTimer = setTimeout(() => {
            selectionDebounceTimer = null;
        }, Math.max(Config.timing.selectionDebounce || 0, 350));
        
        // Check if already animating
        if (GameState.getUI('isAnimating')) {
            return;
        }
        
        // Get current out pen state
        const currentOutAnimal = GameState.get('outPenAnimal');
        const outPenSlot = document.getElementById('out-pen-slot');
        
        if (!outPenSlot) {
            console.error('Out pen slot not found');
            return;
        }
        
        // Set animating state
        GameState.setUI('isAnimating', true);
        
        // If out pen has an animal, return it first
        if (currentOutAnimal) {
            const originalPos = GameState.getOriginalPosition(
                currentOutAnimal.id || currentOutAnimal.animals?.[0]?.id
            );
            
            if (originalPos) {
                const originalSlot = document.querySelector(
                    `.pen--main [data-slot-index="${originalPos.slotIndex}"]`
                );
                
                if (originalSlot) {
                    // Animate return and swap
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
        
        // Simple move to out pen (no swap needed)
        AnimationHandler.moveToOutPen(slotElement, outPenSlot, choice, () => {
            completeSimpleSelection(slotElement, choice, slotIndex, outPenSlot);
        });
    }
    
    /**
     * Complete a swap selection
     */
    function completeSelection(sourceSlot, choice, slotIndex, outPenSlot, returnSlot, returningAnimal) {
        // Update source slot (now empty)
        AnimalSlot.clear(sourceSlot);
        sourceSlot.classList.remove('animal-slot--selectable');
        
        // Update return slot with returning animal
        AnimalSlot.updateContent(returnSlot, returningAnimal);
        returnSlot.classList.add('animal-slot--selectable', 'animal-slot--populated');
        returnSlot.dataset.choiceData = JSON.stringify(returningAnimal);
        returnSlot.dataset.choiceId = returningAnimal.id;
        
        // Re-attach click handler to return slot
        reattachClickHandler(returnSlot);
        
        // Update out pen with new selection
        AnimalSlot.updateContent(outPenSlot, choice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');
        
        // Update out pen surface state
        const outPenSurface = outPenSlot.closest('.pen-surface');
        if (outPenSurface) {
            Pen.setEmpty(outPenSurface, false);
        }
        
        // Update game state
        GameState.setOutPenAnimal(choice, slotIndex);
        GameState.recordSelection(choice, slotIndex);
        
        // Clear selection states
        clearAllSelections();
        
        // Pop animation on out pen
        AnimalSlot.pop(outPenSlot);
        
        // Enable next button
        enableNextButton();
        
        // Update data panel
        updateDataPanel();
        
        // Clear animating state
        GameState.setUI('isAnimating', false);
    }
    
    /**
     * Complete a simple selection (no swap)
     */
    function completeSimpleSelection(sourceSlot, choice, slotIndex, outPenSlot) {
        // Update source slot (now empty)
        AnimalSlot.clear(sourceSlot);
        sourceSlot.classList.remove('animal-slot--selectable');
        
        // Update out pen
        AnimalSlot.updateContent(outPenSlot, choice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');
        
        // Update out pen surface state
        const outPenSurface = outPenSlot.closest('.pen-surface');
        if (outPenSurface) {
            Pen.setEmpty(outPenSurface, false);
        }
        
        // Update game state
        GameState.setOutPenAnimal(choice, slotIndex);
        GameState.recordSelection(choice, slotIndex);
        
        // Clear selection states
        clearAllSelections();
        
        // Pop animation on out pen
        AnimalSlot.pop(outPenSlot);
        
        // Enable next button
        enableNextButton();
        
        // Update data panel
        updateDataPanel();
        
        // Clear animating state
        GameState.setUI('isAnimating', false);
    }
    
    /**
     * Re-attach click handler to a slot
     */
    function reattachClickHandler(slot) {
        // Remove existing listeners by cloning
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Add new listener
        newSlot.addEventListener('click', (e) => {
            e.preventDefault();
            const choiceData = JSON.parse(newSlot.dataset.choiceData || 'null');
            const slotIndex = parseInt(newSlot.dataset.slotIndex);
            if (choiceData && !newSlot.classList.contains('animal-slot--animating')) {
                handleSelection(newSlot, choiceData, slotIndex);
            }
        });
        
        // Keyboard support
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
    
    /**
     * Clear all selection states
     */
    function clearAllSelections() {
        document.querySelectorAll('.animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });
    }
    
    /**
     * Enable next button
     */
    function enableNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.add('arrow-btn--pulse');
            
            // Remove pulse after animation
            setTimeout(() => {
                nextBtn.classList.remove('arrow-btn--pulse');
            }, 1600);
        }
        
        GameState.setUI('nextButtonEnabled', true);
    }
    
    /**
     * Disable next button
     */
    function disableNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.classList.remove('arrow-btn--pulse');
        }
        
        GameState.setUI('nextButtonEnabled', false);
    }
    
    /**
     * Update data panel display
     */
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
    
    /**
     * Bind selection handlers to all selectable slots in a container
     */
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
    
    // ==================== 
    // PUBLIC API
    // ====================
    
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionHandler;
}
