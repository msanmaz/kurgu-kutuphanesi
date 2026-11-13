import { clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

const LOOP = 4;

/** Pop-out half-cut: the card holds still; the PANEL content builds above the head. */
export function popoutFrame(p: Params, t: number) {
  const fadeOut = t > LOOP - 0.3 ? clamp01((LOOP - t) / 0.3) : 1;
  return {
    cardTop: Number(p.cardTop),
    panelOpacity: clamp01((t - 0.2) / 0.15) * fadeOut,
    titleWidth: 380 * clamp01((t - 0.5) / 0.5),
    tileOpacity: [0, 1, 2, 3, 4, 5].map((i) => clamp01((t - 0.9 - i * 0.12) / 0.1)),
  };
}
