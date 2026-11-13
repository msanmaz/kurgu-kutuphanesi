// End-to-end stills check of the running app (start it with the same KURGU_LABELS_PATH first):
//   KURGU_LABELS_PATH=$TMP/labels.json npm start &
//   KURGU_LABELS_PATH=$TMP/labels.json npm run check:stills -- <chrome-profile> <out-dir> [base-url]
// Feed at 1400 and 900 px (overflow, Turkish fonts), stills frozen with __kurguSeek, the T4 detail with
// measurements, a label and note saved through the UI and read back, and the loop resuming after a freeze.
// Fonts: the channel fonts load, and Chrome draws each text role with them, not a fallback (CSS.getPlatformFontsForNode).
// No packages: Node's built-in WebSocket and the installed Google Chrome over the DevTools protocol.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [profile, outDir, base = "http://127.0.0.1:4317"] = process.argv.slice(2);
const expectPath = process.env.KURGU_LABELS_PATH;
if (!profile || !outDir || !expectPath) {
  console.error("usage: KURGU_LABELS_PATH=<same as the server> node scripts/check-stills.mjs <chrome-profile> <out-dir> [base-url]");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const PORT = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const waiting = new Map(), errors = [], failures = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value || a.description).join(" "));
  if (m.id && waiting.has(m.id)) { const w = waiting.get(m.id); waiting.delete(m.id); m.error ? w.fail(new Error(m.error.message)) : w.ok(m.result); }
});
const send = (method, params = {}) => new Promise((ok, fail) => { const n = ++id; waiting.set(n, { ok, fail }); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
const shot = async (name, full = true) => {
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
  writeFileSync(path.join(outDir, name), Buffer.from(r.data, "base64"));
};
const expect = (ok, what) => { if (!ok) failures.push(what); };
async function open(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: base });
  for (let i = 0; i < 100 && (await ev("document.readyState")) !== "complete"; i++) await sleep(100);
  await ev(`Promise.all(${JSON.stringify(FONTS)}.map(f => document.fonts.load(f, 'ĞÜŞİÖÇ ğüşıöç'))).then(() => document.fonts.ready).then(() => true)`);
  await sleep(800);
}
const FONTS = ["40px Anton", "italic 600 40px 'Playfair Display'", "400 40px Poppins", "600 40px Poppins", "700 40px Poppins", "40px Mono"];
// Each text role and the font families Chrome must draw it with, descendants included ("Poppins" also matches
// "Poppins SemiBold"). The report keeps each font's PostScript name, which tells the weights apart.
const ROLES = [
  ["h1", "Anton", "Playfair Display"],
  ["h1 em", "Playfair Display"],
  ["[data-card] h3", "Poppins"],
  ["header p.font-mono", "JetBrains Mono"],
  ['[data-card="caption"] [data-caption] b', "Poppins"],
  ['[data-card="caption-dogal"] [data-caption] b', "Poppins"],
  ['[data-card="caption-helvetica"] [data-caption] b', "Helvetica Neue"],
];
async function drawnFonts() {
  const out = {};
  const { root } = await send("DOM.getDocument", { depth: -1 });
  for (const [selector, ...families] of ROLES) {
    const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector });
    const fonts = nodeId ? (await send("CSS.getPlatformFontsForNode", { nodeId })).fonts : [];
    const is = (name, family) => name === family || name.startsWith(family + " ");
    out[selector] = fonts.map((f) => f.postScriptName || f.familyName);
    expect(fonts.length > 0 && fonts.every((f) => families.some((fam) => is(f.familyName, fam))) && families.every((fam) => fonts.some((f) => is(f.familyName, fam))),
      `${selector}: drawn with ${JSON.stringify(fonts.map((f) => f.familyName))}, expected ${families.join(" + ")}`);
  }
  return out;
}
// Widest caption pill on screen, in Reel pixels (the stage is 1080 wide).
const pillWidth = () => ev("Math.round(Math.max(...[...document.querySelectorAll('[data-caption]')].map(p => p.getBoundingClientRect().width / p.parentElement.getBoundingClientRect().width * 1080)))");
const click = (selector) => ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
const clickText = (scope, text) => ev(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!el) return false; el.click(); return true; })()`);

const summary = { overflow: null, fonts: null, drawn: null, widestPill: null, labelSaved: false, resumed: false, errors };
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable"); await send("CSS.enable");

  await open(1400, 1150);
  summary.fonts = await ev(`${JSON.stringify(FONTS)}.map(f => document.fonts.check(f, 'ĞÜŞİÖÇ ğüşıöç'))`);
  const wide = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth");
  const cards = await ev("document.querySelectorAll('[data-card]').length");
  expect(cards === 19, `19 cards expected, got ${cards}`);
  const widths = [];
  for (const t of [0.3, 1.08, 1.25, 1.6, 2.5]) { await ev(`window.__kurguSeek(${t})`); await sleep(400); await shot(`feed_t${t}.png`); widths.push(await pillWidth()); }
  summary.widestPill = Math.max(...widths);
  summary.drawn = await drawnFonts();

  expect(await click('[data-card="t4"]'), "t4 tile not found"); await sleep(500);
  expect(await clickText("[role=dialog] button", "Ölçüleri göster"), "measurements toggle not found");
  await ev("window.__kurguSeek(1.6)"); await sleep(400);
  await shot("detail_t4_dims.png", false);
  expect(await clickText("[role=dialog] button", "Kapat"), "close button not found"); await sleep(300);

  const before = await (await fetch(`${base}/api/labels/history?card=t4-035`)).json();
  expect(await click('[data-card="t4-035"]'), "t4-035 tile not found"); await sleep(500);
  expect(await clickText("[role=dialog] [role=group] button", "Düşünülüyor"), "label button not found"); await sleep(600);
  await ev("document.getElementById('d-note').focus()");
  await ev("(() => { const t = document.getElementById('d-note'); t.select(); return true; })()");
  await send("Input.insertText", { text: "kontrol notu" });
  await ev("document.getElementById('d-note').blur()"); await sleep(900);
  await shot("detail_t4-035_saved.png", false);

  const labels = await (await fetch(`${base}/api/labels`)).json();
  const after = await (await fetch(`${base}/api/labels/history?card=t4-035`)).json();
  expect(labels.source === "env", `labels source ${labels.source}, expected env`);
  expect(labels.path === expectPath, `labels path ${labels.path}, expected ${expectPath}`);
  const entry = labels.cards?.["t4-035"];
  summary.labelSaved = entry?.label === "Düşünülüyor" && entry?.note === "kontrol notu" && after.history.length > before.history.length;
  expect(summary.labelSaved, `label/note not saved: ${JSON.stringify(entry)}`);
  expect(await clickText("[role=dialog] button", "Kapat"), "close button not found (2)");

  // Resume: sample the cards on screen (off-screen cards pause by design; closing the dialog returns focus to its
  // tile, which scrolls the page) 6 times over ~2.7 s. One card alone can sit in a still stretch of its loop.
  await ev("window.__kurguSeek(null)"); await sleep(300);
  const onScreen = "[...document.querySelectorAll('[data-card]')].filter(c => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })";
  expect((await ev(`${onScreen}.length`)) > 0, "no card on screen after closing the dialog");
  const samples = new Set();
  for (let i = 0; i < 6; i++) {
    samples.add(await ev(`${onScreen}.map(c => c.querySelector('svg').innerHTML + c.textContent).join('|')`));
    await sleep(450);
  }
  summary.resumed = samples.size > 1;
  expect(summary.resumed, "animation did not resume after __kurguSeek(null)");

  await open(900, 1150);
  const narrow = await ev("document.documentElement.scrollWidth > document.documentElement.clientWidth");
  await shot("feed_900.png");
  summary.overflow = wide || narrow;
  expect(!summary.overflow, "horizontal overflow");
  expect(summary.fonts.every(Boolean), `fonts not loaded: ${summary.fonts}`);
} catch (e) {
  failures.push(String(e));
} finally {
  ws.close();
  chrome.kill();
}
if (errors.length) failures.push(`console errors: ${errors.length}`);
console.log(JSON.stringify({ ...summary, failures }));
process.exit(failures.length ? 1 : 0);
