# Analogy Mode: Exhaustive Component Audit

This report lists every line of code that influences how animals are placed and how the fence is displayed.

## 1. Animal Placement (Vertical & Horizontal)

| File | Component | Role |
| :--- | :--- | :--- |
| **JS** | [AnalogyRenderer.js](file:///C:/Users/Muhammad/OneDrive/Desktop/RR_Anomaly/torr_ec_v0/js/renderers/AnalogyRenderer.js) | Calculates the pixel-exact (X, Y) landing target. |
| **JS** | [AnimalSlot.js](file:///C:/Users/Muhammad/OneDrive/Desktop/RR_Anomaly/torr_ec_v0/js/components/AnimalSlot.js) | Defines the HTML wrapper (`animal-group`) that holds the image. |
| **CSS** | [animal-slot.css](file:///C:/Users/Muhammad/OneDrive/Desktop/RR_Anomaly/torr_ec_v0/css/components/animal-slot.css) | Defines the fixed `vh` heights: Large (28vh), Medium (20vh), Small (13vh). |
| **CSS** | [analogy.css](file:///C:/Users/Muhammad/OneDrive/Desktop/RR_Anomaly/torr_ec_v0/css/game-modes/analogy.css) | Contains the **Global Offsets** (Large: -15%, Small: 8%) that shift feet up/down. |
| **CSS** | [analogy.css](file:///C:/Users/Muhammad/OneDrive/Desktop/RR_Anomaly/torr_ec_v0/css/game-modes/analogy.css) | Scopes pen dimensions (`53vw`) which changes the relative value of those percentage offsets. |

### The "Discrepancy" Diagnosis
Even though the JS lands the animal at `0px` offset, the CSS rule below (Lines 341 & 351 of `analogy.css`) immediately pushes it back into a staggered position:
```css
.analogy-layout .animal-slot .animal-image--large { bottom: -15% !important; }
.analogy-layout .animal-slot .animal-image--small { bottom: 8% !important; }
```
**To fix this permanently**: We must set these to `0%` specifically for the Analogy Category Pens, so they don't inherit the global "depth" offsets used in other games.

---

## 2. Fence & Corner Controls

| Component | Responsibility | Relevant CSS Rule in `analogy.css` |
| :--- | :--- | :--- |
| **Boundary** | The rectangle of the pen floor. | `.pen-surface--ab` width/height |
| **Overlay** | The SVG image of the fence. | `.pen-fence img` |
| **Position** | Where the SVG sits in the pen. | `left: 0%`, `top: 15%` |
| **Scale** | The size of the SVG pixels. | `transform: scale(2.1, 1.2)` |
| **Origin** | Where the scaling starts from. | `transform-origin: center bottom` |

### Why `clip-path` failed you
`clip-path` is like a **cookie cutter**. If you move a point to `-30%`, it just cuts off the edge of the image. It **cannot stretch** the wooden planks to reach that point.

### The "Precision Corner" Solution
To actually **move a corner**, we will use a **4-POINT MATRIX**. This is the highest level of control available. It stretches the pixels precisely to the corners you define.

---

## 3. The Resolution Path

1.  **Stop Global Inheritance**: Force `bottom: 0%` on all sizes inside `.pen--ab` and `.pen--c`.
2.  **Activate "Warping" UI**: Replace `clip-path` with a `matrix3d` helper. I will provide a calculator in the CSS comments that allows you to stretch specific corners.
