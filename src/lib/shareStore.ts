import { Redis } from "@upstash/redis";
import { cache } from "react";

// ---------------------------------------------------------------------------
// Server-side store for share links. When an Upstash/Vercel KV database is
// configured (via env vars), a finished run is saved under a short slug so the
// share URL can be a tiny /s/<slug> instead of a long ?d=<base64> payload.
//
// If no store is configured the helpers degrade gracefully: putShare returns
// null and callers fall back to the self-contained ?d= link, so the feature
// keeps working with no backend at all.
// ---------------------------------------------------------------------------

const KEY_PREFIX = "share:";
const SLUG_LEN = 7;
const SLUG_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const MAX_SLUG_ATTEMPTS = 5;

function readEnv(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  if (!url || !token) return null;
  return { url, token };
}

let client: Redis | null = null;

function getClient(): Redis | null {
  const env = readEnv();
  if (!env) return null;
  if (!client) client = new Redis({ url: env.url, token: env.token });
  return client;
}

/** True when a KV store is configured and short links are available. */
export function isShareStoreEnabled(): boolean {
  return readEnv() !== null;
}

function generateSlug(): string {
  const bytes = new Uint8Array(SLUG_LEN);
  crypto.getRandomValues(bytes);
  let slug = "";
  for (const b of bytes) slug += SLUG_ALPHABET[b % SLUG_ALPHABET.length];
  return slug;
}

/**
 * Store an encoded share payload and return its slug, or null if no store is
 * configured (or every slug attempt collided). The value is the canonical
 * base64url string produced by encodeShare().
 */
export async function putShare(encoded: string): Promise<string | null> {
  const redis = getClient();
  if (!redis) return null;
  for (let i = 0; i < MAX_SLUG_ATTEMPTS; i++) {
    const slug = generateSlug();
    // NX = only set if the slug is unused, so we never clobber an existing link.
    const ok = await redis.set(KEY_PREFIX + slug, encoded, { nx: true });
    if (ok === "OK") return slug;
  }
  return null;
}

async function readShare(slug: string): Promise<string | null> {
  const redis = getClient();
  if (!redis || !slug) return null;
  const value = await redis.get<string>(KEY_PREFIX + slug);
  return typeof value === "string" ? value : null;
}

/**
 * Look up the encoded payload for a slug. Wrapped in React cache() so a single
 * request (page render + generateMetadata) only hits the store once.
 */
export const getShare = cache(readShare);
