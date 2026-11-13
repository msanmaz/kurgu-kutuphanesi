// The springs of devmert7/_tools/popout/transition_kit.py, so a card moves like the real edit.

/** Critically damped spring, ~99% of the way at `dur` seconds. 0 before it starts. */
export function settle(t: number, dur = 0.45): number {
  if (t <= 0) return 0;
  const w = 6.64 / dur;
  return 1 - (1 + w * t) * Math.exp(-w * t);
}

/** Underdamped spring (ζ 0.8), ~1.5% overshoot. 0 before it starts. */
export function soft(t: number, dur = 0.45, z = 0.8): number {
  if (t <= 0) return 0;
  const w = 4.2 / (z * dur);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
}

export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p;
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
