/**
 * Configuration Module
 * Constants, paths, and settings for the application
 */

const Config = {
    // ==================== 
    // IMAGE PATHS
    // ====================

    images: {
        // Base paths (relative to index.html location)
        basePath: 'images',

        // Background images
        backgrounds: {
            game: 'images/background_images/background.png',
            welcome: 'images/background_images/opening_page.png',
            meadow: 'images/background_images/meadow_1.png'
        },

        // Pen/fence elements
        elements: {
            penMain: 'images/elements/pen_1.png',
            penGreen: 'images/elements/pen_1a_green.png',
            penRed: 'images/elements/pen_1a_red.png',
            penAnalogy: 'images/elements/analogy_pen.png',
            penSmall: 'images/elements/pen_2.png',
            gateRight: 'images/elements/white_fencing_entrance_rightwards.png',
            gateLeft: 'images/elements/white_fencing_entrance_leftwards.png',
            fenceLong: 'images/elements/pen_1.png',
            ground: 'images/elements/ground_1.png'
        },

        // Animal SVG base path
        animalsBase: 'images/website_selection_clean'
    },

    // ==================== 
    // ANIMAL CONFIGURATIONS
    // ====================

    animals: {
        // Available species
        species: ['cat', 'cow', 'dog', 'horse', 'pig', 'sheep'],

        // Available sizes
        sizes: ['small', 'medium', 'large'],

        // Available colors
        colors: ['blue', 'green', 'red', 'yellow'],

        // Available patterns
        patterns: ['solid', 'striped'],

        // Size folder mapping for image paths
        sizeFolderMap: {
            small: { solid: '00_no_stripe_small', striped: '00_stripe_small' },
            medium: { solid: '01_no_stripe_medium', striped: '01_stripe_medium' },
            large: { solid: '02_no_stripe_large', striped: '02_stripe_large' }
        }
    },

    // ==================== 
    // GAME TYPE SETTINGS
    // ====================

    gameTypes: {
        anomaly: {
            name: 'Anomaly',
            title: "'What Doesn't Fit?'",
            instruction: 'Find the animal that does not belong!',
            minAnimals: 4,
            maxAnimals: 5,
            layout: 'anomaly-layout'
        },
        analogy: {
            name: 'Analogy',
            title: '"What Goes With?"',
            instruction: 'Choose the answer choice that completes the pattern.',
            questionItems: 3,
            answerChoices: 4,
            layout: 'analogy-layout'
        },
        antithesis: {
            name: 'Antithesis',
            title: '"What Goes in the Middle?"',
            instruction: 'Choose the option that goes in the middle.',
            boxes: 3,
            answerChoices: 4,
            layout: 'antithesis-layout'
        },
        antinomy: {
            name: 'Antinomy',
            title: 'What Goes Here?',
            instruction: 'Choose the option that matches the green box rule.',
            categoryBoxes: 2,
            answerChoices: 4,
            layout: 'antinomy-layout'
        },

    },

    // ==================== 
    // ANIMATION SETTINGS
    // ====================

    animation: {
        // Durations (in ms)
        slotPop: 200,
        animalMove: 400,
        animalSwap: 450,
        fadeIn: 300,
        fadeOut: 200,

        // Easing functions
        easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },

    // ==================== 
    // TIMING SETTINGS
    // ====================

    timing: {
        // Auto-save interval (ms)
        autoSaveInterval: 5000,

        // Debounce for selection (ms)
        selectionDebounce: 100,

        // Minimum time before next can be clicked (ms)
        minProblemTime: 500
    },

    // ==================== 
    // STORAGE KEYS
    // ====================

    storage: {
        gameData: 'rr_anomaly_gameData',
        sessionId: 'rr_anomaly_sessionId',
        currentProblem: 'rr_anomaly_currentProblem',
        preferences: 'rr_anomaly_preferences'
    },

    // ==================== 
    // DEBUG SETTINGS
    // ====================

    debug: {
        enabled: false,
        logSelections: true,
        logAnimations: false,
        showDataPanel: true
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(Config);
Object.freeze(Config.images);
Object.freeze(Config.images.backgrounds);
Object.freeze(Config.images.elements);
Object.freeze(Config.animals);
Object.freeze(Config.animals.sizeFolderMap);
Object.freeze(Config.gameTypes);
Object.freeze(Config.animation);
Object.freeze(Config.timing);
Object.freeze(Config.storage);
Object.freeze(Config.debug);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
