import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync, openSync, closeSync, fsyncSync, unlinkSync, statSync } from "node:fs";
import path from "node:path";
import { LABELS } from "../content/types.ts";
import type { Label } from "../content/types.ts";

export type HistoryItem = { label: Label; note: string; at: string };
export type LabelEntry = { label: Label; note: string; updatedAt: string; history: HistoryItem[] };
export type LabelsFile = { version: 1; cards: Record<string, LabelEntry> };

export const NOTE_LIMIT = 2000;
const LOCK_WAIT_MS = 3000, LOCK_STALE_MS = 10000;

export class LabelsFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabelsFileError";
  }
}

const isLabel = (v: unknown): v is Label => (LABELS as readonly unknown[]).includes(v);
const isItem = (v: unknown): boolean =>
  typeof v === "object" && v !== null && isLabel((v as HistoryItem).label) &&
  typeof (v as HistoryItem).note === "string" && typeof (v as HistoryItem).at === "string";

function shapeError(v: unknown): string | null {
  if (typeof v !== "object" || v === null) return "not an object";
  const f = v as LabelsFile;
  if (f.version !== 1) return "version must be 1";
  if (typeof f.cards !== "object" || f.cards === null || Array.isArray(f.cards)) return "cards must be an object";
  for (const [id, e] of Object.entries(f.cards)) {
    if (!isLabel(e?.label) || typeof e.note !== "string" || typeof e.updatedAt !== "string" || !Array.isArray(e.history) || !e.history.every(isItem))
      return `card "${id}" has the wrong shape`;
  }
  return null;
}

/** Reads the labels file. Missing: empty. Malformed: an error, never a throw, and the file is left alone. */
export function readLabels(p: string): { file: LabelsFile; error?: string } {
  const empty: LabelsFile = { version: 1, cards: {} };
  if (!existsSync(p)) return { file: empty };
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    return { file: empty, error: `${p}: JSON okunamadı (${e instanceof Error ? e.message : String(e)})` };
  }
  const bad = shapeError(parsed);
  return bad ? { file: empty, error: `${p}: ${bad}` } : { file: parsed as LabelsFile };
}

const pause = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** An exclusive lock file next to the labels file, so two app copies never interleave a read-modify-write. */
function withLock<T>(p: string, fn: () => T): T {
  const lock = `${p}.lock`;
  const until = Date.now() + LOCK_WAIT_MS;
  let fd: number | undefined;
  while (fd === undefined) {
    try {
      fd = openSync(lock, "wx");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      try { if (Date.now() - statSync(lock).mtimeMs > LOCK_STALE_MS) unlinkSync(lock); } catch { /* the holder just released it */ }
      if (Date.now() > until) throw new Error("Etiket dosyası başka bir kayıtta kilitli, tekrar dene");
      pause(5 + Math.random() * 10);
    }
  }
  try {
    return fn();
  } finally {
    closeSync(fd);
    try { unlinkSync(lock); } catch { /* already gone */ }
  }
}

/** Updates one card and appends a history item, under the lock. Write a temp file, fsync, then rename, so an interrupted save keeps the old file. */
export function writeCardLabel(p: string, cardId: string, change: { label?: Label; note?: string }, now: Date): LabelEntry {
  if (change.label !== undefined && !isLabel(change.label)) throw new Error(`unknown label "${String(change.label)}"`);
  if (change.note !== undefined && change.note.length > NOTE_LIMIT) throw new Error(`note is longer than ${NOTE_LIMIT} characters`);
  mkdirSync(path.dirname(p), { recursive: true });
  return withLock(p, () => writeUnlocked(p, cardId, change, now));
}

function writeUnlocked(p: string, cardId: string, change: { label?: Label; note?: string }, now: Date): LabelEntry {
  const { file, error } = readLabels(p);
  if (error) throw new LabelsFileError(error);
  const prev = file.cards[cardId];
  const label = change.label ?? prev?.label ?? "Yeni";
  const note = change.note ?? prev?.note ?? "";
  const at = now.toISOString();
  const entry: LabelEntry = { label, note, updatedAt: at, history: [...(prev?.history ?? []), { label, note, at }] };
  file.cards[cardId] = entry;
  const tmp = `${p}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(file, null, 2) + "\n");
  const fd = openSync(tmp, "r+");
  try { fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(tmp, p);
  return entry;
}
