"use client";
import type { Card, Label } from "@/lib/content/types";
import { Stage } from "./stage/Stage";
import { FOCUS } from "./labels";

export function CardTile({ card, label, onOpen }: { card: Card; label: Label; onOpen: (id: string, el: HTMLElement) => void }) {
  return (
    <button
      type="button"
      data-card={card.id}
      aria-label={`${card.name} · ${label}`}
      onClick={(e) => onOpen(card.id, e.currentTarget)}
      className={`flex min-w-0 cursor-pointer flex-col gap-2.5 rounded-[20px] border border-edge bg-win p-2.5 pb-3.5 text-left hover:border-[#55554f] ${FOCUS}`}
    >
      <Stage card={card} badge={label} />
      <div className="flex min-w-0 flex-col gap-1.5 px-1.5">
        <h3 className="m-0 text-[17px] font-semibold leading-tight">{card.name}</h3>
        <p className="m-0 line-clamp-2 text-sm leading-snug text-dim">{card.line}</p>
        <div className="flex flex-wrap gap-1.5">
          {card.isVariation && <span className="rounded-full bg-[rgba(217,119,87,.16)] px-2.5 py-1.5 text-xs leading-none text-clay">varyasyon</span>}
          {card.tags.map((t) => <span key={t} className="rounded-full bg-bar px-2.5 py-1.5 text-xs leading-none text-dim">{t}</span>)}
        </div>
      </div>
    </button>
  );
}
