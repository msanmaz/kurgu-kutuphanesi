// Templates from the @viashaan profile study (2026-11-12, Reels/analysis_reference_viashaan_profile_2026-11-12.md).
// Each frame function is pure: (params, t) → what the drawing needs. Timings are the measured ones (±0.1 s).
import { settle, soft, lerp, clamp01 } from "../springs.ts";
import type { Params } from "../registry.ts";

const n = (p: Params, k: string) => Number(p[k]);
/** 0 before `a`, 1 after `a + d`, linear between. */
const ramp = (t: number, a: number, d: number) => clamp01((t - a) / d);
/** Fade the loop out over its last 0.25 s so the restart reads as a cut, not a jump. */
const tail = (t: number, loop: number) => (t > loop - 0.25 ? clamp01((loop - t) / 0.25) : 1);

/** A word entering blurred and sharpening in 0.1 s (his entrance for every word). */
export function blurIn(t: number, at: number, dur = 0.1) {
  const k = ramp(t, at, dur);
  return { opacity: k, blur: (1 - k) * 18 };
}

// ── Yazı ────────────────────────────────────────────────────────────────────────────

export const BEHIND_LOOP = 4;
/** A small line, a ribbon drawing in, then the big word behind the head (soft spring 0.92 → 1). */
export function behindHeadFrame(p: Params, t: number) {
  const at = n(p, "enterAt");
  const small = blurIn(t, at);
  const big = blurIn(t, at + 0.75, 0.12);
  const fade = tail(t, BEHIND_LOOP);
  return {
    smallOpacity: small.opacity * fade, smallBlur: small.blur,
    ribbon: settle(t - at - 0.2, 0.5),
    bigOpacity: big.opacity * fade, bigBlur: big.blur,
    bigScale: lerp(0.92, 1, soft(t - at - 0.75, 0.4)),
  };
}

export const STREAM_WORDS = ["Bekle,", "bu", "sözcükler", "nasıl", "kafamın", "arkasına", "geçiyor?"];
const STREAM_LIFE = 1.5;
/** Words orbit the head on a flat ellipse: each enters front-right, blurred, travels left; the back half passes behind the head. */
export function wordStreamFrame(p: Params, t: number) {
  const per = n(p, "perWord"), speed = n(p, "orbit") * (Math.PI / 180), life = STREAM_LIFE;
  const loop = 0.2 + per * STREAM_WORDS.length + life;
  return STREAM_WORDS.map((word, i) => {
    const at = 0.2 + i * per, age = t - at;
    const phi = -0.35 + Math.max(0, age) * speed;          // 0 = front centre; π = behind the head
    const depth = Math.cos(phi);                              // 1 front, −1 back
    const b = blurIn(t, at);
    const out = 1 - ramp(age, life - 0.35, 0.35);
    return {
      word,
      x: 540 - 380 * Math.sin(phi), y: 700 - 230 * depth,      // tilted orbit: above the head area in front, behind the head at the back
      scale: lerp(0.62, 1, (depth + 1) / 2),
      behind: depth < 0,
      opacity: age < 0 ? 0 : b.opacity * out * tail(t, loop),
      blur: b.blur + (depth < 0 ? 3 : 0),
      italic: i === 0,
    };
  });
}
export const wordStreamLoop = (p: Params) => 0.2 + n(p, "perWord") * STREAM_WORDS.length + STREAM_LIFE;

export const TYPE_LOOKS = ["glow", "caps", "italic"] as const;
/** One word at a time, each set in the style it names; blur-in, hard cut to the next. */
export function typeActsFrame(p: Params, t: number) {
  const hold = n(p, "hold");
  const looks = p.look === "cycle" ? [...TYPE_LOOKS] : [String(p.look) as (typeof TYPE_LOOKS)[number]];
  const i = Math.min(looks.length - 1, Math.floor(t / hold));
  const b = blurIn(t, i * hold + 0.05);
  return { look: looks[i], opacity: b.opacity * tail(t, hold * looks.length), blur: b.blur, rise: (1 - b.opacity) * 24 };
}
export const typeActsLoop = (p: Params) => n(p, "hold") * (p.look === "cycle" ? TYPE_LOOKS.length : 1);

// ── Vurgu ───────────────────────────────────────────────────────────────────────────

export const HUD_LOOP = 3.6;
/** Corner brackets lock on the face (settle 1.25 → 1), a mono readout types, its numbers change `hz` times a second. */
export function faceHudFrame(p: Params, t: number) {
  const lock = n(p, "lockAt"), hz = n(p, "hz");
  const sway = 14 * Math.sin(t * 2.1);                      // the presenter moves; the box follows a frame behind
  const follow = 14 * Math.sin((t - 1 / 30) * 2.1);
  const tick = Math.floor(t * hz);
  const jitter = (k: number) => ((tick * 7919 + k * 104729) % 97) - 48;   // deterministic, so stills repeat
  const label = `YÜZ 0.${930 + (jitter(1) % 9)}`;
  const coords = `X ${String(746 + jitter(2)).padStart(4, "0")} Y ${String(774 + jitter(3)).padStart(4, "0")}`;
  const typed = Math.floor(Math.max(0, t - lock - 0.15) / 0.03);
  return {
    sway, boxX: follow,
    boxScale: lerp(1.25, 1, settle(t - lock, 0.3)),
    boxOpacity: ramp(t, lock, 0.08) * tail(t, HUD_LOOP),
    label: label.slice(0, typed), coords: typed > label.length ? coords.slice(0, typed - label.length) : "",
    tenX: blurIn(t, lock + 1.4, 0.12),
  };
}

export const PATH_WORDS = ["normalde", "kendini", "kare", "kare", "kesmen", "gerekir,", "tek", "bir", "sözcük", "için."];
/** The dashed outline traces the body, then each word is written along it. The last two words are the serif ones. */
export function outlinePathFrame(p: Params, t: number) {
  const per = n(p, "perWord");
  const shown = Math.max(0, Math.min(PATH_WORDS.length, Math.floor((t - 0.7) / per) + 1));
  const loop = 0.7 + per * PATH_WORDS.length + 1.2;
  return {
    outline: settle(t - 0.05, 0.6),
    ants: -t * n(p, "antsSpeed"),                           // dash offset: the marching ants
    words: shown, newest: blurIn(t, 0.7 + (shown - 1) * per),
    opacity: tail(t, loop),
  };
}
export const outlinePathLoop = (p: Params) => 0.7 + n(p, "perWord") * PATH_WORDS.length + 1.2;

/** The hand-drawn ellipse draws on (one stroke with an overshoot), holds, fades. */
export function handCircleFrame(p: Params, t: number) {
  const at = 0.6, draw = n(p, "drawDur"), hold = n(p, "hold");
  return {
    draw: clamp01(settle(t - at, draw * 1.6)),
    opacity: 1 - ramp(t, at + draw + hold, 0.2),
    bandOpacity: ramp(t, at + draw * 0.7, 0.1) * (1 - ramp(t, at + draw + hold, 0.2)),
  };
}
export const handCircleLoop = (p: Params) => 0.6 + n(p, "drawDur") + n(p, "hold") + 0.8;

// ── Yerleşim ────────────────────────────────────────────────────────────────────────

export const RAW_LOOP = 4.5;
export const RAW_WORDS = ["bekle,", "bu", "sözcükler", "kafamın", "arkasında"];
/** Both tiles play the same take in sync; the edited one carries one word at a time. `reveal` cuts it to raw for 0.4 s. */
export function rawEditedFrame(p: Params, t: number) {
  const i = Math.min(RAW_WORDS.length - 1, Math.floor(t / 0.75));
  return {
    sway: 10 * Math.sin(t * 1.7),
    word: RAW_WORDS[i], wordBlur: blurIn(t, i * 0.75).blur,
    revealed: p.reveal === "end" && t >= 3.2 && t < 3.6,
  };
}

/** Looking down at the phone with the effect clip in front; looks up into the lens; the app pushes up over him. */
export function clipHoldFrame(p: Params, t: number) {
  const up = n(p, "lookUpAt");
  const look = soft(t - up, 0.3);
  const push = settle(t - up - 0.8, 0.35);
  return {
    headTilt: lerp(9, 0, look), headDrop: lerp(26, 0, look), eyes: look,
    clipPhase: (t % 1.6) / 1.6,                               // the effect clip loops inside its frame
    sheetY: lerp(1920, 0, push),
    hookOpacity: 1 - push,
  };
}
export const clipHoldLoop = (p: Params) => n(p, "lookUpAt") + 0.8 + 0.35 + 0.9;

// ── Ekran ───────────────────────────────────────────────────────────────────────────

export const CMD = "/harita-rota";
/** Typed command → sent → loader → halftone dissolve into the result card → card grows to full bleed → hold → cut. */
export function cmdExpandFrame(p: Params, t: number) {
  const typedEnd = CMD.length * 0.045;
  const sent = typedEnd + 0.15;
  const cardAt = sent + 0.45, expandAt = cardAt + 0.7, expand = n(p, "expandDur");
  const k = settle(t - expandAt, expand * 2.2);
  return {
    typed: CMD.slice(0, Math.floor(t / 0.045)),
    sent: t >= sent,
    loader: t >= sent + 0.1 && t < expandAt,
    dither: 1 - ramp(t, cardAt, 0.35),                        // dot field over the card, dissolving
    route: ramp(t, cardAt + 0.1, expandAt + 0.6 + n(p, "hold") - cardAt),
    cardOpacity: ramp(t, cardAt - 0.05, 0.05),
    card: { x: lerp(300, 0, k), y: lerp(430, 0, k), w: lerp(480, 1080, k), h: lerp(853, 1920, k), rx: lerp(22, 0, k) },
  };
}
export const cmdExpandLoop = (p: Params) => CMD.length * 0.045 + 0.15 + 0.45 + 0.7 + n(p, "expandDur") + n(p, "hold");

// ── Geçiş ───────────────────────────────────────────────────────────────────────────

/** A thin line sweeps across; behind it the graded picture; the chip switches when the line has crossed. */
export function wipeCompareFrame(p: Params, t: number) {
  const at = 0.8, dur = n(p, "wipeDur");
  const k = ramp(t, at, dur);
  const x = lerp(-6, 1086, k * k * (3 - 2 * k));             // smoothstep: eases in and out like his
  const done = t >= at + dur - 1e-9;                         // by time, so float rounding can't hold the chip back
  return { lineX: x, lineOpacity: t > at - 0.05 && !done ? 1 : 0, after: done };
}
export const wipeCompareLoop = (p: Params) => 0.8 + n(p, "wipeDur") + 1.4;

// ── Ekleme ──────────────────────────────────────────────────────────────────────────

export const CTA_KEYWORD = "REPO";
export const CTA_LOOP = 3.2;
/** The prompt lands, the screen dims, the two lines rise, the brackets draw. `metal` drops the letters one by one. */
export function keywordCtaFrame(p: Params, t: number) {
  const at = 0.6;
  const metal = p.style === "metal";
  return {
    chip: settle(t - 0.2, 0.3),
    dim: metal ? 0 : 0.7 * ramp(t, at, 0.2) * (1 - ramp(t, 2.6, 0.2)),
    line1: soft(t - at, 0.35), line2: soft(t - at - 0.1, 0.35),
    brackets: settle(t - at - 0.25, 0.3),
    letters: [...CTA_KEYWORD].map((_, i) => settle(t - at - 0.3 - i * 0.1, 0.25)),
    shine: ramp(t, at + 0.3 + CTA_KEYWORD.length * 0.1, 0.5),
    curve: Math.floor(Math.max(0, t - at + 0.3) / 0.08),    // letters of "yorum yaz" typed on the arc
    subOpacity: ramp(t, at + 0.9, 0.1),
    opacity: tail(t, CTA_LOOP),
  };
}

export const STEPS = ["Ayarlar → Bağlayıcılar", "+ → Özel bağlayıcı ekle", "Adresi yapıştır", "Bağlan → İzin ver. Tamam ✓"];
/** Title + pill + one numbered step at a time over a phone mock; on the last step the title becomes the CTA. */
export function setupStepsFrame(p: Params, t: number) {
  const dur = n(p, "stepDur"), count = Math.round(n(p, "steps"));
  const step = Math.min(count - 1, Math.floor(t / dur));
  return {
    step, count, stepIn: soft(t - step * dur, 0.3),
    cta: t >= (count - 1) * dur + dur * 0.55,
    opacity: tail(t, dur * count + 0.6),
  };
}
export const setupStepsLoop = (p: Params) => n(p, "stepDur") * Math.round(n(p, "steps")) + 0.6;
