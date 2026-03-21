/**
 * Animation Handler Module
 * Handles animal movement animations between pens
 */

const AnimationHandler = (function () {

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

        // FIX: Extract the physical screen-rendered bounds of each image, 
        // converting them directly to explicitly offset inline blocks. 
        // This ensures they animate structurally to the destination slot's unique CSS configuration.
        const sourceImages = slot.querySelectorAll('.animal-image');
        const cloneImages = clone.querySelectorAll('.animal-image');

        sourceImages.forEach((srcImg, idx) => {
            if (cloneImages[idx]) {
                const imgRect = srcImg.getBoundingClientRect();
                
                cloneImages[idx].style.position = 'absolute';
                cloneImages[idx].style.left = `${imgRect.left - rect.left}px`;
                cloneImages[idx].style.top = `${imgRect.top - rect.top}px`;
                cloneImages[idx].style.width = `${imgRect.width}px`;
                cloneImages[idx].style.height = `${imgRect.height}px`;
                cloneImages[idx].style.maxWidth = 'none';
                cloneImages[idx].style.maxHeight = 'none';
                cloneImages[idx].style.margin = '0';
                cloneImages[idx].style.transform = 'none';
                cloneImages[idx].style.bottom = 'auto';
                cloneImages[idx].style.right = 'auto';
            }
        });

        document.body.appendChild(clone);
        return clone;
    }

    /**
     * Animate element to target position
     */
    function animateToPosition(element, targetRect, duration = Config.animation.animalMove, imageTargets = null) {
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

            // Process deep-image offset animations structurally inside the cloned container
            if (imageTargets) {
                const cloneImages = element.querySelectorAll('.animal-image');
                cloneImages.forEach((img, idx) => {
                    if (imageTargets[idx]) {
                        img.style.transition = `
                            left ${duration}ms ${Config.animation.easeInOut},
                            top ${duration}ms ${Config.animation.easeInOut},
                            width ${duration}ms ${Config.animation.easeInOut},
                            height ${duration}ms ${Config.animation.easeInOut},
                            transform ${duration}ms ${Config.animation.bounce}
                        `;
                        img.style.left = `${imageTargets[idx].left}px`;
                        img.style.top = `${imageTargets[idx].top}px`;
                        img.style.width = `${imageTargets[idx].width}px`;
                        img.style.height = `${imageTargets[idx].height}px`;
                    }
                });
            }

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

        // Temporarily put animal in target slot to measure its CSS-induced offsets
        AnimalSlot.updateContent(outPenSlot, choice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');
        void outPenSlot.offsetWidth;

        // Get target position
        const targetRect = outPenSlot.getBoundingClientRect();
        
        // Measure target images relative to target slot
        const targetImages = outPenSlot.querySelectorAll('.animal-image');
        const imageTargets = [];
        targetImages.forEach(img => {
            const imgRect = img.getBoundingClientRect();
            imageTargets.push({
                left: imgRect.left - targetRect.left,
                top: imgRect.top - targetRect.top,
                width: imgRect.width,
                height: imgRect.height
            });
        });

        // Clear temporary content
        AnimalSlot.clear(outPenSlot);
        outPenSlot.classList.add('animal-slot--empty');
        outPenSlot.classList.remove('animal-slot--populated');

        // Create flying clone using updated metrics
        const clone = createFlyingClone(sourceSlot);

        // Fade out source immediately
        sourceSlot.style.opacity = '0';

        // Animate clone to out pen
        animateToPosition(clone, targetRect, Config.animation.animalMove, imageTargets).then(() => {
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

        // --- MEASURE OUT PEN DESTINATION FOR NEW CHOICE ---
        AnimalSlot.updateContent(outPenSlot, newChoice);
        outPenSlot.classList.add('animal-slot--populated');
        outPenSlot.classList.remove('animal-slot--empty');
        void outPenSlot.offsetWidth;

        const outPenRect = outPenSlot.getBoundingClientRect();
        const outPenImages = outPenSlot.querySelectorAll('.animal-image');
        const newCloneImgTargets = [];
        outPenImages.forEach(img => {
            const imgRect = img.getBoundingClientRect();
            newCloneImgTargets.push({
                left: imgRect.left - outPenRect.left,
                top: imgRect.top - outPenRect.top,
                width: imgRect.width,
                height: imgRect.height
            });
        });

        // --- MEASURE RETURN SLOT DESTINATION FOR RETURNING ANIMAL ---
        AnimalSlot.updateContent(returnTargetSlot, returningAnimal);
        returnTargetSlot.classList.add('animal-slot--populated');
        void returnTargetSlot.offsetWidth;

        const returnTargetRect = returnTargetSlot.getBoundingClientRect();
        const returnTargetImages = returnTargetSlot.querySelectorAll('.animal-image');
        const returnCloneImgTargets = [];
        returnTargetImages.forEach(img => {
            const imgRect = img.getBoundingClientRect();
            returnCloneImgTargets.push({
                left: imgRect.left - returnTargetRect.left,
                top: imgRect.top - returnTargetRect.top,
                width: imgRect.width,
                height: imgRect.height
            });
        });

        // --- RESTORE ORIGINAL STATES FOR ANIMATION START ---
        AnimalSlot.updateContent(outPenSlot, returningAnimal);
        
        AnimalSlot.clear(returnTargetSlot);
        returnTargetSlot.classList.remove('animal-slot--populated');

        // Create flying clones
        const newClone = createFlyingClone(newSourceSlot);
        const returnClone = createFlyingClone(outPenSlot);

        // Fade out originals
        newSourceSlot.style.opacity = '0';
        outPenSlot.style.opacity = '0';

        // Animate both simultaneously
        Promise.all([
            animateToPosition(newClone, outPenRect, duration, newCloneImgTargets),
            animateToPosition(returnClone, returnTargetRect, duration, returnCloneImgTargets)
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

        // Temporarily insert animal in target slot to measure specific class offsets
        AnimalSlot.updateContent(targetSlot, animal);
        targetSlot.classList.add('animal-slot--populated');
        void targetSlot.offsetWidth;

        // Get target position
        const targetRect = targetSlot.getBoundingClientRect();
        
        // Extract internal image offsets for deep-CSS matching
        const targetImages = targetSlot.querySelectorAll('.animal-image');
        const imageTargets = [];
        targetImages.forEach(img => {
            const imgRect = img.getBoundingClientRect();
            imageTargets.push({
                left: imgRect.left - targetRect.left,
                top: imgRect.top - targetRect.top,
                width: imgRect.width,
                height: imgRect.height
            });
        });

        // Clear temporary placeholder content
        AnimalSlot.clear(targetSlot);
        targetSlot.classList.remove('animal-slot--populated');

        // Create flying clone
        const clone = createFlyingClone(outPenSlot);

        // Fade out out pen
        outPenSlot.style.opacity = '0';

        // Animate clone to target
        animateToPosition(clone, targetRect, Config.animation.animalMove, imageTargets).then(() => {
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
