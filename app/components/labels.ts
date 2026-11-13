// Shared UI text and colours for labels, vault statuses and origins.
import type { Card, Label, VaultStatus } from "@/lib/content/types";

export const LABEL_TONE: Record<Label, string> = {
  "Kullanımda": "bg-confirm text-white",
  "Düşünülüyor": "bg-sky text-white",
  "Hiç kullanılmadı": "bg-transparent text-dim ring-1 ring-inset ring-edge",
  "Yeni": "bg-clay text-white",
};

export const STATUS_TEXT: Record<VaultStatus, string> = {
  adopted: "Benimsendi",
  scoped: "Kapsamlı onay",
  candidate: "Aday",
  optional: "İsteğe bağlı",
  rejected: "Reddedildi",
  retired: "Kullanımdan kalktı",
};

export const STATUS_TONE: Record<VaultStatus, string> = {
  adopted: "bg-confirm text-white",
  scoped: "bg-sky text-white",
  candidate: "bg-transparent text-text ring-1 ring-inset ring-[#8a897f]",
  optional: "bg-transparent text-dim ring-1 ring-inset ring-edge",
  rejected: "bg-reject text-white",
  retired: "bg-transparent text-muted ring-1 ring-inset ring-edge",
};

export const ORIGIN_TEXT = { vault: "Vault", claude: "Claude varyasyonu", reference: "Reel'den" } as const;

export function originLine(card: Card): string {
  const o = card.origin;
  if (o.kind === "vault") return "Vault stili";
  if (o.kind === "claude") return `Claude varyasyonu · ${o.basis}${card.changed ? ` · ${card.changed}` : ""}`;
  return `Reel'den · ${o.reel} · ${o.at} · ${o.analysis}`;
}

export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay";
