import type { Position, RatingMode, SquadPlayer } from "./types";

/** Colour for a rating chip, banded to match the rating rubric. */
export function ratingColor(rating: number): string {
  if (rating >= 92) return "#f5c542"; // pantheon / generational — gold
  if (rating >= 88) return "#7ee0a5"; // world-class — bright green
  if (rating >= 84) return "#54c08a"; // elite
  if (rating >= 80) return "#3aa6c4"; // very good — blue
  if (rating >= 75) return "#7f9ad1"; // solid
  return "#9aa6b2"; // squad / fringe — grey
}

export function ratingTextColor(rating: number): string {
  return rating >= 92 ? "#1a1205" : "#06120b";
}

export function displayRating(player: SquadPlayer, mode: RatingMode): number {
  return mode === "prime" ? player.prime : player.rating;
}

export const POSITION_FULL: Record<Position, string> = {
  GK: "Goalkeeper",
  RB: "Right Back",
  CB: "Centre Back",
  LB: "Left Back",
  CDM: "Defensive Mid",
  CM: "Central Mid",
  CAM: "Attacking Mid",
  RM: "Right Mid",
  LM: "Left Mid",
  RW: "Right Wing",
  LW: "Left Wing",
  ST: "Striker",
};
