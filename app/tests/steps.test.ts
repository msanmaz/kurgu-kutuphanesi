import { test } from "node:test";
import assert from "node:assert/strict";
import { keypadFrame, lockFrame, KEYPAD_LOOP, LOCK_LOOP } from "../lib/motion/templates/steps.ts";
import { TEMPLATES, withDefaults } from "../lib/motion/registry.ts";

const near = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("step templates are registered with their loop lengths", () => {
  assert.equal(TEMPLATES.stepKeypad.duration({}, 0), KEYPAD_LOOP);
  assert.equal(TEMPLATES.stepLock.duration({}, 0), LOCK_LOOP);
});

test("keypad: keys arrive staggered, nothing pressed before step 1", () => {
  const p = withDefaults("stepKeypad", {});
  const f = keypadFrame(p, 0.05);
  assert.ok(f.keys[0].opacity > f.keys[2].opacity, "first key ahead of the third");
  assert.deepEqual(f.keys.map((k) => k.fill), [0, 0, 0]);
});

test("keypad: on step 2 the second key dips, fills cream and draws its ring; key 1 shows its tick", () => {
  const p = withDefaults("stepKeypad", {});
  const at = Number(p.step2);
  const dip = keypadFrame(p, at + Number(p.pressDur) / 2);
  near(dip.keys[1].scale, 0.92, 0.005);
  const after = keypadFrame(p, at + 0.25);
  assert.equal(after.keys[1].fill, 1);
  assert.equal(after.keys[1].ring, 1);
  assert.equal(after.keys[0].fill, 0);
  assert.equal(after.keys[0].tick, 1);
  near(keypadFrame(p, at + Number(p.pressDur) + 0.02).keys[1].scale, 1, 0.001);
});

test("lock: the number rises from blur before settling, then rolls to the next step", () => {
  const p = withDefaults("stepLock", {});
  const early = lockFrame(p, Number(p.at1) + 0.05);
  assert.ok(early.blur > 6 && early.rise > 20, "starts low and blurred");
  const settled = lockFrame(p, Number(p.at2) - 0.05);
  near(settled.blur, 0, 0.2);
  assert.equal(settled.current, 0);
  const mid = lockFrame(p, Number(p.at2) + Number(p.rollDur) / 3);
  assert.equal(mid.current, 1);
  assert.equal(mid.previous, 0);
  assert.ok(mid.roll > 0 && mid.roll < 1);
  const done = lockFrame(p, Number(p.at2) + Number(p.rollDur) + 0.05);
  assert.equal(done.previous, -1);
});

test("lock: the date line appears before the number", () => {
  const p = withDefaults("stepLock", {});
  const f = lockFrame(p, Number(p.at1) - 0.02);
  assert.ok(f.dateOpacity > 0);
  assert.equal(f.numberOpacity, 0);
});
