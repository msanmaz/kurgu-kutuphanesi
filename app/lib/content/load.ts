import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { withDefaults } from "../motion/registry.ts";
import { validateAll } from "./validate.ts";
import type { Card, StyleEntry } from "./types.ts";

function toCards(s: StyleEntry): Card[] {
  const base: Card = {
    id: s.id, styleId: s.id, isVariation: false, group: s.group, name: s.name, line: s.line, when: s.when,
    tags: s.tags, rules: s.rules, vault: s.vault, template: s.template, params: withDefaults(s.template, s.params),
    caption: s.caption, initialLabel: s.initialLabel, origin: s.origin,
  };
  return [base, ...s.variations.map((v): Card => ({
    ...base, id: v.id, isVariation: true, name: v.name, line: v.line,
    tags: v.tags ?? s.tags, caption: v.caption ?? s.caption,
    params: withDefaults(s.template, { ...s.params, ...v.params }),
    initialLabel: v.initialLabel, origin: v.origin, changed: v.changed, addedAt: v.addedAt,
  }))];
}

/** Reads contentDir/styles/*.json. Bad files and entries become errors; the rest become cards. */
export function loadContent(contentDir: string): { cards: Card[]; errors: string[] } {
  const dir = path.join(contentDir, "styles");
  if (!existsSync(dir)) return { cards: [], errors: [`${dir}: folder not found`] };
  const errors: string[] = [];
  const entries: { file: string; raw: unknown }[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    try {
      entries.push({ file, raw: JSON.parse(readFileSync(path.join(dir, file), "utf8")) });
    } catch (e) {
      errors.push(`${file}: JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const { styles, errors: invalid } = validateAll(entries);
  return { cards: styles.flatMap(toCards), errors: [...errors, ...invalid] };
}
