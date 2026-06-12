import type { GameSettings, Pick, SimulationResult } from "./types";
import { nationCode } from "./nations";

// ---------------------------------------------------------------------------
// Compact, URL-safe encoding of a finished run so a shared link can render a
// dynamic Open Graph card (and a /share landing page) without any backend.
// The payload is base64url(JSON) carried in the `d` query parameter.
// ---------------------------------------------------------------------------

export interface SharePlayer {
  /** Player name (may contain accents). */
  n: string;
  /** Nation code, e.g. "BRA". */
  c: string;
  /** Two-digit year, e.g. 70. */
  y: number;
  /** Displayed rating. */
  r: number;
  /** Slot label, e.g. "ST". */
  s: string;
}

export interface SharePayload {
  v: 1;
  /** Headline title, e.g. "PERFECT 7-0". */
  t: string;
  /** Subtitle. */
  st: string;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  /** Team rating. */
  r: number;
  /** Furthest round reached. */
  fr: string;
  champ: 0 | 1;
  perfect: 0 | 1;
  clean: 0 | 1;
  /** Golden boot. */
  gb?: { n: string; g: number };
  /** Formation id. */
  f: string;
  /** The XI, ordered by displayed rating (highest first). */
  xi: SharePlayer[];
}

export function resultHeadline(result: {
  perfect: boolean;
  cleanSweep: boolean;
  champions: boolean;
  furthestRound: string;
}): { title: string; sub: string } {
  if (result.cleanSweep)
    return {
      title: "PERFECT 7-0-0",
      sub: "Won it all without conceding a single goal. Untouchable.",
    };
  if (result.perfect)
    return {
      title: "PERFECT 7-0",
      sub: "Seven games, seven wins, champions of the world.",
    };
  if (result.champions)
    return {
      title: "CHAMPIONS",
      sub: "Lifted the trophy — but it wasn't a clean sweep.",
    };
  return { title: "KNOCKED OUT", sub: `The run ended in the ${result.furthestRound}.` };
}

/** Build the share payload from a finished run. */
export function buildSharePayload(
  picks: Pick[],
  result: SimulationResult,
  settings: GameSettings,
): SharePayload {
  const h = resultHeadline(result);
  const xi: SharePlayer[] = picks
    .map((p) => ({
      n: p.player.name,
      c: nationCode(p.nation),
      y: p.year % 100,
      r: settings.ratingMode === "prime" ? p.player.prime : p.player.rating,
      s: p.slotId.replace(/\d+$/, ""),
    }))
    .sort((a, b) => b.r - a.r);

  return {
    v: 1,
    t: h.title,
    st: h.sub,
    w: result.wins,
    d: result.draws,
    l: result.losses,
    gf: result.goalsFor,
    ga: result.goalsAgainst,
    r: result.teamRating,
    fr: result.furthestRound,
    champ: result.champions ? 1 : 0,
    perfect: result.perfect ? 1 : 0,
    clean: result.cleanSweep ? 1 : 0,
    gb: result.goldenBoot ? { n: result.goldenBoot.name, g: result.goldenBoot.goals } : undefined,
    f: settings.formationId,
    xi,
  };
}

// --- base64url helpers that work in both the browser and Node ---------------

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return b64 + pad;
}

export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  if (typeof window !== "undefined" && typeof btoa === "function") {
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return toBase64Url(btoa(bin));
  }
  return toBase64Url(Buffer.from(json, "utf8").toString("base64"));
}

export function decodeShare(param: string): SharePayload | null {
  try {
    const b64 = fromBase64Url(param);
    let json: string;
    if (typeof window !== "undefined" && typeof atob === "function") {
      const bin = atob(b64);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else {
      json = Buffer.from(b64, "base64").toString("utf8");
    }
    const parsed = JSON.parse(json) as SharePayload;
    if (parsed && parsed.v === 1 && Array.isArray(parsed.xi)) return parsed;
    return null;
  } catch {
    return null;
  }
}

/** Strip diacritics so names render with the default OG font. */
export function asciiName(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
