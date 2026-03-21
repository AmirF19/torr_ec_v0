/**
 * State Management Module
 * Centralized game state with observer pattern
 */

const GameState = (function() {
    // ==================== 
    // PRIVATE STATE
    // ====================
    
    let state = {
        // Session info
        sessionId: generateSessionId(),
        startedAt: null,
        
        // Problem navigation
        currentProblemIndex: 0,
        totalProblems: 0,
        
        // Current problem state
        currentProblem: null,
        
        // Animal positions tracking
        animalPositions: new Map(), // animalId -> { penId, slotIndex }
        originalPositions: new Map(), // animalId -> { penId, slotIndex } (for returning)
        outPenAnimal: null, // Currently in out pen
        
        // Selection tracking
        selections: [],
        selectionCount: 0,
        problemStartTime: null,
        
        // Completed problems
        completedProblems: [],
        
        // UI state
        ui: {
            isTransitioning: false,
            isAnimating: false,
            nextButtonEnabled: false,
            showDataPanel: true,
            currentScreen: 'welcome' // 'welcome', 'game', 'report'
        }
    };
    
    // Observers for state changes
    const observers = new Map();
    
    // ==================== 
    // HELPER FUNCTIONS
    // ====================
    
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
        
        // Also notify wildcard observers
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
    
    // ==================== 
    // PUBLIC API
    // ====================
    
    return {
        /**
         * Get current state (immutable copy)
         */
        getState() {
            return deepClone(state);
        },
        
        /**
         * Get specific state property
         */
        get(key) {
            const keys = key.split('.');
            let value = state;
            for (const k of keys) {
                if (value === undefined) return undefined;
                value = value[k];
            }
            return deepClone(value);
        },
        
        /**
         * Set state property
         */
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
        
        /**
         * Subscribe to state changes
         */
        subscribe(key, callback) {
            if (!observers.has(key)) {
                observers.set(key, new Set());
            }
            observers.get(key).add(callback);
            
            // Return unsubscribe function
            return () => {
                observers.get(key).delete(callback);
            };
        },
        
        /**
         * Initialize new game session
         */
        initSession(problemSet) {
            state.sessionId = generateSessionId();
            state.startedAt = Date.now();
            state.currentProblemIndex = 0;
            state.totalProblems = problemSet.length;
            state.completedProblems = [];
            state.ui.currentScreen = 'game';
            
            notifyObservers('session', state.sessionId, null);
        },
        
        /**
         * Start a new problem
         */
        startProblem(problemData) {
            state.currentProblem = deepClone(problemData);
            state.problemStartTime = Date.now();
            state.selections = [];
            state.selectionCount = 0;
            state.clickCount = 0;  // Total raw pointer-downs (includes non-animal clicks)
            state.animalPositions = new Map();
            state.originalPositions = new Map();
            state.outPenAnimal = null;
            state.ui.nextButtonEnabled = false;
            state.ui.isAnimating = false;
            
            notifyObservers('currentProblem', state.currentProblem, null);
        },

        /**
         * Record a raw click/tap event (all pointer-downs on animal targets)
         */
        recordClick() {
            state.clickCount = (state.clickCount || 0) + 1;
        },
        
        /**
         * Record animal selection
         */
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
        
        /**
         * Set animal in out pen
         */
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
        
        /**
         * Get original position for animal
         */
        getOriginalPosition(animalId) {
            return state.originalPositions.get(animalId);
        },
        
        /**
         * Complete current problem
         */
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
                totalClicks: state.clickCount || 0,
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
        
        /**
         * Get completed problems
         */
        getCompletedProblems() {
            return deepClone(state.completedProblems);
        },
        
        /**
         * Check if all problems completed
         */
        isComplete() {
            return state.currentProblemIndex >= state.totalProblems;
        },
        
        /**
         * Get current progress
         */
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
        
        /**
         * Get session statistics
         */
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
        
        /**
         * Reset game state
         */
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
        
        /**
         * Set UI state
         */
        setUI(key, value) {
            const oldValue = state.ui[key];
            state.ui[key] = value;
            notifyObservers(`ui.${key}`, value, oldValue);
        },
        
        /**
         * Get UI state
         */
        getUI(key) {
            return key ? state.ui[key] : deepClone(state.ui);
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
