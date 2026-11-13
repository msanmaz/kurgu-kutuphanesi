// The app reads and writes the vault, so it answers only this computer's own page.
// - Host must be a loopback name. Another site whose domain resolves to 127.0.0.1 (DNS rebinding)
//   still sends its own Host, so this check blocks it even though its Origin "matches" itself.
// - Saves must be JSON (a plain-text cross-site POST needs no CORS preflight) and carry an Origin equal
//   to http://<that Host>. Browsers always send Origin on a POST, so a missing one is refused.
export type GuardResult = { ok: true } | { ok: false; status: 403 | 415; error: string };

const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalHost(host: string | null): boolean {
  if (!host) return false;
  try {
    const u = new URL(`http://${host}`);
    return LOCAL.has(u.hostname) && u.host === host.toLowerCase();
  } catch {
    return false;
  }
}

const notLocal: GuardResult = { ok: false, status: 403, error: "Yalnız bu bilgisayardan açılabilir" };

export function checkReadRequest(headers: Headers): GuardResult {
  return isLocalHost(headers.get("host")) ? { ok: true } : notLocal;
}

export function checkWriteRequest(headers: Headers): GuardResult {
  const type = (headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return { ok: false, status: 415, error: "Yalnız JSON kabul edilir" };
  const host = headers.get("host");
  if (!isLocalHost(host)) return notLocal;
  if (headers.get("origin") !== `http://${host!.toLowerCase()}`) return { ok: false, status: 403, error: "Yalnız uygulamanın kendi sayfası kaydedebilir" };
  return { ok: true };
}
