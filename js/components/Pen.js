/**
 * Pen Component
 * Renders farm pen with fence overlay and content area
 */

const Pen = (function () {

    /**
     * Create a pen element
     */
    function create(options = {}) {
        const {
            id = '',
            label = '',
            variant = 'main', // 'main', 'out', 'question', 'answer', 'green', 'red', 'choices'
            className = '',
            fenceSrc = Config.images.elements.penMain // Default
        } = options;

        // Create pen container
        const pen = document.createElement('div');
        pen.className = `pen pen--${variant} ${className}`.trim();
        if (id) pen.id = id;

        // Add label if provided
        // Add label if provided
        if (label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'problem-label';
            labelEl.textContent = label;
            labelEl.style.visibility = 'hidden'; // Hide label but keep layout space
            pen.appendChild(labelEl);
        }

        // Create pen surface
        const surface = document.createElement('div');
        surface.className = `pen-surface pen-surface--${variant}`;

        // Add shadow element
        const shadow = document.createElement('div');
        shadow.className = 'pen-shadow';
        surface.appendChild(shadow);

        // Add ground element
        const ground = document.createElement('div');
        ground.className = 'pen-ground';
        surface.appendChild(ground);

        // Add content container
        const content = document.createElement('div');
        content.className = 'pen-content';
        surface.appendChild(content);

        // Add fence overlay
        const fence = document.createElement('div');
        fence.className = 'pen-fence';

        const fenceImg = document.createElement('img');
        fenceImg.src = fenceSrc;
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

    /**
     * Create main pen for Anomaly mode
     */
    function createMainPen(label = 'Pen') {
        const { pen, surface, content } = create({
            id: 'main-pen',
            label,
            variant: 'main'
        });

        // Create animal grid
        const grid = document.createElement('div');
        grid.className = 'animal-grid animal-grid--anomaly';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    /**
     * Create out/rejection pen
     */
    function createOutPen(label = 'Does Not Belong') {
        const { pen, surface, content } = create({
            id: 'out-pen',
            label,
            variant: 'out'
        });

        // Add empty state class initially
        surface.classList.add('pen-surface--empty');

        // Create single slot for out pen
        const outSlot = AnimalSlot.createOutPenSlot();
        content.appendChild(outSlot);

        return { pen, surface, content, outSlot };
    }

    /**
     * Create question box pen (for Analogy)
     */
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

    /**
     * Create answer choices pen (for Analogy)
     */
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

    /**
     * Create colored category pen (for Antinomy)
     */
    function createCategoryPen(color, label, fenceSrc) {
        const { pen, surface, content } = create({
            id: `${color}-pen`,
            label,
            variant: color, // 'green' or 'red'
            className: `pen--${color}`,
            fenceSrc: fenceSrc
        });

        const grid = document.createElement('div');
        grid.className = 'animal-grid';
        content.appendChild(grid);

        return { pen, surface, content, grid };
    }

    /**
     * Create choices pen (for Antinomy/Antithesis)
     */
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

    /**
     * Create small box pen (for Antithesis sequence)
     */
    function createBoxPen(boxNum, label, isEmpty = false) {
        const { pen, surface, content } = create({
            id: `box-${boxNum}-pen`,
            label,
            variant: 'box',
            className: isEmpty ? 'pen--box-empty' : ''
        });

        if (isEmpty) {
            // Add question mark placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'animal-slot animal-slot--question-mark';
            content.appendChild(placeholder);
        }

        return { pen, surface, content };
    }

    /**
     * Set pen empty state
     */
    function setEmpty(surface, isEmpty) {
        surface.classList.toggle('pen-surface--empty', isEmpty);
    }

    /**
     * Get pen content element
     */
    function getContent(pen) {
        return pen.querySelector('.pen-content');
    }

    /**
     * Get pen grid element
     */
    function getGrid(pen) {
        return pen.querySelector('.animal-grid');
    }

    /**
     * Clear pen content
     */
    function clearContent(pen) {
        const content = getContent(pen);
        if (content) {
            const grid = content.querySelector('.animal-grid');
            if (grid) {
                grid.innerHTML = '';
            }
        }
    }

    // ==================== 
    // PUBLIC API
    // ====================

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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pen;
}
