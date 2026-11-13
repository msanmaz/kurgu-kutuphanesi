// Every page and route answers only a loopback Host, so a site that points its own domain at
// 127.0.0.1 (DNS rebinding) can't read the feed, the notes or the labels path. The API routes check again.
import type { NextRequest } from "next/server";
import { checkReadRequest } from "@/lib/labels/guard";

export function proxy(request: NextRequest) {
  const guard = checkReadRequest(request.headers);
  if (!guard.ok) return new Response(guard.error, { status: guard.status, headers: { "content-type": "text/plain; charset=utf-8" } });
}
