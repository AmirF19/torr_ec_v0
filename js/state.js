const GameState = (function () {

    let state = {
        sessionId: generateSessionId(),
        startedAt: null,

        currentProblemIndex: 0,
        totalProblems: 0,

        currentProblem: null,

        animalPositions: new Map(),
        originalPositions: new Map(),
        outPenAnimal: null,

        selections: [],
        selectionCount: 0,
        problemStartTime: null,

        completedProblems: [],

        ui: {
            isTransitioning: false,
            isAnimating: false,
            nextButtonEnabled: false,
            showDataPanel: true,
            currentScreen: 'welcome'
        }
    };

    const observers = new Map();

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Map) return new Map(obj);
        if (obj instanceof Set) return new Set(obj);
        if (obj instanceof Date) return new Date(obj);
        if (Array.isArray(obj)) return obj.map(item => deepClone(item));

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    function notifyObservers(key, value, oldValue) {
        if (observers.has(key)) {
            observers.get(key).forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (e) {
                    console.error('Observer error:', e);
                }
            });
        }

        if (observers.has('*')) {
            observers.get('*').forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (e) {
                    console.error('Observer error:', e);
                }
            });
        }
    }

    return {
        getState() {
            return deepClone(state);
        },

        get(key) {
            const keys = key.split('.');
            let value = state;
            for (const k of keys) {
                if (value === undefined) return undefined;
                value = value[k];
            }
            return deepClone(value);
        },

        set(key, value) {
            const keys = key.split('.');
            const lastKey = keys.pop();
            let target = state;

            for (const k of keys) {
                if (target[k] === undefined) {
                    target[k] = {};
                }
                target = target[k];
            }

            const oldValue = target[lastKey];
            target[lastKey] = value;

            notifyObservers(key, value, oldValue);

            if (Config.debug.enabled) {
                console.log(`[State] ${key}:`, value);
            }
        },

        subscribe(key, callback) {
            if (!observers.has(key)) {
                observers.set(key, new Set());
            }
            observers.get(key).add(callback);

            return () => {
                observers.get(key).delete(callback);
            };
        },

        initSession(problemSet) {
            state.sessionId = generateSessionId();
            state.startedAt = Date.now();
            state.currentProblemIndex = 0;
            state.totalProblems = problemSet.length;
            state.completedProblems = [];
            state.ui.currentScreen = 'game';

            notifyObservers('session', state.sessionId, null);
        },

        startProblem(problemData) {
            state.currentProblem = deepClone(problemData);
            state.problemStartTime = Date.now();
            state.selections = [];
            state.selectionCount = 0;
            state.animalPositions = new Map();
            state.originalPositions = new Map();
            state.outPenAnimal = null;
            state.ui.nextButtonEnabled = false;
            state.ui.isAnimating = false;

            notifyObservers('currentProblem', state.currentProblem, null);
        },

        recordSelection(choice, slotIndex) {
            const selection = {
                choiceId: choice.id,
                animals: choice.animals,
                timestamp: Date.now(),
                slotIndex: slotIndex
            };

            state.selections.push(selection);
            state.selectionCount++;
            state.ui.nextButtonEnabled = true;

            notifyObservers('selection', selection, null);
            notifyObservers('selectionCount', state.selectionCount, state.selectionCount - 1);
        },

        setOutPenAnimal(animal, originalSlotIndex) {
            const previousAnimal = state.outPenAnimal;
            state.outPenAnimal = animal;

            if (animal && originalSlotIndex !== undefined) {
                state.originalPositions.set(
                    typeof animal.id !== 'undefined' ? animal.id : animal.animals[0].id,
                    { penId: 'main', slotIndex: originalSlotIndex }
                );
            }

            notifyObservers('outPenAnimal', animal, previousAnimal);
            return previousAnimal;
        },

        getOriginalPosition(animalId) {
            return state.originalPositions.get(animalId);
        },

        completeProblem() {
            if (!state.currentProblem) return null;

            const endTime = Date.now();
            const finalSelection = state.selections[state.selections.length - 1];

            const completedProblem = {
                ...deepClone(state.currentProblem),
                startTime: state.problemStartTime,
                endTime: endTime,
                totalTime: endTime - state.problemStartTime,
                selections: deepClone(state.selections),
                totalSelections: state.selectionCount,
                finalSelection: finalSelection,
                isCorrect: finalSelection ?
                    (finalSelection.choiceId === state.currentProblem.correctChoiceId) :
                    false
            };

            state.completedProblems.push(completedProblem);
            state.currentProblemIndex++;

            notifyObservers('problemCompleted', completedProblem, null);

            return completedProblem;
        },

        getCompletedProblems() {
            return deepClone(state.completedProblems);
        },

        isComplete() {
            return state.currentProblemIndex >= state.totalProblems;
        },

        getProgress() {
            return {
                current: state.currentProblemIndex,
                total: state.totalProblems,
                completed: state.completedProblems.length,
                percentage: state.totalProblems > 0 ?
                    Math.round((state.currentProblemIndex / state.totalProblems) * 100) :
                    0
            };
        },

        getSessionStats() {
            const completed = state.completedProblems;
            const correct = completed.filter(p => p.isCorrect).length;
            const totalTime = completed.reduce((sum, p) => sum + p.totalTime, 0);

            return {
                sessionId: state.sessionId,
                startedAt: state.startedAt,
                problemsCompleted: completed.length,
                problemsCorrect: correct,
                accuracy: completed.length > 0 ?
                    Math.round((correct / completed.length) * 100) :
                    0,
                totalTime: totalTime,
                averageTime: completed.length > 0 ?
                    Math.round(totalTime / completed.length) :
                    0
            };
        },

        reset() {
            state = {
                sessionId: generateSessionId(),
                startedAt: null,
                currentProblemIndex: 0,
                totalProblems: 0,
                currentProblem: null,
                animalPositions: new Map(),
                originalPositions: new Map(),
                outPenAnimal: null,
                selections: [],
                selectionCount: 0,
                problemStartTime: null,
                completedProblems: [],
                ui: {
                    isTransitioning: false,
                    isAnimating: false,
                    nextButtonEnabled: false,
                    showDataPanel: true,
                    currentScreen: 'welcome'
                }
            };

            notifyObservers('reset', null, null);
        },

        setUI(key, value) {
            const oldValue = state.ui[key];
            state.ui[key] = value;
            notifyObservers(`ui.${key}`, value, oldValue);
        },

        getUI(key) {
            return key ? state.ui[key] : deepClone(state.ui);
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
