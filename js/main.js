const App = (function () {

    let problemSet = [];

    function init() {
        console.log('Initializing Relational Reasoning Study...');

        Storage.clearAll();

        problemSet = ProblemSet.getProblems();
        console.log(`Loaded ${problemSet.length} problems`);

        setupEventListeners();

        showWelcomeScreen();

        SelectionHandler.updateDataPanel();

        console.log('Application initialized');
    }

    function setupEventListeners() {
        const startBtn = document.querySelector('.start-container .arrow-btn');
        if (startBtn) {
            startBtn.addEventListener('click', startExperiment);
        }

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', finishProblem);
        }

        const downloadBtn = document.querySelector('.download-btn, [onclick*="downloadData"]');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadData);
        }

        setupGameSwitcher();

        document.addEventListener('keydown', handleKeyboard);

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.animal-slot')) {
                e.preventDefault();
            }
        });

        GameState.subscribe('problemCompleted', onProblemCompleted);
    }

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

    function switchToGameType(gameType) {
        const typeIndex = problemSet.findIndex(p =>
            p.type.toLowerCase() === gameType.toLowerCase()
        );

        if (typeIndex === -1) {
            console.warn(`No problems found for game type: ${gameType}`);
            return;
        }

        GameState.set('currentProblemIndex', typeIndex);

        updateGameSwitcherActive(gameType);

        loadProblem();
    }

    function updateGameSwitcherActive(gameType) {
        const buttons = document.querySelectorAll('.game-type-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('game-type-btn--active',
                btn.dataset.game.toLowerCase() === gameType.toLowerCase()
            );
        });
    }

    function handleKeyboard(e) {
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

    function showWelcomeScreen() {
        document.getElementById('start-container')?.classList.remove('hidden');
        document.getElementById('game-container')?.classList.add('hidden');
        document.getElementById('report-container')?.classList.add('hidden');
        document.body.classList.add('welcome');

        GameState.setUI('currentScreen', 'welcome');
    }

    function showGameScreen() {
        document.getElementById('start-container')?.classList.add('hidden');
        document.getElementById('game-container')?.classList.remove('hidden');
        document.getElementById('report-container')?.classList.add('hidden');
        document.body.classList.remove('welcome');

        GameState.setUI('currentScreen', 'game');
    }

    function showReportScreen() {
        document.getElementById('start-container')?.classList.add('hidden');
        document.getElementById('game-container')?.classList.add('hidden');
        document.getElementById('report-container')?.classList.remove('hidden');
        document.getElementById('data-panel')?.classList.add('hidden');
        document.body.classList.remove('welcome');
        document.body.classList.add('report-view');

        GameState.setUI('currentScreen', 'report');
    }

    function startExperiment() {
        console.log('Starting experiment...');

        GameState.initSession(problemSet);

        showGameScreen();

        loadProblem();

        SelectionHandler.updateDataPanel();
    }

    function loadProblem() {
        const currentIndex = GameState.get('currentProblemIndex');

        if (currentIndex >= problemSet.length) {
            showFinalReport();
            return;
        }

        const problemData = problemSet[currentIndex];

        SelectionHandler.disableNextButton();

        updateGameTitle(problemData.type);

        updateProblemCounter(problemData, currentIndex);

        updateInstruction(problemData.type);

        GameState.startProblem({
            ...problemData,
            animals: ProblemSet.collectProblemAnimals(problemData)
        });

        renderProblem(problemData);

        SelectionHandler.updateDataPanel();

        console.log(`Loaded problem ${currentIndex + 1}: ${problemData.type} - ${problemData.label}`);
    }

    function updateGameTitle(type) {
        const titleEl = document.querySelector('.game-header .game-title');
        if (!titleEl) return;

        const typeConfig = Config.gameTypes[type.toLowerCase()];
        titleEl.textContent = typeConfig?.title || '"What Does Not Belong?"';
    }

    function updateProblemCounter(problemData, currentIndex) {
        const headerCounter = document.getElementById('problem-counter');
        const bottomCounter = document.getElementById('problem-counter-bottom');

        const currentType = problemData.type.toLowerCase();

        const problemsOfType = problemSet.filter(p => p.type.toLowerCase() === currentType);
        const totalOfType = problemsOfType.length;

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

        updateGameSwitcherActive(currentType);
    }

    function updateInstruction(type) {
        const instructionEl = document.querySelector('.game-instruction');
        if (instructionEl) {
            instructionEl.textContent = ProblemSet.getInstruction(type);
        }
    }

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
            default:
                console.warn(`Unknown problem type: ${type}`);
                renderDefaultProblem(problemData, container);
        }
    }

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

    function handleDefaultSelection(slotElement, choice, slotIndex) {
        document.querySelectorAll('.animal-slot--selected').forEach(slot => {
            slot.classList.remove('animal-slot--selected');
        });

        slotElement.classList.add('animal-slot--selected');

        GameState.recordSelection(choice, slotIndex);

        SelectionHandler.enableNextButton();

        SelectionHandler.updateDataPanel();
    }

    function finishProblem() {
        if (!GameState.getUI('nextButtonEnabled')) {
            return;
        }

        const completed = GameState.completeProblem();

        if (completed) {
            console.log(`Problem completed. Correct: ${completed.isCorrect}`);

            Storage.saveGameProgress(GameState.getCompletedProblems());
        }

        SelectionHandler.disableNextButton();

        setTimeout(() => {
            loadProblem();
        }, 100);
    }

    function onProblemCompleted(completed) {
        if (Config.debug.enabled) {
            console.log('Problem completed:', completed);
        }
    }

    function showFinalReport() {
        showReportScreen();

        const completedProblems = GameState.getCompletedProblems();
        const summary = DataExport.generateSummaryReport(completedProblems);

        if (!summary) {
            console.warn('No data for report');
            return;
        }

        const summaryEl = document.getElementById('report-summary');
        if (summaryEl) {
            summaryEl.textContent = `You got ${summary.overall.correct} out of ${summary.overall.total} correct (${summary.overall.accuracy}%)!`;
        }

        populateResultsTable(completedProblems);
    }

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
                    ${problem.isCorrect ? 'Yes' : 'No'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function downloadData() {
        const completedProblems = GameState.getCompletedProblems();

        if (completedProblems.length === 0) {
            console.warn('No data to download');
            return;
        }

        DataExport.exportGameData(completedProblems, false);
    }

    function downloadDetailedData() {
        const completedProblems = GameState.getCompletedProblems();

        if (completedProblems.length === 0) {
            console.warn('No data to download');
            return;
        }

        DataExport.exportGameData(completedProblems, true);
    }

    function restartExperiment() {
        GameState.reset();

        Storage.clearAll();

        problemSet = ProblemSet.getProblems();

        showWelcomeScreen();

        SelectionHandler.updateDataPanel();
    }

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

document.addEventListener('DOMContentLoaded', App.init);

window.addEventListener('load', () => {
    if (!GameState.get('sessionId')) {
        App.init();
    }
});
