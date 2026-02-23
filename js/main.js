/**
 * Main Application Module
 * Entry point and game controller
 */

const App = (function () {

    // Problem set instance
    let problemSet = [];

    // ==================== 
    // INITIALIZATION
    // ====================

    /**
     * Initialize the application
     */
    function init() {
        console.log('Initializing Relational Reasoning Study...');

        // Clear any previous session data
        Storage.clearAll();

        // Load problem set
        problemSet = ProblemSet.getProblems();
        console.log(`Loaded ${problemSet.length} problems`);

        // Setup event listeners
        setupEventListeners();

        // Show main welcome screen
        showWelcomeScreen(
            'Test of Relational Reasoning – Early Childhood',
            'Click the start button to begin!',
            startExperiment
        );

        // Update data panel
        SelectionHandler.updateDataPanel();

        console.log('Application initialized');
    }

    /**
     * Setup global event listeners
     */
    function setupEventListeners() {
        // Start button
        // Start button - Handler is now dynamic based on showWelcomeScreen
        const startBtn = document.querySelector('.start-container .arrow-btn');
        // Remove old static listener if any (good practice, though initialized once)
        // We will assign onclick dynamically in showWelcomeScreen

        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', finishProblem);
        }

        // Download button
        const downloadBtn = document.querySelector('.download-btn, [onclick*="downloadData"]');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadData);
        }

        // Game switcher buttons
        setupGameSwitcher();

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.animal-slot')) {
                e.preventDefault();
            }
        });

        // Subscribe to state changes
        GameState.subscribe('problemCompleted', onProblemCompleted);
    }

    /**
     * Setup game switcher buttons
     */
    function setupGameSwitcher() {
        const switcher = document.getElementById('game-switcher');
        if (!switcher) return;

        const buttons = switcher.querySelectorAll('.game-type-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.dataset.game;
                switchToGameType(gameType);
            });
        });
    }

    /**
     * Switch to a specific game type
     */
    function switchToGameType(gameType) {
        // Find the first problem of this type
        const typeIndex = problemSet.findIndex(p =>
            p.type.toLowerCase() === gameType.toLowerCase()
        );

        if (typeIndex === -1) {
            console.warn(`No problems found for game type: ${gameType}`);
            return;
        }

        // Update current problem index
        GameState.set('currentProblemIndex', typeIndex);

        // Update active button
        updateGameSwitcherActive(gameType);

        // Show interstitial before loading problem
        showGameInterstitial(gameType);
    }

    /**
     * Update game switcher active state
     */
    function updateGameSwitcherActive(gameType) {
        const buttons = document.querySelectorAll('.game-type-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('game-type-btn--active',
                btn.dataset.game.toLowerCase() === gameType.toLowerCase()
            );
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Enter or Space to proceed when button is enabled
        if ((e.key === 'Enter' || e.key === ' ') &&
            !e.target.closest('.animal-slot') &&
            GameState.getUI('nextButtonEnabled')) {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn && !nextBtn.disabled) {
                e.preventDefault();
                finishProblem();
            }
        }
    }

    // ==================== 
    // SCREEN MANAGEMENT
    // ====================

    /**
     * Show welcome screen
     */
    /**
     * Show welcome/interstitial screen
     */
    function showWelcomeScreen(title, instruction, onStartAction) {
        const titleEl = document.querySelector('.start-container .game-title');
        const instructionEl = document.querySelector('.start-container .game-instruction');
        const startBtn = document.querySelector('.start-container .arrow-btn');

        if (titleEl) titleEl.textContent = title;
        if (instructionEl) instructionEl.textContent = instruction;

        if (startBtn) {
            // Remove previous event listeners to strictly control flow
            const newBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newBtn, startBtn);

            newBtn.addEventListener('click', () => {
                if (onStartAction) onStartAction();
            });
        }

        document.getElementById('start-container')?.classList.remove('hidden');
        document.getElementById('game-container')?.classList.add('hidden');
        document.getElementById('report-container')?.classList.add('hidden');
        document.body.classList.add('welcome');

        GameState.setUI('currentScreen', 'welcome');
    }

    /**
     * Show game specific interstitial
     */
    function showGameInterstitial(gameType) {
        let title = '';
        switch (gameType.toLowerCase()) {
            case 'anomaly': title = 'What Does Not Belong?'; break;
            case 'antinomy': title = 'What Goes With?'; break;
            case 'antithesis': title = 'What Goes in the Middle?'; break;
            case 'analogy': title = 'What Goes Here?'; break;
            default: title = 'Game';
        }

        showWelcomeScreen(
            title,
            'Click the arrow to start.',
            () => loadProblem(true)
        );
    }

    /**
     * Show game screen
     */
    function showGameScreen() {
        document.getElementById('start-container')?.classList.add('hidden');
        document.getElementById('game-container')?.classList.remove('hidden');
        document.getElementById('report-container')?.classList.add('hidden');
        document.body.classList.remove('welcome');

        GameState.setUI('currentScreen', 'game');
    }

    /**
     * Show report screen
     */
    function showReportScreen() {
        document.getElementById('start-container')?.classList.add('hidden');
        document.getElementById('game-container')?.classList.add('hidden');
        document.getElementById('report-container')?.classList.remove('hidden');
        document.getElementById('data-panel')?.classList.add('hidden');
        document.body.classList.remove('welcome');
        document.body.classList.add('report-view');

        GameState.setUI('currentScreen', 'report');
    }

    // ==================== 
    // GAME FLOW
    // ====================

    /**
     * Start the experiment
     */
    function startExperiment() {
        console.log('Starting experiment...');

        // Initialize game state
        GameState.initSession(problemSet);

        // Show game screen
        showGameScreen();

        // Get first problem to determine type
        const firstProblem = problemSet[0];

        // Show interstitial for the first game type
        showGameInterstitial(firstProblem.type);

        // Update data panel
        SelectionHandler.updateDataPanel();
    }

    /**
     * Load current problem
     */
    function loadProblem(fromInterstitial = false) {
        const currentIndex = GameState.get('currentProblemIndex');

        // Check if all problems completed
        if (currentIndex >= problemSet.length) {
            showFinalReport();
            return;
        }

        // Check for game type change (sequential navigation)
        const problemData = problemSet[currentIndex];

        // If not coming from interstitial, check if we need to show one
        // (i.e., this is the first problem of a new type)
        if (!fromInterstitial && currentIndex > 0) {
            const prevProblem = problemSet[currentIndex - 1];
            if (problemData.type !== prevProblem.type) {
                // Show interstitial for new game type
                showGameInterstitial(problemData.type);
                return;
            }
        }

        // Ensure we are on the game screen (in case coming from interstitial)
        showGameScreen();

        // Disable next button
        SelectionHandler.disableNextButton();

        // Update game title based on type
        updateGameTitle(problemData.type);

        // Update problem counter (per game type)
        updateProblemCounter(problemData, currentIndex);

        // Update instruction
        updateInstruction(problemData.type);

        // Calculate Question Index (1-based within type) for scoped layout logic
        let questionIndex = 0;
        const currentType = problemData.type.toLowerCase();
        for (let i = 0; i <= currentIndex; i++) {
            if (problemSet[i].type.toLowerCase() === currentType) {
                questionIndex++;
            }
        }
        problemData.questionIndex = questionIndex;

        // Start problem in state
        GameState.startProblem({
            ...problemData,
            animals: ProblemSet.collectProblemAnimals(problemData)
        });

        // Render problem
        renderProblem(problemData);

        // Update data panel
        SelectionHandler.updateDataPanel();

        console.log(`Loaded problem ${currentIndex + 1}: ${problemData.type} - ${problemData.label} (Q${questionIndex})`);
    }

    /**
     * Update game title based on problem type
     */
    function updateGameTitle(type) {
        const titleEl = document.querySelector('.game-header .game-title');
        if (!titleEl) return;

        const typeConfig = Config.gameTypes[type.toLowerCase()];
        titleEl.textContent = typeConfig?.title || '"What Does Not Belong?"';
    }

    /**
     * Update problem counter display - shows count within current game type
     * Now updates the bottom-left panel counter
     */
    function updateProblemCounter(problemData, currentIndex) {
        // Update both the header counter (hidden) and bottom-left counter
        const headerCounter = document.getElementById('problem-counter');
        const bottomCounter = document.getElementById('problem-counter-bottom');

        const currentType = problemData.type.toLowerCase();

        // Get all problems of this type
        const problemsOfType = problemSet.filter(p => p.type.toLowerCase() === currentType);
        const totalOfType = problemsOfType.length;

        // Find which number this problem is within its type
        let numberWithinType = 0;
        for (let i = 0; i <= currentIndex; i++) {
            if (problemSet[i].type.toLowerCase() === currentType) {
                numberWithinType++;
            }
        }

        const labelSuffix = problemData.label ? ` - ${problemData.label}` : '';
        const counterText = `${problemData.type}${labelSuffix} (${numberWithinType} of ${totalOfType})`;

        if (headerCounter) headerCounter.textContent = counterText;
        if (bottomCounter) bottomCounter.textContent = counterText;

        // Update game switcher active state
        updateGameSwitcherActive(currentType);
    }

    /**
     * Update instruction text
     */
    function updateInstruction(type) {
        const instructionEl = document.querySelector('.game-instruction');
        if (instructionEl) {
            instructionEl.textContent = ProblemSet.getInstruction(type);
        }
    }

    /**
     * Render problem based on type
     */
    function renderProblem(problemData) {
        const container = document.getElementById('problem-area');
        if (!container) {
            console.error('Problem area container not found');
            return;
        }

        const type = problemData.type.toLowerCase();

        switch (type) {
            case 'anomaly':
                AnomalyRenderer.render(problemData, container);
                break;
            case 'analogy':
                AnalogyRenderer.render(problemData, container);
                break;
            case 'antithesis':
                AntithesisRenderer.render(problemData, container);
                break;
            case 'antinomy':
                AntinomyRenderer.render(problemData, container);
                break;

                break;
            default:
                console.warn(`Unknown problem type: ${type}`);
                renderDefaultProblem(problemData, container);
        }
    }

    /**
     * Default problem renderer (fallback)
     */
    function renderDefaultProblem(problemData, container) {
        container.innerHTML = '';

        problemData.sections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'problem-section';

            if (section.label) {
                const labelEl = document.createElement('div');
                labelEl.className = 'problem-label';
                labelEl.textContent = section.label;
                sectionEl.appendChild(labelEl);
            }

            const gridEl = document.createElement('div');
            gridEl.className = 'animal-grid';

            section.items.forEach((item, index) => {
                const slot = AnimalSlot.create({
                    item,
                    selectable: section.selectable,
                    slotIndex: index,
                    penId: 'default',
                    onClick: section.selectable ? handleDefaultSelection : null
                });
                gridEl.appendChild(slot);
            });

            sectionEl.appendChild(gridEl);
            container.appendChild(sectionEl);
        });
    }

    /**
     * Default selection handler
     */
    function handleDefaultSelection(slotElement, choice, slotIndex) {
        // Clear previous selections
        document.querySelectorAll('.animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        // Mark this slot as selected
        slotElement.classList.add('animal-slot--selected');

        // Record selection
        GameState.recordSelection(choice, slotIndex);

        // Enable next button
        SelectionHandler.enableNextButton();

        // Update data panel
        SelectionHandler.updateDataPanel();
    }

    /**
     * Finish current problem and move to next
     */
    function finishProblem() {
        // Check if selection was made
        if (!GameState.getUI('nextButtonEnabled')) {
            return;
        }

        // Complete current problem
        const completed = GameState.completeProblem();

        if (completed) {
            console.log(`Problem completed. Correct: ${completed.isCorrect}`);

            // Save progress
            Storage.saveGameProgress(GameState.getCompletedProblems());
        }

        // Disable button during transition
        SelectionHandler.disableNextButton();

        // Load next problem
        setTimeout(() => {
            loadProblem();
        }, 100);
    }

    /**
     * Handle problem completed event
     */
    function onProblemCompleted(completed) {
        if (Config.debug.enabled) {
            console.log('Problem completed:', completed);
        }
    }

    // ==================== 
    // FINAL REPORT
    // ====================

    /**
     * Show final report
     */
    function showFinalReport() {
        showReportScreen();

        const completedProblems = GameState.getCompletedProblems();
        const summary = DataExport.generateSummaryReport(completedProblems);

        if (!summary) {
            console.warn('No data for report');
            return;
        }

        // Update summary text
        const summaryEl = document.getElementById('report-summary');
        if (summaryEl) {
            summaryEl.textContent = `You got ${summary.overall.correct} out of ${summary.overall.total} correct (${summary.overall.accuracy}%)!`;
        }

        // Populate results table
        populateResultsTable(completedProblems);
    }

    /**
     * Populate results table
     */
    function populateResultsTable(completedProblems) {
        const tableBody = document.querySelector('#report-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        completedProblems.forEach((problem, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${problem.type} - ${problem.label}</td>
                <td>${(problem.totalTime / 1000).toFixed(2)}</td>
                <td class="${problem.isCorrect ? 'result-correct' : 'result-incorrect'}">
                    ${problem.isCorrect ? '✔️ Yes' : '❌ No'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * Download experiment data
     */
    function downloadData() {
        const completedProblems = GameState.getCompletedProblems();

        if (completedProblems.length === 0) {
            console.warn('No data to download');
            return;
        }

        DataExport.exportGameData(completedProblems, false);
    }

    /**
     * Download detailed data
     */
    function downloadDetailedData() {
        const completedProblems = GameState.getCompletedProblems();

        if (completedProblems.length === 0) {
            console.warn('No data to download');
            return;
        }

        DataExport.exportGameData(completedProblems, true);
    }

    /**
     * Restart experiment
     */
    function restartExperiment() {
        // Reset game state
        GameState.reset();

        // Clear storage
        Storage.clearAll();

        // Reload problem set
        problemSet = ProblemSet.getProblems();

        // Show welcome screen
        showWelcomeScreen();

        // Update data panel
        SelectionHandler.updateDataPanel();
    }

    // ==================== 
    // PUBLIC API
    // ====================

    return {
        init,
        startExperiment,
        loadProblem,
        finishProblem,
        downloadData,
        downloadDetailedData,
        restartExperiment
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);

// Also handle window load as backup
window.addEventListener('load', () => {
    if (!GameState.get('sessionId')) {
        App.init();
    }
});
