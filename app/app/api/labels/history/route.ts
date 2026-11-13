import path from "node:path";
import type { NextRequest } from "next/server";
import { resolveLabelsPath } from "@/lib/labels/paths";
import { readLabels } from "@/lib/labels/store";
import { openHistoryDb } from "@/lib/labels/db";
import { checkReadRequest } from "@/lib/labels/guard";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const guard = checkReadRequest(request.headers);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const card = request.nextUrl.searchParams.get("card") ?? "";
  const { file, error } = readLabels(resolveLabelsPath(process.env, process.cwd()).path);
  if (error) return Response.json({ history: [], error });
  const db = openHistoryDb(path.join(process.cwd(), "data", "kurgu.db"));
  try {
    db.syncFrom(file);
    return Response.json({ history: db.history(card) });
  } finally {
    db.close();
  }
}
