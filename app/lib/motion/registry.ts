// Drawing templates: their parameters (with defaults and ranges) and loop length.
// A variation is a template plus parameter overrides, so most new variations are data.

import {
  BEHIND_LOOP, HUD_LOOP, RAW_LOOP, CTA_LOOP, wordStreamLoop, typeActsLoop, outlinePathLoop, handCircleLoop, clipHoldLoop,
  cmdExpandLoop, wipeCompareLoop, setupStepsLoop,
} from "./templates/reference.ts";
import { KEYPAD_LOOP, LOCK_LOOP } from "./templates/steps.ts";
import { HALFTONE_LOOP, RISO_LOOP, wheelLoop, quoteLoop, sessionLoop } from "./templates/jitter.ts";

export type Params = Record<string, number | string>;
export type ParamSpec =
  | { key: string; kind: "number"; default: number; min: number; max: number }
  | { key: string; kind: "enum"; default: string; options: string[] };
export type TemplateId =
  | "panel" | "popout" | "cardZoom" | "fullZoom" | "caption"
  // From the @viashaan profile study, 2026-11-12 (templates/reference.ts)
  | "behindHead" | "wordStream" | "typeActs" | "faceHud" | "outlinePath" | "handCircle"
  | "rawEdited" | "clipHold" | "cmdExpand" | "wipeCompare" | "keywordCta" | "setupSteps"
  // Step numbers in everyday Apple-UI forms, 2026-11-12 (templates/steps.ts)
  | "stepKeypad" | "stepLock"
  // Five edits from Jitter templates, tested on the ai-mulakat take, 2026-11-13 (templates/jitter.ts)
  | "halftoneStep" | "blurWheel" | "quoteCard" | "sessionCta" | "risoPrint";
export interface TemplateDef {
  id: TemplateId;
  params: ParamSpec[];
  duration(p: Params, captionChunks: number): number;
}

const num = (p: Params, k: string) => Number(p[k]);
const captionMode: ParamSpec = { key: "captionMode", kind: "enum", default: "bottom", options: ["bottom", "band"] };

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  panel: {
    id: "panel",
    params: [
      { key: "springDur", kind: "number", default: 0.45, min: 0.2, max: 1.2 },
      { key: "enterAt", kind: "number", default: 0.35, min: 0, max: 2 },
    ],
    duration: () => 4,
  },
  popout: {
    id: "popout",
    params: [{ key: "cardTop", kind: "number", default: 1140, min: 900, max: 1300 }, captionMode],
    duration: () => 4,
  },
  cardZoom: {
    id: "cardZoom",
    params: [
      { key: "cut", kind: "number", default: 1.0, min: 0.3, max: 2 },
      { key: "dur", kind: "number", default: 0.5, min: 0.2, max: 1.2 },
      { key: "fromScale", kind: "number", default: 1.2, min: 1.0, max: 1.4 },
      { key: "cardTop", kind: "number", default: 1140, min: 900, max: 1300 },
    ],
    duration: (p) => num(p, "cut") + 3.6,
  },
  fullZoom: {
    id: "fullZoom",
    params: [
      { key: "hold", kind: "number", default: 0.45, min: 0.2, max: 1.5 },
      { key: "zoomDur", kind: "number", default: 0.6, min: 0.3, max: 1.5 },
      { key: "scale", kind: "number", default: 2.3, min: 1.5, max: 3.2 },
      { key: "stops", kind: "number", default: 1, min: 1, max: 3 },
    ],
    duration: (p) => num(p, "hold") + 1.4 * num(p, "stops") + 1.5,
  },
  caption: {
    id: "caption",
    params: [
      { key: "chunkDur", kind: "number", default: 1.1, min: 0.5, max: 2 },
      captionMode,
      // Channel fonts (creator, 2026-10-25): Poppins or Helvetica. Size and weight are Claude's proposal until picked.
      { key: "captionFont", kind: "enum", default: "poppins", options: ["poppins", "helvetica"] },
      { key: "captionWeight", kind: "number", default: 700, min: 400, max: 800 },
      { key: "captionSize", kind: "number", default: 60, min: 40, max: 90 },
    ],
    duration: (p, chunks) => Math.max(1, chunks) * num(p, "chunkDur"),
  },
  behindHead: {
    id: "behindHead",
    params: [
      { key: "enterAt", kind: "number", default: 0.3, min: 0, max: 1.5 },
      { key: "wordFont", kind: "enum", default: "serif", options: ["serif", "anton"] },
      { key: "fill", kind: "enum", default: "solid", options: ["solid", "frame"] },
    ],
    duration: () => BEHIND_LOOP,
  },
  wordStream: {
    id: "wordStream",
    params: [
      { key: "perWord", kind: "number", default: 0.28, min: 0.15, max: 0.6 },
      { key: "orbit", kind: "number", default: 150, min: 40, max: 240 },
    ],
    duration: wordStreamLoop,
  },
  typeActs: {
    id: "typeActs",
    params: [
      { key: "look", kind: "enum", default: "cycle", options: ["cycle", "glow", "caps", "italic"] },
      { key: "hold", kind: "number", default: 1.2, min: 0.6, max: 2.5 },
    ],
    duration: typeActsLoop,
  },
  faceHud: {
    id: "faceHud",
    params: [
      { key: "lockAt", kind: "number", default: 0.3, min: 0, max: 1.5 },
      { key: "hz", kind: "number", default: 10, min: 2, max: 30 },
    ],
    duration: () => HUD_LOOP,
  },
  outlinePath: {
    id: "outlinePath",
    params: [
      { key: "perWord", kind: "number", default: 0.25, min: 0.12, max: 0.6 },
      { key: "antsSpeed", kind: "number", default: 60, min: 0, max: 200 },
    ],
    duration: outlinePathLoop,
  },
  handCircle: {
    id: "handCircle",
    params: [
      { key: "drawDur", kind: "number", default: 0.25, min: 0.1, max: 0.8 },
      { key: "hold", kind: "number", default: 1.0, min: 0.3, max: 2.5 },
    ],
    duration: handCircleLoop,
  },
  rawEdited: {
    id: "rawEdited",
    params: [{ key: "reveal", kind: "enum", default: "none", options: ["none", "end"] }],
    duration: () => RAW_LOOP,
  },
  clipHold: {
    id: "clipHold",
    params: [
      { key: "lookUpAt", kind: "number", default: 2.6, min: 1, max: 7 },
      { key: "clip", kind: "enum", default: "wide", options: ["wide", "tall"] },
    ],
    duration: clipHoldLoop,
  },
  cmdExpand: {
    id: "cmdExpand",
    params: [
      { key: "expandDur", kind: "number", default: 0.15, min: 0.1, max: 0.6 },
      { key: "hold", kind: "number", default: 0.8, min: 0.3, max: 2 },
    ],
    duration: cmdExpandLoop,
  },
  wipeCompare: {
    id: "wipeCompare",
    params: [{ key: "wipeDur", kind: "number", default: 0.4, min: 0.2, max: 1.5 }],
    duration: wipeCompareLoop,
  },
  keywordCta: {
    id: "keywordCta",
    params: [{ key: "style", kind: "enum", default: "bracket", options: ["bracket", "metal"] }],
    duration: () => CTA_LOOP,
  },
  setupSteps: {
    id: "setupSteps",
    params: [
      { key: "stepDur", kind: "number", default: 1.1, min: 0.6, max: 2.5 },
      { key: "steps", kind: "number", default: 4, min: 2, max: 4 },
    ],
    duration: setupStepsLoop,
  },
  stepKeypad: {
    id: "stepKeypad",
    params: [
      { key: "stagger", kind: "number", default: 0.08, min: 0, max: 0.3 },
      { key: "pressDur", kind: "number", default: 0.28, min: 0.12, max: 0.6 },
      { key: "step1", kind: "number", default: 0.9, min: 0.5, max: 1.5 },
      { key: "step2", kind: "number", default: 1.9, min: 1.2, max: 2.6 },
      { key: "step3", kind: "number", default: 2.9, min: 2.2, max: 3.6 },
      { key: "placement", kind: "enum", default: "panel", options: ["panel", "face"] },
    ],
    duration: () => KEYPAD_LOOP,
  },
  stepLock: {
    id: "stepLock",
    params: [
      { key: "rise", kind: "number", default: 0.5, min: 0.25, max: 1 },
      { key: "rollDur", kind: "number", default: 0.32, min: 0.15, max: 0.7 },
      { key: "at1", kind: "number", default: 0.25, min: 0.1, max: 1 },
      { key: "at2", kind: "number", default: 1.75, min: 1.2, max: 2.6 },
      { key: "at3", kind: "number", default: 3.15, min: 2.6, max: 4 },
      { key: "fill", kind: "enum", default: "frame", options: ["frame", "solid"] },
    ],
    duration: () => LOCK_LOOP,
  },
  halftoneStep: {
    id: "halftoneStep",
    params: [
      { key: "at1", kind: "number", default: 0.3, min: 0.1, max: 1 },
      { key: "at2", kind: "number", default: 1.8, min: 1.2, max: 2.6 },
      { key: "at3", kind: "number", default: 3.5, min: 2.8, max: 4.2 },
      { key: "grow", kind: "number", default: 0, min: 0, max: 0.8 },            // 0 = Jitter's hard cut (measured)
      { key: "look", kind: "enum", default: "poster", options: ["poster", "wall"] },
      { key: "roll", kind: "enum", default: "on", options: ["on", "off"] },
    ],
    duration: () => HALFTONE_LOOP,
  },
  blurWheel: {
    id: "blurWheel",
    params: [
      { key: "per", kind: "number", default: 0.75, min: 0.3, max: 1.6 },       // Jitter: one move every 0.75 s
      { key: "move", kind: "number", default: 0.2, min: 0.1, max: 0.5 },       // Jitter: ≈ 0.2 s asymmetric ease-in-out
      { key: "list", kind: "enum", default: "adimlar", options: ["adimlar", "doordash"] },
      { key: "look", kind: "enum", default: "poster", options: ["poster", "card"] },
    ],
    duration: (p) => wheelLoop(p),
  },
  quoteCard: {
    id: "quoteCard",
    params: [
      { key: "perWord", kind: "number", default: 0.07, min: 0.03, max: 0.3 },  // Jitter: ≈ 0.07 s word stagger
      { key: "look", kind: "enum", default: "duotone", options: ["duotone", "top", "card"] },
      { key: "quote", kind: "enum", default: "mert", options: ["mert", "doordash"] },
    ],
    duration: (p) => quoteLoop(p),
  },
  sessionCta: {
    id: "sessionCta",
    params: [
      { key: "eraseDur", kind: "number", default: 0.6, min: 0.3, max: 1.2 },   // Jitter: the grid erases in 0.6 s
      { key: "typeRate", kind: "number", default: 60, min: 20, max: 120 },
      { key: "strobe", kind: "enum", default: "on", options: ["on", "off"] },
      { key: "track", kind: "enum", default: "on", options: ["on", "off"] },
      { key: "trail", kind: "enum", default: "on", options: ["on", "off"] },
    ],
    duration: (p) => sessionLoop(p),
  },
  risoPrint: {
    id: "risoPrint",
    params: [
      { key: "stepFps", kind: "number", default: 8, min: 0, max: 24 },         // footage steps; grain changes only on a step
      { key: "inks", kind: "enum", default: "one", options: ["one", "two"] },
      { key: "headline", kind: "enum", default: "soru", options: ["soru", "kapak"] },
    ],
    duration: () => RISO_LOOP,
  },
};

/** The template's defaults, overridden by `p`. */
export function withDefaults(id: TemplateId, p: Params): Params {
  const out: Params = {};
  for (const spec of TEMPLATES[id].params) out[spec.key] = spec.default;
  return { ...out, ...p };
}
