import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readLabels } from "../lib/labels/store.ts";

const storeUrl = new URL("../lib/labels/store.ts", import.meta.url).href;
const here = path.dirname(fileURLToPath(import.meta.url));

function writer(file: string, card: string, times: number): Promise<number> {
  const code = `import { writeCardLabel } from ${JSON.stringify(storeUrl)};
    for (let i = 0; i < ${times}; i++) writeCardLabel(${JSON.stringify(file)}, ${JSON.stringify(card)}, { label: "Kullanımda", note: "n" + i }, new Date());`;
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", code], { cwd: here, stdio: ["ignore", "ignore", "inherit"] });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

test("two app copies saving different cards at the same time never lose each other's labels", async () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "kurgu-race-")), "labels.json");
  const cards = Array.from({ length: 12 }, (_, i) => `card-${i}`);
  const codes = await Promise.all(cards.map((c) => writer(file, c, 8)));
  assert.deepEqual(codes, cards.map(() => 0));
  const { file: labels, error } = readLabels(file);
  assert.equal(error, undefined);
  assert.deepEqual(Object.keys(labels.cards).sort(), [...cards].sort());
  for (const c of cards) assert.equal(labels.cards[c].history.length, 8, c);
});
