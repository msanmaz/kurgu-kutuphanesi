import path from "node:path";
import { resolveLabelsPath } from "@/lib/labels/paths";
import { readLabels, writeCardLabel, LabelsFileError, NOTE_LIMIT } from "@/lib/labels/store";
import { openHistoryDb } from "@/lib/labels/db";
import { checkReadRequest, checkWriteRequest } from "@/lib/labels/guard";
import { LABELS } from "@/lib/content/types";
import type { Label } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const guard = checkReadRequest(request.headers);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const where = resolveLabelsPath(process.env, process.cwd());
  const { file, error } = readLabels(where.path);
  return Response.json({ cards: file.cards, path: where.path, source: where.source, warning: where.warning, error });
}

export async function POST(request: Request) {
  const guard = checkWriteRequest(request.headers);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  let body: { cardId?: unknown; label?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Gövde JSON değil" }, { status: 400 });
  }
  const { cardId, label, note } = body;
  if (typeof cardId !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(cardId)) return Response.json({ error: "Geçersiz kart" }, { status: 400 });
  if (label !== undefined && !(LABELS as readonly unknown[]).includes(label)) return Response.json({ error: "Geçersiz etiket" }, { status: 400 });
  if (note !== undefined && (typeof note !== "string" || note.length > NOTE_LIMIT)) return Response.json({ error: `Not en çok ${NOTE_LIMIT} karakter` }, { status: 400 });

  const where = resolveLabelsPath(process.env, process.cwd());
  try {
    const entry = writeCardLabel(where.path, cardId, { label: label as Label | undefined, note: note as string | undefined }, new Date());
    try {
      const db = openHistoryDb(path.join(process.cwd(), "data", "kurgu.db"));
      db.syncFrom(readLabels(where.path).file);
      db.close();
    } catch (e) {
      console.warn("history db not updated:", e); // labels.json is the authority; the save itself succeeded
    }
    return Response.json(entry);
  } catch (e) {
    if (e instanceof LabelsFileError) return Response.json({ error: `Etiket dosyası okunamadı, düzeltilene kadar kayıt kapalı (${e.message})` }, { status: 409 });
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
