"use client";
// The explore feed: every style and variation as an animated card, filtered and ordered by label.
import { useCallback, useMemo, useRef, useState } from "react";
import type { Card, Group, Label, Origin } from "@/lib/content/types";
import { GROUPS, LABELS } from "@/lib/content/types";
import type { LabelEntry } from "@/lib/labels/store";
import { effectiveLabel, filterCards, orderCards } from "@/lib/feed";
import { saveLabel } from "@/lib/labels/client";
import type { FeedFilter } from "@/lib/feed";
import { CardTile } from "./CardTile";
import { Detail } from "./Detail";
import { Banner } from "./Banner";
import { FOCUS, ORIGIN_TEXT } from "./labels";

export type LabelsState = { cards: Record<string, LabelEntry>; path: string; source: string; warning?: string; error?: string };

function Chip({ on, disabled, onClick, children }: { on: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${on ? "bg-text text-ground" : "text-dim ring-1 ring-inset ring-edge"} disabled:cursor-default disabled:opacity-40 ${FOCUS}`}>
      {children}
    </button>
  );
}

export function Feed({ cards, contentErrors, initial }: { cards: Card[]; contentErrors: string[]; initial: LabelsState }) {
  const [labels, setLabels] = useState(initial.cards);
  const [fileError, setFileError] = useState(initial.error);
  const [saveError, setSaveError] = useState<string>();
  const [filter, setFilter] = useState<FeedFilter>({ rejected: false });
  const [openId, setOpenId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const shown = useMemo(() => orderCards(filterCards(cards, labels, filter), labels), [cards, labels, filter]);
  const pool = useMemo(() => filterCards(cards, labels, { rejected: filter.rejected }), [cards, labels, filter.rejected]);
  const open = cards.find((c) => c.id === openId) ?? null;

  const save = useCallback(async (cardId: string, change: { label?: Label; note?: string }) => {
    const r = await saveLabel(fetch, cardId, change);
    if (!r.ok) {
      setSaveError(r.error);
      if (r.conflict) setFileError(r.error);
      return false;
    }
    setSaveError(undefined);
    setFileError(undefined); // the file is readable again
    setLabels((prev) => ({ ...prev, [cardId]: r.entry }));
    return true;
  }, []);
  const close = useCallback(() => { setOpenId(null); setSaveError(undefined); opener.current?.focus(); }, []);
  const set = (patch: Partial<FeedFilter>) => setFilter((f) => ({ ...f, ...patch }));

  return (
    <div className="mx-auto max-w-[1380px] px-[max(16px,env(safe-area-inset-left,0px))] py-6">
      <header className="mb-5 flex flex-col gap-1.5">
        <h1 className="m-0 font-display text-[52px] font-normal leading-none tracking-[.4px]">Kurgu <em className="font-serif text-[1.08em] font-semibold italic tracking-normal text-clay">Kütüphanesi</em></h1>
        <p className="m-0 font-mono text-[12px] text-muted [overflow-wrap:anywhere]">etiketler: {initial.path} · {initial.source === "main" ? "ana vault" : initial.source === "env" ? "KURGU_LABELS_PATH" : "bu klasör"}</p>
        <p className="m-0 text-[13.5px] text-dim">Kartlar kurgu mekaniğinin şemasıdır; gerçek ekran ya da kayıt değildir.</p>
      </header>

      <div className="mb-4 flex flex-col gap-2.5 empty:hidden">
        {fileError && <Banner tone="error" title="Etiket dosyası okunamadı, düzeltilene kadar kayıt kapalı" items={[fileError]} />}
        {initial.warning && <Banner tone="warning" title={initial.warning} />}
        {contentErrors.length > 0 && <Banner tone="warning" title="Bazı kartlar yüklenemedi:" items={contentErrors} />}
      </div>

      <section className="rounded-[22px] border border-edge bg-box">
        <div className="flex flex-col gap-2.5 border-b border-edge px-7 py-5 max-[860px]:px-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Gruplar">
            <Chip on={!filter.group} onClick={() => set({ group: undefined })}>Tümü <span className="font-mono text-[11.5px] opacity-75">{pool.length}</span></Chip>
            {GROUPS.map((g) => {
              const n = pool.filter((c) => c.group === g).length;
              return <Chip key={g} on={filter.group === g} disabled={!n} onClick={() => set({ group: filter.group === g ? undefined : (g as Group) })}>{g} <span className="font-mono text-[11.5px] opacity-75">{n}</span></Chip>;
            })}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Etiketler ve kaynak">
            {LABELS.map((l) => (
              <Chip key={l} on={filter.label === l} onClick={() => set({ label: filter.label === l ? undefined : l })}>
                {l} <span className="font-mono text-[11.5px] opacity-75">{pool.filter((c) => effectiveLabel(c, labels) === l).length}</span>
              </Chip>
            ))}
            <span className="mx-1 w-px self-stretch bg-edge" aria-hidden="true" />
            {(Object.keys(ORIGIN_TEXT) as Origin["kind"][]).map((k) => (
              <Chip key={k} on={filter.origin === k} onClick={() => set({ origin: filter.origin === k ? undefined : k })}>{ORIGIN_TEXT[k]}</Chip>
            ))}
            <span className="mx-1 w-px self-stretch bg-edge" aria-hidden="true" />
            <Chip on={filter.rejected} onClick={() => set({ rejected: !filter.rejected, group: undefined })}>Reddedilenler</Chip>
          </div>
        </div>

        {shown.length === 0
          ? <p className="m-0 px-7 py-12 text-dim">{filter.rejected ? "Reddedilen ya da kullanımdan kalkan stil yok." : "Bu filtreyle kart yok."}</p>
          : <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5 px-7 py-6 max-[860px]:px-4">
              {shown.map((c) => (
                <CardTile key={c.id} card={c} label={effectiveLabel(c, labels)} onOpen={(id, el) => { opener.current = el; setOpenId(id); }} />
              ))}
            </div>}
      </section>

      {open && (
        <Detail
          card={open}
          siblings={cards.filter((c) => c.styleId === open.styleId)}
          label={effectiveLabel(open, labels)}
          entry={labels[open.id]}
          saveError={fileError ? `Kayıt kapalı: ${fileError}` : saveError}
          onSave={(change) => save(open.id, change)}
          onOpen={setOpenId}
          onClose={close}
        />
      )}
    </div>
  );
}
