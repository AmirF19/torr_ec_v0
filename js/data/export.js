/**
 * Export Module
 * Handles data export to CSV format
 */

const DataExport = (function() {
    
    /**
     * Build a human-readable animal descriptor string.
     * Format: "large solid red cat" or "small striped green sheep"
     */
    function buildAnimalDescriptor(animal) {
        if (!animal) return '';
        const patternText = animal.pattern === 'striped' ? 'striped' : 'solid';
        return `${animal.size} ${patternText} ${animal.color} ${animal.species}`;
    }

    /**
     * Generate CSV content from completed problems.
     * Columns: problem_number, game_type, problem_label, question_index,
     *          seconds_elapsed, option_chosen, option_chosen_id,
     *          total_animals_selected, total_clicks, total_time_on_problem_ms,
     *          time_from_last_selection_ms, is_correct
     */
    function generateCSV(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }

        const headers = [
            'problem_number',
            'game_type',
            'problem_label',
            'question_index',
            'seconds_elapsed',
            'option_chosen',
            'option_chosen_id',
            'total_animals_selected',
            'total_clicks',
            'total_time_on_problem_ms',
            'time_from_last_selection_ms',
            'is_correct'
        ];

        let csv = headers.join(',') + '\n';

        completedProblems.forEach((problem, index) => {
            const finalSelection = problem.finalSelection;
            const selectedAnimals = finalSelection?.animals || [];

            // Full descriptor for the chosen option
            const optionChosen = selectedAnimals.map(a => buildAnimalDescriptor(a)).join(' + ');

            // Seconds elapsed since problem started
            const secondsElapsed = problem.totalTime > 0 ? (problem.totalTime / 1000).toFixed(2) : '0.00';

            // Time from last selection to end (if multiple selections, else equals total time)
            const selections = problem.selections || [];
            let timeFromLastSelection = problem.totalTime;
            if (selections.length > 0) {
                const lastSelectionTime = selections[selections.length - 1].timestamp;
                const endTime = problem.endTime || (problem.startTime + problem.totalTime);
                timeFromLastSelection = endTime - lastSelectionTime;
            }

            const row = [
                index + 1,
                escapeCSV(problem.type),
                escapeCSV(problem.label),
                problem.questionIndex || '',
                secondsElapsed,
                escapeCSV(optionChosen),
                finalSelection?.choiceId || '',
                problem.totalSelections || 0,
                problem.totalClicks || 0,
                problem.totalTime || 0,
                timeFromLastSelection,
                problem.isCorrect ? 'TRUE' : 'FALSE'
            ];

            csv += row.join(',') + '\n';
        });

        return csv;
    }
    
    /**
     * Generate detailed CSV with one row per selection.
     * Columns: problem_number, game_type, problem_label, question_index,
     *          selection_number, selection_time_from_start_ms,
     *          option_chosen, option_chosen_id, is_final_selection,
     *          total_clicks, total_time_on_problem_ms,
     *          time_from_last_selection_ms, is_correct
     */
    function generateDetailedCSV(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }

        const headers = [
            'problem_number',
            'game_type',
            'problem_label',
            'question_index',
            'selection_number',
            'selection_time_from_start_ms',
            'option_chosen',
            'option_chosen_id',
            'is_final_selection',
            'total_clicks',
            'total_time_on_problem_ms',
            'time_from_last_selection_ms',
            'is_correct'
        ];

        let csv = headers.join(',') + '\n';

        completedProblems.forEach((problem, problemIndex) => {
            const selections = problem.selections || [];

            selections.forEach((selection, selectionIndex) => {
                const isFinal = selectionIndex === selections.length - 1;
                const animals = selection.animals || [];
                const isCorrect = isFinal && problem.isCorrect;

                // Time from problem start to this selection
                const selectionTimeFromStart = selection.timestamp - problem.startTime;

                // Time from this selection to the end of the problem
                const endTime = problem.endTime || (problem.startTime + problem.totalTime);
                const timeFromThisSelection = endTime - selection.timestamp;

                // Human-readable descriptor for this selection
                const optionChosen = animals.map(a => buildAnimalDescriptor(a)).join(' + ');

                const row = [
                    problemIndex + 1,
                    escapeCSV(problem.type),
                    escapeCSV(problem.label),
                    problem.questionIndex || '',
                    selectionIndex + 1,
                    selectionTimeFromStart,
                    escapeCSV(optionChosen),
                    selection.choiceId,
                    isFinal ? 'TRUE' : 'FALSE',
                    problem.totalClicks || 0,
                    problem.totalTime || 0,
                    timeFromThisSelection,
                    isCorrect ? 'TRUE' : 'FALSE'
                ];

                csv += row.join(',') + '\n';
            });
        });

        return csv;
    }
    
    /**
     * Escape CSV field
     */
    function escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        
        // Check if escaping is needed
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        
        return stringValue;
    }
    
    /**
     * Download CSV file
     */
    function downloadCSV(csvContent, filename) {
        if (!csvContent) {
            console.warn('No CSV content to download');
            return false;
        }
        
        try {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || generateFilename();
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (e) {
            console.error('Failed to download CSV:', e);
            return false;
        }
    }
    
    /**
     * Generate default filename
     */
    function generateFilename(prefix = 'rr_experiment') {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${prefix}_${dateStr}_${timeStr}.csv`;
    }
    
    /**
     * Export game data to CSV
     */
    function exportGameData(completedProblems, detailed = false) {
        const csv = detailed ? 
            generateDetailedCSV(completedProblems) : 
            generateCSV(completedProblems);
        
        if (!csv) {
            console.warn('No data to export');
            return false;
        }
        
        const prefix = detailed ? 'rr_detailed_data' : 'rr_experiment_data';
        return downloadCSV(csv, generateFilename(prefix));
    }
    
    /**
     * Generate summary report
     */
    function generateSummaryReport(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }
        
        const total = completedProblems.length;
        const correct = completedProblems.filter(p => p.isCorrect).length;
        const totalTime = completedProblems.reduce((sum, p) => sum + p.totalTime, 0);
        
        // Group by type
        const byType = {};
        completedProblems.forEach(problem => {
            const type = problem.type;
            if (!byType[type]) {
                byType[type] = { total: 0, correct: 0, time: 0 };
            }
            byType[type].total++;
            if (problem.isCorrect) byType[type].correct++;
            byType[type].time += problem.totalTime;
        });
        
        return {
            overall: {
                total,
                correct,
                accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
                totalTime,
                averageTime: total > 0 ? Math.round(totalTime / total) : 0
            },
            byType: Object.entries(byType).map(([type, data]) => ({
                type,
                total: data.total,
                correct: data.correct,
                accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                averageTime: data.total > 0 ? Math.round(data.time / data.total) : 0
            }))
        };
    }
    
    // ==================== 
    // PUBLIC API
    // ====================
    
    return {
        generateCSV,
        generateDetailedCSV,
        downloadCSV,
        exportGameData,
        generateSummaryReport
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataExport;
}
