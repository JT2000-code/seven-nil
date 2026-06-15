import { decodeShare, encodeShare } from "@/lib/share";
import { isShareStoreEnabled, putShare } from "@/lib/shareStore";

export const runtime = "nodejs";

// Generous ceiling: a full XI encodes to well under 2000 chars; anything much
// larger is malformed or abusive and is rejected before touching the store.
const MAX_ENCODED_LEN = 6000;

/**
 * Create a short link for a finished run.
 * Body: { d: <base64url payload> }. Returns { slug } on success, or
 * { slug: null } when no store is configured (client then uses the ?d= link).
 */
export async function POST(req: Request): Promise<Response> {
  if (!isShareStoreEnabled()) {
    return Response.json({ slug: null });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const d =
    body && typeof (body as { d?: unknown }).d === "string"
      ? (body as { d: string }).d
      : "";
  if (!d || d.length > MAX_ENCODED_LEN) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only valid, bounded game payloads may be stored — re-encode canonically so
  // the store can never be used to stash arbitrary data.
  const payload = decodeShare(d);
  if (!payload) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const slug = await putShare(encodeShare(payload));
  return Response.json({ slug });
}
