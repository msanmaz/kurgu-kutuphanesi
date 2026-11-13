import path from "node:path";
import { loadContent } from "@/lib/content/load";
import { resolveLabelsPath } from "@/lib/labels/paths";
import { readLabels } from "@/lib/labels/store";
import { Feed } from "@/components/Feed";

// Content and labels are read from disk on every request, so a new variation shows on refresh.
export const dynamic = "force-dynamic";

export default function Page() {
  const { cards, errors } = loadContent(path.join(process.cwd(), "content"));
  const where = resolveLabelsPath(process.env, process.cwd());
  const { file, error } = readLabels(where.path);
  return (
    <Feed
      cards={cards}
      contentErrors={errors}
      initial={{ cards: file.cards, path: where.path, source: where.source, warning: where.warning, error }}
    />
  );
}
