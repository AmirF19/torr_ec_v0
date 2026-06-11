# Getting Started — TORR EC Website

Welcome to the project, Thuy! This guide assumes very little previous web development work. 

If anything here doesn't match what you see on your screen, feel free to send me an email--a mismatch usually means something changed and the docs need updating, which is useful to know.

---

## 1. What this project is

It's a website that runs four reasoning games for 4-6 year old participants. A child taps animal pictures to answer puzzles, and the website keeps records of their answers (what they picked, how long it took, how many times they tapped). The website will not be used in a live setting, but rather in the lab. 

Be sure to follow the dimensions that the website will be used in. The dimensions are for an **iPad 11, 1194x834 in landscape mode**. Test it in this mode. 

---

## 2. Development languages

You'll be working across three languages:

**HTML** (`index.html`) It does not control how things look or what happens when you click. There's only one HTML file in this project, and you'll rarely change it.

**CSS** (everything in the `css/` folder) — colors, sizes, spacing, positions. If an animal is too big, sitting too low, or overlapping a fence, I would recommend that you first check one of the CSS files.

**JavaScript** (everything in the `js/` folder) — what happens when the child taps, how an animal animates across the screen, which puzzle comes next, what gets recorded. This is the most involved of the three.

---

## 3. Install list

1. **Web browser.** Preferably Safari, but working in Chrome works too. 
2. **A code editor.** Visual Studio Code (VS Code) is free. Download it from code.visualstudio.com.
3. **The "Live Server" extension for VS Code.** Open VS Code, click the Extensions icon on the left (the four little squares), search for "Live Server" by Ritwick Dey, and install it. This lets you run the site locally.

---

## 4. Get the code and run it

1. In VS Code, open the Command Palette (View menu → Command Palette), type "Git: Clone," paste the repository link, and pick a folder to put it in.
2. When it finishes, open that folder in VS Code.

To run the site:

- Find `index.html` in the file list on the left.
- Right-click it and choose **"Open with Live Server."**
- Your browser opens with the site running. You should see the welcome screen with a start arrow.

That should work. Nothing you do here touches the live website that real participants would use. Use this as reference for development.

---

## 5. Git

Follow these steps to avoid merge conflicts.

**Step 1 — Get the latest before you touch anything.**

git pull

**Step 2 — Make your change.**
Edit the file. Save it.

**Step 3 — Look at it in the browser.**
Switch to the browser tab running Live Server and refresh. Confirm your change did what you expected and didn't break anything else.

**Step 4 — See what you changed.**
In the Source Control panel you'll see a list of every file you modified. Click any of them to see exactly what's different.

**Step 5 — Commit.**
In the Source Control panel, type a short message describing what you did. Then click the Commit checkmark.
```
git add .
git commit -m "Insert message here"
```

**Step 6 — Push.**
Click "Sync Changes".

Commit small and often. One commit per fix is much easier to understand (and undo, if needed) than one giant commit at the end of the day.

---

## 6. Project Overview

```
index.html              The one HTML file.

css/
  variables.css         Shared colors, spacing, and sizes used everywhere.
  base.css              Resets and basic text styling.
  layout.css            The big containers and overall arrangement.
  responsive.css        Rules that change the layout for different screen sizes (phone,
                        tablet portrait, tablet landscape, desktop).
  components/           Styling for reusable pieces (buttons, the header, the pens, an
                        animal slot, the results panel, etc.).
  game-modes/           One file per game: anomaly.css, analogy.css, antinomy.css,
                        antithesis.css. Most per-game visual tweaks live here.

js/
  config.js             Settings: image paths, animation speeds, game rules.
  state.js              Keeps track of what's happening: puzzle, selected item, timers.
  problems.js           The puzzles. Every question and its correct answer is defined here.
  main.js               Starts the app, moves between screens and puzzles.
  components/           Builders for on-screen pieces (an animal slot, a pen).
  interactions/         The tap and animation logic.
  renderers/            One file per game that builds that game's screen. AnomalyRenderer.js,
                        AnalogyRenderer.js, AntinomyRenderer.js, AntithesisRenderer.js.
  data/                 Saving progress (storage.js) and the spreadsheet export (export.js).

images/                 All the pictures: backgrounds, fences, and the animal artwork.
```

**The four experiments / "games":**

- **Anomaly** — "What doesn't belong?" Pick the odd one out.
- **Analogy** — "What goes with?" Finish the pattern (A is to B as C is to ?).
- **Antithesis** — "What goes in the middle?" Fill the gap in a sequence.
- **Antinomy** — "What goes here?" Place the item that follows the green-box rule.

---

## 7. Process of making changes

When the page loads, `index.html` pulls in all the CSS and JavaScript files. JavaScript then builds the game screens on the fly: when it's time for, say, an Anomaly puzzle, `main.js` calls `AnomalyRenderer.js`, which reads that puzzle's data from `problems.js` and creates the boxes and animal pictures. The CSS files then decide how all of that looks.

So if you want to change:

- **how something looks** (size, color, position, spacing) → a CSS file, usually in `css/game-modes/` for a specific game or `css/variables.css` for something global.
- **the puzzles themselves** (which animals, the right answer) → `js/problems.js`.
- **what happens on a tap, or the animation** → `js/interactions/` and the `js/renderers/` file for that game.

**Caching** Browsers try to reuse old copies of CSS/JS files. To force a fresh copy after a change, the project adds a version tag to the file name in `index.html`.
<link rel="stylesheet" href="css/game-modes/anomaly.css?v=15">
The `?v=15` doesn't change the file it just gets the browser to reload it. If you edit a CSS file and the browser shows the old version even after refreshing, bump that number (15 → 16) in `index.html` and refresh again. (A hard refresh — Ctrl+Shift+R — often works too.)