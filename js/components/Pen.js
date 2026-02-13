const Pen = (function () {

    function create(options = {}) {
        const {
            id = '',
            label = '',
            variant = 'main',
            className = ''
        } = options;

        const pen = document.createElement('div');
        pen.className = `pen pen--${variant} ${className}`.trim();
        if (id) pen.id = id;

        if (label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'problem-label';
            labelEl.textContent = label;
            pen.appendChild(labelEl);
        }

        const surface = document.createElement('div');
        surface.className = `pen-surface pen-surface--${variant}`;

        const shadow = document.createElement('div');
        shadow.className = 'pen-shadow';
        surface.appendChild(shadow);

        const ground = document.createElement('div');
        ground.className = 'pen-ground';
        surface.appendChild(ground);

        const content = document.createElement('div');
        content.className = 'pen-content';
        surface.appendChild(content);

        const fence = document.createElement('div');
        fence.className = 'pen-fence';

        const fenceImg = document.createElement('img');
        fenceImg.src = Config.images.elements.penMain;
        fenceImg.alt = 'Pen fence';
        fenceImg.draggable = false;
        fenceImg.onerror = function () {
            console.warn('Failed to load pen fence image');
            this.style.display = 'none';
        };

        fence.appendChild(fenceImg);
        surface.appendChild(fence);

        pen.appendChild(surface);

        return { pen, surface, content, ground, fence };
    }

    function createMainPen(label = 'Pen') {
        const { pen, surface, content } = create({
            id: 'main-pen',
            label,
            variant: 'main'
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid animal-grid--anomaly';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    function createOutPen(label = 'Does Not Belong') {
        const { pen, surface, content } = create({
            id: 'out-pen',
            label,
            variant: 'out'
        });

        surface.classList.add('pen-surface--empty');

        const outSlot = AnimalSlot.createOutPenSlot();
        content.appendChild(outSlot);

        return { pen, surface, content, outSlot };
    }

    function createQuestionPen(label = 'Question Box') {
        const { pen, surface, content } = create({
            id: 'question-pen',
            label,
            variant: 'question'
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid animal-grid--question';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    function createAnswerPen(label = 'Answer Choices') {
        const { pen, surface, content } = create({
            id: 'answer-pen',
            label,
            variant: 'answer'
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid animal-grid--answers';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    function createCategoryPen(color, label) {
        const { pen, surface, content } = create({
            id: `${color}-pen`,
            label,
            variant: color,
            className: `pen--${color}`
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    function createChoicesPen(label = 'Choices') {
        const { pen, surface, content } = create({
            id: 'choices-pen',
            label,
            variant: 'choices'
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid animal-grid--answers';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    function createBoxPen(boxNum, label, isEmpty = false) {
        const { pen, surface, content } = create({
            id: `box-${boxNum}-pen`,
            label,
            variant: 'box',
            className: isEmpty ? 'pen--box-empty' : ''
        });

        if (isEmpty) {
            const placeholder = document.createElement('div');
            placeholder.className = 'animal-slot animal-slot--question-mark';
            content.appendChild(placeholder);
        }

        return { pen, surface, content };
    }

    function setEmpty(surface, isEmpty) {
        surface.classList.toggle('pen-surface--empty', isEmpty);
    }

    function getContent(pen) {
        return pen.querySelector('.pen-content');
    }

    function getGrid(pen) {
        return pen.querySelector('.animal-grid');
    }

    function clearContent(pen) {
        const content = getContent(pen);
        if (content) {
            const grid = content.querySelector('.animal-grid');
            if (grid) {
                grid.innerHTML = '';
            }
        }
    }

    return {
        create,
        createMainPen,
        createOutPen,
        createQuestionPen,
        createAnswerPen,
        createCategoryPen,
        createChoicesPen,
        createBoxPen,
        setEmpty,
        getContent,
        getGrid,
        clearContent
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pen;
}
