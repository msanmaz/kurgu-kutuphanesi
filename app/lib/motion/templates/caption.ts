import { withDefaults } from "../registry.ts";
import type { Params } from "../registry.ts";

/** The caption pill steps through its chunks, one every chunkDur seconds. */
export function captionFrame(p: Params, t: number, chunks: number) {
  const n = Math.max(1, chunks);
  return { captionIndex: Math.min(n - 1, Math.max(0, Math.floor(t / Number(p.chunkDur)))) };
}

/** The pill's bottom edge: 330 px above the frame's bottom (at 150 px it sat under the Reels UI). */
export const CAPTION_BOTTOM = 1590;
const PAD_Y = 13, PAD_X = 26;
// Poppins is bundled; Helvetica is the macOS system font, so it only renders on this Mac (channel-fonts.md).
const FAMILIES: Record<string, string> = {
  poppins: 'Poppins, "Helvetica Neue", Arial, sans-serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

/** Font and box of the caption pill, in Reel pixels. Cards of other templates get the caption defaults. */
export function captionStyle(p: Params) {
  const q = withDefaults("caption", p);
  const size = Number(q.captionSize);
  const height = size + 2 * PAD_Y;
  return { fontFamily: FAMILIES[String(q.captionFont)], fontWeight: Number(q.captionWeight), size, padY: PAD_Y, padX: PAD_X, height, top: CAPTION_BOTTOM - height };
}
