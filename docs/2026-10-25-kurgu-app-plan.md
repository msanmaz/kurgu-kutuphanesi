# Kurgu Kütüphanesi app · implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local Next.js + Tailwind edit library. It shows one feed of animated 9:16 style cards and their variations from content JSON. The creator sets a label and a note per card; these are saved to the main checkout's `labels.json`, with a SQLite history.

**Architecture:**
- Pure TypeScript in `lib/` (springs, per-template frame math, content validation, labels storage) is tested with Node's built-in test runner.
- Thin React components draw each template's frame as SVG in Reel pixels.
- A server page reads content and labels from disk on each request.
- Two route handlers save labels and read history.

**Tech Stack:** Next.js 16.4.0 (App Router), React 19.3.0, TypeScript 6.0.3, Tailwind CSS 4.3.3, `node:sqlite` (Node 24), `node --test`.

**Spec:** `devmert7/kurgu-kutuphanesi/docs/2026-10-25-kurgu-app-design.md` (approved by the creator 2026-10-25: "sounds good"). Visual and motion reference: `devmert7/kurgu-kutuphanesi/kurgu.html`.

## Global Constraints

- **App root:** `devmert7/kurgu-kutuphanesi/app/`. Every path below is relative to it unless it starts with `devmert7/`.
- **Exact pins, installed with `npm install --save-exact`:**
  - runtime: `next@16.4.0`, `react@19.3.0`, `react-dom@19.3.0`;
  - dev: `typescript@6.0.3`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/node@24.19.2`, `tailwindcss@4.3.3`, `@tailwindcss/postcss@4.3.3`, `postcss@8.5.29`.

  No other packages. `better-sqlite3` is allowed only if `node:sqlite` fails inside a Next route handler; then pin its newest version older than 14 days and say so in the README. Decline every upgrade prompt.
- **Node 24** (v24.21.0 on this Mac). The database is `node:sqlite`.
- **Tests:** `node --test "tests/**/*.test.ts"` (type stripping, no transpiler).
  - Every file under `lib/` uses erasable TypeScript only: no `enum`, no `namespace`, no parameter properties.
  - Imports between `lib/` files are relative, with the `.ts` extension. No `@/` alias inside `lib/`.
  - `tsconfig.json` sets `"allowImportingTsExtensions": true` and `"noEmit": true`.
- **No commits.** Vault rule: commit or merge only when the creator asks. Each task ends with a checkpoint (tests green, `git status` reviewed), not a commit.
- **Labels authority:** `labels.json` lives in the main checkout at `devmert7/kurgu-kutuphanesi/app/data/labels.json`, found through `git worktree list --porcelain` (first `worktree` line). The environment variable `KURGU_LABELS_PATH` overrides it. **Tests and checks always set `KURGU_LABELS_PATH` to a temp file. Nothing during development writes the real main checkout's labels.** The worktree never creates its own `data/labels.json`.
- **SQLite:** `data/kurgu.db` in the app folder that runs, git-ignored. It is a history copy, rebuilt from `labels.json`.
- **Git-ignored:** `node_modules/`, `.next/`, `data/*.db`, `data/labels.local.json`, `next-env.d.ts`, `tsconfig.tsbuildinfo`.
- **UI language and exact strings:** Turkish.
  - Labels: `Kullanımda`, `Düşünülüyor`, `Hiç kullanılmadı`, `Yeni`.
  - Vault statuses: `adopted` → `Benimsendi`, `scoped` → `Kapsamlı onay`, `candidate` → `Aday`, `optional` → `İsteğe bağlı`, `rejected` → `Reddedildi`, `retired` → `Kullanımdan kalktı`.
  - Unchecked status: `Kontrol edilmedi`.
  - Filters: groups `Yerleşim, Geçiş, Zoom, Ekran, Vurgu, Hareket, Yazı, Ekleme, Görünüm`, and `Reddedilenler`.
- **Tokens** (Tailwind `@theme`): ground `#141413`, ground-hi `#2a2826`, box `#161615`, win `#1E1E1E`, bar `#2A2A2C`, edge `#3a3a3c`, text `#ECEAE4`, dim `#B9B6AC`, muted `#87867F`, clay `#D97757`, confirm `#6B8F71`, sky `#6A9BCC`, reject `#B8564B`. Page ground: `radial-gradient(ellipse 80% 50% at 50% 0%, #2a2826 0%, #141413 70%)`.
- **Fonts:** local woff2 copied into `public/fonts/` from `devmert7/assets/fonts/` (Inter, JetBrains Mono, latin + latin-ext) and `devmert7/_shots/public/fonts/` (Bebas Neue latin + latin-ext). Plain `@font-face` with the latin-ext `unicode-range: U+0100-024F, U+1E00-1EFF`, as in `kurgu.html`. Families: display `Bebas`, body `Inter`, mono `Mono`.
- **Reel geometry** (viewBox `0 0 1080 1920`):
  - PANEL box x 40–1040, y 60–660, content ≤ 645;
  - caption pill bottom y 1590 (330 from the bottom), or band mode with the pill top at y 720;
  - pop-out card x 40–1040, radius 36, top 1020 or 1140, head top ≈ 900.
- **Springs**, identical to `devmert7/_tools/popout/transition_kit.py`:
  - `settle(t, dur)`: `w = 6.64/dur`, `1-(1+w t)e^(-w t)`;
  - `soft(t, dur, z = 0.8)`: `w = 4.2/(z·dur)`;
  - both return 0 for t ≤ 0.

  The T4 PANEL delay is the first frame k (30 fps) at which `cardTop · settle(k/30, dur) ≥ 680`. That is 6 frames at card top 1020 and 5 at 1140.
- **Feed:**
  - **Order** by effective label `Yeni`, `Düşünülüyor`, `Kullanımda`, `Hiç kullanılmadı`, then by group in the order above, then by name.
  - **Effective label:** the stored label, else the card's `initialLabel`.
  - **Rejected cards:** vault status `rejected` or `retired` is hidden unless the `Reddedilenler` filter is on. When it is on, only those cards show.
- **Dev server:** port 4317. Scripts:
  - `dev`: `next dev -p 4317`
  - `build`
  - `start`: `next start -p 4317`
  - `test`
  - `check:content`
  - `check:stills`

## Review Focus

1. **Running the app or a check from this worktree** could write into the real main checkout. The page must show which labels file it writes to, and the checks set `KURGU_LABELS_PATH` to a temp file. Test in Task 3 (`resolveLabelsPath` honours the env var); the check in Task 7 asserts the reported path is the temp file.
2. **A `labels.json` that's malformed** (merge-conflict markers, hand edit). The app shows an error banner, keeps the file untouched, and refuses writes until it's fixed. Tests in Task 3.
3. **A content file with a bad entry** (unknown template, parameter out of range, duplicate id, broken JSON). That style is skipped and listed in a visible warning; every other card renders. Tests in Task 2.
4. **Labels for card ids this folder doesn't know** (picked in another worktree). They are preserved byte-for-byte when another card is written. Test in Task 3.
5. **An interrupted or concurrent save.** The write is per-card read-modify-write through a temp file plus `rename`, so the old file survives an interrupted write and other cards' entries are never lost. Test in Task 3.

---

### Task 1: Scaffold, tokens and springs

**Files:**
- Create:
  - `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`;
  - `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (placeholder);
  - `public/fonts/*.woff2` (6 files);
  - `lib/motion/springs.ts`.
- Test: `tests/springs.test.ts`

**Interfaces:**
- Produces:
  - `settle(t: number, dur?: number): number`, with `dur` defaulting to 0.45;
  - `soft(t: number, dur?: number, z?: number): number`, with defaults 0.45 and 0.8;
  - `lerp(a: number, b: number, p: number): number`;
  - `clamp01(x: number): number`.

- [ ] **Step 1:** Create `package.json`.
  - Fields: `"name": "kurgu-kutuphanesi"`, `"private": true`, `"type": "module"`.
  - Scripts: `"dev": "next dev -p 4317"`, `"build": "next build"`, `"start": "next start -p 4317"`, `"test": "node --test \"tests/**/*.test.ts\""`, `"check:content": "node scripts/check-content.ts"`, `"check:stills": "node scripts/check-stills.mjs"`.
  - Then run the two exact-pin installs from Global Constraints.

  Expected: `npm ls --depth=0` lists exactly the 10 pinned packages.
- [ ] **Step 2:** Write `tsconfig.json` (Next defaults plus `strict`, `allowImportingTsExtensions`, `noEmit`, `paths: {"@/*": ["./*"]}`), `postcss.config.mjs` (`{ plugins: { "@tailwindcss/postcss": {} } }`), `next.config.ts` (empty config object) and `.gitignore` (Global Constraints list).
- [ ] **Step 3:** Copy the six woff2 files into `public/fonts/`. Write `app/globals.css`:
  - `@import "tailwindcss";`
  - the `@font-face` rules;
  - `@theme` with the tokens as `--color-*`, and `--font-display`, `--font-body` and `--font-mono` set to the families;
  - the body ground gradient;
  - `[hidden]{display:none!important}`.

  `app/layout.tsx`: `<html lang="tr">`, title `Kurgu Kütüphanesi`. `app/page.tsx`: a heading "Kurgu Kütüphanesi".
- [ ] **Step 4:** Write the failing test `tests/springs.test.ts`.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { settle, soft, clamp01 } from "../lib/motion/springs.ts";

test("springs match transition_kit.py frame by frame (card top 1020)", () => {
  const softPx = [0, 63, 203, 369, 530, 671, 786, 873, 937, 980, 1008, 1024, 1032, 1035, 1035, 1033];
  const settlePx = [0, 75, 227, 391, 539, 662, 758, 831, 886, 925, 954, 974, 988, 998, 1005, 1010];
  softPx.forEach((px, k) => assert.equal(Math.round(1020 * soft(k / 30)), px));
  settlePx.forEach((px, k) => assert.equal(Math.round(1020 * settle(k / 30, 0.5)), px));
});
test("springs are 0 before start and clamp01 clamps", () => {
  assert.equal(settle(-0.1), 0); assert.equal(soft(0), 0);
  assert.equal(clamp01(-1), 0); assert.equal(clamp01(2), 1); assert.equal(clamp01(0.3), 0.3);
});
```

- [ ] **Step 5:** Run `npm test`. Expected: FAIL (cannot find `lib/motion/springs.ts`).
- [ ] **Step 6:** Implement `lib/motion/springs.ts` with the formulas from Global Constraints.
- [ ] **Step 7:** Run `npm test`, then `npm run build`. Expected: tests PASS; the build completes with no type errors.
- [ ] **Step 8: Checkpoint.** `git status` shows only new files under `app/`, plus `node_modules/` and `.next/` ignored. No `data/labels.json`. Do not commit.

### Task 2: Template frame math, the registry, and the content model

**Files:**
- Create:
  - `lib/motion/templates/panel.ts`, `popout.ts`, `cardZoom.ts`, `fullZoom.ts`, `caption.ts`;
  - `lib/motion/registry.ts`;
  - `lib/content/types.ts`, `lib/content/validate.ts`, `lib/content/load.ts`;
  - `scripts/check-content.ts`.
- Test: `tests/templates.test.ts`, `tests/content.test.ts`

**Interfaces:**
- Consumes: Task 1 springs.
- Produces:
  - **Shared types:**
    - `type Params = Record<string, number | string>`;
    - `type ParamSpec = { key: string; kind: "number"; default: number; min: number; max: number } | { key: string; kind: "enum"; default: string; options: string[] }`;
    - `type TemplateId = "panel" | "popout" | "cardZoom" | "fullZoom" | "caption"`.
  - **Registry:** `TEMPLATES: Record<TemplateId, { id: TemplateId; params: ParamSpec[]; duration(p: Params, captionChunks: number): number }>`, plus `withDefaults(id: TemplateId, p: Params): Params`.
  - **Per template:** a `xxxFrame(p: Params, t: number)` returning plain numbers. Each template's param keys and defaults:

    | Template | Params (default; min–max or options) | Frame returns | Loop |
    |---|---|---|---|
    | `panelFrame` | `springDur` (0.45; 0.2–1.2), `enterAt` (0.35; 0–2) | `{ panelScale, panelOpacity, titleWidth, tileOpacity: number[] }` (6 tiles) | 4 s |
    | `popoutFrame` | `cardTop` (1140; 900–1300), `captionMode` (`bottom`; `bottom`/`band`) | `{ cardTop, panelOpacity, titleWidth, tileOpacity }` | 4 s |
    | `cardZoomFrame` | `cut` (1.0; 0.3–2), `dur` (0.5; 0.2–1.2), `fromScale` (1.2; 1.0–1.4), `cardTop` (1140; 900–1300) | `{ camScale, camTx, camTy, card: {x,y,w,h,rx}, aboveH, panelOpacity, cutMarker: boolean }` | `cut + 3.6` |
    | `fullZoomFrame` | `hold` (0.45; 0.2–1.5), `zoomDur` (0.6; 0.3–1.5), `scale` (2.3; 1.5–3.2), `stops` (1; 1–3) | `{ winTx, winTy, winScale, bandOpacity, bandRow, captionIndex }` | `hold + 1.4·stops + 1.5` |
    | `captionFrame` | `chunkDur` (1.1; 0.5–2), `captionMode` (`bottom`; `bottom`/`band`) | `{ captionIndex }` (takes `chunks: number`) | `chunks·chunkDur` |

    `cardZoomFrame` also has `panelDelayFrames(p: Params): number`.
  - **Content types** (`lib/content/types.ts`), exactly:
    - `Group`, `Label` and `VaultStatus` unions with the Global Constraints values;
    - `CaptionChunk = (string | { k: string })[]`;
    - `Origin = { kind: "vault" } | { kind: "claude"; basis: string } | { kind: "reference"; reel: string; at: string; analysis: string }`;
    - `VaultRecord { status; date?; statusCheckedAt?; note?; quote; quoteWho; sources: string[]; examples: string[] }`;
    - `VariationEntry { id; name; line; changed; params; caption?; tags?; origin; initialLabel; addedAt }`;
    - `StyleEntry { id; group; name; line; when; tags; rules; vault; template; params; caption; initialLabel; origin; variations: VariationEntry[] }`;
    - `Card { id; styleId; isVariation; group; name; line; when; tags; rules; vault; template; params; caption; initialLabel; origin; changed?; addedAt? }`.
  - **Validation and loading:**
    - `validateAll(entries: { file: string; raw: unknown }[]): { styles: StyleEntry[]; errors: string[] }`;
    - `loadContent(contentDir: string): { cards: Card[]; errors: string[] }`. It reads `contentDir/styles/*.json`, flattens each style plus its variations into cards, and fills params with defaults. A variation inherits every style field it doesn't set.

- [ ] **Step 1:** Write the failing `tests/templates.test.ts`:
  - `panelDelayFrames({cardTop:1020, dur:0.5}) === 6` and `panelDelayFrames({cardTop:1140, dur:0.5}) === 5`.
  - `cardZoomFrame` at `t = cut - 0.01`: `camScale === fromScale`, `card.y === 0`, `panelOpacity === 0`.
  - At `t = cut + 3`: `card.y` is within 1 px of `cardTop`, `card.x` within 0.5 of 40, `camScale` within 0.001 of 1.
  - At `t = cut + (panelDelayFrames-1)/30`: `panelOpacity === 0`.
  - At `t = cut + (panelDelayFrames+4)/30`: `panelOpacity === 1`.
  - `fullZoomFrame` at `t = hold/2`: `winScale === 1`. At `t = hold + zoomDur + 0.3`: `winScale` within 0.02 of `scale` and `bandOpacity === 1`.
  - `captionFrame({chunkDur:1.1}, 2.3, 3).captionIndex === 2`.
  - Every `TEMPLATES[id].params` default lies inside its range.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement the five frame modules and `registry.ts`, porting the motion from `kurgu.html` (the `DRAW` frame functions) with the defaults above. `cardZoom` computes the PANEL wait from `panelDelayFrames`, not the prototype's fixed 6/30: the prototype used 6 at card top 1140, where the kit gives 5. Each later `fullZoom` stop moves the band 2 rows down, re-zooming with the same spring.
- [ ] **Step 4:** Run `npm test`. Expected: the template tests PASS.
- [ ] **Step 5:** Write the failing `tests/content.test.ts`, using in-memory entries plus a temp dir for `loadContent`:
  - a valid style with 2 variations gives 3 cards. Variation ids are kept; `isVariation` is true for 2 of them; a variation's `params` merge the style's params, its own and the defaults.
  - **Review Focus 3**, each case with no throw:
    - `template: "nope"` gives an error naming the file and the template;
    - `params.cardTop: 5000` gives an error naming the key and its range;
    - duplicate ids across two files give an error;
    - a file with broken JSON gives a parse error;
    - in each case, the other valid styles still produce cards.
  - a missing `vault.statusCheckedAt` is allowed: the card loads, and the UI shows `Kontrol edilmedi`.
- [ ] **Step 6:** Run `npm test`. Expected: FAIL.
- [ ] **Step 7:** Implement `types.ts`, `validate.ts` and `load.ts`. Validate by hand (no schema library): required fields and their types, a known `Group`/`Label`/`VaultStatus`, a known template, param keys from the spec within range, unique ids.
- [ ] **Step 8:** Implement `scripts/check-content.ts`. It prints `ok: <n> cards` and exits 0, or prints each error and exits 1.
- [ ] **Step 9:** Run `npm test`. Expected: PASS.
- [ ] **Step 10: Checkpoint**, no commit.

### Task 3: Labels storage

**Files:**
- Create: `lib/labels/paths.ts`, `lib/labels/store.ts`, `lib/labels/db.ts`
- Test: `tests/labels.test.ts`

**Interfaces:**
- Consumes: the `Label` type from Task 2.
- Produces:
  - **Paths:**
    - `parseMainWorktree(porcelain: string): string | null`;
    - `resolveLabelsPath(env: Record<string, string | undefined>, cwd: string): { path: string; source: "env" | "main" | "local"; warning?: string }`.

      Order: `KURGU_LABELS_PATH`; then the main worktree plus `devmert7/kurgu-kutuphanesi/app/data/labels.json`; then, if git fails, `<cwd>/data/labels.local.json` with a Turkish warning ("Ana vault bulunamadı, etiketler bu klasöre kaydediliyor").
  - **The file:**
    - `type LabelEntry = { label: Label; note: string; updatedAt: string; history: { label: Label; note: string; at: string }[] }`;
    - `type LabelsFile = { version: 1; cards: Record<string, LabelEntry> }`;
    - `readLabels(path: string): { file: LabelsFile; error?: string }`. A missing file gives an empty file and no error. Malformed JSON or a wrong shape gives an error and never throws.
    - `writeCardLabel(path: string, cardId: string, change: { label?: Label; note?: string }, now: Date): LabelEntry`. It reads the current file, throws a `LabelsFileError` if that is malformed, updates one card, appends a history item, runs `mkdir -p`, writes `path + ".tmp-" + pid`, then calls `renameSync`. The previous label is kept when only the note changes; a new card starts from `"Yeni"` when only a note is given. Notes are limited to 2000 characters.
  - **History:** `openHistoryDb(dbPath: string): { syncFrom(file: LabelsFile): void; history(cardId: string): { label: Label; note: string; at: string }[]; close(): void }`. It uses `node:sqlite` `DatabaseSync`, with table `history(card_id TEXT, label TEXT, note TEXT, at TEXT)`. `syncFrom` rebuilds the table when the database's row count or newest `at` differs from the file's.

- [ ] **Step 1:** Write the failing `tests/labels.test.ts`, using temp dirs from `fs.mkdtempSync`:
  - `parseMainWorktree("worktree /a/main\nHEAD x\nbranch refs/heads/main\n\nworktree /b/wt\n")` is `"/a/main"`.
  - `resolveLabelsPath({KURGU_LABELS_PATH: "/tmp/x.json"}, anyDir).source` is `"env"` and its `path` is `"/tmp/x.json"` (**Review Focus 1**).
  - `resolveLabelsPath({}, nonGitTempDir)` gives `source: "local"` and a warning.
  - `readLabels` on a missing file gives `{file: {version: 1, cards: {}}}` with no error. On a file containing `<<<<<<< HEAD` it gives an error string, and the file's bytes are unchanged (**Review Focus 2**).
  - `writeCardLabel` on that malformed file throws `LabelsFileError` and leaves the bytes unchanged (**Review Focus 2**).
  - Writing card `a`, then `b`, keeps `a`. A pre-existing unknown id `zz` with an exotic note survives a write of `a` (deep-equal) (**Review Focus 4**).
  - After a write, no `*.tmp-*` file remains. A stale `labels.json.tmp-999` left beforehand doesn't break the next write and the real file stays valid JSON (**Review Focus 5**).
  - Changing only the note keeps the label; `history.length` grows by one per write.
  - `openHistoryDb` → `syncFrom(file)` → `history("a")` returns the file's history for `a`. Deleting the database and syncing again returns the same rows.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `paths.ts` (`execFileSync("git", ["worktree", "list", "--porcelain"], {cwd})` in a try/catch), `store.ts` and `db.ts` as specified.
- [ ] **Step 4:** Run `npm test`. Expected: PASS. The `node:sqlite` experimental warning on stderr is acceptable.
- [ ] **Step 5: Checkpoint**, no commit. Confirm that nothing under the real main checkout changed: `git -C /Users/mo/Desktop/scripts101/content-diary status --short devmert7/kurgu-kutuphanesi` prints nothing.

### Task 4: Drawing components and the stage

**Files:**
- Create:
  - `components/stage/primitives.tsx`;
  - `components/stage/drawings/PanelDrawing.tsx`, `PopoutDrawing.tsx`, `CardZoomDrawing.tsx`, `FullZoomDrawing.tsx`, `CaptionDrawing.tsx`;
  - `components/stage/Stage.tsx`;
  - `components/stage/clock.ts`.

**Interfaces:**
- Consumes: the Task 2 frame functions, `TEMPLATES`, `withDefaults` and `Card`.
- Produces:
  - `<Stage card={Card} badge?: string showDims?: boolean />`: a client component with a 9:16 box, an SVG `viewBox="0 0 1080 1920"` and an HTML caption overlay.
  - **The shared clock** (`clock.ts`): `subscribe(fn: (now: number) => void): () => void`, one `requestAnimationFrame` loop, and `window.__kurguSeek(t: number | null)`. A number freezes every stage at loop time `t`; `null` resumes.
  - **The stages:** each stage renders `frame(params, now % duration)`, animates only while it is in view (`IntersectionObserver`), and under `prefers-reduced-motion` shows the frame at `0.8 · duration`.
  - **Primitives,** each drawn as in `kurgu.html`, with the same shapes and colours: `Ground`, `TakeBg`, `Person`, `PanelBox`, `WindowWithCode`, `Dims`, `CaptionPill`.
    - `CaptionPill` is HTML: Bebas at `7.22cqw`, padding `1.48cqw 2.41cqw .93cqw`, radius `1.3cqw`, key word in a clay inner pill. Positioned bottom `17.19%` in `bottom` mode, or top `37.5%` in `band` mode (y 720 of 1920).
    - SVG ids are unique per instance (`useId`).

- [ ] **Step 1:** Implement `clock.ts`, the primitives and the five drawings, mapping frame fields to SVG attributes. `Dims` is shown only when `showDims` is set, with the labels from `kurgu.html` (caption labels below or above the line, readable with the dark stroke).
- [ ] **Step 2:** Temporarily render one `Stage` per template on `app/page.tsx`, using hard-coded example cards from the Task 2 test fixtures. Run `npm run dev`, then open `http://localhost:4317` with `KURGU_LABELS_PATH` set to a temp file.

  Expected: five animating stages that look like `kurgu.html`'s five cards. In the console, `__kurguSeek(1.25)` freezes T4 with the card mid-close and the PANEL fading in; `__kurguSeek(null)` resumes.
- [ ] **Step 3:** Run `npm run build`. Expected: no type errors.
- [ ] **Step 4: Checkpoint**, no commit.

### Task 5: Content for v1

**Files:**
- Create: `content/styles/panel.json`, `popout.json`, `t4.json`, `fullzoom.json`, `caption.json`

**Interfaces:**
- Consumes: the Task 2 schema and its validator.

- [ ] **Step 1:** Port the five styles from `kurgu.html`'s `STYLES` array into the schema, field for field (name, line, when, tags, rules, vault record with status, date, note, quote, quoteWho, sources and examples). Add `statusCheckedAt: "2026-10-25"` to each: Claude checked these five against the vault that day; the T4 status is `scoped`. Initial labels (design, Claude's calls):

  | Style | `initialLabel` |
  |---|---|
  | panel | `Kullanımda` |
  | popout | `Düşünülüyor` |
  | t4 | `Düşünülüyor` |
  | fullzoom | `Kullanımda` |
  | caption | `Kullanımda` |

  Every style has `origin: {kind: "vault"}`.
- [ ] **Step 2:** Add variations. Each has `initialLabel: "Yeni"`, `addedAt: "2026-10-25"`, `origin: {kind: "claude", basis: "<style id> parametreleri"}`, a Turkish `name` and `line`, and a `changed` line naming the difference.

  | Style | Variation ids and params |
  |---|---|
  | panel | `panel-yavas` `{springDur: 0.8}` · `panel-gec` `{enterAt: 0.8}` |
  | popout | `popout-1020` `{cardTop: 1020}` · `popout-bant` `{captionMode: "band"}` |
  | t4 | `t4-035` `{dur: 0.35}` · `t4-070` `{dur: 0.7}` · `t4-full-sonrasi` `{fromScale: 1.12}` |
  | fullzoom | `fullzoom-2durak` `{stops: 2}` · `fullzoom-3durak` `{stops: 3}` · `fullzoom-yumusak` `{scale: 1.8}` |
  | caption | `caption-bant` `{captionMode: "band"}` · `caption-hizli` `{chunkDur: 0.7}` |
- [ ] **Step 3:** Run `npm run check:content`. Expected: `ok: 17 cards` (5 styles + 12 variations).
- [ ] **Step 4: Checkpoint**, no commit.

### Task 6: Feed, detail and the labels API

**Files:**
- Create:
  - `lib/feed.ts`;
  - `app/api/labels/route.ts`, `app/api/labels/history/route.ts`;
  - `components/Feed.tsx`, `components/CardTile.tsx`, `components/Detail.tsx`, `components/Banner.tsx`.
- Modify: `app/page.tsx` (replace the Task 4 temporary stages).
- Test: `tests/feed.test.ts`

**Interfaces:**
- Consumes:
  - Task 2: `loadContent`, `Card`, `Label`;
  - Task 3: `resolveLabelsPath`, `readLabels`, `writeCardLabel`, `openHistoryDb`;
  - Task 4: `<Stage>`.
- Produces:
  - **Feed logic:**
    - `effectiveLabel(card: Card, labels: Record<string, { label: Label }>): Label`;
    - `orderCards(cards: Card[], labels): Card[]`;
    - `filterCards(cards: Card[], labels, f: { group?: Group; label?: Label; origin?: Origin["kind"]; rejected: boolean }): Card[]`.
  - **`GET /api/labels`:** returns `{ cards: LabelsFile["cards"]; path: string; source: string; warning?: string; error?: string }`.
  - **`POST /api/labels`:**
    - takes the body `{ cardId: string; label?: Label; note?: string }`;
    - returns 200 with the `LabelEntry`;
    - returns 400 for an unknown label or a note longer than 2000 characters;
    - returns 409 with `{error}` when the file is malformed.
  - **`GET /api/labels/history?card=<id>`:** returns `{ history: [...] }`.
  - **Rendering:** both routes and the page use `export const dynamic = "force-dynamic"`. The page reads content from `path.join(process.cwd(), "content")` and labels from `resolveLabelsPath(process.env, process.cwd())`.

- [ ] **Step 1:** Write the failing `tests/feed.test.ts`:
  - **Order:** cards labelled `Kullanımda`, `Yeni`, `Hiç kullanılmadı` and `Düşünülüyor` come out `Yeni`, `Düşünülüyor`, `Kullanımda`, `Hiç kullanılmadı`. Within one label, `Geçiş` precedes `Zoom`.
  - **Effective label:** a stored label overrides `initialLabel`.
  - **Rejected filter:** with `rejected: false` a `rejected` card is excluded; with `rejected: true` only `rejected`/`retired` cards are returned.
  - **Group, label and origin filters** each narrow the result.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/feed.ts`. Run `npm test`. Expected: PASS.
- [ ] **Step 4:** Implement the two route handlers. The POST validates its input, calls `writeCardLabel`, then calls `openHistoryDb(path.join(process.cwd(), "data/kurgu.db")).syncFrom(readLabels(p).file)`, then `close()`.
- [ ] **Step 5:** Implement the UI, following the prototype's layout without the three sections.
  - **Header:** "Kurgu Kütüphanesi" in Bebas with "Kütüphanesi" in clay. Under it, mono text: `etiketler: <path>`, plus the source. One line below that, in exactly these words: "Kartlar kurgu mekaniğinin şemasıdır; gerçek ekran ya da kayıt değildir."
  - **Keyboard:** every chip, tile, label button and the dialog close have a visible focus ring (2 px clay, 2 px offset). Tiles are buttons.
  - **Banner:** a red banner when GET returns `error` ("Etiket dosyası okunamadı, düzeltilene kadar kayıt kapalı"). A yellow-toned dim banner for `warning`. A list of content `errors` ("Bazı kartlar yüklenemedi:" plus each error).
  - **Filter row:** chips for the groups (with counts), the labels, the origins (`Vault`, `Claude varyasyonu`, `Reel'den`) and `Reddedilenler`.
  - **Grid:** `repeat(auto-fill, minmax(250px, 1fr))`. Each tile shows the `Stage`, name, line, tags and a label chip. Chip colours: `Kullanımda` confirm, `Düşünülüyor` sky, `Hiç kullanılmadı` outline, `Yeni` clay.
  - **Detail dialog,** closed by Esc or the backdrop, with focus returned:
    - a large stage and the `Ölçüleri göster` toggle;
    - `Ne zaman`, `Kurallar ve ölçüler`;
    - the vault record box: status (or `Kontrol edilmedi` when `statusCheckedAt` is missing), note, quote and who, sources, examples. It is visually separate from the label controls and titled `Vault kaydı`;
    - origin;
    - a `Varyasyonlar` strip with small stages of the sibling cards, each clickable;
    - the label buttons (4) and a note textarea, saved 600 ms after typing stops and on blur. The status reads `Kaydedildi · <time>`, or the error;
    - `Geçmiş` from the history route.
  - Reduced motion is respected through `Stage`.
- [ ] **Step 6:** Run `npm run build`. Then run `KURGU_LABELS_PATH=<tmp>/labels.json npm start` and check the page by hand:
  - 17 cards in label order;
  - setting a label in the detail view updates the tile chip and the temp file;
  - a hand-corrupted temp file shows the red banner, and a save returns the 409 message.
- [ ] **Step 7: Checkpoint**, no commit.

### Task 7: The stills and end-to-end check, and the vault record

**Files:**
- Create: `scripts/check-stills.mjs`
- Modify:
  - `devmert7/kurgu-kutuphanesi/README.md`;
  - `devmert7/kurgu-kutuphanesi/docs/2026-10-25-kurgu-app-design.md` (status line only);
  - `50-design-language/_index.md` (the Kurgu Kütüphanesi line).

**Interfaces:**
- Consumes: the running app at `http://localhost:4317` (started with `KURGU_LABELS_PATH`) and `window.__kurguSeek`.

- [ ] **Step 1:** Implement `scripts/check-stills.mjs <chrome-profile> <out-dir>`, adapting `devmert7/kurgu-kutuphanesi/check.mjs`: Node WebSocket plus Chrome DevTools, no packages. It:
  1. loads the feed at 1400×1150 and 900×1150 and asserts no horizontal overflow and that `document.fonts.check` passes for Bebas, Inter and Mono with "ĞÜŞİÖÇ ğüşıöç";
  2. freezes at t = 0.3, 1.08, 1.25 and 1.6 and saves full-page PNGs;
  3. opens the `t4` detail, toggles measurements and saves a PNG;
  4. clicks label `Düşünülüyor` on `t4-035` and types the note `kontrol notu`;
  5. fetches `/api/labels` and asserts `source === "env"`, that the path equals the temp file (**Review Focus 1**), and that `cards["t4-035"].label === "Düşünülüyor"` with the note saved;
  6. prints a JSON summary and exits 1 on any failure or console error.
- [ ] **Step 2:** Run `npm run build && KURGU_LABELS_PATH=$TMP/labels.json npm start &`, then `npm run check:stills -- $TMP/profile $TMP/stills`. Expected: exit 0 and the summary `{"overflow":false,"fonts":[true,true,true],"labelSaved":true,"errors":[]}`.
- [ ] **Step 3:** Open the stills at full size and compare them with `kurgu.html`'s cards at the same times: T4 frozen at 1.25 (card mid-close, PANEL fading in), full-then-zoom at 1.6 (zoomed, band on), detail measurements legible. Fix any differences.
- [ ] **Step 4:** Update the README:
  - how to run: `cd devmert7/kurgu-kutuphanesi/app && npm install && npm run dev`, then open localhost:4317;
  - where the labels go (the main checkout, or `KURGU_LABELS_PATH`);
  - how Claude adds a variation: edit a `content/styles/*.json`, run `npm run check:content`, refresh;
  - the test and check commands;
  - which packages were installed and their versions.

  Set the design doc's status to "approved 2026-10-25; v1 built". Point the index line at the app.
- [ ] **Step 5: Final checkpoint.**
  - `npm test`, `npm run check:content` and `npm run check:stills` all pass.
  - `git status` shows the app's source, content and docs only: no `data/labels.json`, no database file, no `node_modules`.
  - The main checkout's `devmert7/kurgu-kutuphanesi` is untouched.
  - Report to the creator; commit only if asked.
