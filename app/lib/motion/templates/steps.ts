// Step numbers in everyday Apple-UI forms (creator, 2026-11-12: "n5 aND N3 IS GOOD KEEP IN OUR EDIT LIBRARY … ON HOW THEIR
// MOTION WOULD BE"). The looks were approved on devmert7/ai-mulakat-kabul-mu-kontrol-mu/storyboard-v1/sheets/step-numbers.png;
// the motion below is Claude's proposal until the creator approves it.
import { settle, soft, clamp01, lerp } from "../springs.ts";
import type { Params } from "../registry.ts";

export const KEYPAD_LOOP = 4.2;
export const LOCK_LOOP = 4.6;

/** The three steps of the ai-mulakat Reel: number, keypad verb, lock-screen date line. */
export const STEPS = [
  { n: "1", verb: "OKU", line: "ADIM 1 · REQUIREMENT'LARI OKU" },
  { n: "2", verb: "BUL", line: "ADIM 2 · KURALI KODDA BUL" },
  { n: "3", verb: "SOR", line: "ADIM 3 · KURALLA AI'A SOR" },
] as const;

const fadeOutAt = (t: number, loop: number) => (t > loop - 0.3 ? clamp01((loop - t) / 0.3) : 1);

/**
 * N3 · Tuş takımı. On "üç adımı yap" the keys arrive left to right (settle spring, `stagger` apart, 0.85 → 1).
 * On each step word its key is pressed: it dips to 92 % and back over `pressDur` (soft spring feel), fills cream in 0.12 s and
 * draws a burgundy ring in 0.2 s. A finished key goes back to glass and shows a small tick.
 */
export function keypadFrame(p: Params, t: number) {
  const stagger = Number(p.stagger), pressDur = Number(p.pressDur);
  const at = [Number(p.step1), Number(p.step2), Number(p.step3)];
  const fade = fadeOutAt(t, KEYPAD_LOOP);
  const keys = [0, 1, 2].map((i) => {
    const enter = settle(t - i * stagger, 0.45);
    const dt = t - at[i];
    const next = i < 2 ? at[i + 1] : Infinity;
    const active = dt >= 0 && t < next;
    const done = t >= next;
    let scale = lerp(0.85, 1, enter);
    if (dt >= 0 && dt < pressDur) scale *= 1 - 0.08 * Math.sin((Math.PI * dt) / pressDur);
    return {
      scale,
      opacity: clamp01(enter * 1.4) * fade,
      fill: active ? clamp01(dt / 0.12) : 0,
      ring: active ? clamp01(dt / 0.2) : 0,
      tick: done ? clamp01((t - next) / 0.15) : 0,
    };
  });
  return { keys, placement: String(p.placement) };
}

/**
 * N5 · Kilit ekranı. The date line sharpens first (0.15 s); the number rises 40 px from blur 12 → 0 and scale 0.94 → 1 on a soft
 * spring (`rise`), behind the head. On each later step the digit rolls like a clock digit: the old one slides 120 px up and
 * fades over `rollDur`, the new one comes up from below on a settle spring; the date line switches with it.
 */
export function lockFrame(p: Params, t: number) {
  const at = [Number(p.at1), Number(p.at2), Number(p.at3)];
  const rise = Number(p.rise), rollDur = Number(p.rollDur);
  const idx = Math.max(0, at.filter((a) => t >= a).length - 1);
  const enter = soft(t - at[0], rise);
  const since = t - at[idx];
  const rolling = idx > 0 && since < rollDur;
  const roll = idx > 0 ? settle(since, rollDur) : 1;
  return {
    current: idx,
    previous: rolling ? idx - 1 : -1,
    roll,
    rise: lerp(40, 0, enter),
    blur: lerp(12, 0, clamp01(enter)),
    scale: lerp(0.94, 1, enter),
    numberOpacity: clamp01((t - at[0]) / 0.12) * fadeOutAt(t, LOCK_LOOP),
    dateOpacity: clamp01((t - (at[0] - 0.15)) / 0.15) * fadeOutAt(t, LOCK_LOOP),
    fill: String(p.fill),
  };
}
