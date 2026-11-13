// Stills of the Kurgu Kütüphanesi for checking: desktop and phone widths, every card frozen at chosen
// times (window.__kurguSeek), and one card's detail with the measurements on. Console errors are reported.
// No packages: Node 24's built-in WebSocket + the installed Google Chrome over the DevTools protocol.
// Usage: node check.mjs <chrome-profile-dir> <out-dir> [card-id-for-detail] [t,t,…]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [profile, outDir, detailId = "t4", times = "0.3,0.75,1.1,1.25,1.6,3.2"] = process.argv.slice(2);
if (!profile || !outDir) { console.error("usage: node check.mjs <profile> <out-dir> [card-id] [t,t,…]"); process.exit(2); }
mkdirSync(outDir, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`,
  `--remote-debugging-port=${PORT}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const waiting = new Map(), errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value || a.description).join(" "));
  if (m.id && waiting.has(m.id)) { const w = waiting.get(m.id); waiting.delete(m.id); m.error ? w.fail(new Error(m.error.message)) : w.ok(m.result); }
});
const send = (method, params = {}) => new Promise((ok, fail) => { const n = ++id; waiting.set(n, { ok, fail }); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
const shot = async (name, full = false) => {
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
  writeFileSync(path.join(outDir, name), Buffer.from(r.data, "base64"));
};
async function open(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: width < 600 });
  await send("Page.navigate", { url: pathToFileURL(path.join(HERE, "index.html")).href });
  for (let i = 0; i < 80 && (await evaluate("document.readyState")) !== "complete"; i++) await sleep(100);
  await evaluate("document.fonts.ready.then(() => true)");
  await sleep(600);
}
try {
  await send("Page.enable"); await send("Runtime.enable");
  await open(1400, 1150);
  const fonts = await evaluate("['Bebas Neue','Inter','JetBrains Mono'].map(f => document.fonts.check('40px \"' + f + '\"', 'ĞÜŞİÖÇ ğüşıöç'))");
  const overflow = await evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth");
  for (const t of times.split(",")) { await evaluate(`window.__kurguSeek(${t})`); await sleep(120); await shot(`desktop_t${t}.png`, true); }
  await evaluate(`window.__kurguSeek(3.2)`);
  await evaluate(`document.querySelector('.card[data-id="${detailId}"]').click()`); await sleep(300);
  await evaluate(`document.getElementById('d-dims').click()`); await evaluate(`window.__kurguSeek(1.6)`); await sleep(150);
  await shot(`detail_${detailId}_dims.png`);
  await evaluate(`document.getElementById('d-close').click()`);
  await open(390, 844);
  const phoneOverflow = await evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth");
  await evaluate(`window.__kurguSeek(1.6)`); await sleep(120);
  await shot("phone.png", true);
  console.log(JSON.stringify({ fonts, overflowDesktop: overflow, overflowPhone: phoneOverflow, errors }));
} finally { ws.close(); chrome.kill(); }
