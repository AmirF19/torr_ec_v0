# Analogy Layout Failure: Diagnosis & Correction

This audit identifies why the recent Phase 3/4 fixes failed to resolve the core layout and alignment issues.

## 1. Why the Question Mark shifted right
**Diagnosis**: Adding the `.animal-slot` class to the `?` container inadvertently triggered a CSS rule in `analogy.css` (Line 184):
```css
.analogy-layout .pen-surface--c .animal-slot {
    width: 100%;
}
```
Because the `?` now has the `.animal-slot` class, it became **100% wide**, consuming all space in the C Pen's flex container and pushing Animal C to the left edge.
- **Correction**: We must use a separate class or a more specific `11vw` override for the `?` slot to prevent it from expansion.

---

## 2. Why `clip-path` doesn't "move" corners
**Diagnosis**: In CSS, `clip-path` is a **cropping** tool, not a **warping** tool. 
- If you set a corner to `-30%`, it simply hides 30% of the image. It does not stretch the pixels to that point.
- **The Solution**: To "pin corners" (distort the SVG to match ground perspective), we must use `transform: perspective()` and `rotateX`/`scale()`. This actually stretches the image pixels to fill the trapezoidal space of the ground.

---

## 3. The Animal Placement Discrepancy
**Diagnosis**: The staggered baselines (Large: -15%, Small: +8%) are intended to create depth in Antinomy's perspective pens. However, in the tighter Analogy pens, these offsets are magnifying the "unaligned" look because the visual "floor" line in the SVG is very narrow.
- **Goal**: Align all animals to the **exact same baseline** (0% offset) in Analogy to ensure they look like they are sharing the same wooden floor line.
- **Mirroring Antinomy**: We will synchronize the `bottom` values in CSS to `0%` for all sizes in the Category Pens specifically, ensuring a clean, uniform row.

---

## 4. Proposed Fix Strategy

| Problem | Fix |
| :--- | :--- |
| **Shifted '?'** | Remove `width: 100%` override for `.question-mark-slot`. |
| **Static Fence** | Replace `clip-path` with `transform: perspective(...) scale(...)` for true corner-stretching. |
| **Unlined Feet** | Set `sizeOffset` to `0` and CSS `bottom` to `0%` for Category Pen animals. |

This strategy will create a perfectly aligned, visually stable analogy layout.
