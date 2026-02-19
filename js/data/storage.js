/**
 * Storage Module
 * Handles localStorage operations and data persistence
 */

const Storage = (function() {
    
    /**
     * Check if localStorage is available
     */
    function isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Save data to localStorage
     */
    function save(key, data) {
        if (!isAvailable()) {
            console.warn('localStorage not available');
            return false;
        }
        
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     */
    function load(key) {
        if (!isAvailable()) {
            return null;
        }
        
        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) {
                return null;
            }
            return JSON.parse(serialized);
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    }
    
    /**
     * Remove data from localStorage
     */
    function remove(key) {
        if (!isAvailable()) {
            return false;
        }
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    }
    
    /**
     * Clear all game-related data
     */
    function clearAll() {
        if (!isAvailable()) {
            return false;
        }
        
        try {
            Object.values(Config.storage).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
            return false;
        }
    }
    
    /**
     * Save game progress
     */
    function saveGameProgress(gameData) {
        return save(Config.storage.gameData, gameData);
    }
    
    /**
     * Load game progress
     */
    function loadGameProgress() {
        return load(Config.storage.gameData);
    }
    
    /**
     * Save current problem state
     */
    function saveCurrentProblem(problemState) {
        return save(Config.storage.currentProblem, problemState);
    }
    
    /**
     * Load current problem state
     */
    function loadCurrentProblem() {
        return load(Config.storage.currentProblem);
    }
    
    /**
     * Save session ID
     */
    function saveSessionId(sessionId) {
        return save(Config.storage.sessionId, sessionId);
    }
    
    /**
     * Load session ID
     */
    function loadSessionId() {
        return load(Config.storage.sessionId);
    }
    
    // ==================== 
    // PUBLIC API
    // ====================
    
    return {
        isAvailable,
        save,
        load,
        remove,
        clearAll,
        saveGameProgress,
        loadGameProgress,
        saveCurrentProblem,
        loadCurrentProblem,
        saveSessionId,
        loadSessionId
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
