import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReadRequest, checkWriteRequest, isLocalHost } from "../lib/labels/guard.ts";

const h = (o: Record<string, string>) => new Headers(o);
const json = { "content-type": "application/json" };

test("a same-origin JSON save from this computer is allowed", () => {
  for (const host of ["localhost:4317", "127.0.0.1:4317", "[::1]:4317"]) {
    assert.deepEqual(checkWriteRequest(h({ ...json, host, origin: `http://${host}` })), { ok: true }, host);
  }
  assert.deepEqual(checkWriteRequest(h({ "content-type": "application/json; charset=utf-8", host: "localhost:4317", origin: "http://localhost:4317" })), { ok: true });
});

test("a plain-text body from another site is refused before it is parsed", () => {
  const r = checkWriteRequest(h({ "content-type": "text/plain;charset=UTF-8", host: "localhost:4317", origin: "https://evil.example" }));
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 415);
});

test("a JSON save from another origin is refused", () => {
  const r = checkWriteRequest(h({ ...json, host: "localhost:4317", origin: "https://evil.example" }));
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 403);
});

test("DNS rebinding: a foreign Host with its own matching Origin is refused", () => {
  const r = checkWriteRequest(h({ ...json, host: "evil.example:4317", origin: "http://evil.example:4317" }));
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 403);
});

test("a save without an Origin header is refused", () => {
  const r = checkWriteRequest(h({ ...json, host: "localhost:4317" }));
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 403);
});

test("a local origin on another port is refused", () => {
  const r = checkWriteRequest(h({ ...json, host: "localhost:4317", origin: "http://localhost:3000" }));
  assert.equal(r.ok, false);
});

test("reads are allowed only through a local Host", () => {
  assert.deepEqual(checkReadRequest(h({ host: "127.0.0.1:4317" })), { ok: true });
  const r = checkReadRequest(h({ host: "evil.example:4317" }));
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 403);
  assert.equal(checkReadRequest(h({})).ok, false);
});

test("only loopback names count as local", () => {
  for (const host of ["localhost", "localhost:4317", "LOCALHOST:4317", "127.0.0.1:4317", "[::1]:4317"]) assert.equal(isLocalHost(host), true, host);
  for (const host of [null, "", "localhost.evil.example:4317", "127.0.0.1.nip.io:4317", "evil.example", "192.168.1.20:4317", "0.0.0.0:4317"]) assert.equal(isLocalHost(host), false, String(host));
});
