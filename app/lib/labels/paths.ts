import { execFileSync } from "node:child_process";
import path from "node:path";

const IN_VAULT = path.join("devmert7", "kurgu-kutuphanesi", "app", "data", "labels.json");

/** The main checkout is the first `worktree` line of `git worktree list --porcelain`. */
export function parseMainWorktree(porcelain: string): string | null {
  const line = porcelain.split("\n").find((l) => l.startsWith("worktree "));
  return line ? line.slice("worktree ".length).trim() : null;
}

/** Where labels are saved: KURGU_LABELS_PATH, else the main vault checkout, else this folder (with a warning). */
export function resolveLabelsPath(
  env: Record<string, string | undefined>,
  cwd: string,
): { path: string; source: "env" | "main" | "local"; warning?: string } {
  const override = env.KURGU_LABELS_PATH;
  if (override) return { path: override, source: "env" };
  try {
    const out = execFileSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const main = parseMainWorktree(out);
    if (main) return { path: path.join(main, IN_VAULT), source: "main" };
  } catch {
    // not a git checkout, or git missing: fall through to the local file
  }
  return {
    path: path.join(cwd, "data", "labels.local.json"),
    source: "local",
    warning: "Ana vault bulunamadı, etiketler bu klasöre kaydediliyor",
  };
}
