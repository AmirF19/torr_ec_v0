# TORR EC — Six-Week Intern Project

This is a scoped plan for a research intern joining the lab for six weeks. The work has been chosen so that you can make real, visible improvements to the website without touching the parts that, if broken, would compromise a participant's session or the data we collect. Everything here is either additive (you're adding something new), cosmetic (you're adjusting how something looks), or supporting (testing, documentation, cleanup). You can do all of it and the experiment keeps working the whole time.

Read the onboarding guide first if you haven't. It covers how to run the site and the save-your-work routine you'll use every day.

---

## Ground rules

**What's on your plate:** visual polish, a tablet-orientation prompt, clearer instructions for the child, a device/browser testing report, an accessibility review, an image-asset cleanup, and documentation. Details below.

**What's deliberately not on your plate**, and why — so you know to route these to a senior team member rather than tackle them yourself:

- The puzzle definitions in `js/problems.js` (the questions and correct answers). One wrong edit here silently changes what we're measuring.
- The data export in `js/data/export.js` and the tracking in `js/state.js` / `js/main.js`. This is the actual research output.
- The core tap/animation logic in `js/interactions/`. Shared by every game.
- Anything to do with the domain, hosting, IRB, or data storage policy.

If a task ever seems to require changing one of those, that's your signal to pause and ask. It usually means there's a smaller, safer way to get the same result, or that the task belongs to someone else.

**Definition of done** for any task: the change works when you click through a full game in the browser, it looks right on an iPad screen size in both orientations, you've checked it didn't disturb the screens around it, and you've committed it with a clear message. For the research/writing tasks, "done" means a short written summary saved into the repo that someone else could act on.

A realistic note on pacing: weeks 1 and 2 are mostly about getting comfortable and building confidence on low-risk work. The meatier improvements land in weeks 3 through 5. Week 6 is for wrapping up and handing off. If something takes longer than planned, that's fine — better one solid, well-tested change than three rushed ones.

---

## Week 1 — Get oriented and make your first real change

**Goal:** be able to run the site, navigate the code, and ship a tiny fix end to end.

- Set up your tools and clone the repo (onboarding guide, sections 3–4).
- Play through all four games several times. Take notes on anything that feels off — you're seeing it with fresh eyes, which is valuable and won't last. Save those notes; they'll feed later weeks.
- Read through `js/config.js` slowly. It's short and it's the friendliest file in the project — it's just settings. Understanding it gives you a mental map of the whole thing (image locations, animation speeds, the rules for each game).
- **First fix (small, supervised):** `index.html` loads a stylesheet called `css/components/buttons.css` that doesn't exist — the button styles actually live in `css/components/controls.css`. Remove the dead line. Confirm the buttons still look and behave exactly the same afterward. This is a gentle introduction: low stakes, but it's a genuine cleanup and it walks you through the edit-test-commit loop.

**Deliverable:** your first-impressions notes saved as a markdown file in the repo, plus the buttons.css cleanup committed.

---

## Week 2 — Repo cleanup and the image asset audit

**Goal:** leave the project tidier than you found it, and learn the asset side of the codebase.

- **Add a `.gitignore`.** The project doesn't have one, and some files that shouldn't be shared (the `.wrangler/` cache folder) are currently tracked. Ask a senior team member to confirm the list, then add a `.gitignore` covering the wrangler cache, OS clutter (`.DS_Store`, `Thumbs.db`), and editor folders. This is standard housekeeping and a good Git exercise.
- **Audit the image assets.** The `images/elements/` folder has working leftovers — things like `pen_1 - Copy.svg`, a couple of `Gemini_Generated_Image_…png` files, and several near-duplicate fence images. Your job is to figure out which images the site actually uses (start from `js/config.js`, which lists the paths, and search the code for the others) and produce a list of what's referenced versus what's orphaned. Don't delete anything yet — bring the list for review first, then remove the confirmed-unused files.
- **Swap the mis-colored animal.** There's a known issue: a large blue cow in one Antithesis puzzle uses an asset that's the wrong color. Track down which file under `images/website_selection_clean/cow/` is being shown there and replace it with the correct one. This connects the asset folder to the puzzle data and teaches you how an animal picture gets chosen.

**Deliverable:** the `.gitignore`, a short "assets in use vs. orphaned" list saved in the repo, the confirmed-unused files removed, and the cow asset fixed.

---

## Week 3 — Tablet orientation prompt

**Goal:** solve the single biggest usability issue from testing, with a self-contained addition.

During testing, a participant started with the iPad held vertically and couldn't see the whole task — the games are designed for landscape. The cleanest, lowest-risk fix is to detect portrait orientation and show a friendly full-screen overlay that says something like "Please turn your tablet sideways," which disappears on its own when the device is rotated.

This is a great project because it's *additive* — you're building a new piece that sits on top of the existing site without changing how any game works.

- Add the overlay markup and styling. Make it warm and kid-appropriate (a big rotate icon, simple words, maybe a gentle animation). The celebration screens already in the app are a good reference for tone.
- Use CSS to show it only in portrait and hide it in landscape. CSS can detect orientation on its own (an orientation media query), so you may be able to do this with no JavaScript at all — that's the preferred approach because it can't interfere with anything.
- Test by rotating in Chrome's device toolbar (onboarding guide, section 8). Confirm that the game underneath is untouched in landscape and fully covered in portrait.

If there's time and appetite, a stretch version is to actually finish the portrait layouts for the Antinomy and Antithesis games (the responsive CSS already handles Anomaly and Analogy in portrait but not those two). That's more involved and should be a follow-on, not the main goal — the overlay alone solves the participant's problem.

**Deliverable:** the rotation overlay, working in both orientations, committed. A short note on whether you recommend pursuing full portrait layouts later.

---

## Week 4 — Clearer instructions for the child

**Goal:** address the "I didn't know how to interact" friction from testing. All additive or text-only.

Testing showed two gaps: children (and adults) first tried to *drag* the animals when the task is *tap to place*, and it wasn't obvious you can tap a placed animal to send it back. Tapping (not dragging) is an intentional design choice, so the answer is to communicate it, not to change it.

- **Add a short instruction line or a small hint on the first sample of each game.** Something brief and visual — even a tiny tapping-hand animation on the sample item — so the child learns the gesture before the real questions start. Keep the wording minimal; these are young kids and the existing instruction text is short on purpose.
- **Clarify the Antinomy rule.** Testers weren't sure children would understand that the green and red pens represent a fixed rule rather than decoration. Look at the instruction text for Antinomy (it currently reads roughly "choose the option that matches the green box rule") and propose clearer wording, ideally something that frames it as a rule the child is learning. This is a text change, but run your proposed wording past the team before committing — the exact framing matters for the study.
- **Say that placements can be undone.** Add a small note (or work it into the instruction) that you can tap your chosen animal again to send it back. This pairs with the consistency work the senior devs are doing on the undo behavior, so coordinate so the instructions match the actual behavior.

A constraint to keep in mind: instruction text is part of how the task is presented to participants, so treat wording changes as proposals for review rather than free edits. The *mechanism* for showing a hint (a label, an overlay on the sample) is yours to build; the exact words get a sign-off.

**Deliverable:** the on-screen hint mechanism built and shown on sample problems, plus a short proposal doc with your suggested wording for each game's instruction and the undo note.

---

## Week 5 — Visual polish and an accessibility pass

**Goal:** clean up the remaining cosmetic placement issues and review the site for accessibility. This is the most CSS-heavy week.

Pick from the open visual items (full list is in the master task list). Good candidates, all CSS-only and isolated to one game:

- Analogy: the large sheep clips out of the final answer box, and the large yellow dog sits lower than the large red cow in one puzzle. These share a cause (how large animals get sized in Analogy), so solving one likely helps the other.
- Anomaly: a final walk-through of every question confirming no animal perches on or overlaps a fence. The major spacing work is already done — this is the careful last pass.
- Antinomy: a slight overlap on the large blue animals in the first real problem. Minor; a small spacing tweak.

Work one problem at a time, and after each tweak click through the whole game to make sure you didn't shift a different screen. Take a "before" and "after" screenshot for each fix — useful for your write-up and for the team to confirm.

**Accessibility review (the research-flavored half of the week):** go through the site against basic accessibility expectations and write up what you find. Things to check: do the animal images have meaningful text descriptions (they're set in the code — are they accurate?), can you complete a game using only the keyboard, is the text readable against its background, and does the site respect a "reduce motion" setting for users sensitive to animation. You don't have to fix everything you find — a clear, prioritized list of issues is itself a valuable deliverable, and the easy fixes you can do.

**Deliverable:** the chosen visual fixes committed with before/after screenshots, and an accessibility findings document (what's good, what to improve, ranked).

---

## Week 6 — Documentation and handoff

**Goal:** make sure the next person (and the team) can build on what you did.

- **Write up a "how each game is built" visual guide.** Using screenshots of each of the four games, label which file controls which part (this box comes from this CSS file, this animation from this renderer). The README has a text version of this; you're making it visual and current. This is genuinely useful — it's the document you wish you'd had in week 1.
- **Refresh the docs you touched.** If the asset list, instruction wording, or anything else changed, update the relevant notes so they're accurate.
- **Polish item (optional, fun):** the between-game celebration screens got positive feedback during testing. If you want a lighter task to close on, you could refine the confetti or the celebration wording in `js/main.js`. Purely cosmetic, totally safe.
- **Write a one-page handoff.** What you accomplished, what's committed, what you started but didn't finish, and what you'd do next with more time. Save it in the repo.

**Deliverable:** the visual game guide, updated docs, and the handoff page.

---

## A few extra ideas, if you finish early

These aren't scheduled, but if you move faster than expected or want a change of pace, any of them is safe and useful:

- A printable one-page "how to run a session" cheat sheet for researchers (how to start, what the buttons do, how to download the data at the end).
- A simple visual style check across the four games — are fonts, button styles, and colors consistent? Note any drift.
- Test the site on a few real devices you have access to (different iPads, maybe an Android tablet) and add to the accessibility/testing report.
- A short screen-recording walkthrough of a full session, for onboarding future helpers.

---

## How to pick up a task each day

1. Pull the latest first (onboarding guide, section 5).
2. Pick one item. If it's not obvious where to start, ask — a two-minute question beats an hour of hunting.
3. Make the change, test it in the browser across orientations, check the neighboring screens.
4. Commit with a clear message, push.
5. Jot a line in your running notes about what you did and anything that surprised you.

The goal over six weeks isn't to clear the whole list — it's to leave the project noticeably better and better-documented than you found it, and to come away understanding how a real research tool is built and maintained. The tasks here are arranged so that even if you only get through weeks 1 to 4, the participant experience is meaningfully improved.
