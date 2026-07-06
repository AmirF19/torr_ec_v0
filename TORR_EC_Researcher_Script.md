# TORR EC -- Researcher Script and Session Guide

**Updated:** July 6, 2026

Instructions live in this script and are read aloud by the researcher. There are
no on-screen instructions in the app itself.

---

## Before the session

- Open the study link and reload the page so a fresh session starts.
- A session ID is generated automatically when the page loads. Format:
  `YYYY-MM-DD_HH-MM-SS_XXXX` (date, time, and a four-character random
  identifier). It is written into every row of the exported CSV files and into
  the CSV filename, so you do not need to record it separately.
- Confirm the iPad is in landscape orientation.

## What to say to the participant

Read this once at the start, before the first problem:

> We are going to play some animal games. When you want to pick an animal,
> tap it once with your finger, like this. The animal will move by itself.
> You do not need to drag it. If you change your mind, tap the animal you
> picked and it will go back. When you are happy with your pick, I will
> press the arrow and we will go to the next one.

Demonstrate one tap on the sample problem if the participant hesitates.

## Antinomy: the green and red pens

Read this when the first Antinomy problem appears:

> Look at these two pens. The animals in the green pen all go together.
> The animal in the red pen does not go with them. One spot in the green
> pen is empty. Look at the animals at the bottom and find the one that
> goes in the green pen. When you find it, tap it.

If the participant taps an animal into the green pen and wants to change
their answer, remind them:

> If you want to pick a different animal, tap the one you already picked
> and it will go back.

## Researcher controls

- **Auto-fill (hidden button):** tap the bottom-right corner of the screen
  three times quickly (within 1.5 seconds). The correct answer for the
  current problem is selected automatically. Use this to demo a problem or
  skip ahead. It goes through the normal selection path, so it is recorded
  in the data like a real selection.
- **Game switcher:** the developer panel in the bottom-left corner allows
  jumping between game types. Add `?dev=0` to the URL to hide it during
  real sessions.
- **Data download:** the results screen at the end has a Download Data (CSV)
  button for the summary export. The per-selection detailed export has no
  button; run `App.downloadDetailedData()` in the browser console to get it.
  Both files carry the session ID in every row and in the filename.

## Between participants

- Reload the page. This generates a new session ID and clears the current
  progress.
- Download the data before reloading if the session ended early.
