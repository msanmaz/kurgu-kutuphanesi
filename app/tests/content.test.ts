import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateAll } from "../lib/content/validate.ts";
import { loadContent } from "../lib/content/load.ts";

function style(id: string, extra: Record<string, unknown> = {}) {
  return {
    id, group: "Geçiş", name: `Stil ${id}`, line: "Bir satır.", when: "Ne zaman.", tags: ["POP"], rules: ["Kural."],
    vault: { status: "scoped", date: "2026-10-24", statusCheckedAt: "2026-10-25", quote: "q", quoteWho: "Creator", sources: ["a.md"], examples: ["b/"] },
    template: "cardZoom", params: { dur: 0.5 }, caption: [["ANA ", { k: "FİKRE" }]], initialLabel: "Düşünülüyor",
    origin: { kind: "vault" }, variations: [], ...extra,
  };
}
const variation = (id: string, params: Record<string, unknown>) => ({
  id, name: `Varyasyon ${id}`, line: "Fark.", changed: "Yay değişti", params,
  origin: { kind: "claude", basis: "t4 parametreleri" }, initialLabel: "Yeni", addedAt: "2026-10-25",
});

function contentDir(files: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "kurgu-content-"));
  mkdirSync(path.join(dir, "styles"));
  for (const [name, body] of Object.entries(files)) writeFileSync(path.join(dir, "styles", name), body);
  return dir;
}

test("a style with two variations flattens to three cards with merged params", () => {
  const s = style("t4", { params: { dur: 0.5, cut: 1.2 }, variations: [variation("t4-a", { dur: 0.35 }), variation("t4-b", { fromScale: 1.12 })] });
  const { cards, errors } = loadContent(contentDir({ "t4.json": JSON.stringify(s) }));
  assert.deepEqual(errors, []);
  assert.deepEqual(cards.map((c) => c.id).sort(), ["t4", "t4-a", "t4-b"]);
  assert.equal(cards.filter((c) => c.isVariation).length, 2);
  const a = cards.find((c) => c.id === "t4-a")!;
  assert.equal(a.styleId, "t4");
  assert.equal(a.params.dur, 0.35);          // its own
  assert.equal(a.params.cut, 1.2);           // the style's
  assert.equal(a.params.fromScale, 1.2);     // the template default
  assert.equal(a.group, "Geçiş");            // inherited
  assert.equal(a.initialLabel, "Yeni");
  assert.equal(a.changed, "Yay değişti");
});

test("an unknown template is reported with the file and the template, and does not throw", () => {
  const { styles, errors } = validateAll([
    { file: "bad.json", raw: style("bad", { template: "nope" }) },
    { file: "ok.json", raw: style("ok") },
  ]);
  assert.ok(errors.some((e) => e.includes("bad.json") && e.includes("nope")), errors.join("\n"));
  assert.deepEqual(styles.map((s) => s.id), ["ok"]);
});

test("a parameter out of range is reported with its key and range", () => {
  const { styles, errors } = validateAll([
    { file: "bad.json", raw: style("bad", { params: { cardTop: 5000 } }) },
    { file: "ok.json", raw: style("ok") },
  ]);
  assert.ok(errors.some((e) => e.includes("cardTop") && e.includes("900") && e.includes("1300")), errors.join("\n"));
  assert.deepEqual(styles.map((s) => s.id), ["ok"]);
});

test("duplicate ids across files are reported and the first one wins", () => {
  const { styles, errors } = validateAll([
    { file: "a.json", raw: style("same") },
    { file: "b.json", raw: style("other", { variations: [variation("same", {})] }) },
    { file: "c.json", raw: style("ok") },
  ]);
  assert.ok(errors.some((e) => e.includes("same") && e.includes("b.json")), errors.join("\n"));
  assert.deepEqual(styles.map((s) => s.id).sort(), ["ok", "same"]);
});

test("broken JSON is a parse error and the other files still load", () => {
  const { cards, errors } = loadContent(contentDir({ "broken.json": "{ not json", "ok.json": JSON.stringify(style("ok")) }));
  assert.ok(errors.some((e) => e.includes("broken.json")), errors.join("\n"));
  assert.deepEqual(cards.map((c) => c.id), ["ok"]);
});

test("a vault record without statusCheckedAt still loads", () => {
  const s = style("x");
  delete (s.vault as Record<string, unknown>).statusCheckedAt;
  const { cards, errors } = loadContent(contentDir({ "x.json": JSON.stringify(s) }));
  assert.deepEqual(errors, []);
  assert.equal(cards[0].vault.statusCheckedAt, undefined);
});

test("template names that exist only on Object's prototype are rejected, and the feed still loads", () => {
  for (const name of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
    const { styles, errors } = validateAll([
      { file: "bad.json", raw: style("bad", { template: name, params: {} }) },
      { file: "ok.json", raw: style("ok") },
    ]);
    assert.ok(errors.some((e) => e.includes("bad.json") && e.includes("unknown template")), `${name}: ${errors.join("\n")}`);
    assert.deepEqual(styles.map((s) => s.id), ["ok"], name);
  }
});

test("caption variations may set the font, weight and size, within range", () => {
  const ok = style("cap", { template: "caption", params: {}, variations: [variation("cap-h", { captionFont: "helvetica", captionWeight: 700, captionSize: 58 })] });
  const bad = style("cap2", { template: "caption", params: { captionFont: "comic", captionSize: 120 } });
  const { styles, errors } = validateAll([{ file: "ok.json", raw: ok }, { file: "bad.json", raw: bad }]);
  assert.deepEqual(styles.map((s) => s.id), ["cap"]);
  assert.ok(errors.some((e) => e.includes("captionFont") && e.includes("poppins")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("captionSize") && e.includes("90")), errors.join("\n"));
});
