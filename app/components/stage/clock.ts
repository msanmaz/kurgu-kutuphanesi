// One requestAnimationFrame loop for every stage. window.__kurguSeek(t) freezes all stages at loop time t
// (for stills checks); __kurguSeek(null) resumes.

type Listener = (now: number) => void;
const listeners = new Set<Listener>();
let frozen: number | null = null;
let running = false;

declare global {
  interface Window { __kurguSeek?: (t: number | null) => void }
}

function loop() {
  if (!listeners.size) { running = false; return; }
  const now = frozen ?? performance.now() / 1000;
  for (const fn of listeners) fn(now);
  requestAnimationFrame(loop);
}

export function frozenTime(): number | null {
  return frozen;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  if (typeof window !== "undefined") {
    window.__kurguSeek = (t) => { frozen = t; };
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  return () => { listeners.delete(fn); };
}
