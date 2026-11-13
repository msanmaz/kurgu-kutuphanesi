// Five edits from Jitter templates the creator sent on 2026-11-13, tested on the ai-mulakat take v1 (frames and notes in
// devmert7/ai-mulakat-kabul-mu-kontrol-mu/{halftone-steps,blur-scroller,quote-card,cta-session,riso-clamp}-test/).
// Creator, 2026-11-13: "add this animations we made to our kurgu kutuphanesi … and give them a motion with this contact sheet";
// then "can you use animation vocabulary skills and review jitter to get properly motions". The motion below follows the measured
// previews (docs/2026-11-13-jitter-motion-measurements.md); the named terms are from the animation-vocabulary glossary.
// Each frame function is pure: (params, t) → what the drawing needs. The Jitter files and assets are not used.
import { settle, lerp, clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

const n = (p: Params, k: string) => Number(p[k]);
const ramp = (t: number, a: number, d: number) => clamp01((t - a) / d);
/** Fade the loop out over its last 0.25 s so the restart reads as a cut. */
const tail = (t: number, loop: number) => (t > loop - 0.25 ? clamp01((loop - t) / 0.25) : 1);

/** Cubic-bezier easing (CSS semantics): x is time 0..1, returns progress 0..1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3;
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, s = x;
    for (let i = 0; i < 30; i++) { s = (lo + hi) / 2; if (bx(s) < x) lo = s; else hi = s; }
    return by(s);
  };
}
/** Asymmetric ease-in-out: a quick start, the long slow landing measured on the scroller. */
export const easeInOutAsym = cubicBezier(0.45, 0, 0.15, 1);   // velocity peaks at 32 % (measured ≈ 30–35 %)
/** Ease-out for entrances (the quote card's slide in). */
export const easeOut = cubicBezier(0.2, 0.8, 0.2, 1);
/** Ease-in for exits (the quote card's slide out). */
export const easeIn = cubicBezier(0.5, 0, 0.9, 0.4);

// ── Yarım ton adım (halftone-counter-poster) ────────────────────────────────────────

export const HALFTONE_LOOP = 5;
export const HALFTONE_STEPS = ["HARİTAYI ÇIKAR", "HATAYI TESTLE YAKALA", "AI'A KÜÇÜK İŞ VER"] as const;
/**
 * Stepped animation / number ticker, as measured: each digit is a hard cut and nothing moves until the next one (Jitter holds
 * 0.57 s per number). Here the cuts land on the step words. With `roll` on, the "Üç…" pause runs a fast ticker 1 → 2 in two
 * other typefaces (Anton, Playfair italic), 0.15 s each, before 3 — the template's change of face per number.
 * `grow` > 0 is our own option (dots print in row by row); 0 is the template's hard cut.
 */
export function halftoneFrame(p: Params, t: number) {
  const at = [n(p, "at1"), n(p, "at2"), n(p, "at3")];
  const grow = n(p, "grow");
  const roll = p.roll === "on";
  let glyph = "p1", start = at[0], step = 0, rolling = false;
  if (t >= at[1]) { glyph = "p2"; start = at[1]; step = 1; }
  if (roll && t >= at[2] - 0.45 && t < at[2] - 0.3) { glyph = "a1"; start = -9; rolling = true; }
  else if (roll && t >= at[2] - 0.3 && t < at[2] - 0.15) { glyph = "i2"; start = -9; rolling = true; }
  else if (roll && t >= at[2] - 0.15 && t < at[2]) { glyph = "p2"; start = -9; rolling = true; }
  if (t >= at[2]) { glyph = "p3"; start = at[2]; step = 2; }
  /** Dot radius factor for a dot at height y (120 top … 840 bottom). */
  const dot = (y: number) => {
    if (t < at[0]) return 0;
    if (grow <= 0) return 1;
    return settle(t - start - ((y - 120) / 720) * grow * 0.6, grow * 0.6);
  };
  return {
    glyph, step, rolling, dot,
    labelOpacity: t >= at[0] ? tail(t, HALFTONE_LOOP) : 0,
    opacity: tail(t, HALFTONE_LOOP),
    look: String(p.look),
  };
}

// ── Bulanık kelime çarkı (blur-text-scroller) ───────────────────────────────────────

export const WHEEL_LISTS = {
  adimlar: { words: ["Nereden başlasam?", "Harita", "Test", "Küçük iş"], ticks: false, title: "" },
  doordash: { words: ["Yön bulmak", "AI'ın çıktısını kontrol etmek", "İşi küçük tutmak", "Kararını anlatmak"], ticks: true, title: "NEYE PUAN VERİYOR" },
} as const;
const WHEEL_D = 0.42;
const WHEEL_START = 0.5;
/**
 * A drum of words. Every `per` seconds (Jitter: 0.75) the list translates one row on an asymmetric ease-in-out over `move` s
 * (Jitter: ≈ 0.2). Blur, scale and colour follow a lagging position (settle, 0.35 s) — the follow-through measured after each
 * landing — so the new middle word crossfades grey → white partway through the move. Rows sit on a cylinder: y ∝ sin(d × 0.42),
 * scale 0.62 + 0.38 cos, blur 2.2 + 3.2 (|d| − 1) px, tilt d × 3°.
 */
export function wheelFrame(p: Params, t: number) {
  const list = WHEEL_LISTS[(String(p.list) in WHEEL_LISTS ? String(p.list) : "adimlar") as keyof typeof WHEEL_LISTS];
  const per = n(p, "per"), move = n(p, "move");
  const steps = list.words.length - 1;
  let pos = 0, lag = 0;
  for (let k = 1; k <= steps; k++) {
    const s = WHEEL_START + (k - 1) * per;
    pos += easeInOutAsym((t - s) / move);
    lag += settle(t - s - move * 0.25, 0.35);
  }
  const loop = wheelLoop(p);
  const rows = list.words.map((word, i) => {
    const d = i - pos, th = d * WHEEL_D;
    const dl = Math.abs(i - lag);                                 // looks (blur, scale, colour) follow the lagging position
    return {
      word,
      dy: Math.sin(Math.max(-1.45, Math.min(1.45, th))) / Math.sin(WHEEL_D),
      scale: 0.62 + 0.38 * Math.cos(Math.min(1.45, dl * WHEEL_D)),
      blur: dl < 1 ? dl * 2.2 : 2.2 + 3.2 * (dl - 1),
      opacity: Math.max(0, 1 - 0.28 * dl) * ramp(t, 0.1, 0.2) * tail(t, loop),
      tilt: d * 3,
      white: clamp01(1 - dl * 1.6),                               // 1 = white, 0 = grey: the crossfade
      tick: list.ticks && i < Math.round(lag),
    };
  });
  return { rows: rows.filter((_, i) => Math.abs(i - pos) < 3.2), title: list.title, look: String(p.look), pos };
}
export const wheelLoop = (p: Params) => WHEEL_START + n(p, "per") * (WHEEL_LISTS.adimlar.words.length - 1) + 1.2;

// ── Alıntı kartı (the-track-quote) ──────────────────────────────────────────────────

export const QUOTES = {
  mert: { words: ["Sesli", "anlatmak", "çok", "önemli."], who: ["MERT", "@DEVMERT7"], tr: "", avatar: true },
  doordash: {
    words: ["Many", "candidates", "needed", "15", "to", "20", "minutes", "just", "to", "explore", "and", "understand", "the", "code."],
    who: ["DOORDASH, 19 MART 2026", "CAREERS.DOORDASH.COM"], tr: "Birçok aday sadece kodu anlamak için 15–20 dakika harcadı.", avatar: false,
  },
} as const;
const Q_IN = 0.5, Q_SLIDE = 0.4, Q_HOLD = 1.5, Q_OUT = 0.4;
/**
 * As measured: the card slides in from off-frame on an ease-out (0.4 s); the words appear in a stagger, each in one frame
 * (`perWord`, Jitter ≈ 0.07); then a layout animation grows the card for the attribution (0.3 s ease-out) and the name types in;
 * hold; the card slides out on an ease-in (0.4 s). duotone: our addition — the take turns burgundy and pulls back to 70 % first,
 * because his face fills the frame (the template's photo is a full-figure shot). top: the card comes down from above his head.
 * card: the card on the dark panel, his take in the card below.
 */
export function quoteFrame(p: Params, t: number) {
  const q = QUOTES[(String(p.quote) in QUOTES ? String(p.quote) : "mert") as keyof typeof QUOTES];
  const per = n(p, "perWord");
  const look = String(p.look);
  const duo = look === "duotone" ? settle(t - 0.05, 0.45) : 0;
  const w0 = Q_IN + Q_SLIDE * 0.8;
  const shown = Math.max(0, Math.min(q.words.length, Math.floor((t - w0) / per) + 1));
  const end = w0 + per * q.words.length;
  const attrAt = end + 0.25 + (q.tr ? 0.2 : 0);
  const outAt = attrAt + 0.3 + Q_HOLD;
  const inK = easeOut((t - Q_IN) / Q_SLIDE), outK = easeIn((t - outAt) / Q_OUT);
  const off = look === "top" ? -900 : 1000;                       // from beyond the frame edge
  const name = q.who.join("\n");
  const typed = Math.max(0, Math.floor((t - attrAt - 0.15) * 40));
  return {
    look, duo, pull: lerp(1, 0.7, duo),
    cardOffset: lerp(off, 0, inK) + (look === "top" ? -1 : 1) * 1000 * outK,
    cardOpacity: t < Q_IN ? 0 : 1,
    grow: easeOut((t - attrAt) / 0.3),                            // 0 → 1: the card's extra height for the attribution row
    words: q.words, shown,
    tr: q.tr, trOpacity: q.tr && t >= end + 0.1 ? 1 : 0,
    who: name.slice(0, typed).split("\n"), avatar: q.avatar, avatarOn: t >= attrAt + 0.1,
  };
}
export const quoteLoop = (p: Params) => {
  const q = QUOTES[(String(p.quote) in QUOTES ? String(p.quote) : "mert") as keyof typeof QUOTES];
  return Q_IN + Q_SLIDE * 0.8 + n(p, "perWord") * q.words.length + 0.25 + (q.tr ? 0.2 : 0) + 0.3 + Q_HOLD + Q_OUT + 0.6;
};

// ── Seans tamam CTA (the-track-session-complete) ────────────────────────────────────

export const SESSION_STATS = [["YORUM", "MÜLAKAT"], ["DM", "ÇALIŞMA PROJESİ"], ["PROJE", "RANDEVU SİSTEMİ"], ["ADIMLAR", "HARİTA · TEST · KÜÇÜK İŞ"]] as const;
export const SESSION_GRID_WORD = "MÜLAKAT";
/** The template's timeline (s), measured: black, strobe, photo, full grid, erase, headline, stats, tracking insert, poster. */
export function sessionTimeline(p: Params) {
  const strobe = p.strobe === "on" ? 0.3 : 0;
  const black = 0.35;
  const photo = black + strobe;
  const gridFull = photo + 0.2;
  const erase = gridFull + 0.15;
  const head = erase + n(p, "eraseDur");
  const stats = head + 0.3;
  const statsLen = SESSION_STATS.reduce((a, [k, v]) => a + 9 + v.length, 0);
  const statsEnd = stats + statsLen / n(p, "typeRate");
  const track = p.track === "on" ? statsEnd + 0.3 : Infinity;
  const back = track + 0.5;
  const end = (p.track === "on" ? back : statsEnd + 0.3) + 1.4;
  return { black, strobe, photo, gridFull, erase, head, stats, statsEnd, track, back, end };
}
/**
 * In the template's order: black hold → strobe (hard cuts black ↔ frame every 2 frames) → the duotone frame → the MÜLAKAT grid,
 * then erased by a reverse typewriter in ≈ 12 fps steps with a stagger across rows (as "58.42s" → "58." → gone) → "Yoruma",
 * "MÜLAKAT yaz." word by word (0.08 s) → the stats typewriter → a hard-cut insert of the grey tracking frame (0.5 s) → hard cut
 * back with "DM'den atayım." → cut to black. Motion trail: the take's own earlier frames, faint (the runner's blur).
 */
export function sessionFrame(p: Params, t: number) {
  const T = sessionTimeline(p);
  let phase: "black" | "strobe" | "photo" | "grid" | "poster" | "track" = "poster";
  if (t < T.black || t >= T.end) phase = "black";
  else if (t < T.photo) phase = Math.floor((t - T.black) * 15) % 2 === 0 ? "black" : "photo";
  else if (t < T.gridFull) phase = "photo";
  else if (t < T.head) phase = "grid";
  else if (t >= T.track && t < T.back) phase = "track";
  // the erase: time is quantised to 12 fps steps (stepped animation); each row starts later than the one above (stagger,
  // up to 40 % of the erase) and loses one letter every 60 % of the erase / 7, as "58.42s" → "58." → gone in the template
  const ed = n(p, "eraseDur");
  const tq = Math.floor(Math.max(0, t - T.erase) * 12) / 12;
  const perLetter = (0.6 * ed) / SESSION_GRID_WORD.length;
  const gridLen = (row: number) =>
    Math.max(0, SESSION_GRID_WORD.length - Math.floor(Math.max(0, tq - (row / 5) * 0.4 * ed) / perLetter));
  const typed = Math.max(0, Math.floor((t - T.stats) * n(p, "typeRate")));
  let left = typed;
  const stats = SESSION_STATS.map(([k, v]) => {
    const line = `${(k + ":").padEnd(9)}${v}`;
    const s = line.slice(0, Math.max(0, left));
    left -= line.length;
    return s;
  });
  return {
    phase,
    words: t >= T.head + 0.08 ? 2 : t >= T.head ? 1 : 0,           // "Yoruma", then "MÜLAKAT yaz."
    gridRows: [0, 1, 2, 3, 4, 5].map(gridLen),
    stats,
    sub: t >= T.back || (p.track !== "on" && t >= T.statsEnd + 0.3),
    sway: 18 * Math.sin(t * 2.4),
    trail: p.trail === "on",
  };
}
export const sessionLoop = (p: Params) => sessionTimeline(p).end + 0.2;

// ── Riso baskı (grainy-color-clamp) ─────────────────────────────────────────────────

export const RISO_LOOP = 3.7;
/**
 * As measured: the grain is static and tied to the image; the footage moves in low-frame-rate steps (`stepFps`, here the
 * presenter's sway moves in steps and the grain re-rolls only on a step); the type does not animate. With two inks, a hard cut
 * from shot A (black on paper, 1.6 s) to shot B (the burgundy close-up overprinted, 2.1 s), as the template cuts its two shots.
 */
export function risoFrame(p: Params, t: number) {
  const fps = n(p, "stepFps");
  const step = fps > 0 ? Math.floor(t * fps) : 0;
  return {
    seed: step % 97,
    sway: fps > 0 ? 8 * Math.sin((step / fps) * 2.2) : 0,
    shotB: p.inks === "two" && t >= 1.6,
    headline: String(p.headline),
  };
}
