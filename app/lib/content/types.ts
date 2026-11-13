import type { Params, TemplateId } from "../motion/registry.ts";

export const GROUPS = ["Yerleşim", "Geçiş", "Zoom", "Ekran", "Vurgu", "Hareket", "Yazı", "Ekleme", "Görünüm"] as const;
export const LABELS = ["Kullanımda", "Düşünülüyor", "Hiç kullanılmadı", "Yeni"] as const;
export const VAULT_STATUSES = ["adopted", "scoped", "candidate", "optional", "rejected", "retired"] as const;

export type Group = (typeof GROUPS)[number];
export type Label = (typeof LABELS)[number];
export type VaultStatus = (typeof VAULT_STATUSES)[number];

/** One caption chunk: plain text and {k: key word} parts, e.g. ["ANA ", {k: "FİKRE"}, " GEÇİŞ"]. */
export type CaptionChunk = (string | { k: string })[];

export type Origin =
  | { kind: "vault" }
  | { kind: "claude"; basis: string }
  | { kind: "reference"; reel: string; at: string; analysis: string };

export interface VaultRecord {
  status: VaultStatus;
  date?: string;
  statusCheckedAt?: string;
  note?: string;
  quote: string;
  quoteWho: string;
  sources: string[];
  examples: string[];
}

export interface VariationEntry {
  id: string;
  name: string;
  line: string;
  changed: string;
  params: Params;
  caption?: CaptionChunk[];
  tags?: string[];
  origin: Origin;
  initialLabel: Label;
  addedAt: string;
}

export interface StyleEntry {
  id: string;
  group: Group;
  name: string;
  line: string;
  when: string;
  tags: string[];
  rules: string[];
  vault: VaultRecord;
  template: TemplateId;
  params: Params;
  caption: CaptionChunk[];
  initialLabel: Label;
  origin: Origin;
  variations: VariationEntry[];
}

/** What the feed shows: a style, or one of its variations with the style's fields filled in. */
export interface Card {
  id: string;
  styleId: string;
  isVariation: boolean;
  group: Group;
  name: string;
  line: string;
  when: string;
  tags: string[];
  rules: string[];
  vault: VaultRecord;
  template: TemplateId;
  params: Params;
  caption: CaptionChunk[];
  initialLabel: Label;
  origin: Origin;
  changed?: string;
  addedAt?: string;
}
