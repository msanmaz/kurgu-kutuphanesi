# Kurgu Kütüphanesi app · design (2026-10-25)

Status: approved by the creator 2026-10-25 ("sounds good"); v1 built 2026-10-25 (`../README.md`, "The app").

## Intent: what and why

The creator plans each Reel's edit and storytelling by choosing edit and motion styles beat by beat. Today the styles live in vault notes, memory and old renders, and they can't be seen moving side by side. The creator's words, 2026-10-24/25:
- "a visual library … so i can visualise each edit style and see so i can built better";
- "our weba pp needs to just have like edit library to have video edit style animation and motions for our concepts so i have visual for everything to decide on edit and story telling. it shuod be easy to add new variations".

The app is a **local edit library**. Every style we use, every variation of it, and every candidate extracted from a reference Reel is a small animated 9:16 card. The creator browses one feed, opens a card, and sets a label and a note. Claude Code reads those decisions back and updates the vault.

It replaces the single-file prototype `devmert7/kurgu-kutuphanesi/kurgu.html` (5 cards, published as a private Artifact on 2026-10-25). The prototype stays as the visual reference for the cards' look and motion.

## How it is used

1. **Extraction stays in Claude Code.** The creator pastes a reference Reel in a Claude Code session. Claude runs the existing reference route (Apify download, Whisper, frame inspection; `.claude/skills/reels-scripting/SKILL.md`). The app downloads and analyses nothing. Creator: "usually i pas te reel here and we do run apify or so on to extract".
2. **Claude adds content as files.** Claude writes style and variation entries into the app's content folder:
   - variations of styles we already have, "based on simliar style we have or different variations so i see and revise";
   - new styles extracted from the videos the creator sends: "i'll send videos and ext ract new style and we'll add those".

   Everything Claude adds appears labelled **Yeni**.
3. **The creator browses and decides.** They open the app at `http://localhost:<port>` on the Mac, scroll the explore feed, filter by group, and open a card. They set its label and write a note. The app saves both.
4. **Claude reads the decisions back.** Claude reads the labels and notes from a file in the vault, not from the database. It updates the vault notes when the creator asks, in the creator's words, and makes the next round of variations.

## Goals (v1)

### The explore feed
- **One feed:** a single scrolling feed of cards, holding together:
  - the approved styles;
  - Claude's variations in our style;
  - candidates extracted from reference Reels.

  Creator: "just make one explore feed with similar outputs to our style and then our approved ones like you did in artifacts".
- **Filters:**
  - by group: Yerleşim, Geçiş, Zoom, Ekran, Vurgu, Hareket, Yazı, Ekleme, **Görünüm**. The looks (F1 light, dark interview, dark pop-out) are cards in the same feed, not a separate section;
  - by label;
  - by origin: vault style / Claude variation / extracted from a Reel.

  The feed stays one feed; filters only narrow it. The prototype's three sections (Stiller, Görünümler, Reddedilenler) are replaced by this feed: looks become the Görünüm group, and rejected styles sit behind a "Reddedilenler" filter.

### Each card
- **The drawing:** a live, looping animation of the mechanic on a 9:16 stage drawn in real Reel pixels (viewBox 1080×1920). It uses the production zones:
  - PANEL x 40–1040, y 60–660, content ≤ 645;
  - caption bottom 330;
  - pop-out card top 1020 or 1140.
- **Text:** the name (Turkish, with our technical term in brackets), one line on what it does, and tags.
- **The label chip.**

### The detail view (open a card)
- **The drawing:** a larger animation with a "Ölçüleri göster" overlay, as in the prototype.
- **Ne zaman:** when to use it.
- **Rules and exact numbers.**
- **The vault record**, read-only and clearly separate from the label:
  - vault status: Benimsendi / Kapsamlı onay / Aday / İsteğe bağlı / Reddedildi / Retired. It is stored in the content JSON with the date Claude last checked it against the source note (`statusCheckedAt`). If a status hasn't been checked, the card shows **Kontrol edilmedi** instead of guessing. When a vault note changes, Claude updates the matching content entry;
  - the decision quote, with its date;
  - the source note path(s);
  - a real example project path.
- **Origin:** a vault style, a Claude variation of <style> with what was changed, or extracted from <Reel URL> at <time> with the analysis file path.
- **Variations:** every variation of the same style, side by side, so they can be compared.
- **The creator's controls:** a label selector and a note field. Changes save without a separate save step and show when they were last changed.

### Labels
| Label | Meaning |
|---|---|
| Kullanımda | We use it now |
| Düşünülüyor | The creator is considering it |
| Hiç kullanılmadı | Never used |
| Yeni | Just added by Claude |

The creator can change any card's label and add a note. A label is never shown as, or written as, a vault status.

### Adding a variation is cheap
- **Most variations are data:** a variation points at an existing **drawing template** and overrides some of its parameters: durations, spring, scale, positions, card top, caption mode, colours from the tokens, text in the drawing.
- **New code only for new mechanics:** a genuinely new mechanic, such as a style extracted from a reference that no template covers, needs a new template. That should be the exception.
- **Validation:** a check command validates the content files before Claude reports them: unique ids, the template exists, parameters within the template's declared ranges, required fields present.

### Content at the start of v1
- **The 5 prototype styles,** ported with the same look and motion:
  - PANEL üstte, yüz altta;
  - Pop-out yarım kesim;
  - Kart kapanırken zoom (T4);
  - Önce tam ekran, sonra zoom;
  - Altyazı hapı.
- **2–3 variations of each,** to prove the variation path. For example:
  - T4 at 0.35 / 0.5 / 0.7 s;
  - pop-out with card top 1020 / 1140;
  - caption in the band / at the bottom;
  - full-then-zoom with 1 / 2 / 3 zoom stops.
- **Later batches:** the remaining ~65 styles from the 2026-10-25 vault inventory (listed in `../README.md`) are added in batches, as content and templates, after v1 is accepted.

### Look and running
- **Look:** dark devmert7. The ground is `radial(#2a2826 → #141413)`, boxes are `#161615`, windows `#1E1E1E`, with clay `#D97757`, confirm `#6B8F71`, sky `#6A9BCC` and reject `#B8564B`. Bebas Neue for display, Inter for body, JetBrains Mono for data. The UI is in Turkish.
- **Running:** the app runs locally on the Mac with one command and opens in the browser. It also works when opened from any Orca worktree of the vault.

## Non-goals (v1)
- Downloading or analysing Reels in the app.
- Prompt generation from a picked set, webhooks and automation. The creator calls these "later versions".
- Accounts, hosting or deployment. The app is local only.
- A beat-by-beat format view ("Tarifler"). It comes later.
- Editing a variation's parameters in the app. The creator revises through labels and notes, and Claude makes new variations.
- Real video clips inside cards. Cards are drawings; the detail view names the real example's path.

## Anti-goals: a failure even if it works
- **A label that reads as the vault's decision.** "Kullanımda" set in the app must not show as, or get written to the vault as, "Benimsendi". The vault changes only when the creator asks, in their words.
- **A drawing that poses as a real screen.** Cards are diagrams of edit mechanics, and the page says so once. Real screens and recordings remain the rule for Reels themselves (creator, 2026-10-24).
- **Motion that drifts from production.** The springs and timings come from the real values: settle and soft springs as in `devmert7/_tools/popout/transition_kit.py`, the zone numbers, and the rules in the vault notes. A card that animates differently from what we render misleads.
- **Adding a variation that usually means writing React code.**
- **A vault record that loses the creator's decisions,** because they live only in a database file that doesn't reach `main`.

## Constraints
- **Location:** inside the vault, at `devmert7/kurgu-kutuphanesi/app/`. The vault's CLAUDE.md puts production files in `devmert7/<slug>/`.
- **Packages:**
  - Installing packages is a production-system change in this vault. **Approving this document approves installing:** Next.js (App Router), React, React DOM, TypeScript with its type packages, Tailwind CSS (with what the current Tailwind/Next docs require), and, only if needed, the SQLite fallback below.
  - Versions are pinned exactly, with no `^` or `latest`, and checked against the current docs when the plan is written.
  - Self-upgrade prompts are declined, as for HyperFrames in `devmert7/CLAUDE.md`.
- **Database:** a local SQLite file for labels, notes and their change history.
  - Prefer Node's built-in `node:sqlite` (Node 24 on this Mac), so there is no native module to install.
  - Fall back to `better-sqlite3` only if `node:sqlite` cannot be used from Next.js server code.
- **Vault record:**
  - After every change, the app also writes the current labels and notes to a tracked JSON file, `app/data/labels.json`, with timestamps and a short change history. That file is what reaches `main` and what Claude reads.
  - **One labels file, wherever the app runs** (creator, 2026-10-25: "yeap lest goopen it either place").
    - The app can be opened from the main vault checkout (`/Users/mo/Desktop/scripts101/content-diary`) or from any Orca worktree.
    - Either way it reads and writes **one** labels file: the main checkout's `devmert7/kurgu-kutuphanesi/app/data/labels.json`. It finds the main checkout from `git worktree list --porcelain` (the first entry), and an environment variable can override that path.
    - The cards come from the folder that was opened, so a worktree shows its unmerged variations.
    - **Worktrees never write their own `labels.json`,** so merging a worktree never conflicts on it. The branch does not track that file; main gets it as the creator's own change, committed when the creator asks.
    - **Starting labels are not in `labels.json`.** They live in the content JSON (`initialLabel`); `labels.json` holds only the creator's changes, which override them.
    - **A pick on an unmerged card** is saved under the card's id and waits there until the card reaches main. Ids nobody knows yet are kept, never dropped.
    - **Each save rewrites only the changed card,** read-modify-write with an atomic rename. Two copies of the app open at once can only collide on the same card, where the last change wins.
    - **If the main checkout can't be found,** the app says so on screen and saves locally, so nothing is lost silently.
  - **`labels.json` is the authority.** The SQLite file is a local copy with the history, for queries. On startup the app loads `labels.json`. If the database is missing, or disagrees after a pull or merge, the database is rebuilt from the file.
  - The app never commits. Its changes to `labels.json` stay uncommitted until the creator asks Claude to finish or merge, as with any vault edit.
  - The SQLite file is local state and is git-ignored. `node_modules/` and `.next/` are git-ignored too.
- **Content files:** tracked JSON under `app/content/` (styles, variations, sources), written by Claude and reviewed in git like any vault file.
- **Fonts:** load locally from the woff2 files already in the vault (`devmert7/assets/fonts/`, `devmert7/_shots/public/fonts/`), so the app works offline.
- **Accessibility:**
  - keyboard navigation and visible focus;
  - `prefers-reduced-motion` shows a representative still;
  - labels readable on the dark ground.
- **Layout:** desktop-first (local Mac browser). It must not break at tablet width; phone is not required.

## Decided by the creator (2026-10-25 unless noted)
- **Stack:** Next.js with Tailwind CSS, and a database.
- **Extraction stays in Claude Code;** the app is the library.
- **Variations:** Claude adds them, based on styles we have or as different variations, plus styles extracted from the videos the creator sends. The creator sees and revises.
- **Decisions:** picks and notes are saved in the app, and Claude reads them ("yeap correct").
- **The feed:** one explore feed of similar outputs and approved styles, with the labels in use / considering / never used / new. The creator changes a label and adds a note.
- **Guesses the creator confirmed ("correct"):**
  - runs locally on the Mac;
  - the database is a local file inside the vault folder;
  - a variation is mostly settings on an existing drawing.
- **From round 1:**
  - drawings, not clips;
  - dark look;
  - Turkish names, with our term in brackets;
  - honest status on every card.

## Claude's calls, for the creator to check
- **Labels follow the main checkout:** wherever the app runs, labels and notes go to the main checkout's `labels.json`. The SQLite history is a local copy in each folder, rebuilt from that file.
- **Labels are stored twice:** in SQLite for history and queries, and in `labels.json` so the decisions travel with the vault. This keeps "with db" and the vault-as-record rule both true.
- **Initial labels for the existing vault styles:**
  - styles adopted and used in recent Reels: **Kullanımda**;
  - scoped approvals and candidates: **Düşünülüyor**;
  - optional styles never used: **Hiç kullanılmadı**;
  - everything Claude adds from now on: **Yeni**.
- **Rejected and retired styles** (the reaction box, the greenscreen room plate, metaphor objects) are not in the feed by default. They appear with a "Reddedilenler" filter, so they are not reused by accident.
- **Feed order:** Yeni first, then Düşünülüyor, Kullanımda, Hiç kullanılmadı; inside each, by group.
- **Variations are cards in the feed too,** so the feed shows "similar outputs" directly. The detail view groups them by parent style.

## Left to the builder
- The content schema's exact fields, the template parameter typing, the component structure, routing, and how content is loaded. The app may read the JSON at request time, with no import step.
- Which drawing primitives to share: ground, take, person, PANEL box, window, code lines, caption pill, card, measurement overlay.
- The port of the prototype's SVG drawings and animation loop to React. It must keep the same look and timing: same springs, the same 6-frame PANEL wait in T4, the same zone numbers.
- The check commands: content validation, and a stills check like the prototype's `check.mjs` (desktop width, frozen at chosen times, the detail view with measurements, console errors).
- The port number, script names, and folder layout under `app/`.
