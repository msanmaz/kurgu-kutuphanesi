import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseMainWorktree, resolveLabelsPath } from "../lib/labels/paths.ts";
import { readLabels, writeCardLabel, LabelsFileError } from "../lib/labels/store.ts";
import { openHistoryDb } from "../lib/labels/db.ts";

const tmp = () => mkdtempSync(path.join(tmpdir(), "kurgu-labels-"));
const T0 = new Date("2026-10-25T10:00:00Z"), T1 = new Date("2026-10-25T10:05:00Z");
const CONFLICTED = '{"version":1,"cards":{\n<<<<<<< HEAD\n"a":{}\n=======\n"b":{}\n>>>>>>> wt\n}}';

test("the main checkout is the first worktree in git's porcelain list", () => {
  assert.equal(parseMainWorktree("worktree /a/main\nHEAD x\nbranch refs/heads/main\n\nworktree /b/wt\n"), "/a/main");
  assert.equal(parseMainWorktree(""), null);
});

test("KURGU_LABELS_PATH always wins, so checks never touch the real vault", () => {
  const r = resolveLabelsPath({ KURGU_LABELS_PATH: "/tmp/x.json" }, process.cwd());
  assert.equal(r.source, "env");
  assert.equal(r.path, "/tmp/x.json");
});

test("outside git the labels go to a local file, with a warning", () => {
  const dir = tmp();
  const r = resolveLabelsPath({}, dir);
  assert.equal(r.source, "local");
  assert.equal(r.path, path.join(dir, "data", "labels.local.json"));
  assert.ok(r.warning && r.warning.includes("Ana vault bulunamadı"));
});

test("a missing labels file reads as empty, without an error", () => {
  assert.deepEqual(readLabels(path.join(tmp(), "labels.json")), { file: { version: 1, cards: {} } });
});

test("a conflicted labels file is reported, and neither read nor write changes it", () => {
  const p = path.join(tmp(), "labels.json");
  writeFileSync(p, CONFLICTED);
  const r = readLabels(p);
  assert.ok(r.error);
  assert.throws(() => writeCardLabel(p, "a", { label: "Kullanımda" }, T0), LabelsFileError);
  assert.equal(readFileSync(p, "utf8"), CONFLICTED);
});

test("writing one card keeps every other card, including ids this folder does not know", () => {
  const p = path.join(tmp(), "labels.json");
  const zz = { label: "Düşünülüyor", note: "başka worktree · ğüşıöç \"tırnak\"", updatedAt: "2026-10-20T00:00:00Z", history: [] };
  writeFileSync(p, JSON.stringify({ version: 1, cards: { zz } }));
  writeCardLabel(p, "a", { label: "Kullanımda" }, T0);
  writeCardLabel(p, "b", { label: "Hiç kullanılmadı" }, T1);
  const { file } = readLabels(p);
  assert.equal(file.cards.a.label, "Kullanımda");
  assert.equal(file.cards.b.label, "Hiç kullanılmadı");
  assert.deepEqual(file.cards.zz, zz);
});

test("a save leaves no temp file, and a stale one does not break the next save", () => {
  const dir = tmp(), p = path.join(dir, "labels.json");
  writeCardLabel(p, "a", { label: "Yeni" }, T0);
  assert.deepEqual(readdirSync(dir).filter((f) => f.includes(".tmp-")), []);
  writeFileSync(p + ".tmp-999", "half a file");
  writeCardLabel(p, "a", { label: "Kullanımda" }, T1);
  assert.equal(readLabels(p).file.cards.a.label, "Kullanımda");
  assert.doesNotThrow(() => JSON.parse(readFileSync(p, "utf8")));
});

test("a note-only change keeps the label; every save adds one history item", () => {
  const p = path.join(tmp(), "labels.json");
  const first = writeCardLabel(p, "a", { note: "ilk not" }, T0);
  assert.equal(first.label, "Yeni");
  writeCardLabel(p, "a", { label: "Düşünülüyor" }, T0);
  const e = writeCardLabel(p, "a", { note: "ikinci not" }, T1);
  assert.equal(e.label, "Düşünülüyor");
  assert.equal(e.note, "ikinci not");
  assert.equal(e.updatedAt, T1.toISOString());
  assert.equal(e.history.length, 3);
});

test("a note longer than 2000 characters is refused", () => {
  const p = path.join(tmp(), "labels.json");
  assert.throws(() => writeCardLabel(p, "a", { note: "x".repeat(2001) }, T0));
});

test("the SQLite history mirrors the file and can be rebuilt from it", () => {
  const dir = tmp(), p = path.join(dir, "labels.json"), dbPath = path.join(dir, "kurgu.db");
  writeCardLabel(p, "a", { label: "Yeni" }, T0);
  writeCardLabel(p, "a", { label: "Kullanımda", note: "seçtim" }, T1);
  let db = openHistoryDb(dbPath);
  db.syncFrom(readLabels(p).file);
  const rows = db.history("a");
  db.close();
  assert.deepEqual(rows, readLabels(p).file.cards.a.history);
  rmSync(dbPath);
  db = openHistoryDb(dbPath);
  db.syncFrom(readLabels(p).file);
  assert.deepEqual(db.history("a"), rows);
  db.close();
});
