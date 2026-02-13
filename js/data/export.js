const DataExport = (function () {

    function generateCSV(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }

        const headers = [
            'Problem Number',
            'Game Type',
            'Problem Label',
            'Instruction',
            'Correct Answer ID',
            'Presented Animal IDs',
            'Problem Start Time',
            'Total Time (ms)',
            'Total Selections',
            'Final Selection ID',
            'Final Selection Species',
            'Final Selection Colors',
            'Final Selection Patterns',
            'Final Selection Sizes',
            'Final Selection Images',
            'Is Correct'
        ];

        let csv = headers.join(',') + '\n';

        completedProblems.forEach((problem, index) => {
            const finalSelection = problem.finalSelection;
            const animals = problem.animals || [];

            const selectedAnimals = finalSelection?.animals || [];
            const selectedIds = selectedAnimals.map(a => a.id).join(';');
            const selectedSpecies = selectedAnimals.map(a => a.species).join(';');
            const selectedColors = selectedAnimals.map(a => a.color).join(';');
            const selectedPatterns = selectedAnimals.map(a => a.pattern).join(';');
            const selectedSizes = selectedAnimals.map(a => a.size).join(';');
            const selectedImages = selectedAnimals.map(a => a.image).join(';');

            const row = [
                index + 1,
                escapeCSV(problem.type),
                escapeCSV(problem.label),
                escapeCSV(problem.instruction || ProblemSet.getInstruction(problem.type)),
                problem.correctChoiceId,
                animals.map(a => a.id).join(';'),
                new Date(problem.startTime).toISOString(),
                problem.totalTime,
                problem.totalSelections,
                finalSelection?.choiceId || '',
                escapeCSV(selectedSpecies),
                escapeCSV(selectedColors),
                escapeCSV(selectedPatterns),
                escapeCSV(selectedSizes),
                escapeCSV(selectedImages),
                problem.isCorrect ? 'TRUE' : 'FALSE'
            ];

            csv += row.join(',') + '\n';
        });

        return csv;
    }

    function generateDetailedCSV(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }

        const headers = [
            'Problem Number',
            'Game Type',
            'Problem Label',
            'Selection Number',
            'Selection Time (ms)',
            'Selection Timestamp',
            'Selected Choice ID',
            'Selected Slot Index',
            'Selected Animal Species',
            'Selected Animal Color',
            'Selected Animal Pattern',
            'Selected Animal Size',
            'Is Final Selection',
            'Is Correct'
        ];

        let csv = headers.join(',') + '\n';

        completedProblems.forEach((problem, problemIndex) => {
            const selections = problem.selections || [];

            selections.forEach((selection, selectionIndex) => {
                const isFinal = selectionIndex === selections.length - 1;
                const animals = selection.animals || [];
                const isCorrect = isFinal && problem.isCorrect;

                const selectionTime = selection.timestamp - problem.startTime;

                animals.forEach(animal => {
                    const row = [
                        problemIndex + 1,
                        escapeCSV(problem.type),
                        escapeCSV(problem.label),
                        selectionIndex + 1,
                        selectionTime,
                        new Date(selection.timestamp).toISOString(),
                        selection.choiceId,
                        selection.slotIndex,
                        escapeCSV(animal.species),
                        escapeCSV(animal.color),
                        escapeCSV(animal.pattern),
                        escapeCSV(animal.size),
                        isFinal ? 'TRUE' : 'FALSE',
                        isCorrect ? 'TRUE' : 'FALSE'
                    ];

                    csv += row.join(',') + '\n';
                });
            });
        });

        return csv;
    }

    function escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }

        const stringValue = String(value);

        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
        }

        return stringValue;
    }

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

    function generateFilename(prefix = 'rr_experiment') {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${prefix}_${dateStr}_${timeStr}.csv`;
    }

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

    function generateSummaryReport(completedProblems) {
        if (!completedProblems || completedProblems.length === 0) {
            return null;
        }

        const total = completedProblems.length;
        const correct = completedProblems.filter(p => p.isCorrect).length;
        const totalTime = completedProblems.reduce((sum, p) => sum + p.totalTime, 0);

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

    return {
        generateCSV,
        generateDetailedCSV,
        downloadCSV,
        exportGameData,
        generateSummaryReport
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataExport;
}
