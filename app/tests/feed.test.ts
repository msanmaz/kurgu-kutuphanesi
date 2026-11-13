import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveLabel, orderCards, filterCards } from "../lib/feed.ts";
import type { Card, Group, Label, VaultStatus, Origin } from "../lib/content/types.ts";

function card(id: string, initialLabel: Label, group: Group = "Geçiş", status: VaultStatus = "adopted", origin: Origin = { kind: "vault" }): Card {
  return {
    id, styleId: id, isVariation: false, group, name: id, line: "", when: "", tags: [], rules: [],
    vault: { status, quote: "q", quoteWho: "w", sources: [], examples: [] },
    template: "panel", params: {}, caption: [], initialLabel, origin,
  };
}

test("the feed orders by label: Yeni, Düşünülüyor, Kullanımda, Hiç kullanılmadı", () => {
  const cards = [card("a", "Kullanımda"), card("b", "Yeni"), card("c", "Hiç kullanılmadı"), card("d", "Düşünülüyor")];
  assert.deepEqual(orderCards(cards, {}).map((c) => c.id), ["b", "d", "a", "c"]);
});

test("within one label, groups follow the library order (Geçiş before Zoom)", () => {
  const cards = [card("z", "Yeni", "Zoom"), card("g", "Yeni", "Geçiş")];
  assert.deepEqual(orderCards(cards, {}).map((c) => c.id), ["g", "z"]);
});

test("a stored label overrides the card's initial label", () => {
  const c = card("a", "Yeni");
  assert.equal(effectiveLabel(c, { a: { label: "Kullanımda" } }), "Kullanımda");
  assert.equal(effectiveLabel(c, {}), "Yeni");
});

test("rejected and retired cards show only under the Reddedilenler filter", () => {
  const cards = [card("ok", "Kullanımda"), card("rej", "Hiç kullanılmadı", "Yerleşim", "rejected"), card("old", "Hiç kullanılmadı", "Yerleşim", "retired")];
  assert.deepEqual(filterCards(cards, {}, { rejected: false }).map((c) => c.id), ["ok"]);
  assert.deepEqual(filterCards(cards, {}, { rejected: true }).map((c) => c.id).sort(), ["old", "rej"]);
});

test("group, label and origin filters each narrow the feed", () => {
  const cards = [
    card("a", "Yeni", "Zoom"),
    card("b", "Kullanımda", "Geçiş"),
    card("c", "Yeni", "Geçiş", "adopted", { kind: "claude", basis: "b" }),
  ];
  assert.deepEqual(filterCards(cards, {}, { rejected: false, group: "Geçiş" }).map((c) => c.id), ["b", "c"]);
  assert.deepEqual(filterCards(cards, { b: { label: "Yeni" } }, { rejected: false, label: "Yeni" }).map((c) => c.id), ["a", "b", "c"]);
  assert.deepEqual(filterCards(cards, {}, { rejected: false, origin: "claude" }).map((c) => c.id), ["c"]);
});
