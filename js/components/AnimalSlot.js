const AnimalSlot = (function () {

    function create(options = {}) {
        const {
            item = null,
            selectable = false,
            slotIndex = 0,
            penId = 'main',
            isOutPen = false,
            onClick = null
        } = options;

        const animals = item?.animals || [];
        const hasAnimals = animals.length > 0;
        const isGrouped = animals.length > 1;

        const slot = document.createElement('div');
        slot.className = 'animal-slot';
        slot.dataset.slotIndex = slotIndex;
        slot.dataset.penId = penId;

        if (hasAnimals) {
            slot.classList.add('animal-slot--populated');
        } else {
            slot.classList.add('animal-slot--empty');
        }

        if (isGrouped) {
            slot.classList.add('animal-slot--grouped');
        }

        if (selectable && hasAnimals) {
            slot.classList.add('animal-slot--selectable');
            slot.setAttribute('tabindex', '0');
            slot.setAttribute('role', 'button');
            slot.setAttribute('aria-label', getAriaLabel(animals));
        }

        if (isOutPen) {
            slot.classList.add('animal-slot--out');
        }

        if (item) {
            slot.dataset.choiceId = item.id;
            slot.dataset.choiceData = JSON.stringify(item);
        }

        const groupEl = document.createElement('div');
        groupEl.className = 'animal-group';
        if (!isGrouped && hasAnimals) {
            groupEl.classList.add('animal-group--single');
        }

        animals.forEach(animal => {
            const img = createAnimalImage(animal);
            groupEl.appendChild(img);
        });

        slot.appendChild(groupEl);

        if (selectable && onClick) {
            slot.addEventListener('click', (e) => {
                e.preventDefault();
                if (!slot.classList.contains('animal-slot--animating')) {
                    onClick(slot, item, slotIndex);
                }
            });

            slot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!slot.classList.contains('animal-slot--animating')) {
                        onClick(slot, item, slotIndex);
                    }
                }
            });
        }

        return slot;
    }

    function createAnimalImage(animal) {
        const img = document.createElement('img');
        img.src = animal.image;
        img.alt = ProblemSet.formatAnimalLabel(animal);
        img.className = `animal-image animal-image--${animal.size}`;
        img.draggable = false;

        img.onerror = function () {
            console.warn('Failed to load animal image:', animal.image);
            const pngPath = animal.image.replace('.svg', '.png');
            if (this.src !== pngPath) {
                this.src = pngPath;
            }
        };

        return img;
    }

    function getAriaLabel(animals) {
        if (animals.length === 0) return 'Empty slot';
        if (animals.length === 1) {
            return ProblemSet.formatAnimalLabel(animals[0]);
        }
        return animals.map(a => ProblemSet.formatAnimalLabel(a)).join(' and ');
    }

    function updateContent(slot, item) {
        const groupEl = slot.querySelector('.animal-group');
        if (!groupEl) return;

        groupEl.innerHTML = '';

        const animals = item?.animals || [];
        const hasAnimals = animals.length > 0;
        const isGrouped = animals.length > 1;

        slot.classList.toggle('animal-slot--populated', hasAnimals);
        slot.classList.toggle('animal-slot--empty', !hasAnimals);
        slot.classList.toggle('animal-slot--grouped', isGrouped);
        groupEl.classList.toggle('animal-group--single', !isGrouped && hasAnimals);

        if (item) {
            slot.dataset.choiceId = item.id;
            slot.dataset.choiceData = JSON.stringify(item);
        } else {
            delete slot.dataset.choiceId;
            delete slot.dataset.choiceData;
        }

        animals.forEach(animal => {
            const img = createAnimalImage(animal);
            groupEl.appendChild(img);
        });

        if (slot.hasAttribute('aria-label')) {
            slot.setAttribute('aria-label', getAriaLabel(animals));
        }
    }

    function clear(slot) {
        updateContent(slot, null);
        slot.classList.remove('animal-slot--selected');
    }

    function setSelected(slot, isSelected) {
        slot.classList.toggle('animal-slot--selected', isSelected);
    }

    function setAnimating(slot, isAnimating) {
        slot.classList.toggle('animal-slot--animating', isAnimating);
    }

    function pop(slot) {
        slot.classList.remove('animal-slot--pop');
        void slot.offsetWidth;
        slot.classList.add('animal-slot--pop');

        setTimeout(() => {
            slot.classList.remove('animal-slot--pop');
        }, 300);
    }

    function createOutPenSlot() {
        const slot = document.createElement('div');
        slot.id = 'out-pen-slot';
        slot.className = 'animal-slot animal-slot--out animal-slot--empty';

        const groupEl = document.createElement('div');
        groupEl.className = 'animal-group animal-group--single';
        slot.appendChild(groupEl);

        return slot;
    }

    function getPosition(slot) {
        const rect = slot.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    }

    return {
        create,
        createAnimalImage,
        updateContent,
        clear,
        setSelected,
        setAnimating,
        pop,
        createOutPenSlot,
        getPosition
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalSlot;
}
