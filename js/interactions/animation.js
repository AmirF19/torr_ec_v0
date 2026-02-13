const AnimationHandler = (function () {

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

        clone.classList.remove(
            'animal-slot--selected',
            'animal-slot--selectable',
            'animal-slot--animating'
        );

        document.body.appendChild(clone);
        return clone;
    }

    function animateToPosition(element, targetRect, duration = Config.animation.animalMove) {
        return new Promise((resolve) => {
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

    function moveToOutPen(sourceSlot, outPenSlot, choice, onComplete) {
        AnimalSlot.setAnimating(sourceSlot, true);

        const clone = createFlyingClone(sourceSlot);

        const targetRect = outPenSlot.getBoundingClientRect();

        sourceSlot.style.opacity = '0';

        animateToPosition(clone, targetRect).then(() => {
            clone.remove();

            sourceSlot.style.opacity = '';
            AnimalSlot.setAnimating(sourceSlot, false);

            if (onComplete) {
                onComplete();
            }
        });
    }

    function swapAnimals(newSourceSlot, outPenSlot, returnTargetSlot, newChoice, returningAnimal, onComplete) {
        const duration = Config.animation.animalSwap;

        AnimalSlot.setAnimating(newSourceSlot, true);
        AnimalSlot.setAnimating(outPenSlot, true);
        AnimalSlot.setAnimating(returnTargetSlot, true);

        const newClone = createFlyingClone(newSourceSlot);
        const returnClone = createFlyingClone(outPenSlot);

        const outPenRect = outPenSlot.getBoundingClientRect();
        const returnTargetRect = returnTargetSlot.getBoundingClientRect();

        newSourceSlot.style.opacity = '0';
        outPenSlot.style.opacity = '0';

        Promise.all([
            animateToPosition(newClone, outPenRect, duration),
            animateToPosition(returnClone, returnTargetRect, duration)
        ]).then(() => {
            newClone.remove();
            returnClone.remove();

            newSourceSlot.style.opacity = '';
            outPenSlot.style.opacity = '';

            AnimalSlot.setAnimating(newSourceSlot, false);
            AnimalSlot.setAnimating(outPenSlot, false);
            AnimalSlot.setAnimating(returnTargetSlot, false);

            if (onComplete) {
                onComplete();
            }
        });
    }

    function returnToOriginal(outPenSlot, targetSlot, animal, onComplete) {
        AnimalSlot.setAnimating(outPenSlot, true);
        AnimalSlot.setAnimating(targetSlot, true);

        const clone = createFlyingClone(outPenSlot);

        const targetRect = targetSlot.getBoundingClientRect();

        outPenSlot.style.opacity = '0';

        animateToPosition(clone, targetRect).then(() => {
            clone.remove();

            outPenSlot.style.opacity = '';
            AnimalSlot.setAnimating(outPenSlot, false);
            AnimalSlot.setAnimating(targetSlot, false);

            if (onComplete) {
                onComplete();
            }
        });
    }

    function fadeIn(element, duration = Config.animation.fadeIn) {
        return new Promise((resolve) => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-out`;

            void element.offsetWidth;

            element.style.opacity = '1';

            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

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

    function shake(element, duration = 400) {
        return new Promise((resolve) => {
            element.style.animation = `shake ${duration}ms ease-in-out`;

            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationHandler;
}
