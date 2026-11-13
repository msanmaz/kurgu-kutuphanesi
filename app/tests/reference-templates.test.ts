import { test } from "node:test";
import assert from "node:assert/strict";
import { withDefaults, TEMPLATES } from "../lib/motion/registry.ts";
import {
  blurIn, behindHeadFrame, wordStreamFrame, typeActsFrame, faceHudFrame, outlinePathFrame, PATH_WORDS, handCircleFrame,
  rawEditedFrame, clipHoldFrame, cmdExpandFrame, CMD, wipeCompareFrame, keywordCtaFrame, setupStepsFrame,
} from "../lib/motion/templates/reference.ts";

const near = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("a word enters blurred and is sharp 0.1 s later", () => {
  assert.deepEqual(blurIn(0.5, 0.5), { opacity: 0, blur: 18 });
  assert.deepEqual(blurIn(0.61, 0.5), { opacity: 1, blur: 0 });
});

test("behind-head: the big word waits 0.75 s after the small line, then settles to full size", () => {
  const p = withDefaults("behindHead", {});
  assert.equal(behindHeadFrame(p, 0.3 + 0.7).bigOpacity, 0);
  const f = behindHeadFrame(p, 2.5);
  assert.equal(f.bigOpacity, 1);
  near(f.bigScale, 1, 0.01);
  near(f.ribbon, 1, 0.01);
});

test("word stream: a word starts in front and is behind the head half a turn later", () => {
  const p = withDefaults("wordStream", {});
  const first = (t: number) => wordStreamFrame(p, t)[0];
  assert.equal(first(0.25).behind, false);
  assert.equal(first(0.2 + (Math.PI / 2 + 0.35 + 0.2) / (150 * Math.PI / 180)).behind, true);
  assert.equal(wordStreamFrame(p, 0.1).every((w) => w.opacity === 0), true);
});

test("type acts: cycles glow, caps, italic every 1.2 s; a single look holds", () => {
  const p = withDefaults("typeActs", {});
  assert.deepEqual([0.6, 1.8, 3.0].map((t) => typeActsFrame(p, t).look), ["glow", "caps", "italic"]);
  assert.equal(typeActsFrame(withDefaults("typeActs", { look: "caps" }), 0.9).look, "caps");
  assert.equal(TEMPLATES.typeActs.duration(withDefaults("typeActs", { look: "caps" }), 0), 1.2);
});

test("face HUD: the readout changes hz times a second and types after the lock", () => {
  const p = withDefaults("faceHud", { hz: 10 });
  assert.equal(faceHudFrame(p, 0.3).label, "");
  const a = faceHudFrame(p, 2.0).coords, b = faceHudFrame(p, 2.05).coords, c = faceHudFrame(p, 2.1).coords;
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(faceHudFrame(p, 2.0).label, /^YÜZ 0\.9\d\d$/);
});

test("outline path: words are written one per perWord after the outline", () => {
  const p = withDefaults("outlinePath", {});
  assert.equal(outlinePathFrame(p, 0.6).words, 0);
  assert.equal(outlinePathFrame(p, 0.7).words, 1);
  assert.equal(outlinePathFrame(p, 0.7 + 0.25 * 3 + 0.01).words, 4);
  assert.equal(outlinePathFrame(p, 4).words, PATH_WORDS.length);
});

test("hand circle: drawn by 0.6 + 1.6 × drawDur, gone after the hold", () => {
  const p = withDefaults("handCircle", {});
  assert.equal(handCircleFrame(p, 0.5).draw, 0);
  near(handCircleFrame(p, 0.6 + 0.4).draw, 1, 0.01);
  assert.equal(handCircleFrame(p, 0.6 + 0.25 + 1.0 + 0.25).opacity, 0);
});

test("raw | edited: the reveal cuts to raw only between 3.2 and 3.6 s", () => {
  const p = withDefaults("rawEdited", { reveal: "end" });
  assert.deepEqual([3.1, 3.3, 3.7].map((t) => rawEditedFrame(p, t).revealed), [false, true, false]);
  assert.equal(rawEditedFrame(withDefaults("rawEdited", {}), 3.3).revealed, false);
});

test("clip hold: head down before lookUpAt, up and the app pushed in after", () => {
  const p = withDefaults("clipHold", {});
  assert.equal(clipHoldFrame(p, 2.5).headTilt, 9);
  const f = clipHoldFrame(p, 2.6 + 0.8 + 0.6);
  near(f.headTilt, 0, 0.2);
  near(f.sheetY, 0, 2);
});

test("command → result: typed per 0.045 s, card grows to full bleed after the in-chat hold", () => {
  const p = withDefaults("cmdExpand", {});
  assert.equal(cmdExpandFrame(p, 0.2).typed, CMD.slice(0, 4));
  const expandAt = CMD.length * 0.045 + 0.15 + 0.45 + 0.7;
  assert.equal(cmdExpandFrame(p, expandAt - 0.01).card.w, 480);
  near(cmdExpandFrame(p, expandAt + 0.5).card.w, 1080, 1);
});

test("wipe: the line crosses in wipeDur and the chip flips at the end", () => {
  const p = withDefaults("wipeCompare", {});
  assert.equal(wipeCompareFrame(p, 0.79).after, false);
  near(wipeCompareFrame(p, 1.0).lineX, 540, 1);
  assert.equal(wipeCompareFrame(p, 1.2).after, true);
});

test("keyword CTA: the screen dims to 0.7 by 0.8 s; metal letters drop 0.1 s apart", () => {
  near(keywordCtaFrame(withDefaults("keywordCta", {}), 0.8).dim, 0.7, 0.001);
  const m = keywordCtaFrame(withDefaults("keywordCta", { style: "metal" }), 1.05);
  assert.equal(m.dim, 0);
  assert.ok(m.letters[0] > m.letters[1] && m.letters[1] > m.letters[2], m.letters.join(","));
});

test("setup steps: one step per stepDur; the title turns into the CTA during the last step", () => {
  const p = withDefaults("setupSteps", {});
  assert.deepEqual([0.5, 1.6, 2.7, 3.4].map((t) => setupStepsFrame(p, t).step), [0, 1, 2, 3]);
  assert.equal(setupStepsFrame(p, 3.4).cta, false);
  assert.equal(setupStepsFrame(p, 3.3 + 1.1 * 0.56).cta, true);
});
