import { test } from "node:test";
import assert from "node:assert/strict";
import { settle, soft, clamp01 } from "../lib/motion/springs.ts";

test("springs match transition_kit.py frame by frame (card top 1020)", () => {
  const softPx = [0, 63, 203, 369, 530, 671, 786, 873, 937, 980, 1008, 1024, 1032, 1035, 1035, 1033];
  const settlePx = [0, 75, 227, 391, 539, 662, 758, 831, 886, 925, 954, 974, 988, 998, 1005, 1010];
  softPx.forEach((px, k) => assert.equal(Math.round(1020 * soft(k / 30)), px));
  settlePx.forEach((px, k) => assert.equal(Math.round(1020 * settle(k / 30, 0.5)), px));
});

test("springs are 0 before start and clamp01 clamps", () => {
  assert.equal(settle(-0.1), 0);
  assert.equal(soft(0), 0);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(clamp01(0.3), 0.3);
});
