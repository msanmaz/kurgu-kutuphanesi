import { TEMPLATES } from "../motion/registry.ts";
import type { Params, TemplateId } from "../motion/registry.ts";
import { GROUPS, LABELS, VAULT_STATUSES } from "./types.ts";
import type { StyleEntry } from "./types.ts";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const ID = /^[a-z0-9][a-z0-9-]*$/;

function checkParams(template: TemplateId, params: unknown, where: string, errors: string[]) {
  if (!isObj(params)) { errors.push(`${where}: params must be an object`); return; }
  const specs = TEMPLATES[template].params;
  for (const [key, value] of Object.entries(params as Params)) {
    const spec = specs.find((s) => s.key === key);
    if (!spec) { errors.push(`${where}: unknown param "${key}" for template "${template}"`); continue; }
    if (spec.kind === "number") {
      if (typeof value !== "number" || !Number.isFinite(value) || value < spec.min || value > spec.max)
        errors.push(`${where}: param "${key}" = ${JSON.stringify(value)} is outside ${spec.min}–${spec.max}`);
    } else if (typeof value !== "string" || !spec.options.includes(value)) {
      errors.push(`${where}: param "${key}" = ${JSON.stringify(value)} is not one of ${spec.options.join(", ")}`);
    }
  }
}

function checkCaption(v: unknown, where: string, errors: string[]) {
  const ok = Array.isArray(v) && v.every((chunk) => Array.isArray(chunk) && chunk.every((part) => typeof part === "string" || (isObj(part) && isStr(part.k))));
  if (!ok) errors.push(`${where}: caption must be a list of chunks of text and {k} parts`);
}

function checkOrigin(v: unknown, where: string, errors: string[]) {
  if (!isObj(v)) { errors.push(`${where}: origin missing`); return; }
  if (v.kind === "vault") return;
  if (v.kind === "claude" && isStr(v.basis)) return;
  if (v.kind === "reference" && isStr(v.reel) && isStr(v.at) && isStr(v.analysis)) return;
  errors.push(`${where}: origin must be vault, claude {basis} or reference {reel, at, analysis}`);
}

/** Checks one style file. Returns its errors; an empty list means the entry is a valid StyleEntry. */
function checkStyle(raw: unknown, file: string): string[] {
  const errors: string[] = [];
  if (!isObj(raw)) return [`${file}: not an object`];
  const where = `${file}: ${isStr(raw.id) ? raw.id : "?"}`;
  if (!isStr(raw.id) || !ID.test(raw.id)) errors.push(`${where}: id must be lowercase letters, digits and dashes`);
  if (!(GROUPS as readonly unknown[]).includes(raw.group)) errors.push(`${where}: unknown group "${String(raw.group)}"`);
  for (const k of ["name", "line", "when"]) if (!isStr(raw[k])) errors.push(`${where}: ${k} missing`);
  for (const k of ["tags", "rules"]) if (!isStrList(raw[k])) errors.push(`${where}: ${k} must be a list of text`);
  const vault = raw.vault;
  if (!isObj(vault)) errors.push(`${where}: vault record missing`);
  else {
    if (!(VAULT_STATUSES as readonly unknown[]).includes(vault.status)) errors.push(`${where}: unknown vault status "${String(vault.status)}"`);
    if (!isStr(vault.quote) || !isStr(vault.quoteWho)) errors.push(`${where}: vault quote and quoteWho required`);
    if (!isStrList(vault.sources) || !isStrList(vault.examples)) errors.push(`${where}: vault sources and examples must be lists`);
  }
  const template = raw.template as TemplateId;
  const knownTemplate = typeof raw.template === "string" && Object.hasOwn(TEMPLATES, raw.template);
  if (!knownTemplate) errors.push(`${where}: unknown template "${String(raw.template)}"`);
  else checkParams(template, raw.params, where, errors);
  checkCaption(raw.caption, where, errors);
  if (!(LABELS as readonly unknown[]).includes(raw.initialLabel)) errors.push(`${where}: unknown initialLabel "${String(raw.initialLabel)}"`);
  checkOrigin(raw.origin, where, errors);
  if (!Array.isArray(raw.variations)) errors.push(`${where}: variations must be a list`);
  else raw.variations.forEach((v, i) => {
    const vw = `${file}: ${isObj(v) && isStr(v.id) ? v.id : `variation ${i}`}`;
    if (!isObj(v)) { errors.push(`${vw}: not an object`); return; }
    if (!isStr(v.id) || !ID.test(v.id)) errors.push(`${vw}: id must be lowercase letters, digits and dashes`);
    for (const k of ["name", "line", "changed", "addedAt"]) if (!isStr(v[k])) errors.push(`${vw}: ${k} missing`);
    if (knownTemplate) checkParams(template, v.params, vw, errors);
    if (v.caption !== undefined) checkCaption(v.caption, vw, errors);
    if (v.tags !== undefined && !isStrList(v.tags)) errors.push(`${vw}: tags must be a list of text`);
    if (!(LABELS as readonly unknown[]).includes(v.initialLabel)) errors.push(`${vw}: unknown initialLabel "${String(v.initialLabel)}"`);
    checkOrigin(v.origin, vw, errors);
  });
  return errors;
}

/** Validates every style; skips invalid ones and any style that reuses an earlier id. Never throws. */
export function validateAll(entries: { file: string; raw: unknown }[]): { styles: StyleEntry[]; errors: string[] } {
  const styles: StyleEntry[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const { file, raw } of entries) {
    const errs = checkStyle(raw, file);
    if (errs.length) { errors.push(...errs); continue; }
    const s = raw as StyleEntry;
    const ids = [s.id, ...s.variations.map((v) => v.id)];
    const dup = ids.find((id, i) => seen.has(id) || ids.indexOf(id) !== i);
    if (dup) { errors.push(`${file}: duplicate id "${dup}"${seen.has(dup) ? ` (also in ${seen.get(dup)})` : ""}; this style is skipped`); continue; }
    ids.forEach((id) => seen.set(id, file));
    styles.push(s);
  }
  return { styles, errors };
}
