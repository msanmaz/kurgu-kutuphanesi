// Validates content/styles/*.json the way the app loads it. Run: npm run check:content
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "../lib/content/load.ts";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { cards, errors } = loadContent(path.join(appDir, "content"));
if (errors.length) {
  for (const e of errors) console.error(e);
  process.exit(1);
}
console.log(`ok: ${cards.length} cards`);
