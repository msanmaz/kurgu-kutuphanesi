import { soft, lerp, clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

const LOOP = 4;

/** PANEL over the face: the box springs in, its title types, the six tiles land one by one. */
export function panelFrame(p: Params, t: number) {
  const enterAt = Number(p.enterAt), springDur = Number(p.springDur);
  const s = soft(t - enterAt, springDur);
  const fadeOut = t > LOOP - 0.3 ? clamp01((LOOP - t) / 0.3) : 1;
  return {
    panelScale: lerp(0.9, 1, s),
    panelOpacity: clamp01((t - enterAt) / 0.12) * fadeOut,
    titleWidth: 380 * clamp01((t - enterAt - 0.45) / 0.5),
    tileOpacity: [0, 1, 2, 3, 4, 5].map((i) => clamp01((t - enterAt - 0.85 - i * 0.12) / 0.1)),
  };
}
