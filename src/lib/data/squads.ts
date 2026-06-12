import type { TournamentSquad } from "../types";
import { WC_1954 } from "./tournaments/wc1954";
import { WC_1958 } from "./tournaments/wc1958";
import { WC_1966 } from "./tournaments/wc1966";
import { WC_1970 } from "./tournaments/wc1970";
import { WC_1974 } from "./tournaments/wc1974";
import { WC_1982 } from "./tournaments/wc1982";
import { WC_1986 } from "./tournaments/wc1986";
import { WC_1998 } from "./tournaments/wc1998";
import { WC_2002 } from "./tournaments/wc2002";
import { WC_2006 } from "./tournaments/wc2006";
import { WC_2010 } from "./tournaments/wc2010";
import { WC_2014 } from "./tournaments/wc2014";
import { WC_2018 } from "./tournaments/wc2018";
import { WC_2022 } from "./tournaments/wc2022";

// ---------------------------------------------------------------------------
// Dataset for 7-0. Each World Cup is expanded to the top 16 finishers (or the
// strongest sides for the older 16-team tournaments), stored per-tournament in
// ./tournaments/. Ratings are original editorial estimates anchored to FIFA
// games for recent cups and to reputation/impact for historical ones
// (see src/lib/rating-rubric.md). `rating` = the player at that tournament,
// `prime` = career best (>= rating). Data is used for descriptive / nostalgic
// / gameplay purposes only.
// ---------------------------------------------------------------------------

export const SQUADS: TournamentSquad[] = [
  ...WC_1954,
  ...WC_1958,
  ...WC_1966,
  ...WC_1970,
  ...WC_1974,
  ...WC_1982,
  ...WC_1986,
  ...WC_1998,
  ...WC_2002,
  ...WC_2006,
  ...WC_2010,
  ...WC_2014,
  ...WC_2018,
  ...WC_2022,
];

/** Squads eligible to be spun given the era (min-year) filter. */
export function eligibleSquads(minYear: number): TournamentSquad[] {
  return SQUADS.filter((s) => s.year >= minYear);
}

export function getSquad(id: string): TournamentSquad | undefined {
  return SQUADS.find((s) => s.id === id);
}
