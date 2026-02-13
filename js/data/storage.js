const Storage = (function () {

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

    function saveGameProgress(gameData) {
        return save(Config.storage.gameData, gameData);
    }

    function loadGameProgress() {
        return load(Config.storage.gameData);
    }

    function saveCurrentProblem(problemState) {
        return save(Config.storage.currentProblem, problemState);
    }

    function loadCurrentProblem() {
        return load(Config.storage.currentProblem);
    }

    function saveSessionId(sessionId) {
        return save(Config.storage.sessionId, sessionId);
    }

    function loadSessionId() {
        return load(Config.storage.sessionId);
    }

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
