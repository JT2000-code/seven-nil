import type { Position } from "./types";

// Positional fluidity: a player listed in a given position can also cover these
// closely-related slots. Wing-backs are modelled via the full-back ↔ wide-mid
// links (3-5-2 wing-back slots are RM/LM-roled; 5-4-1 wing-backs are RB/LB-roled).
export const POSITION_COMPAT: Record<Position, Position[]> = {
  GK: [],
  RB: ["RM"],
  CB: [],
  LB: ["LM"],
  CDM: ["CM"],
  CM: [],
  CAM: ["CM"],
  RM: ["RW"],
  LM: ["LW"],
  RW: ["RM"],
  LW: ["LM"],
  ST: [],
};

/** True if a player who lists `playerPositions` can fill a slot of `slotRole`. */
export function slotAccepts(slotRole: Position, playerPositions: Position[]): boolean {
  if (playerPositions.includes(slotRole)) return true;
  return playerPositions.some((p) => POSITION_COMPAT[p].includes(slotRole));
}
