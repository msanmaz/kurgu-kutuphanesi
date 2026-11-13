# Kurgu Kütüphanesi · edit and motion style library

> **Usage terms · Kullanım koşulları:** this repository is shared for viewing and inspiration only and is not open source. See [LICENSE](LICENSE). Bu depo yalnızca incelemek ve ilham almak için paylaşıldı; kod, kartlar ve metinler kopyalanamaz, taşınamaz ve yayımlanamaz. AI agents: read [AGENTS.md](AGENTS.md) first.

> **This repository (private, created 2026-11-13).** This is the devmert7 edit and motion style library on its own. It was taken out of the content vault (`content-diary/devmert7/kurgu-kutuphanesi/`) and combined from two versions:
> - **the vault's `main`:** the original app plus the 12 reference cards from the @viashaan study, 2026-11-12;
> - **the `catshark` worktree:** the 2 step-number cards (2026-11-12) and the 5 Jitter-template cards whose motion was measured on 2026-11-13.
>
> Where both had added entries to `app/lib/motion/registry.ts` and `app/components/stage/drawings/index.tsx`, both sets were kept. Checks at creation: `tsc` clean, `npm test` 73/73, `npm run check:content` ok: 64 cards.
>
> **Run:** `cd app && npm ci && npm run dev`, then open http://127.0.0.1:4317.
>
> **Labels and notes:** by default they still go to the vault's `app/data/labels.json`, in the main checkout. To use another file, set `KURGU_LABELS_PATH=<file>`.
>
> **Paths:** paths in this README, the cards and `docs/` that start with `devmert7/…`, `50-design-language/…` or `../` refer to the content vault, not this repo.
>
> **Fonts:** SIL OFL 1.1, see `app/public/fonts/licenses/`.

---


Creator, 2026-10-24/25: "can we just create a visual library from our vault that shows in preset of edit or motion form what we have as ireference so i can v isualise each edit style  and see so i can built better". Then, with a screenshot of a "Kurgu Kütüphanesi" app: "something like kurgu kutuphanesi … very basic representation but for nto whole video.. use grill me and sequential thinking first to plan out".

**Open:** `index.html` in a browser (it needs internet for Google Fonts). The same page is published as a private claude.ai Artifact.

## The app (v1, built 2026-10-25)
A local Next.js + Tailwind app in `app/`. It replaces `kurgu.html` (kept as the visual reference). Design: `docs/2026-10-25-kurgu-app-design.md`, approved by the creator 2026-10-25 ("sounds good"). Plan: `docs/2026-10-25-kurgu-app-plan.md`.

**Run:**
```bash
cd devmert7/kurgu-kutuphanesi/app && npm install && npm run dev     # then open http://127.0.0.1:4317 (it listens on this computer only)
```
It works from the main vault checkout or from any Orca worktree.

**Where your labels and notes go:**
- **Always the main checkout:** `/Users/mo/Desktop/scripts101/content-diary/devmert7/kurgu-kutuphanesi/app/data/labels.json`, wherever the app runs from. The page header shows the path.
- **The SQLite history** (`app/data/kurgu.db`, git-ignored) is a local copy, rebuilt from that file.
- **Overrides:** `KURGU_LABELS_PATH=<file>` points the app at another file. All tests and checks use a temp file this way.
- **A broken file** (for example merge-conflict markers) shows a red banner, and saving stays off until the file is fixed. The file is never overwritten.
- **Saving is per card,** so ids from other worktrees are kept. The app never commits.
- **This computer only (2026-10-25, after a security review):**
  - `npm run dev` / `npm start` listen on `127.0.0.1`.
  - `proxy.ts` and the API routes answer only a loopback Host (`localhost`, `127.0.0.1`, `[::1]`). This blocks LAN access and DNS rebinding.
  - A save must be JSON with an Origin equal to the page's own address.
  - Tests: `tests/guard.test.ts`.

**How Claude adds a variation or a new style:**
1. Edit or add `app/content/styles/<style>.json`. A variation is `{id, name, line, changed, params, origin, initialLabel: "Yeni", addedAt}`, and its `params` override the template's. A new mechanic needs a new template in `app/lib/motion/templates/` plus a drawing in `app/components/stage/drawings/`.
2. Run `npm run check:content`. It prints `ok: <n> cards`, or each problem, with the file and the field.
3. Refresh the page. A bad entry is skipped and listed in a banner, and the other cards still show.

**Checks:**
- **`npm test`:** 59 Node tests covering the springs (frame by frame against `transition_kit.py`), the template frames (13 of them for the reference templates), the caption style, content validation, label storage, feed order and the request guard.
- **`npm run check:content`.**
- **`npm run check:stills -- <chrome-profile> <out-dir>`,** with `KURGU_LABELS_PATH` set the same as the running server. It loads the feed at 1400 and 900 px, checks overflow and that Chrome draws each text role with its channel font (title, italic word, card text, mono, three caption styles), reports the widest caption pill in Reel px, takes frozen stills, opens the T4 detail with measurements, saves a label and a note through the UI and reads them back, and confirms the animation resumes.

**Installed, exact pins:**
- Runtime: next 16.4.1, react 19.3.0, react-dom 19.3.0.
- Dev: typescript 6.0.3, @types/react 19.3.0, @types/react-dom 19.3.0, @types/node 24.19.2, tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3, postcss 8.5.29.
- Next.js is 16.4.1 rather than the planned 16.4.0, because 16.4.0 has critical advisories: GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr and GHSA-p3m5-59mp-jv5r. `npm audit`: 0 vulnerabilities.
- The database is Node 24's built-in `node:sqlite`; no SQLite package is installed.

**v1 content:** the 5 styles and 14 variations (19 cards). The rest of the ~65 inventoried styles come in batches.

**Added 2026-11-12:** 12 styles and 14 variations (26 cards) from the @viashaan profile study. That makes 45 cards; see "Reference cards" below.

1. **Sections:**
   - **Stiller:** the main section, filterable by group: Yerleşim, Geçiş, Zoom, Ekran, Vurgu, Hareket, Yazı, Ekleme.
   - **Görünümler:** the looks.
   - **Reddedilenler:** so turned-down styles aren't reused.
   - The screenshot's İmzalar and İşler sections are left out.
2. **Drawings:** each style is a basic animated drawing of just the mechanic, not a real clip. The card names the project where the style was really used.
3. **Look:** the dark devmert7 look, in Turkish.
4. **Where:** this vault folder as the record, plus a private Artifact for viewing on a phone.
5. **Card contents:** name, "ne zaman" line, tags and status on the card. A click opens the rules with exact numbers, the creator's decision quote and the vault source.
6. **What's included:** every style, with an honest status:
   - **Benimsendi:** creator-adopted;
   - **Kapsamlı onay:** approved for a scope;
   - **Aday:** candidate;
   - **İsteğe bağlı:** optional;
   - **Reddedildi:** rejected.
7. **Two steps:** 5 cards first for a look approval, then the rest.
8. **Names:** Turkish, with our technical term in brackets.
9. **Tarifler** (which styles a format uses, beat by beat): later, after the Stiller cards.

## Reference cards from @viashaan (2026-11-12)

Creator, 2026-11-12: "review the videos of this apify or ytdl whivere gets the best free results and then understand breakdown editing style and etc to have some fresh ones added to our kurgu kutuphanesi".

- **The study:** `Reels/analysis_reference_viashaan_profile_2026-11-12.md`. 30 Reels: the list from Apify, the 1080p videos from yt-dlp, then Whisper, 0.5 s frames and 10 fps strips of the measured moments.
- **On every card:**
  - status *Aday* (vault `candidate`), label *Yeni*;
  - origin *Reel'den*, with the Reel and the time range;
  - the measured timings in the rules.
  - None of them is adopted. The creator picks.
- **Look:** our burgundy (`#8E1F3F` for fills, `#D2557C` for strokes and words on dark) and cream replace his gold, yellow and lime.
- **Two creator rules from 2026-11-12 (other sessions) are applied:**
  - *Overlays avoid the head:* no word, chip, panel or mark sits on the head area, which is the face plus 65 % above it and ±20 % at the sides.
    - Text behind the head is the one exception.
    - Where his edit puts something on the face (HUD crosshairs on the eyes, a clip over the face), our card moves it, and the rules say so.
  - *Text behind the head takes its colour from the frame:* the "Kareden renk" variation of *Kafanın arkasındaki sözcük*.
  - Captions on these cards are Inter, the one-word caption font adopted 2026-11-11. The Inter files are copied from `devmert7/assets/fonts/`.
  - The older cards still draw the 2026-10-25 clay key word and Poppins pill. Moving them to the 2026-11-11 caption style is a separate step.
- **Code:**
  - templates: `app/lib/motion/templates/reference.ts`;
  - drawings: `app/components/stage/drawings/reference.tsx`;
  - content: `app/content/styles/ref-*.json`;
  - tests: `app/tests/reference-templates.test.ts`.

| Card | Group | From (Reel · time) | Template |
|---|---|---|---|
| Kafanın arkasındaki sözcük (+ Anton, + Kareden renk) | Yazı | DfMiYjYRbMI · 0:01.2–0:02.7 | `behindHead` |
| Kafanın etrafında dönen sözcükler (+ yavaş) | Yazı | DfMiYjYRbMI · 0:00–0:01.5 | `wordStream` |
| Sözcük anlattığı stili giyer (+ parıltı, + büyük harf) | Yazı | DfMiYjYRbMI · 0:04.5–0:11.2 | `typeActs` |
| Yüz takip çerçevesi (+ 4/sn) | Vurgu | DfMiYjYRbMI · 0:15.5–0:18.5 | `faceHud` |
| Siluet çizgisinde yazı | Vurgu | DfMiYjYRbMI · 0:22.5–0:27.5 | `outlinePath` |
| Elle çizilmiş daire (+ yavaş) | Vurgu | DfpLSUugYZ4 · 0:05.0–0:06.5 | `handCircle` |
| Ham \| Kurgulu yan yana (+ ifşa kesmesi) | Yerleşim | DfSrDF-Riau · 0:00–0:09.3 | `rawEdited` |
| Efekt klibi önünde, sonra başını kaldırır (+ dikey ORİJİNAL, + uzun sessiz açılış) | Yerleşim | DfkEeRNjgXB · 0:00–0:07 | `clipHold` |
| Komut → sonuç sohbette → tam ekran (+ yavaş büyüme) | Ekran | DfHd4AKxDLa · 0:00–0:03.6 | `cmdExpand` |
| Önce/sonra perdesi (+ yavaş) | Geçiş | DfiYWMvMOqV · 0:02.1–0:03.1 | `wipeCompare` |
| Anahtar sözcük CTA, teslim anında (+ metal harfler) | Ekleme | DfpLSUugYZ4 · 0:07.3–0:08.8 | `keywordCta` |
| Numaralı kurulum kartı (+ yavaş) | Ekleme | DfiYWMvMOqV · 0:15–0:22.6 | `setupSteps` |

**Checks, 2026-11-12:**
- `npm run check:content`: ok, 45 cards.
- `tsc --noEmit`: clean.
- `npm test`: 59/59 pass.
- Stills of all 25 cards, frozen with `__kurguSeek` at 1–4 times each, read in full and fixed:
  1. the effect-clip panel didn't render (`w`/`h` passed to a `rect`);
  2. the "after" grade turned deep red, because SVG filters work in linear RGB; they now set `color-interpolation-filters: sRGB`;
  3. the big word ran past the right edge;
  4. the hand circle missed half the line;
  5. the orbiting words piled up; the orbit is now tilted, and words live 1.5 s.
- **Head-area check** (`overlays-avoid-head`):
  - every visible letter drawn in front of a presenter, per letter, against that presenter's head area;
  - 19 cards × 50 moments (0–4.9 s): no overlaps;
  - a negative control (a word placed on two faces, one of them in a scaled tile) is caught.
  - It found and fixed: the orbiting words at the sides, the italic font label, the metal CTA letters, the outline text arc, the HUD crosshairs, and the effect clip over the face.
  - The script is a session tool; it isn't in the repo.
- **At 390 px and 1400 px:** no horizontal scroll.
- **Console:** the only error is the app's missing `/favicon.ico` (404), which predates these cards.
- `check:stills` was not run: it saves a label through the UI, and the running server writes to the real labels file.

## How the cards are drawn
- **Coordinates:** each stage is an SVG in real Reel pixels (viewBox 1080×1920). The zones are the production ones:
  - PANEL x 40–1040, y 60–660, content ≤ 645;
  - caption bottom 330;
  - pop-out card top 1140.
  - "Ölçüleri göster" in the detail view overlays them.
- **Motion:** a small JS loop drives the animation with the same springs as `../_tools/popout/transition_kit.py` (settle ζ 1, soft ζ 0.8), so a card moves like the real edit. T4's PANEL waits 6 frames after the cut, as in the kit.
- **Fonts** ([[channel-fonts]], switched 2026-10-25 at the creator's request: "fix the fonts based upon our latest update"):
  - Anton for the page and detail titles, with Playfair Display italic for "Kütüphanesi" (the approved heavy sans + serif italic pairing);
  - Poppins for the captions and the app's text;
  - JetBrains Mono for paths, numbers and measurements.
  - The files are copies from `devmert7/assets/fonts/` (sources and OFL licences there). Bebas and Inter were set aside in `_to_delete/2026-10-25/kurgu-app-fonts/`.
- **Captions** are HTML pills in our caption CSS (clay key word), sized in container units, so they match the pill. Their font, weight and size are parameters of the caption template (`captionStyle` in `app/lib/motion/templates/caption.ts`). Every card uses Claude's proposal, Poppins Bold 60 px in capitals, until the creator picks. The Altyazı hapı card shows the options as variations: doğal yazım (Poppins SemiBold 66 px) and Helvetica Neue Bold 58 px. Helvetica is the Mac's system font, so that card only renders correctly on this Mac.
- **The prototype** `kurgu.html` (and the published Artifact) keeps Bebas. It's the pre-switch reference and isn't rebuilt.
- **Reduced motion:** with `prefers-reduced-motion`, each card shows one representative still.
- **Check hook:** `window.__kurguSeek(t)` freezes every card at time t.

## Files
| File | What |
|---|---|
| `kurgu.html` | The page, as published to claude.ai: no document skeleton, which the Artifact adds |
| `index.html` | `kurgu.html` wrapped for opening from disk. Rebuild with `python3 -I build.py` |
| `check.mjs` | Stills for checking: desktop and phone, cards frozen at chosen times, a card's detail with the measurements on, console errors. `node check.mjs <chrome-profile> <out-dir> [card-id] [t,t,…]`. No packages: Node's WebSocket + the installed Chrome |

## Built so far: 5 cards (step 1)
| Card | Group | Status | Source |
|---|---|---|---|
| PANEL üstte, yüz altta | Yerleşim | Benimsendi 2026-10-11 | reel-visual-language.md · Frame and zones |
| Pop-out yarım kesim | Yerleşim | Aday (dark look scoped to trend-repo 2026-10-24) | halfcut-talking-head-frame.md |
| Kart kapanırken zoom (T4) | Geçiş | Kapsamlı onay 2026-10-24 (kit for pop-out beats) | halfcut note · Transition kit |
| Önce tam ekran, sonra zoom | Zoom | Benimsendi 2026-10-21 | **only in Claude's memory** (`screens-full-then-zoom`); no vault note found. A vault note is needed |
| Altyazı hapı | Yazı | Benimsendi 2026-10-11 | reel-visual-language.md · Captions |

**Checks, 2026-10-25, main session:**
- desktop and phone, no horizontal scroll, no console errors;
- the T4 and full-then-zoom cards frozen at 0.3 / 1.08 / 1.25 / 1.6 s and checked frame by frame;
- the T4, pop-out and caption details checked with the measurements on.

Fixes found that way:
- a `[hidden]` reset for the local copy;
- code-like lines so the zoom reads;
- measurement labels clear of the drawing and the caption.

## Step 2: the remaining styles (from the read-only vault inventory, 2026-10-25)
About 65 more devices, with the status the inventory found. Each needs its card, rules and quote checked against the source before it is shown.
- **Yerleşim:**
  - FACE, FULL, FULL text limit (≤ 2 text layers): Benimsendi;
  - frame-0 conflict panel: Benimsendi (2026-10-16, partly adopted);
  - split-screen/whiteboard: İsteğe bağlı;
  - talking-head A/B/C templates, faceless cold open: Aday.
- **Geçiş:**
  - hard cut between zones, opacity fade swap: Benimsendi;
  - T1, T2, T3, T5: Kapsamlı onay (kit);
  - cut-the-curve seam set: İsteğe bağlı.
- **Zoom:**
  - face punch-in 1.12–1.2×, zoom while typing: Benimsendi;
  - hold-travel-hold, stillness before payoff: Benimsendi (motion law);
  - push-in on the spoken line: Kapsamlı onay;
  - edit-map push and snap zoom: İsteğe bağlı;
  - zoom to the line with dimming: Aday.
- **Ekran:**
  - real recording in a window, code-editor look for real screens, cursor play, desk authored UI card: Benimsendi;
  - inspector box, data strip, sky window band with ruler, duel rail: Kapsamlı onay;
  - oversized cursor, Remotion shots (Terminal3D916, RealPage916, BeforeAfter916, ScanFocus916, ScrollBrake916, CardFlip916): İsteğe bağlı;
  - terminal without chrome, highlighter receipt, commit graph, live data inset, toggle-then-test, real covers on tiles: Aday.
- **Vurgu:**
  - clay band on the spoken words, red band for "doesn't work": used in the trend-repo storyboard, status to check;
  - source tags GERÇEK KAYIT / VURGU BİZİM: Benimsendi.
- **Hareket:**
  - one morphing shape, click causes the change, illustrated reactions, gags inside the graphic, spring presets: Benimsendi;
  - rolling counter, window edges on different springs, chip set: Kapsamlı onay;
  - callback object: İsteğe bağlı;
  - number morph, ghost chips, recurring roadmap, volume→selection, metric badge, evidence card per clause, node-graph reveal, annotated screenshot: Aday.
- **Yazı:**
  - channel fonts (titles Playfair, Anton, Engraver, Druk Wide; handwritten Franklin Notes, Seasalt; captions Poppins, Helvetica): Benimsendi 2026-10-25, replacing the Bebas display font;
  - caption band, embedded big word, serif emphasis word: Aday.
- **Ekleme:**
  - painting meme, trendy meme template, Turkish TV clip full screen, logo on the spoken name, UI sound cues, gag sounds: Benimsendi;
  - meme in the first 3 s: Aday.
- **Görünümler:**
  - F1 base (light canvas, dark windows): Benimsendi;
  - dark interview, dark trend-repo page: Kapsamlı onay;
  - real screen world, depth space world: İsteğe bağlı.
- **Reddedilenler:**
  - reaction box (2026-10-16), metaphor object (2026-10-14): Reddedildi;
  - greenscreen half-cut with room plate (2026-10-24), metaphor cutaway, vector law as mandatory: retired.

**Conflicts the inventory found.** Four were settled on 2026-10-25, when the creator accepted the recommended answers: "questions yes were recommended answer is good".
- **Real screens always;** drawn windows only for ideas with no real screen, labelled "temsili".
- **Whole window first** replaces the no-chrome terminal note.
- **frame.md's greenscreen presenter** is marked replaced.
- **The full-then-zoom decision** is now in `reel-visual-language.md` (Edit grammar).
- **Dark is the default look** for new recorded Reels, light F1 on request.

These were the original items:
- **Authored "desk UI" cards vs the real-screen rule:** the desk cards were adopted 2026-10-11; the rule "always real terminal/web/page" is from 2026-10-24.
- **Terminal capture without chrome vs the full app window:** `terminal-capture-frame.md` says no chrome; the full-window rule is from 2026-10-21.
- **frame.md still specifies a greenscreen presenter,** while the 2026-10-24 direction says no greenscreen.
- **Is the dark interview look universal,** or scoped to its projects?
- **Is the pop-out a "boxed face" under the reaction-box rejection?**

## Step-number cards, 2026-11-12 (ai-mulakat)

**Creator:** "n5 aND N3 IS GOOD KEEP IN OUR EDIT LIBRARY ON devmert7/kurgu-kutuphanesi/app/ ON HOW THEIR MOTION WOULD BE..".
- **Two new styles, both labelled Yeni and both with Kapsamlı onay status:**
  - **Adım tuşları (tuş takımı)** (`adim-tus-takimi`, Vurgu):
    - keys 1 OKU · 2 BUL · 3 SOR, arriving 0.08 s apart on a settle spring;
    - on each step word the key dips to 92% over 0.28 s, fills cream in 0.12 s and draws a burgundy ring in 0.2 s;
    - a finished key shows a tick;
    - variation: on the face, above the head.
  - **Kilit ekranı rakamı** (`adim-kilit-ekrani`, Yazı):
    - the date line sharpens first;
    - the number rises 40 px from blur 12 → 0 on a soft spring, behind the head;
    - each step rolls like a clock digit (0.32 s, 120 px);
    - variation: solid burgundy fill.
- **Files:**
  - `app/lib/motion/templates/steps.ts`;
  - `app/components/stage/drawings/steps.tsx`;
  - `app/content/styles/adim-*.json`;
  - `app/tests/steps.test.ts` (5 tests);
  - Inter woff2 in `app/public/fonts/`, loaded by the drawing itself.
- **Shared files** (`registry.ts`, `drawings/index.tsx`) got only the registration lines. The main checkout has another session's uncommitted reference cards in the same two files, so the merge needs the three-way step from CLAUDE.md.
- **Looks** approved on `devmert7/ai-mulakat-kabul-mu-kontrol-mu/storyboard-v1/sheets/step-numbers.png`. **Motion** is Claude's proposal until the creator approves it.
- **Checks:**
  - `npm test` 51/51;
  - `npm run check:content` ok: 23 cards;
  - `tsc` clean;
  - both cards and their details viewed in Chrome with the measurements on.

## Jitter-template cards, 2026-11-13 (ai-mulakat)

**Creator:** "add this animations we made to our kurgu kutuphanesi do you have access to it and give them a motion with this contact sheet", after five Jitter templates were reviewed and tested on take v1.
- **Five new styles, all labelled Yeni with Aday status.** Each has two variations, and each card links its real-take test (README, build.py and contact sheet) under `devmert7/ai-mulakat-kabul-mu-kontrol-mu/<name>-test/`.
  - **Yarım ton adım numarası** (`yarim-ton-adim`, Yazı):
    - the step digit printed as 24 px dots (Playfair 900, lining figures), row by row, in ≈ 0.35 s;
    - a hard cut between steps;
    - before step 3, the counter flicks 1 → 2 in Anton and Playfair italic, 0.15 s each;
    - variations: on the wall, and without the counter.
  - **Bulanık kelime çarkı** (`bulanik-cark`, Yazı):
    - a drum of the words he says;
    - it snaps one row every 0.55 s (settle, 0.28 s);
    - the rows shrink, blur and tilt with their distance from the middle;
    - variations: the DoorDash list on the card, the steps on the card.
  - **Alıntı kartı** (`alinti-karti`, Ekleme):
    - burgundy duotone, the take pulled to 70 %;
    - a glass card rises over his chest;
    - the words arrive 0.24 s apart, with the attribution last;
    - variations: the card above the head, the DoorDash quote on the card.
  - **Seans tamam CTA'sı** (`seans-tamam`, Ekleme):
    - a grey tracking flash;
    - the duotone poster with a motion trail;
    - the stats typing at 60 characters a second;
    - the MÜLAKAT grid flash on the keyword;
    - variations: no tracking flash, no trail.
  - **Riso baskı** (`riso-baski`, Görünüm):
    - two inks on paper, with grain re-rolling 12 times a second;
    - a burgundy Anton headline above the head;
    - variations: two inks, the cover idea.
- **Files:**
  - `app/lib/motion/templates/jitter.ts`;
  - `app/lib/motion/templates/halftoneDigits.ts`, the dot grids, generated by `devmert7/ai-mulakat-kabul-mu-kontrol-mu/halftone-steps-test/gen_library_digits.py`;
  - `app/components/stage/drawings/jitter.tsx`;
  - `app/content/styles/{yarim-ton-adim,bulanik-cark,alinti-karti,seans-tamam,riso-baski}.json`;
  - `app/tests/jitter.test.ts` (8 tests).
- **Shared files** (`registry.ts`, `drawings/index.tsx`) got only the registration lines. The three-way merge note above applies.
- **Origin and approval:**
  - The Jitter files and assets are not used; the technique is rebuilt.
  - Looks come from the creator's template picks.
  - Motion is Claude's proposal, from each test's contact sheet, until the creator approves it.
- **Checks:**
  - `npm test` 59/59;
  - `npm run check:content` ok: 38 cards;
  - `tsc` clean;
  - every new card viewed in Chrome at frozen times through `__kurguSeek`;
  - the one console warning is a hydration attribute added to `<html>` by a browser extension.

### Motion corrected from measured Jitter previews, 2026-11-13

**Creator:** "can you use animation vocabulary skills and review jitter to get properly motions".
- **Method:** each template's public preview was recorded frame by frame in Chrome (about 117 fps) and measured, with the effects named using the animation-vocabulary skill. Reading Jitter's project file through its API was refused by the permission check, so the curves are inferred from the measured motion.
- **Notes:** full numbers and the before/after of each card are in `docs/2026-11-13-jitter-motion-measurements.md`.
- **What changed:**
  - Halftone: a stepped hard cut (`grow` 0).
  - Wheel: 0.75 s period, a 0.2 s asymmetric ease-in-out (cubic-bezier 0.45, 0, 0.15, 1), and follow-through on blur, scale and colour.
  - Quote: ease-out slide in, a 0.07 s hard word stagger, a layout animation for the attribution with a typewriter name, and an ease-in slide out.
  - Session: rebuilt in the template's order (black → strobe → stepped reverse typewriter erase → word-by-word headline → stats typewriter → hard-cut tracking insert).
  - Riso: static grain on 8 fps footage steps, and two inks as a hard cut at 1.6 s on a 3.7 s loop.
- **Checks:** `npm test` 60/60, `check:content` ok: 38 cards, `tsc` clean. The cards were viewed in Chrome at frozen times.
