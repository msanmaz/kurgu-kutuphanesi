"use client";
// A card's detail: the drawing with measurements, rules, the vault record (read-only),
// its variations side by side, and the creator's label and note.
import { useEffect, useRef, useState } from "react";
import type { Card, Label } from "@/lib/content/types";
import { LABELS } from "@/lib/content/types";
import type { HistoryItem, LabelEntry } from "@/lib/labels/store";
import { Stage } from "./stage/Stage";
import { FOCUS, LABEL_TONE, STATUS_TEXT, STATUS_TONE, originLine } from "./labels";

type Props = {
  card: Card;
  siblings: Card[];
  label: Label;
  entry?: LabelEntry;
  saveError?: string;
  onSave: (change: { label?: Label; note?: string }) => Promise<boolean>;
  onOpen: (id: string) => void;
  onClose: () => void;
};

const time = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function Detail({ card, siblings, label, entry, saveError, onSave, onOpen, onClose }: Props) {
  const [dims, setDims] = useState(false);
  const [note, setNote] = useState(entry?.note ?? "");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const loadHistory = () =>
    fetch(`/api/labels/history?card=${encodeURIComponent(card.id)}`).then((r) => r.json()).then((d) => setHistory(d.history ?? [])).catch(() => setHistory([]));

  useEffect(() => { setNote(entry?.note ?? ""); setDims(false); loadHistory(); closeRef.current?.focus(); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (change: { label?: Label; note?: string }) => { if (await onSave(change)) loadHistory(); };
  const flushNote = () => {
    if (pending.current) { clearTimeout(pending.current); pending.current = null; }
    if (note !== (entry?.note ?? "")) save({ note });
  };
  const onNote = (v: string) => {
    setNote(v);
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => { pending.current = null; save({ note: v }); }, 600);
  };

  const v = card.vault;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="d-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-20 grid place-items-center bg-[rgba(8,8,8,.72)] p-4">
      <div className="grid max-h-full w-[min(1100px,100%)] grid-cols-[minmax(220px,340px)_minmax(0,1fr)] gap-6 overflow-auto rounded-3xl border border-edge bg-box p-6 max-[860px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-[14px] border border-edge"><Stage card={card} showDims={dims} /></div>
          <button type="button" aria-pressed={dims} onClick={() => setDims(!dims)}
            className={`self-start rounded-full px-3 py-1.5 text-[13px] ${dims ? "text-text ring-1 ring-inset ring-clay" : "text-dim ring-1 ring-inset ring-edge"} ${FOCUS}`}>
            {dims ? "Ölçüleri gizle" : "Ölçüleri göster"}
          </button>
          {siblings.length > 1 && (
            <div>
              <h4 className="m-0 mb-2 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Varyasyonlar</h4>
              <div className="grid grid-cols-3 gap-2">
                {siblings.map((s) => (
                  <button key={s.id} type="button" onClick={() => onOpen(s.id)} aria-current={s.id === card.id}
                    className={`flex min-w-0 flex-col gap-1 rounded-xl p-1 text-left ${s.id === card.id ? "ring-2 ring-clay" : "ring-1 ring-edge"} ${FOCUS}`}>
                    <Stage card={s} />
                    <span className="truncate text-[11.5px] text-dim">{s.isVariation ? s.name : "Ana stil"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="d-title" className="m-0 font-display text-[38px] font-normal leading-[1.05] tracking-[.3px] [text-wrap:balance]">{card.name}</h2>
              <p className="mb-0 mt-2 text-dim">{card.line}</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className={`rounded-full bg-bar px-3.5 py-2 text-sm font-semibold ${FOCUS}`}>Kapat</button>
          </div>

          <section className="mt-4 rounded-2xl border border-edge bg-win p-4" aria-label="Senin kararın">
            <h4 className="m-0 mb-2 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Etiketin</h4>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Etiket">
              {LABELS.map((l) => (
                <button key={l} type="button" aria-pressed={l === label} onClick={() => save({ label: l })}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${l === label ? LABEL_TONE[l] : "text-dim ring-1 ring-inset ring-edge"} ${FOCUS}`}>{l}</button>
              ))}
            </div>
            <label htmlFor="d-note" className="mt-3 block text-[13px] text-dim">Not</label>
            <textarea id="d-note" value={note} maxLength={2000} rows={3} onChange={(e) => onNote(e.target.value)} onBlur={flushNote}
              className={`mt-1 w-full resize-y rounded-xl border border-edge bg-box p-2.5 text-sm text-text ${FOCUS}`} placeholder="Bu kart hakkında not..." />
            <p className={`m-0 mt-1 text-[12.5px] ${saveError ? "text-reject" : "text-muted"}`} aria-live="polite">
              {saveError ?? (entry ? `Kaydedildi · ${time(entry.updatedAt)}` : "Henüz kaydedilmedi")}
            </p>
          </section>

          <h4 className="mb-1.5 mt-5 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Ne zaman</h4>
          <p className="m-0">{card.when}</p>
          <h4 className="mb-1.5 mt-5 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Kurallar ve ölçüler</h4>
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">{card.rules.map((r) => <li key={r}>{r}</li>)}</ul>

          <section className="mt-5 rounded-2xl border border-edge p-4" aria-label="Vault kaydı">
            <h4 className="m-0 mb-2 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Vault kaydı</h4>
            {v.statusCheckedAt
              ? <span className={`inline-block rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold leading-none ${STATUS_TONE[v.status]}`}>{STATUS_TEXT[v.status]}{v.date ? ` · ${v.date}` : ""}</span>
              : <span className="inline-block rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold leading-none text-dim ring-1 ring-inset ring-edge">Kontrol edilmedi</span>}
            {v.statusCheckedAt && <span className="ml-2 font-mono text-[11.5px] text-muted">kontrol: {v.statusCheckedAt}</span>}
            {v.note && <p className="mb-0 mt-2 text-[13.5px] text-dim">{v.note}</p>}
            <p className="mb-0 mt-3 rounded-xl border border-edge bg-win px-3.5 py-3 font-mono text-sm">
              &ldquo;{v.quote}&rdquo;<span className="mt-1.5 block font-body text-[12.5px] text-muted">{v.quoteWho}</span>
            </p>
            <p className="mb-0 mt-3 font-mono text-[13px] leading-relaxed text-dim [overflow-wrap:anywhere]">{v.sources.map((s) => <span key={s} className="block">{s}</span>)}</p>
            <p className="mb-0 mt-2 text-[12.5px] text-muted">Gerçek örnek</p>
            <p className="m-0 font-mono text-[13px] leading-relaxed text-dim [overflow-wrap:anywhere]">{v.examples.map((s) => <span key={s} className="block">{s}</span>)}</p>
          </section>

          <h4 className="mb-1.5 mt-5 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Kaynak</h4>
          <p className="m-0 font-mono text-[13px] text-dim [overflow-wrap:anywhere]">{originLine(card)}{card.addedAt ? ` · eklendi ${card.addedAt}` : ""}</p>

          <h4 className="mb-1.5 mt-5 font-mono text-xs font-bold uppercase tracking-[1.2px] text-muted">Geçmiş</h4>
          {history.length === 0
            ? <p className="m-0 text-[13px] text-muted">Henüz değişiklik yok.</p>
            : <ul className="m-0 flex list-none flex-col gap-1 p-0 font-mono text-[12.5px] text-dim">
                {[...history].reverse().map((h, i) => <li key={i}>{time(h.at)} · {h.label}{h.note ? ` · ${h.note}` : ""}</li>)}
              </ul>}
        </div>
      </div>
    </div>
  );
}
