/**
 * Animation Handler Module
 * Handles animal movement animations between pens
 */

const AnimationHandler = (function() {
    
    /**
     * Create a flying clone of a slot for animation
     */
    function createFlyingClone(slot) {
        const clone = slot.cloneNode(true);
        const rect = slot.getBoundingClientRect();
        
        clone.className = 'animal-slot animal-slot--flying-clone';
        clone.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            z-index: 1000;
            pointer-events: none;
            margin: 0;
            background: transparent;
            border: none;
        `;
        
        // Remove any selection/hover states
        clone.classList.remove(
            'animal-slot--selected',
            'animal-slot--selectable',
            'animal-slot--animating'
        );
        
        document.body.appendChild(clone);
        return clone;
    }
    
    /**
     * Animate element to target position
     */
    function animateToPosition(element, targetRect, duration = Config.animation.animalMove) {
        return new Promise((resolve) => {
            // Force reflow before starting animation
            void element.offsetWidth;
            
            element.style.transition = `
                left ${duration}ms ${Config.animation.easeInOut},
                top ${duration}ms ${Config.animation.easeInOut},
                width ${duration}ms ${Config.animation.easeInOut},
                height ${duration}ms ${Config.animation.easeInOut},
                transform ${duration}ms ${Config.animation.bounce}
            `;
            
            element.style.left = `${targetRect.left}px`;
            element.style.top = `${targetRect.top}px`;
            element.style.width = `${targetRect.width}px`;
            element.style.height = `${targetRect.height}px`;
            
            // Add slight scale effect mid-animation
            setTimeout(() => {
                element.style.transform = 'scale(1.05)';
            }, duration * 0.3);
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, duration * 0.7);
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
    
    /**
     * Move animal from main pen to out pen
     */
    function moveToOutPen(sourceSlot, outPenSlot, choice, onComplete) {
        // Mark source as animating
        AnimalSlot.setAnimating(sourceSlot, true);
        
        // Create flying clone
        const clone = createFlyingClone(sourceSlot);
        
        // Get target position
        const targetRect = outPenSlot.getBoundingClientRect();
        
        // Fade out source immediately
        sourceSlot.style.opacity = '0';
        
        // Animate clone to out pen
        animateToPosition(clone, targetRect).then(() => {
            // Clean up clone
            clone.remove();
            
            // Reset source slot
            sourceSlot.style.opacity = '';
            AnimalSlot.setAnimating(sourceSlot, false);
            
            // Call completion handler
            if (onComplete) {
                onComplete();
            }
        });
    }
    
    /**
     * Swap animals between out pen and main pen slot
     */
    function swapAnimals(newSourceSlot, outPenSlot, returnTargetSlot, newChoice, returningAnimal, onComplete) {
        const duration = Config.animation.animalSwap;
        
        // Mark slots as animating
        AnimalSlot.setAnimating(newSourceSlot, true);
        AnimalSlot.setAnimating(outPenSlot, true);
        AnimalSlot.setAnimating(returnTargetSlot, true);
        
        // Create flying clones
        const newClone = createFlyingClone(newSourceSlot);
        const returnClone = createFlyingClone(outPenSlot);
        
        // Get target positions
        const outPenRect = outPenSlot.getBoundingClientRect();
        const returnTargetRect = returnTargetSlot.getBoundingClientRect();
        
        // Fade out originals
        newSourceSlot.style.opacity = '0';
        outPenSlot.style.opacity = '0';
        
        // Animate both simultaneously
        Promise.all([
            animateToPosition(newClone, outPenRect, duration),
            animateToPosition(returnClone, returnTargetRect, duration)
        ]).then(() => {
            // Clean up clones
            newClone.remove();
            returnClone.remove();
            
            // Reset slots
            newSourceSlot.style.opacity = '';
            outPenSlot.style.opacity = '';
            
            AnimalSlot.setAnimating(newSourceSlot, false);
            AnimalSlot.setAnimating(outPenSlot, false);
            AnimalSlot.setAnimating(returnTargetSlot, false);
            
            // Call completion handler
            if (onComplete) {
                onComplete();
            }
        });
    }
    
    /**
     * Return animal from out pen to original position
     */
    function returnToOriginal(outPenSlot, targetSlot, animal, onComplete) {
        // Mark slots as animating
        AnimalSlot.setAnimating(outPenSlot, true);
        AnimalSlot.setAnimating(targetSlot, true);
        
        // Create flying clone
        const clone = createFlyingClone(outPenSlot);
        
        // Get target position
        const targetRect = targetSlot.getBoundingClientRect();
        
        // Fade out out pen
        outPenSlot.style.opacity = '0';
        
        // Animate clone to target
        animateToPosition(clone, targetRect).then(() => {
            // Clean up clone
            clone.remove();
            
            // Reset slots
            outPenSlot.style.opacity = '';
            AnimalSlot.setAnimating(outPenSlot, false);
            AnimalSlot.setAnimating(targetSlot, false);
            
            // Call completion handler
            if (onComplete) {
                onComplete();
            }
        });
    }
    
    /**
     * Simple fade in animation
     */
    function fadeIn(element, duration = Config.animation.fadeIn) {
        return new Promise((resolve) => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-out`;
            
            // Force reflow
            void element.offsetWidth;
            
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
    
    /**
     * Simple fade out animation
     */
    function fadeOut(element, duration = Config.animation.fadeOut) {
        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
    
    /**
     * Scale pop animation
     */
    function pop(element, duration = Config.animation.slotPop) {
        return new Promise((resolve) => {
            element.style.transition = `transform ${duration}ms ${Config.animation.bounce}`;
            element.style.transform = 'scale(1.15)';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, duration * 0.4);
            
            setTimeout(() => {
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }
    
    /**
     * Shake animation for error feedback
     */
    function shake(element, duration = 400) {
        return new Promise((resolve) => {
            element.style.animation = `shake ${duration}ms ease-in-out`;
            
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
    
    // ==================== 
    // PUBLIC API
    // ====================
    
    return {
        createFlyingClone,
        animateToPosition,
        moveToOutPen,
        swapAnimals,
        returnToOriginal,
        fadeIn,
        fadeOut,
        pop,
        shake
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationHandler;
}
