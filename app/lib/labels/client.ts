// The browser side of a save: never throws, so the UI can always show what happened.
import type { Label } from "../content/types.ts";
import type { LabelEntry } from "./store.ts";

export type SaveResult = { ok: true; entry: LabelEntry } | { ok: false; error: string; conflict: boolean };

export async function saveLabel(fetchImpl: typeof fetch, cardId: string, change: { label?: Label; note?: string }): Promise<SaveResult> {
  let res: Response;
  try {
    res = await fetchImpl("/api/labels", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cardId, ...change }) });
  } catch {
    return { ok: false, error: "Kaydedilemedi: uygulamaya ulaşılamadı (sunucu kapalı olabilir)", conflict: false };
  }
  const data = await res.json().catch(() => ({ error: "Yanıt okunamadı" }));
  if (!res.ok) return { ok: false, error: data.error ?? "Kaydedilemedi", conflict: res.status === 409 };
  return { ok: true, entry: data as LabelEntry };
}
