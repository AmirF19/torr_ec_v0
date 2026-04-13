# TORR EC: Implementation Guidance Document

**Date:** February 26, 2026

This document provides step-by-step instructions, file locations, and code snippets to implement the bug bash changes directly in the codebase. Follow the "File to Edit" paths and copy/paste or modify the specific lines shown in the "Code to Change" sections.

---

## Part 1: Global Application Changes

### 1.1 Test Progression Order
*   **Goal:** Change the core order so that tests run in this sequence: Analogy -> Anomaly -> Antinomy -> Antithesis.
*   **File to Edit:** `js/problems.js`
*   **How to fix:** Scroll down to approximately **Line 60** where `function buildProblemSet()` begins. You will see large blocks of code grouped by comments like `// ======================================== // ANOMALY PROBLEMS`. 
    1. Cut and paste these entire sections so they appear in the new correct order.
    2. *Example Order Structure in the code:*
```javascript
function buildProblemSet() {
    // Reset IDs for consistent problem set
    nextAnimalId = 1; nextGroupId = 1;

    return [
        // 1. ANALOGY PROBLEMS BLOCK (Move this to the top)
        // ... all analogy code ...

        // 2. ANOMALY PROBLEMS BLOCK (Move this second)
        // ... all anomaly code ...

        // 3. ANTINOMY PROBLEMS BLOCK (Move this third)
        // ... all antinomy code ...

        // 4. ANTITHESIS PROBLEMS BLOCK (Move this last)
        // ... all antithesis code ...
    ];
}
```

### 1.2 Data Collection Specifications (CSV Export)
*   **Goal:** Replace filler metrics with the precise requested data points.
*   **File to Edit:** `js/data/export.js`
*   **How to fix:** Go to **Line 16** inside `function generateCSV(completedProblems)`. Update the `headers` array to define the exact columns you want in Excel, and then update the `row` array (around Line 53) to match those headers.
```javascript
// Change Headers (Line 16)
const headers = [
    'Seconds',
    'Option Chosen',
    'Total Animals Selected',
    'Total Clicks',
    'Total Time on Problem',
    'Time From Last Selection'
];

// Change Row Data (Line 53)
const row = [
    new Date(problem.startTime).toISOString(), // Seconds / Timestamp
    escapeCSV(selectedSpecies + ' ' + selectedSizes + ' ' + selectedColors + ' ' + selectedPatterns), // Option Chosen
    problem.totalSelections, // Total Animals Selected
    problem.totalClicks || 0, // Total Clicks (Requires click tracker in main.js)
    problem.totalTime, // Total Time on Problem
    problem.timeSinceLastSelection || 0 // Time From Last Selection
];
```

### 1.3 Animal Population Mechanics (Hidden Button)
*   **Goal:** Create a hidden button to manually populate choice boxes.
*   **File to Edit:** `index.html` and `js/main.js`
*   **How to fix:** First, add an invisible button to your HTML right under the game controls. Then, link it to a JavaScript action that triggers the animals to appear.
```html
<!-- Add this in index.html (around Line 82, below the next-btn) -->
<button id="hidden-populate-btn" style="opacity: 0; position: absolute; pointer-events: auto; width: 50px; height: 50px; bottom: 0; right: 0; z-index: 9999;"></button>
```
```javascript
// Add this in js/main.js (inside setupEventListeners at Line 47)
const populateBtn = document.getElementById('hidden-populate-btn');
if (populateBtn) {
    populateBtn.addEventListener('click', () => {
        // Find the choice box and force it to render its animals
        console.log("Hidden Developer button clicked. Populating animals...");
        // You will add the specific render triggering function here based on the active test
    });
}
```

---

## Part 2: Test-Specific Fixes (CSS Styling)

*CSS files act as the "paint" and "layout instructions" for the website. The following changes require tweaking numbers (like percentages or pixels) inside these files.*

### 2.1 Anomaly
*   **File to Edit:** `css/game-modes/anomaly.css`
*   **Issue 1: Visual Overlap Fence:** Find `.anomaly-layout .pen-ground` (Line 280). Adjust the `top`, `bottom`, `left`, and `right` percentages. Increasing `top` makes the dirty ground area start lower, keeping animals away from the top fence.
*   **Issue 2: Option Overlap:** Find `.anomaly-layout .pen-surface--main .animal-grid` (Line 96). Change `gap: 0.5vw;` to `gap: 2vw;` to push the animals further apart.
*   **Issue 3: Remove Question Metadata:**
    *   **File to Edit:** `js/main.js` (Line 340 `updateProblemCounter`)
    *   **Change:** Empty the counter text calculation so it no longer shows "Question 1 (1 of 7)":
```javascript
// Inside js/main.js, change line 360 from:
const counterText = `${problemData.type}${labelSuffix} (${numberWithinType} of ${totalOfType})`;
// To this:
const counterText = ``; // Leaves it completely blank
```

### 2.2 Analogy
*   **File to Edit:** `css/game-modes/analogy.css`
*   **Issue 1: iPad Overlap (Next Button):** Decrease the overall grid height. Look for `.analogy-layout` and add `margin-bottom: 80px;` to lift the animals above the Next button space.
*   **Issue 2: Choices Box Resizing (75% Bigger):** Search for `.analogy-layout .pen-surface--choices`. Change its `width` from whatever it currently is to something much wider (e.g., from `30vw` to `50vw`).

### 2.3 Antithesis
*   **Issue 1: Persistence Bug (Animals stuck on screen):**
    *   **File to Edit:** `js/renderers/AntithesisRenderer.js` and `js/main.js`
    *   **Change:** The issue occurs because the previous game screen is not fully erased before the next one starts. In `js/main.js`, find `function renderDefaultProblem` and ensure we aggressively clear the container: `container.innerHTML = '';` runs properly during transitions.
*   **Issue 2: Remove Arrows:**
    *   **File to Edit:** `css/game-modes/antithesis.css`
    *   **Change:** Search for the CSS class controlling the arrow (e.g., `.antithesis-arrow`). Add `display: none !important;` to hide it permanently.

### 2.4 Antinomy
*   **File to Edit:** `css/game-modes/antinomy.css`
*   **Issue 1: Question Mark Placement:** Search for `.antinomy-layout .animal-slot--empty::after`. This controls the question mark. Change `margin-left:` and `margin-top:` to `0` to perfectly center it within the selection area.
*   **Issue 2: Green Box / Red Box Baseline Misalignment:**
    *   Search for `.antinomy-layout .pen-surface--green .pen-content` and `.antinomy-layout .pen-surface--red .pen-content`.
    *   Compare their `bottom` percentage values. If the Green Box has `bottom: 25%` and the Red Box has `bottom: 20%`, change the Green Box to `bottom: 20%` so they share the exact same mathematical alignment line for the animals' feet.
