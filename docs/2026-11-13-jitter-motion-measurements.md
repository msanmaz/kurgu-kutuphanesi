# Jitter templates: measured motion · 2026-11-13

**Creator, 2026-11-13:** "can you use animation vocabulary skills and review jitter to get properly motions". This followed the five Jitter-template cards (`app/lib/motion/templates/jitter.ts`), whose first motion was Claude's guess from 0.5 s samples.

## Method

- **The preview:** each template's public preview player on jitter.video, viewed in Chrome.
- **Recording:** in the page, each frame of the player's canvas was copied at display rate (about 117 fps) for one or two loops.
- **Metrics:**
  - The mean pixel change per frame shows cuts as one-frame spikes and eases as velocity curves.
  - Contact grids at 1/30–1/12 s steps were viewed directly.
- **Not used:** reading Jitter's project file through its API was refused by the permission check. These are measurements of the rendered preview, not the template's keyframe data, so easing curves are inferred from the velocity shape, to ±1 frame.
- **Terms:** from the animation-vocabulary skill (Emil Kowalski's glossary).

## Findings

| Template | What it actually does (vocabulary) | Measured |
|---|---|---|
| Counter: Halftone Poster | **Stepped animation** · **Number ticker** with hard cuts; no tween at all | One number every **0.57 s**, a one-frame cut, nothing moving between cuts. The count runs 7 → 1 (seen as 5 4 3 2 1 7 6 …); loop 4.0 s. Didone serif, except the 4 in another face. |
| Blur: Text Scroller | Translate on an **asymmetric ease-in-out**, then **follow-through**; the middle word's colour **crossfades** grey → white partway through the move | One move every **0.75 s**. The motion lasts about 0.5 s and peaks about 0.15 s in, with a long ease-out tail. The jump itself takes about 0.15–0.2 s. Blur, scale and colour keep settling about 0.3 s after the position lands, then hold about 0.25 s. The left edge curves, as on a drum (3D tilt). |
| The Track: Animated Quote | Card **slide in** (ease-out) → word **stagger** (hard appear) → **layout animation** (card grows for the attribution) + name **typewriter** → hold → **slide out** (ease-in) | Card enters from below about 1.0–1.45 s into the loop. Words appear 0.03–0.12 s apart, the quote in about 0.4 s, each word in one frame. The attribution comes about 0.75 s after the first word: the card grows over about 0.3 s, ease-out, and the name types in. Hold about 1.5 s. Exit 0.40 s, with velocity rising steadily until the card leaves the frame (ease-in). Photo alone about 1.1 s. Loop 5.0 s. The photo is footage with slight constant motion. |
| The Track: Session Complete | Black hold → **strobe** (hard cuts black ↔ photo) → number grid erased by a reverse **typewriter** with a **stagger** → headline word by word → stats typewriter → hard-cut insert of the grey tracking frame → hard cut back → cut to black | Black 0.35 s; strobe 0.3 s (cuts about every 0.04 s); runner 0.2 s; full "58.42s" grid about 0.15 s; erase 0.6 s in steps of about 0.08 s (≈ 12 fps), rows shortening at different times; "Session" then "Complete." 0.08 s apart; grey tracking frame 0.50 s, about 1.1 s after the headline; poster hold about 2.6 s; loop 6.1 s. |
| Grainy Color Clamp | Two clamped shots joined by **hard cuts**; the grain is static, tied to the image; the footage moves in low-frame-rate steps; the type is static | Shot A (black on paper) about 1.6 s, shot B (red overprint) about 2.1 s, loop 3.7 s. No dissolve. The grain changes only when the footage steps. |

## What changed in the cards (Claude's first guess → measured)

- **yarim-ton-adim:**
  - Before: dots grew row by row with a settle spring.
  - Now: hard cut by default (`grow` 0). Growing stays available as our own option.
  - The pre-3 counter remains a stepped ticker.
- **bulanik-cark:**
  - Before: a critically damped settle (full speed at the start) every 0.55 s.
  - Now: every 0.75 s, an asymmetric ease-in-out move of 0.2 s (cubic-bezier 0.45, 0, 0.15, 1: velocity peaks at 32 %, as measured). The rows' blur, scale and colour follow a lagging position (0.35 s settle) as follow-through.
- **alinti-karti:**
  - Before: a soft spring rise with overshoot, words blurring in 0.24 s apart, no exit.
  - Now: an ease-out slide in from off-frame (0.4 s); words appear hard, 0.07 s apart; the attribution grows the card (0.3 s ease-out) and the name types in; after the hold, an ease-in slide out (0.4 s).
  - The duotone pull-back to 70 % is ours, needed because his face fills the frame; it is not in the template.
- **seans-tamam:**
  - Rebuilt in the template's order: black → strobe → MÜLAKAT grid erased by a stepped reverse typewriter → headline word by word → stats typewriter → grey tracking insert (hard cuts) → "DM'den atayım.".
  - Before: the tracking flash came first, and the grid was a flash on the keyword.
- **riso-baski:**
  - Before: grain re-rolled 12 times a second, and the second ink dissolved in and out.
  - Now: the grain is static and moves only with the footage's steps (8 fps). Two inks are a hard cut between shot A and shot B (1.6 s / 2.1 s). The type is static.
