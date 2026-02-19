# CSS Customization Guide - Relational Reasoning Study

## Table of Contents
1. [Understanding CSS Units for Proportionality](#understanding-css-units-for-proportionality)
2. [Global Settings (All Games)](#global-settings-all-games)
3. [Anomaly Game](#anomaly-game)
4. [Analogy Game](#analogy-game)
5. [Antithesis Game](#antithesis-game)
6. [Antinomy Game](#antinomy-game)
7. [Animal Sizes](#animal-sizes)

---

## Understanding CSS Units for Proportionality

### CRITICAL: Use the RIGHT units for proportional scaling

| Unit | Behavior | When to Use |
|------|----------|-------------|
| `vw` | % of viewport WIDTH | Horizontal sizes that should scale with screen width |
| `vh` | % of viewport HEIGHT | Vertical sizes that should scale with screen height |
| `%` | % of PARENT element | Relative to container |
| `px` | Fixed pixels | AVOID for main sizes (use only for min-width) |
| `clamp(min, preferred, max)` | Responsive range | Best for proportional elements |

### The Proportionality Problem
When you use `min-width: 350px` with `width: 70vw`, on small screens:
- 70vw might be 280px, but min-width forces 350px
- This breaks layout because element is now larger than intended

### Solution: Use `clamp()` for all sizes
```css
/* BAD - breaks on small screens */
width: 70vw;
min-width: 350px;

/* GOOD - proportional with limits */
width: clamp(280px, 70vw, 1200px);
```

---

## Global Settings (All Games)

### File: `css/variables.css`

| Line | Variable | Current Value | Effect |
|------|----------|---------------|--------|
| 93 | `--main-pen-width` | `55vw` | Default main pen width |
| 94 | `--main-pen-height` | `50vh` | Default main pen height |
| 97 | `--out-pen-size` | `18vw` | Default out pen size |
| 100 | `--question-pen-width` | `45vw` | Question pen width |
| 101 | `--question-pen-height` | `40vh` | Question pen height |
| 102 | `--answer-pen-size` | `20vw` | Answer pen size |
| 114 | `--slot-size` | `9vw` | Default animal slot size |
| 119 | `--slot-gap` | `2vw` | Gap between animal slots |

### File: `css/components/pen.css`

#### Ground Positioning (Lines 113-143)
Controls where the dirt/ground SVG appears inside the fence.

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 119 | `top: 35%` | 35% | Distance from TOP of pen to TOP of ground. **Increase = ground moves DOWN** |
| 120 | `left: 5%` | 5% | Distance from LEFT edge. **Increase = ground narrows from left** |
| 121 | `right: 5%` | 5% | Distance from RIGHT edge. **Increase = ground narrows from right** |
| 122 | `bottom: 8%` | 8% | Distance from BOTTOM of pen. **Increase = ground moves UP** |

#### Trapezoid Shape (Lines 130-135)
Controls the 3D perspective shape of the ground.

```css
clip-path: polygon(
    12% 0%,       /* Line 131: Top-left corner indent. Increase = narrower top */
    88% 0%,       /* Line 132: Top-right corner. Decrease = narrower top */
    100% 100%,    /* Line 133: Bottom-right (full width) */
    0% 100%       /* Line 134: Bottom-left (full width) */
);
```

#### Content Area / Animal Positioning (Lines 150-176)
Controls where animals are placed within the pen.

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 156 | `top: 40%` | 40% | Distance from top. **Increase = animals start LOWER** |
| 157 | `left: 15%` | 15% | Inset from left. **Increase = animals move RIGHT** |
| 158 | `right: 15%` | 15% | Inset from right. **Increase = animals move LEFT** |
| 159 | `bottom: 15%` | 15% | Distance from bottom. **Increase = animals move UP** |

---

## Anomaly Game

### File: `css/game-modes/anomaly.css`

#### Layout (Lines 35-50)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 39 | `gap: 4vw` | 4vw | Space between main pen and out pen. **Increase = more separation** |
| 41-42 | `width: 94%` | 94% | Total layout width. **Decrease = more screen edge margin** |
| 43-44 | `margin-left/right: 3%` | 3% | Screen edge margins |
| 46 | `margin-top: 2vh` | 2vh | Distance from top of screen. **Increase = pens move DOWN** |
| 48 | `min-height: 65vh` | 65vh | Minimum layout height |

#### Main Pen (Lines 61-66)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 62 | `width: 70vw` | 70vw | Main pen width. **Increase = wider pen** |
| 63 | `height: 75vh` | 75vh | Main pen height. **Increase = taller pen** |
| 64 | `min-width: 350px` | 350px | Minimum width (prevents too small) |
| 65 | `min-height: 280px` | 280px | Minimum height |

#### Animal Grid (Lines 69-82)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 71 | `grid-template-columns: repeat(5, 1fr)` | 5 columns | Number of animal columns. Change `5` to `4` for 4 animals |
| 73 | `gap: 1vw` | 1vw | Space between animals |
| 80 | `align-items: end` | end | Vertical alignment. `end` = feet at bottom (baseline) |
| 81 | `justify-items: center` | center | Horizontal alignment |

#### Out Pen / "Does Not Belong" (Lines 110-125)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 111 | `width: 26vw` | 26vw | Out pen width |
| 112 | `height: 68vh` | 68vh | Out pen height |
| 121 | `width: 11vw` (slot) | 11vw | Animal slot width in out pen |
| 122 | `height: 30vh` (slot) | 30vh | Animal slot height in out pen |

#### Responsive Breakpoints

**Tablet (768px-1024px)** - Lines 139-169:
- Reduces pen sizes for tablet screens

**Mobile (<767px)** - Lines 172-219:
- Stacks pens vertically
- Adjusts all sizes for mobile

---

## Analogy Game

### File: `css/game-modes/analogy.css`

#### Layout (Lines 10-25)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 14 | `gap: 10vw` | 10vw | Space between question pen and answer pen |
| 16-17 | `width: 90%` | 90% | Total layout width |
| 18-19 | `margin-left/right: 5%` | 5% | Screen edge margins |
| 21 | `margin-top: 3vh` | 3vh | Distance from top |

#### Question Pen (Lines 35-62)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 36 | `width: 60vw` | 60vw | Question pen width |
| 37 | `height: 50vh` | 50vh | Question pen height |
| 45 | `grid-template-columns: repeat(3, 1fr)` | 3 columns | 3 items in question |
| 49 | `align-items: center` | center | Vertical alignment |

#### Gate/Arrow (Lines 68-79)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 73 | `margin-top: 12vh` | 12vh | Vertical position of arrow |
| 77 | `width: clamp(80px, 12vw, 180px)` | responsive | Arrow image size |

#### Answer Pen (Lines 90-113)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 87 | `margin-top: 5vh` | 5vh | Vertical offset from question pen |
| 91 | `width: 20vw` | 20vw | Answer pen width |
| 92 | `height: 20vw` | 20vw | Answer pen height (square) |
| 100 | `grid-template-columns: repeat(2, 1fr)` | 2x2 grid | 4 answer choices |

---

## Antithesis Game

### File: `css/game-modes/antithesis.css`

#### Layout (Lines 10-18)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 14 | `gap: var(--space-lg)` | ~30px | Vertical gap between box row and options |

#### Box Row (Lines 24-30)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 28 | `gap: clamp(20px, 4vw, 60px)` | responsive | Space between sequence boxes |

#### Sequence Boxes (Lines 42-50)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 43 | `width: clamp(120px, 18vw, 220px)` | responsive | Box width |
| 44 | `height: clamp(120px, 18vw, 220px)` | responsive | Box height (square) |
| 48-49 | animal slot size | `clamp(70px, 10vw, 120px)` | Animal size inside boxes |

#### Options/Choices Pen (Lines 82-98)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 83 | `width: clamp(300px, 60vw, 700px)` | responsive | Options pen width |
| 84 | `min-height: clamp(140px, 25vh, 220px)` | responsive | Options pen height |
| 89 | `grid-template-columns: repeat(auto-fit, minmax(80px, 1fr))` | auto | Auto-fit columns |
| 96-97 | animal slot size | `clamp(65px, 9vw, 100px)` | Option animal sizes |

---

## Antinomy Game

### File: `css/game-modes/antinomy.css`

#### Layout (Lines 10-18)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 14 | `gap: var(--space-lg)` | ~30px | Vertical gap between category row and choices |

#### Category Row (Lines 24-30)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 28 | `gap: clamp(30px, 6vw, 100px)` | responsive | Space between green and red boxes |

#### Green Box (Lines 40-56)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 41 | `width: clamp(200px, 30vw, 350px)` | responsive | Green box width |
| 42 | `min-height: clamp(150px, 22vh, 250px)` | responsive | Green box height |
| 49 | `filter: drop-shadow(...)` | green glow | Border glow color |

#### Red Box (Lines 66-82)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 67 | `width: clamp(200px, 30vw, 350px)` | responsive | Red box width |
| 68 | `min-height: clamp(150px, 22vh, 250px)` | responsive | Red box height |
| 75 | `filter: drop-shadow(...)` | red glow | Border glow color |

#### Category Box Grids (Lines 88-103)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 91 | `grid-template-columns: repeat(3, 1fr)` | 3 columns | Animals per row in category boxes |
| 99-100 | animal slot size | `clamp(55px, 7vw, 90px)` | Animal size in category boxes |

#### Choices Pen (Lines 113-129)

| Line | Property | Current | Effect |
|------|----------|---------|--------|
| 114 | `width: clamp(300px, 55vw, 650px)` | responsive | Choices pen width |
| 115 | `min-height: clamp(130px, 18vh, 180px)` | responsive | Choices pen height |
| 120 | `grid-template-columns: repeat(auto-fit, minmax(75px, 1fr))` | auto | Auto-fit columns |
| 127-128 | animal slot size | `clamp(60px, 8vw, 95px)` | Choice animal sizes |

---

## Animal Sizes

### File: `css/components/animal-slot.css`

#### Single Animals (Lines 156-178)

| Line | Class | Current Height | Effect |
|------|-------|----------------|--------|
| 159 | `.animal-image--large` | `28vh` | Large animal height. **Increase = bigger animals** |
| 167 | `.animal-image--medium` | `20vh` | Medium animal height |
| 175 | `.animal-image--small` | `13vh` | Small animal height |

#### Grouped Animals (Lines 181-200)

| Line | Class | Current Height | Effect |
|------|-------|----------------|--------|
| 183 | `.animal-slot--grouped .animal-image--large` | `18vh` | Large animal when grouped |
| 190 | `.animal-slot--grouped .animal-image--medium` | `14vh` | Medium animal when grouped |
| 198 | `.animal-slot--grouped .animal-image--small` | `10vh` | Small animal when grouped |

---

## Fixing Proportionality Issues

### Step 1: Replace fixed min-width/min-height with clamp()

In `anomaly.css`, change:
```css
/* Line 64-65 - BEFORE */
min-width: 350px;
min-height: 280px;

/* AFTER - proportional */
/* Remove min-width/min-height and use clamp for width/height */
width: clamp(280px, 70vw, 1400px);
height: clamp(220px, 75vh, 900px);
```

### Step 2: Update all game files

Apply the same pattern to:
- `anomaly.css` lines 64-65, 113-114, 152, etc.
- `analogy.css` lines 38-39, 93-94, etc.
- All responsive breakpoints

### Step 3: Test at multiple screen sizes
1. Full screen desktop
2. Half-width window
3. Tablet size (768px)
4. Mobile size (375px)

---

## Quick Reference: What Controls What

| What you want to change | File | Lines |
|-------------------------|------|-------|
| Space between pens | Game mode CSS | `gap` in layout |
| Pen width/height | Game mode CSS | `.pen-surface--*` |
| Ground position in fence | `pen.css` | Lines 119-122 |
| Ground trapezoid shape | `pen.css` | Lines 130-135 |
| Animal position in pen | `pen.css` | Lines 156-159 |
| Animal sizes (all games) | `animal-slot.css` | Lines 156-178 |
| Number of columns | Game mode CSS | `grid-template-columns` |
| Screen edge margins | Game mode CSS | `margin-left/right` |
| Responsive behavior | Game mode CSS | `@media` sections |
