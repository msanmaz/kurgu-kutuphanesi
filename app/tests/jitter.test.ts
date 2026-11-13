// Motion of the Jitter-template cards, against the measured previews (docs/2026-11-13-jitter-motion-measurements.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  halftoneFrame, wheelFrame, quoteFrame, sessionFrame, sessionTimeline, risoFrame, easeInOutAsym,
  HALFTONE_LOOP, RISO_LOOP, wheelLoop, quoteLoop, sessionLoop,
} from "../lib/motion/templates/jitter.ts";
import { DIGITS } from "../lib/motion/templates/halftoneDigits.ts";
import { TEMPLATES, withDefaults } from "../lib/motion/registry.ts";

const near = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("jitter templates are registered with their loop lengths", () => {
  assert.equal(TEMPLATES.halftoneStep.duration({}, 0), HALFTONE_LOOP);
  assert.equal(TEMPLATES.risoPrint.duration({}, 0), RISO_LOOP);
  near(RISO_LOOP, 3.7, 1e-9);                                       // measured loop
  const w = withDefaults("blurWheel", {});
  near(wheelLoop(w), 3.95, 1e-9);                                    // 0.5 + 0.75 × 3 + 1.2
  const q = withDefaults("quoteCard", {});
  near(quoteLoop(q), 4.15, 1e-9);
  const s = withDefaults("sessionCta", {});
  near(TEMPLATES.sessionCta.duration(s, 0), sessionLoop(s), 1e-9);
});

test("halftone digits: every glyph has dots inside the digit box", () => {
  for (const key of ["p1", "p2", "p3", "a1", "i2"]) {
    assert.ok(DIGITS[key].length > 150, `${key} has ${DIGITS[key].length} dots`);
    for (const [, y] of DIGITS[key]) assert.ok(y >= 120 && y <= 840);
  }
});

test("halftone: a stepped hard cut by default — full dots on the frame of the step word, nothing before", () => {
  const p = withDefaults("halftoneStep", {});
  assert.equal(Number(p.grow), 0);
  assert.equal(halftoneFrame(p, 0.29).dot(500), 0);
  assert.equal(halftoneFrame(p, 0.3).dot(130), 1);
  assert.equal(halftoneFrame(p, 0.3).dot(830), 1);
  assert.equal(halftoneFrame(p, 1.8).glyph, "p2");
  const grown = halftoneFrame(withDefaults("halftoneStep", { grow: 0.35 }), 0.42);
  assert.ok(grown.dot(130) > grown.dot(830), "with grow, the top rows lead");
});

test("halftone: the ticker before step 3 runs 1 → 2 in other faces, 0.15 s each, only with roll on", () => {
  const on = withDefaults("halftoneStep", {});
  assert.deepEqual([3.1, 3.25, 3.4, 3.55].map((t) => halftoneFrame(on, t).glyph), ["a1", "i2", "p2", "p3"]);
  const off = withDefaults("halftoneStep", { roll: "off" });
  assert.deepEqual([3.1, 3.25, 3.55].map((t) => halftoneFrame(off, t).glyph), ["p2", "p2", "p3"]);
});

test("wheel: one move every 0.75 s on an asymmetric ease-in-out, done in 0.2 s", () => {
  const p = withDefaults("blurWheel", {});
  near(easeInOutAsym(0.5), 0.79, 0.01);
  near(wheelFrame(p, 0.5 + 0.1).pos, 0.79, 0.01);
  near(wheelFrame(p, 0.71).pos, 1, 1e-9);
  near(wheelFrame(p, 1.24).pos, 1, 1e-9);                            // holds until the next move at 1.25
  near(wheelFrame(p, 1.25 + 0.2).pos, 2, 1e-9);
});

test("wheel: blur, scale and colour follow through after the move lands (the crossfade to white)", () => {
  const p = withDefaults("blurWheel", {});
  const landed = wheelFrame(p, 0.71).rows.find((r) => r.word === "Harita")!;
  assert.ok(landed.white > 0.5 && landed.white < 0.8, `still crossfading: ${landed.white}`);
  assert.ok(landed.blur > 0.2, "still a little soft");
  const settled = wheelFrame(p, 1.2).rows.find((r) => r.word === "Harita")!;
  near(settled.white, 1, 0.01);
  near(settled.blur, 0, 0.02);
  const dd = wheelFrame(withDefaults("blurWheel", { list: "doordash" }), 1.2 + 0.75);
  assert.deepEqual(dd.rows.filter((r) => r.tick).map((r) => r.word), ["Yön bulmak", "AI'ın çıktısını kontrol etmek"]);
});

test("quote: slide in (ease-out), words hard in a 0.07 s stagger, the card grows, the name types, slide out (ease-in)", () => {
  const p = withDefaults("quoteCard", {});
  assert.equal(quoteFrame(p, 0.4).cardOpacity, 0);
  const mid = quoteFrame(p, 0.7);
  assert.ok(mid.cardOffset > 0 && mid.cardOffset < 200, `ease-out: mostly there at half time (${mid.cardOffset})`);
  near(quoteFrame(p, 0.9).cardOffset, 0, 1e-9);
  assert.equal(quoteFrame(p, 0.9).shown, 2);
  assert.equal(quoteFrame(p, 1.2).shown, 4);
  assert.equal(quoteFrame(p, 1.3).grow, 0);
  near(quoteFrame(p, 1.65).grow, 1, 1e-9);
  assert.deepEqual(quoteFrame(p, 1.66).who, ["MERT", "@"]);            // 40 characters a second from 1.5 s
  const out = quoteFrame(p, 3.15 + 0.2);
  assert.ok(out.cardOffset > 0 && out.cardOffset < 500, `ease-in: slow at first (${out.cardOffset})`);
  assert.ok(quoteFrame(p, 3.6).cardOffset >= 1000, "gone by the end of the exit");
  assert.equal(quoteFrame(withDefaults("quoteCard", { look: "top" }), 1.0).pull, 1);
  assert.equal(quoteFrame(withDefaults("quoteCard", { look: "card", quote: "doordash" }), 0.1).words.length, 14);
});

test("session: the template's order — black, strobe, grid erased in steps with a stagger, headline, stats, tracking insert", () => {
  const p = withDefaults("sessionCta", {});
  const T = sessionTimeline(p);
  near(T.head, 1.6, 1e-9);
  near(T.statsEnd, 1.9 + 97 / 60, 1e-9);
  assert.equal(sessionFrame(p, 0.2).phase, "black");
  assert.deepEqual([0.36, 0.42, 0.5].map((t) => sessionFrame(p, t).phase), ["black", "photo", "black"]);   // strobe
  assert.equal(sessionFrame(p, 0.7).phase, "photo");
  assert.deepEqual(sessionFrame(p, 0.9).gridRows, [7, 7, 7, 7, 7, 7]);
  const e = sessionFrame(p, 1.25).gridRows;
  assert.equal(e[0], 3);
  assert.equal(e[5], 7);                                            // the bottom row has not started yet (stagger)
  assert.equal(sessionFrame(p, 1.62).words, 1);
  assert.equal(sessionFrame(p, 1.7).words, 2);
  const s = sessionFrame(p, 2.4).stats;
  assert.equal(s[0], "YORUM:   MÜLAKAT");
  assert.equal(s[1], "DM:      ÇALIŞ");                             // 30 − 16
  assert.equal(sessionFrame(p, 4.0).phase, "track");
  const back = sessionFrame(p, 4.4);
  assert.equal(back.phase, "poster");
  assert.equal(back.sub, true);
  assert.equal(sessionFrame(p, 5.8).phase, "black");
  assert.equal(sessionFrame(withDefaults("sessionCta", { strobe: "off" }), 0.42).phase, "photo");
});

test("riso: static grain that changes only on the footage's steps; two inks are a hard cut at 1.6 s", () => {
  const p = withDefaults("risoPrint", {});
  assert.equal(risoFrame(p, 0.1).seed, 0);
  assert.equal(risoFrame(p, 0.13).seed, 1);
  assert.equal(risoFrame(withDefaults("risoPrint", { stepFps: 0 }), 2).seed, 0);
  assert.equal(risoFrame(withDefaults("risoPrint", { inks: "two" }), 1.59).shotB, false);
  assert.equal(risoFrame(withDefaults("risoPrint", { inks: "two" }), 1.6).shotB, true);
  assert.equal(risoFrame(p, 2).shotB, false);
});
