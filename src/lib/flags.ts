// Simplified, original SVG flag specifications for each nation in the dataset.
// National flags are not trademarks; these are stylised editorial renderings
// drawn from primitive shapes (no official artwork/assets) so they render
// identically on every platform (unlike regional-indicator emoji, which do not
// display as flags on Windows). viewBox is 60 x 40.

export type FlagOverlay =
  | { kind: "disc"; cx?: number; cy?: number; r: number; color: string; color2?: string }
  | { kind: "diamond"; color: string }
  | { kind: "star"; cx?: number; cy?: number; r: number; color: string; points?: number; rot?: number }
  | { kind: "crescent"; cx?: number; cy?: number; r: number; color: string; bite: string }
  | { kind: "triangle"; color: string }
  | { kind: "cantonRect"; x: number; y: number; w: number; h: number; color: string }
  | { kind: "cantonCross"; x: number; y: number; w: number; h: number; field: string; cross: string };

export type FlagBase =
  | { kind: "stripes"; dir: "h" | "v"; colors: string[]; weights?: number[] }
  | { kind: "cross"; field: string; cross: string; fim?: string }
  | { kind: "nordic"; field: string; cross: string; inner?: string }
  | { kind: "saltire"; field: string; cross: string }
  | { kind: "solid"; color: string };

export interface FlagSpec {
  base: FlagBase;
  overlays?: FlagOverlay[];
}

const SUN = "#f6b40e";

export const FLAGS: Record<string, FlagSpec> = {
  Algeria: {
    base: { kind: "stripes", dir: "v", colors: ["#006233", "#ffffff"] },
    overlays: [
      { kind: "crescent", r: 8, color: "#d21034", bite: "#ffffff" },
      { kind: "star", cx: 33, r: 4, color: "#d21034" },
    ],
  },
  Argentina: {
    base: { kind: "stripes", dir: "h", colors: ["#74acdf", "#ffffff", "#74acdf"] },
    overlays: [{ kind: "disc", r: 5, color: SUN }],
  },
  Australia: {
    base: { kind: "solid", color: "#00008b" },
    overlays: [
      { kind: "cantonCross", x: 0, y: 0, w: 26, h: 20, field: "#00008b", cross: "#ffffff" },
      { kind: "star", cx: 13, cy: 31, r: 5, color: "#ffffff" },
      { kind: "star", cx: 46, cy: 20, r: 4, color: "#ffffff" },
    ],
  },
  Austria: {
    base: { kind: "stripes", dir: "h", colors: ["#c8102e", "#ffffff", "#c8102e"] },
  },
  Belgium: {
    base: { kind: "stripes", dir: "v", colors: ["#000000", "#fdda24", "#ef3340"] },
  },
  Brazil: {
    base: { kind: "solid", color: "#009b3a" },
    overlays: [
      { kind: "diamond", color: "#ffdf00" },
      { kind: "disc", r: 7, color: "#002776" },
    ],
  },
  Bulgaria: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#00966e", "#d62612"] },
  },
  Chile: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#d52b1e"] },
    overlays: [
      { kind: "cantonRect", x: 0, y: 0, w: 20, h: 20, color: "#0039a6" },
      { kind: "star", cx: 10, cy: 10, r: 6, color: "#ffffff" },
    ],
  },
  Colombia: {
    base: { kind: "stripes", dir: "h", colors: ["#fcd116", "#003893", "#ce1126"], weights: [2, 1, 1] },
  },
  "Costa Rica": {
    base: {
      kind: "stripes",
      dir: "h",
      colors: ["#002b7f", "#ffffff", "#ce1126", "#ffffff", "#002b7f"],
      weights: [1, 1, 2, 1, 1],
    },
  },
  Croatia: {
    base: { kind: "stripes", dir: "h", colors: ["#ff0000", "#ffffff", "#171796"] },
    overlays: [{ kind: "cantonRect", x: 26, y: 14, w: 8, h: 12, color: "#ff0000" }],
  },
  Czechoslovakia: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#d7141a"] },
    overlays: [{ kind: "triangle", color: "#11457e" }],
  },
  Denmark: {
    base: { kind: "nordic", field: "#c8102e", cross: "#ffffff" },
  },
  "East Germany": {
    base: { kind: "stripes", dir: "h", colors: ["#000000", "#dd0000", "#ffce00"] },
    overlays: [{ kind: "disc", r: 5, color: "#cd8c00" }],
  },
  Ecuador: {
    base: { kind: "stripes", dir: "h", colors: ["#fcd116", "#003893", "#ce1126"], weights: [2, 1, 1] },
    overlays: [{ kind: "disc", r: 4, color: "#7b6a2a" }],
  },
  England: {
    base: { kind: "cross", field: "#ffffff", cross: "#ce1124" },
  },
  France: {
    base: { kind: "stripes", dir: "v", colors: ["#0055a4", "#ffffff", "#ef4135"] },
  },
  Germany: {
    base: { kind: "stripes", dir: "h", colors: ["#000000", "#dd0000", "#ffce00"] },
  },
  Ghana: {
    base: { kind: "stripes", dir: "h", colors: ["#ce1126", "#fcd116", "#006b3f"] },
    overlays: [{ kind: "star", r: 5, color: "#000000" }],
  },
  Greece: {
    base: {
      kind: "stripes",
      dir: "h",
      colors: ["#0d5eaf", "#ffffff", "#0d5eaf", "#ffffff", "#0d5eaf"],
    },
    overlays: [{ kind: "cantonCross", x: 0, y: 0, w: 16, h: 16, field: "#0d5eaf", cross: "#ffffff" }],
  },
  Hungary: {
    base: { kind: "stripes", dir: "h", colors: ["#cd2a3e", "#ffffff", "#436f4d"] },
  },
  Italy: {
    base: { kind: "stripes", dir: "v", colors: ["#009246", "#ffffff", "#ce2b37"] },
  },
  Japan: {
    base: { kind: "solid", color: "#ffffff" },
    overlays: [{ kind: "disc", r: 9, color: "#bc002d" }],
  },
  Mexico: {
    base: { kind: "stripes", dir: "v", colors: ["#006847", "#ffffff", "#ce1126"] },
    overlays: [{ kind: "disc", r: 4, color: "#9b6a35" }],
  },
  Morocco: {
    base: { kind: "solid", color: "#c1272d" },
    overlays: [{ kind: "star", r: 9, color: "#006233" }],
  },
  Netherlands: {
    base: { kind: "stripes", dir: "h", colors: ["#ae1c28", "#ffffff", "#21468b"] },
  },
  Nigeria: {
    base: { kind: "stripes", dir: "v", colors: ["#008751", "#ffffff", "#008751"] },
  },
  "North Korea": {
    base: {
      kind: "stripes",
      dir: "h",
      colors: ["#024fa2", "#ffffff", "#ed1c27", "#ffffff", "#024fa2"],
      weights: [3, 0.6, 6, 0.6, 3],
    },
    overlays: [
      { kind: "disc", cx: 20, r: 5.5, color: "#ffffff" },
      { kind: "star", cx: 20, r: 3.6, color: "#ed1c27" },
    ],
  },
  "Northern Ireland": {
    base: { kind: "cross", field: "#ffffff", cross: "#ce1124" },
    overlays: [
      { kind: "disc", r: 6, color: "#ffffff" },
      { kind: "star", r: 5, color: "#ce1124", points: 6 },
    ],
  },
  Norway: {
    base: { kind: "nordic", field: "#ef2b2d", cross: "#ffffff", inner: "#002868" },
  },
  Paraguay: {
    base: { kind: "stripes", dir: "h", colors: ["#d52b1e", "#ffffff", "#0038a8"] },
    overlays: [{ kind: "disc", r: 4, color: "#cda434" }],
  },
  Peru: {
    base: { kind: "stripes", dir: "v", colors: ["#d91023", "#ffffff", "#d91023"] },
  },
  Poland: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#dc143c"] },
  },
  Portugal: {
    base: { kind: "stripes", dir: "v", colors: ["#006600", "#ff0000"], weights: [2, 3] },
    overlays: [{ kind: "disc", cx: 24, r: 5, color: SUN }],
  },
  "Republic of Ireland": {
    base: { kind: "stripes", dir: "v", colors: ["#169b62", "#ffffff", "#ff883e"] },
  },
  Romania: {
    base: { kind: "stripes", dir: "v", colors: ["#002b7f", "#fcd116", "#ce1126"] },
  },
  Russia: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#0039a6", "#d52b1e"] },
  },
  Scotland: {
    base: { kind: "saltire", field: "#005eb8", cross: "#ffffff" },
  },
  Senegal: {
    base: { kind: "stripes", dir: "v", colors: ["#00853f", "#fdef42", "#e31b23"] },
    overlays: [{ kind: "star", r: 5, color: "#00853f" }],
  },
  Slovakia: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#0b4ea2", "#ee1c25"] },
    overlays: [{ kind: "cantonRect", x: 17, y: 12, w: 9, h: 16, color: "#ee1c25" }],
  },
  "South Korea": {
    base: { kind: "solid", color: "#ffffff" },
    overlays: [{ kind: "disc", r: 8, color: "#cd2e3a", color2: "#0047a0" }],
  },
  "Soviet Union": {
    base: { kind: "solid", color: "#cd0000" },
    overlays: [{ kind: "star", cx: 13, cy: 11, r: 5, color: "#ffd900" }],
  },
  Spain: {
    base: { kind: "stripes", dir: "h", colors: ["#aa151b", "#f1bf00", "#aa151b"], weights: [1, 2, 1] },
  },
  Sweden: {
    base: { kind: "nordic", field: "#006aa7", cross: "#fecc00" },
  },
  Switzerland: {
    base: { kind: "cross", field: "#d52b1e", cross: "#ffffff" },
  },
  Turkey: {
    base: { kind: "solid", color: "#e30a17" },
    overlays: [
      { kind: "crescent", cx: 24, r: 9, color: "#ffffff", bite: "#e30a17" },
      { kind: "star", cx: 38, r: 4.5, color: "#ffffff" },
    ],
  },
  Ukraine: {
    base: { kind: "stripes", dir: "h", colors: ["#0057b7", "#ffd700"] },
  },
  Uruguay: {
    base: {
      kind: "stripes",
      dir: "h",
      colors: ["#ffffff", "#0038a8", "#ffffff", "#0038a8", "#ffffff"],
    },
    overlays: [
      { kind: "cantonRect", x: 0, y: 0, w: 24, h: 16, color: "#ffffff" },
      { kind: "star", cx: 12, cy: 8, r: 5, color: SUN, points: 8 },
    ],
  },
  USA: {
    base: {
      kind: "stripes",
      dir: "h",
      colors: ["#b22234", "#ffffff", "#b22234", "#ffffff", "#b22234", "#ffffff", "#b22234"],
    },
    overlays: [
      { kind: "cantonRect", x: 0, y: 0, w: 26, h: 23, color: "#3c3b6e" },
      { kind: "star", cx: 6, cy: 6, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 14, cy: 6, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 22, cy: 6, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 10, cy: 12, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 18, cy: 12, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 6, cy: 18, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 14, cy: 18, r: 2.2, color: "#ffffff" },
      { kind: "star", cx: 22, cy: 18, r: 2.2, color: "#ffffff" },
    ],
  },
  Wales: {
    base: { kind: "stripes", dir: "h", colors: ["#ffffff", "#00ab39"] },
    overlays: [{ kind: "disc", r: 5, color: "#c8102e" }],
  },
  "West Germany": {
    base: { kind: "stripes", dir: "h", colors: ["#000000", "#dd0000", "#ffce00"] },
  },
  Yugoslavia: {
    base: { kind: "stripes", dir: "h", colors: ["#003893", "#ffffff", "#d52b1e"] },
    overlays: [{ kind: "star", r: 5, color: "#d52b1e" }],
  },
};

/** A two-colour vertical fallback for any nation without an explicit spec. */
export function getFlagSpec(
  nation: string,
  fallback: { primary: string; secondary: string },
): FlagSpec {
  return (
    FLAGS[nation] ?? {
      base: { kind: "stripes", dir: "v", colors: [fallback.primary, fallback.secondary] },
    }
  );
}
