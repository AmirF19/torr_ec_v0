# Relational Reasoning Study (EC)

A web-based cognitive task designed for a relational reasoning study. It features multiple game modes where users interact with animal figures to solve logical reasoning puzzles.

## Project Overview

*   **Current Implementation**: The project runs directly in the browser. No bundlers (Webpack/Vite) or package managers (npm/yarn) are required for the core application.
*   **Future Development**: The project is intended to be implemented on a web browser for an iPad (no exact specifications yet).
*   **Entry Point**: `index.html`

## Setup & Running

1.  **Clone or Download the repository**.
2.  **Open `index.html`**: Simply double-click the file to open it in your browser.
3.  **Optional**: For the most reliable experience (especially for saving progress across sessions), you can run a local server:
    *   *Python*: `python -m http.server 8000`
    *   *VS Code*: Use the "Live Server" extension.
    *   *Node*: `npx serve .`

## Project Architecture

The codebase handles clean separation of concerns:

### 1. Directory Structure
```
/
├── index.html          # Main entry point, contains base DOM structure
├── css/
│   ├── base.css        # Reset and typography
│   ├── layout.css      # Main containers and grid systems
│   ├── variables.css   # CSS variables (colors, spacing, fonts)
│   ├── components/     # Specific UI components (controls, header, pens)
│   └── game-modes/     # Layout styles specific to each game mode
├── js/
│   ├── config.js       # Global constants (paths, timing, game rules)
│   ├── state.js        # Global state management (Pub/Sub pattern)
│   ├── problems.js     # Problem definitions and data generation
│   ├── main.js         # Application bootstrapper
│   ├── components/     # UI Component factories (AnimalSlot.js, Pen.js)
│   ├── interactions/   # Logic for Drag/Drop/Click & Animations
│   ├── renderers/      # Logic to render specific game modes into the DOM
│   └── data/           # Storage and Export logic
└── images/             # Assets (backgrounds, UI elements, animal SVGs)
```

### 2. Key Modules

*   **`js/config.js`**: The central configuration file. Edit this to change image paths, animation durations, or game constants.
*   **`js/state.js`**: Manages the application state (current problem, selections, session ID) and provides an observer pattern (`subscribe`) for UI updates.
*   **`js/problems.js`**: Contains the hardcoded problem sets. This is where you add new questions or modify existing ones.
*   **`js/renderers/`**: Each game mode (Anomaly, Analogy, Antithesis, Antinomy) has a dedicated renderer that constructs the DOM based on the problem data.

## Game Modes

1.  **Anomaly**: "What Does Not Belong?" - Users select the odd one out from a main pen.
2.  **Analogy**: "Complete the Pattern" - Users choose an item to complete a visual analogy (A:B :: C:?).
3.  **Antithesis**: "Find the Middle" - Users fill a middle slot to complete a sequence.
4.  **Antinomy**: "What Goes Game" - Users place an item that follows a rule into a specific category box.

## Developer Guide: Example Modifications

### 1. Changing Animal SVG Elements
To update the source images for animals:
*   **File**: `js/config.js`
*   **Action**: Update the `images.animalsBase` path or the `animals.sizeFolderMap` if your folder structure changes.
*   **Note**: The system expects specific naming conventions (`green.svg`, `00_no_stripe_small`, etc.) defined in `js/problems.js`.

### 2. Changing Animal Sizing
To adjust the visual size of the animals:
*   **File**: `css/components/animal-slot.css`
*   **Action**: Modify the CSS classes for specific sizes:
    ```css
    .animal-image--small { height: 60%; }
    .animal-image--medium { height: 75%; }
    .animal-image--large { height: 90%; }
    ```
*   **Game-Specific**: Some game modes override these sizes in `css/game-modes/antinomy.css` (etc.) to fit their specific layout constraints. Check there if your changes aren't applying.

### 3. Moving Animal Baseline (Up/Down)
To adjust where animals sit within their slots:
*   **File**: `css/game-modes/[mode].css` (e.g., `antinomy.css`)
*   **Action**: Look for the `.animal-slot` or `.animal-image` rules.
    *   **Move UP**: Increase `bottom: X%` or `margin-bottom`.
    *   **Move DOWN**: Decrease `bottom` or use `transform: translateY(10%)`.
    ```css
    /* Example in antinomy.css */
    .antinomy-layout .pen-surface--green .animal-slot .animal-image--medium {
        bottom: 5%; /* Change this value */
    }
    ```

### 4. Changing Pen Colors
To change the color themes (e.g., from Green/Red to Blue/Orange):
*   **File**: `css/variables.css`
    *   Update `--accent-green` or `--accent-red`.
*   **File**: `css/game-modes/antinomy.css`
    *   Update specific gradient backgrounds or border colors if they are hardcoded for that specific pen style.

### 5. Fitting Ground SVG to Fence
To adjust how the ground `svg` sits inside the fence:
*   **File**: `css/game-modes/[mode].css`
*   **Action**: Adjust the `clip-path` and `transform` properties of the `.pen-ground`.
    ```css
    /* Example */
    .pen-surface--green .pen-ground {
        /* Controls the visible shape of the ground */
        clip-path: polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%);
        /* Controls size and position */
        transform: scaleX(1.1); 
    }
    ```
*   **Fence Sizing**: You can also adjust the fence image itself using `transform: scale(...)` on `.pen-fence img`.

### 6. Adjusting Animation Speed
To make animations faster or slower:
*   **File**: `js/config.js`
*   **Action**: Edit the `animation` object:
    ```javascript
    animation: {
        animalMove: 400, // ms
        animalSwap: 450, // ms
        ...
    }
    ```

## Customization

### Adding New Problems
Modifying `js/problems.js` is the primary way to change content.
Use the helper functions `a()` (animal) and `makeChoice()` to construct new items.

### Changing Styles
*   **Global Layout**: `css/layout.css`
*   **Colors/Fonts**: `css/variables.css`
*   **Specific Modes**: `css/game-modes/*.css`

## Data & Logging
Data is saved locally via `localStorage` (handled in `js/data/storage.js`).
At the end of a session, users can download their unique session data as a CSV file (`js/data/export.js`).

## Browser Support
Designed for modern browsers (Chrome, Firefox, Safari, Edge). Optimized for both desktop and tablet interactions.

## Game Type Explainers: Code-to-Visual Guide

This section explains how specific lines of code control the visual elements on the screen.

### 1. Anomaly ("What Does Not Belong?")
**Visual Layout**: One large box (Main Pen) and one small box (Out Pen).
*   **Grid layout**: Controlled by `js/renderers/AnomalyRenderer.js`.
    *   *Code*: `gridClass` logic toggles between `.animal-grid--4col` and `.animal-grid--anomaly`.
*   **Main Pen Size**: Controlled in `css/game-modes/anomaly.css`.
    *   *Code*: `.anomaly-layout .pen-surface--main` sets the `width` and `aspect-ratio`.
*   **Out Pen**: The small box on the right.
    *   *Code*: Defined as `.pen--out` in `css/game-modes/anomaly.css`.

### 2. Analogy ("Complete the Pattern")
**Visual Layout**: Top box (Question), Gate/Arrow, Bottom box (Answers).
*   **The Gate & Arrow**: The image between the two pens.
    *   *Code*: Created in `js/renderers/AnalogyRenderer.js` as `.gate-container`.
    *   *Image Source*: `Config.images.elements.gateRight` in `js/config.js`.
*   **Question Box**: The top container.
    *   *Code*: `.analogy-layout .pen-surface--question` in `css/game-modes/analogy.css`.
*   **Answer Choices**: The bottom container.
    *   *Code*: `.analogy-layout .pen-surface--answer` in `css/game-modes/analogy.css`.

### 3. Antithesis ("Find the Middle")
**Visual Layout**: A sequence `[Box 1] -> [?] -> [Box 3]` with a `[Options]` pen below.
*   **The Arrows**: The `→` symbols between boxes.
    *   *Code*: Created in `js/renderers/AntithesisRenderer.js` as elements with class `.arrow-indicator`.
    *   *Style*: Look for `.arrow-indicator` in `css/game-modes/antithesis.css` to change size/color.
*   **The Middle Box (?)**: Explicitly created as a "Question Mark Box".
    *   *Code*: `createQuestionMarkBox('?', 2)` inside `AntithesisRenderer.js`.
*   **Box Dimensions**: All three top boxes share styles.
    *   *Code*: `.antithesis-layout .pen-surface--sequence` in `css/game-modes/antithesis.css`.

### 4. Antinomy ("Sort by Rule")
**Visual Layout**: Green Box (Left), Red Box (Right), Choices Box (Bottom).
*   **Green vs Red Styling**: The specific themes for the top boxes.
    *   *Code*: `css/game-modes/antinomy.css` defines `.pen-surface--green` and `.pen-surface--red`.
    *   *Gradients*: The colored backgrounds are set here (e.g., `linear-gradient(...)`).
*   **The "VS" Text**: The text between the green and red boxes.
    *   *Code*: Created in `js/renderers/AntinomyRenderer.js` as `.vs-indicator`.
    *   *Hidden?*: It might be set to `opacity: 0` or `display: none` in the CSS if not visible.
*   **Choices Pen Positioning**:
    *   *Code*: `.antinomy-layout .pen--choices` in the CSS handles its fixed position at the bottom.

## Contributors
*   **Muhammad Fusenig** - Lead Developer. Designed and implemented the core game logic, UI interactions, and responsive layouts.
