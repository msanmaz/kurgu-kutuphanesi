import { settle, lerp, clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

const FPS = 30;
const PANEL_CLEAR = 680; // PANEL box bottom 660 + 20 px, as in transition_kit.py

/** Frames after the cut before the PANEL may appear: the first frame the card edge is below the box. */
export function panelDelayFrames(p: Params): number {
  const cardTop = Number(p.cardTop), dur = Number(p.dur);
  let k = 0;
  while (k < 300 && cardTop * settle(k / FPS, dur) < PANEL_CLEAR) k++;
  return k;
}

/** T4: one digital zoom out of the face (fromScale → 1) while the card closes to cardTop (settle spring). */
export function cardZoomFrame(p: Params, t: number) {
  const cut = Number(p.cut), dur = Number(p.dur), fromScale = Number(p.fromScale), cardTop = Number(p.cardTop);
  const loop = cut + 3.6;
  const k = t < cut ? 0 : settle(t - cut, dur);
  const camScale = t < cut ? fromScale : lerp(fromScale, 1, k);
  const top = cardTop * k, x0 = 40 * k;
  const frameSinceCut = Math.floor((t - cut) * FPS + 1e-6);
  const fadeOut = t > loop - 0.3 ? clamp01((loop - t) / 0.3) : 1;
  return {
    camScale,
    camTx: 560 - camScale * 560,
    camTy: 1260 - camScale * 1260,
    card: { x: x0, y: top, w: 1080 - 2 * x0, h: 1920 - top + 60, rx: 36 * k },
    aboveH: top + 24,
    panelOpacity: t < cut ? 0 : clamp01((frameSinceCut - panelDelayFrames(p)) / 4) * fadeOut,
    cutMarker: t > cut - 0.02 && t < cut + 0.25,
  };
}
