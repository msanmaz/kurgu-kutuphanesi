import { test } from "node:test";
import assert from "node:assert/strict";
import { saveLabel } from "../lib/labels/client.ts";

const entry = { label: "Kullanımda", note: "", updatedAt: "2026-10-25T00:00:00Z", history: [] };
const reply = (status: number, body: unknown) => async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("a saved label returns the entry", async () => {
  assert.deepEqual(await saveLabel(reply(200, entry), "a", { label: "Kullanımda" }), { ok: true, entry });
});

test("a stopped server gives a visible error instead of throwing", async () => {
  const r = await saveLabel(async () => { throw new TypeError("Failed to fetch"); }, "a", { note: "x" });
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.error.includes("ulaşılamadı"), JSON.stringify(r));
  assert.equal(!r.ok && r.conflict, false);
});

test("a conflicted labels file is reported as a conflict", async () => {
  const r = await saveLabel(reply(409, { error: "Etiket dosyası okunamadı" }), "a", { label: "Yeni" });
  assert.deepEqual(r, { ok: false, error: "Etiket dosyası okunamadı", conflict: true });
});
