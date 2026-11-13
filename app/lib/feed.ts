import { GROUPS } from "./content/types.ts";
import type { Card, Group, Label, Origin } from "./content/types.ts";

export type LabelMap = Record<string, { label: Label }>;
export type FeedFilter = { group?: Group; label?: Label; origin?: Origin["kind"]; rejected: boolean };

const LABEL_ORDER: Label[] = ["Yeni", "Düşünülüyor", "Kullanımda", "Hiç kullanılmadı"];

/** The creator's label for a card, else the card's starting label. */
export function effectiveLabel(card: Card, labels: LabelMap): Label {
  return labels[card.id]?.label ?? card.initialLabel;
}

/** Yeni first, then Düşünülüyor, Kullanımda, Hiç kullanılmadı; then by group, then by name. */
export function orderCards(cards: Card[], labels: LabelMap): Card[] {
  return [...cards].sort((a, b) =>
    LABEL_ORDER.indexOf(effectiveLabel(a, labels)) - LABEL_ORDER.indexOf(effectiveLabel(b, labels)) ||
    GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) ||
    a.name.localeCompare(b.name, "tr"));
}

const isRejected = (c: Card) => c.vault.status === "rejected" || c.vault.status === "retired";

/** Narrows the feed. Rejected and retired cards show only when `rejected` is on, and then only they show. */
export function filterCards(cards: Card[], labels: LabelMap, f: FeedFilter): Card[] {
  return cards.filter((c) =>
    isRejected(c) === f.rejected &&
    (!f.group || c.group === f.group) &&
    (!f.label || effectiveLabel(c, labels) === f.label) &&
    (!f.origin || c.origin.kind === f.origin));
}
