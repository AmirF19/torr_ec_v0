const Config = {
    images: {
        basePath: 'images',

        backgrounds: {
            game: 'images/background_images/background.png',
            welcome: 'images/background_images/opening_page.png',
            meadow: 'images/background_images/meadow_1.png'
        },

        elements: {
            penMain: 'images/elements/pen_1.svg',
            penSmall: 'images/elements/pen_2.png',
            gateRight: 'images/elements/white_fencing_entrance_rightwards.png',
            gateLeft: 'images/elements/white_fencing_entrance_leftwards.png',
            fenceLong: 'images/elements/pen_1.svg',
            ground: 'images/elements/ground_1.svg'
        },

        animalsBase: 'images/website_selection_clean'
    },

    animals: {
        species: ['cat', 'cow', 'dog', 'horse', 'pig', 'sheep'],
        sizes: ['small', 'medium', 'large'],
        colors: ['blue', 'green', 'red', 'yellow'],
        patterns: ['solid', 'striped'],

        sizeFolderMap: {
            small: { solid: '00_no_stripe_small', striped: '00_stripe_small' },
            medium: { solid: '01_no_stripe_medium', striped: '01_stripe_medium' },
            large: { solid: '02_no_stripe_large', striped: '02_stripe_large' }
        }
    },

    gameTypes: {
        anomaly: {
            name: 'Anomaly',
            title: '"What Does Not Belong?"',
            instruction: 'Find the animal that does not belong!',
            minAnimals: 4,
            maxAnimals: 5,
            layout: 'anomaly-layout'
        },
        analogy: {
            name: 'Analogy',
            title: '"Complete the Pattern"',
            instruction: 'Choose the answer choice that completes the pattern.',
            questionItems: 3,
            answerChoices: 4,
            layout: 'analogy-layout'
        },
        antithesis: {
            name: 'Antithesis',
            title: '"Find the Middle"',
            instruction: 'Choose the option that goes in the middle.',
            boxes: 3,
            answerChoices: 4,
            layout: 'antithesis-layout'
        },
        antinomy: {
            name: 'Antinomy',
            title: 'What Goes Game',
            instruction: 'Choose the option that matches the green box rule.',
            categoryBoxes: 2,
            answerChoices: 4,
            layout: 'antinomy-layout'
        },
    },

    animation: {
        slotPop: 200,
        animalMove: 400,
        animalSwap: 450,
        fadeIn: 300,
        fadeOut: 200,

        easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },

    timing: {
        autoSaveInterval: 5000,
        selectionDebounce: 100,
        minProblemTime: 500
    },

    storage: {
        gameData: 'rr_anomaly_gameData',
        sessionId: 'rr_anomaly_sessionId',
        currentProblem: 'rr_anomaly_currentProblem',
        preferences: 'rr_anomaly_preferences'
    },

    debug: {
        enabled: false,
        logSelections: true,
        logAnimations: false,
        showDataPanel: true
    }
};

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
