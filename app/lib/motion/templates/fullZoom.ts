import { settle, lerp, clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

// Window geometry in its own pixels (968 wide): code rows start at y 70, 58 apart, inside a 30 px offset.
const FIRST_ROW = 3, ROW_STEP = 2, STOP_GAP = 1.4, FOCUS_X = 500;
const FULL_X = 56, FULL_Y = 320, CENTRE_X = 540, CENTRE_Y = 625;
export const rowFocusY = (row: number) => 30 + 70 + row * 58 + 12;

/** Whole window for `hold`, then a zoom to a line; each later stop moves 2 rows down with the same spring. */
export function fullZoomFrame(p: Params, t: number) {
  const hold = Number(p.hold), zoomDur = Number(p.zoomDur), scale = Number(p.scale);
  const stops = Math.max(1, Math.round(Number(p.stops)));
  let stop = 0;
  for (let i = 1; i < stops; i++) if (t >= hold + i * STOP_GAP) stop = i;
  const start = hold + stop * STOP_GAP;
  const row = FIRST_ROW + stop * ROW_STEP;
  const k = settle(t - start, zoomDur);
  let winScale: number, winTx: number, winTy: number;
  if (stop === 0) {
    winScale = lerp(1, scale, k);
    winTx = lerp(FULL_X, CENTRE_X - winScale * FOCUS_X, k);
    winTy = lerp(FULL_Y, CENTRE_Y - winScale * rowFocusY(row), k);
  } else {
    const fy = lerp(rowFocusY(row - ROW_STEP), rowFocusY(row), k);
    winScale = scale;
    winTx = CENTRE_X - scale * FOCUS_X;
    winTy = CENTRE_Y - scale * fy;
  }
  return {
    winTx, winTy, winScale,
    bandOpacity: clamp01((t - start - zoomDur - 0.05) / 0.12),
    bandRow: row,
    captionIndex: t < hold + zoomDur * 0.6 ? 0 : 1,
  };
}
