import { test } from "node:test";
import assert from "node:assert/strict";
import { cardZoomFrame, panelDelayFrames } from "../lib/motion/templates/cardZoom.ts";
import { fullZoomFrame } from "../lib/motion/templates/fullZoom.ts";
import { captionFrame, captionStyle } from "../lib/motion/templates/caption.ts";
import { TEMPLATES, withDefaults } from "../lib/motion/registry.ts";
import type { TemplateId } from "../lib/motion/registry.ts";

const near = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("T4 PANEL waits until the card edge clears the box, as in transition_kit.py", () => {
  assert.equal(panelDelayFrames({ cardTop: 1020, dur: 0.5 }), 6);
  assert.equal(panelDelayFrames({ cardTop: 1140, dur: 0.5 }), 5);
});

test("T4 before the cut: zoomed face, full-bleed card, no PANEL", () => {
  const p = withDefaults("cardZoom", {});
  const f = cardZoomFrame(p, Number(p.cut) - 0.01);
  assert.equal(f.camScale, p.fromScale);
  assert.equal(f.card.y, 0);
  assert.equal(f.panelOpacity, 0);
});

test("T4 settles into the pop-out card", () => {
  const p = withDefaults("cardZoom", {});
  const f = cardZoomFrame(p, Number(p.cut) + 3);
  near(f.card.y, Number(p.cardTop), 1);
  near(f.card.x, 40, 0.5);
  near(f.camScale, 1, 0.001);
});

test("T4 PANEL is hidden one frame before its delay and fully in four frames after", () => {
  const p = withDefaults("cardZoom", {});
  const d = panelDelayFrames(p);
  const cut = Number(p.cut);
  assert.equal(cardZoomFrame(p, cut + (d - 1) / 30).panelOpacity, 0);
  assert.equal(cardZoomFrame(p, cut + (d + 4) / 30).panelOpacity, 1);
});

test("full-then-zoom holds the whole window, then lands the zoom and the band", () => {
  const p = withDefaults("fullZoom", {});
  const hold = Number(p.hold), zoomDur = Number(p.zoomDur);
  assert.equal(fullZoomFrame(p, hold / 2).winScale, 1);
  const landed = fullZoomFrame(p, hold + zoomDur + 0.3);
  near(landed.winScale, Number(p.scale), 0.02);
  assert.equal(landed.bandOpacity, 1);
});

test("caption chunks advance every chunkDur", () => {
  assert.equal(captionFrame({ chunkDur: 1.1 }, 2.3, 3).captionIndex, 2);
});

test("the caption pill defaults to Poppins Bold 60 px, bottom edge 330 px above the frame's bottom", () => {
  const s = captionStyle({});
  assert.ok(s.fontFamily.startsWith("Poppins,"), s.fontFamily);
  assert.equal(s.fontWeight, 700);
  assert.equal(s.size, 60);
  assert.equal(s.height, 60 + 13 + 13);
  assert.equal(s.top + s.height, 1920 - 330);
});

test("a Helvetica caption uses the system font first and keeps the same bottom edge", () => {
  const s = captionStyle({ captionFont: "helvetica", captionSize: 58 });
  assert.ok(s.fontFamily.startsWith('"Helvetica Neue"'), s.fontFamily);
  assert.equal(s.top, 1590 - (58 + 26));
});

test("every template default lies inside its declared range", () => {
  for (const id of Object.keys(TEMPLATES) as TemplateId[]) {
    for (const spec of TEMPLATES[id].params) {
      if (spec.kind === "number") assert.ok(spec.default >= spec.min && spec.default <= spec.max, `${id}.${spec.key}`);
      else assert.ok(spec.options.includes(spec.default), `${id}.${spec.key}`);
    }
  }
});
