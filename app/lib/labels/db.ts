import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Label } from "../content/types.ts";
import type { HistoryItem, LabelsFile } from "./store.ts";

/** A local SQLite copy of the label history. labels.json is the authority; this is rebuilt from it. */
export function openHistoryDb(dbPath: string) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("CREATE TABLE IF NOT EXISTS history (card_id TEXT NOT NULL, label TEXT NOT NULL, note TEXT NOT NULL, at TEXT NOT NULL)");
  return {
    syncFrom(file: LabelsFile): void {
      const rows = Object.entries(file.cards).flatMap(([id, e]) => e.history.map((h) => ({ id, ...h })));
      const newest = rows.reduce((m, r) => (r.at > m ? r.at : m), "");
      const cur = db.prepare("SELECT COUNT(*) AS n, COALESCE(MAX(at), '') AS newest FROM history").get() as { n: number; newest: string };
      if (Number(cur.n) === rows.length && String(cur.newest) === newest) return;
      const insert = db.prepare("INSERT INTO history (card_id, label, note, at) VALUES (?, ?, ?, ?)");
      db.exec("BEGIN");
      try {
        db.exec("DELETE FROM history");
        for (const r of rows) insert.run(r.id, r.label, r.note, r.at);
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    history(cardId: string): HistoryItem[] {
      const rows = db.prepare("SELECT label, note, at FROM history WHERE card_id = ? ORDER BY rowid").all(cardId) as Record<string, unknown>[];
      return rows.map((r) => ({ label: String(r.label) as Label, note: String(r.note), at: String(r.at) }));
    },
    close(): void {
      db.close();
    },
  };
}
