// Core data model for 7-0 — the all-time World Finals XI draft game.
// All ratings and squad data are editorial estimates used for descriptive,
// nostalgic and gameplay purposes only (see rating-rubric.md).

export type Position =
  | "GK"
  | "RB"
  | "CB"
  | "LB"
  | "CDM"
  | "CM"
  | "CAM"
  | "RM"
  | "LM"
  | "RW"
  | "LW"
  | "ST";

export type Era =
  | "1950s"
  | "1960s"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

/** A single player as they were during one specific tournament. */
export interface SquadPlayer {
  /** Unique within the parent squad, e.g. "pele". */
  id: string;
  name: string;
  /** Slots this player is eligible to fill. */
  positions: Position[];
  /** 0-99 rating for THIS tournament ("career season" mode). */
  rating: number;
  /** 0-99 career-best rating ("prime" mode). Always >= rating. */
  prime: number;
  /** Optional flavour: goals scored in the tournament. */
  goals?: number;
}

/** One nation at one tournament, e.g. Brazil 1970. */
export interface TournamentSquad {
  /** Slug id, e.g. "brazil-1970". */
  id: string;
  nation: string;
  year: number;
  /** Editorial label shown to players, e.g. "Brazil — Finals of 1970". */
  label: string;
  era: Era;
  /** Editorial finish, e.g. "Champions", "Runners-up". */
  finish: string;
  colors: { primary: string; secondary: string };
  players: SquadPlayer[];
}

/** A position on the pitch within a chosen formation. */
export interface FormationSlot {
  /** Unique slot id within the formation, e.g. "CB1". */
  id: string;
  role: Position;
  /** Short label shown in the slot, e.g. "CB". */
  label: string;
  /** Pitch coordinates, 0-100 (x = left→right, y = own goal→opp goal). */
  x: number;
  y: number;
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  slots: FormationSlot[];
}

export type Difficulty = "easy" | "normal" | "hard";
export type RatingMode = "career" | "prime";
export type DraftMode = "squad-first" | "position-first";

export interface GameSettings {
  formationId: string;
  difficulty: Difficulty;
  showRatings: boolean;
  ratingMode: RatingMode;
  draftMode: DraftMode;
  /** Minimum tournament year that can be spun (era filter). */
  minYear: number;
}

/** A player drafted into a specific slot. */
export interface Pick {
  slotId: string;
  player: SquadPlayer;
  squadId: string;
  squadLabel: string;
  nation: string;
  year: number;
}

export interface Scorer {
  /** Player name. */
  name: string;
  /** Minute scored (1-90 regulation, 91-120 extra time). */
  minute: number;
}

export interface MatchResult {
  round: string;
  opponent: string;
  goalsFor: number;
  goalsAgainst: number;
  outcome: "W" | "D" | "L";
  knockout: boolean;
  wentToPens: boolean;
  pensFor?: number;
  pensAgainst?: number;
  /** Did we advance / survive this match? */
  advanced: boolean;
  /** Our goalscorers with the minute they scored, in chronological order. */
  scorers: Scorer[];
}

export interface SimulationResult {
  matches: MatchResult[];
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  furthestRound: string;
  champions: boolean;
  /** Won the tournament with 7 wins from 7 — the holy grail. */
  perfect: boolean;
  /** Perfect run AND zero goals conceded. */
  cleanSweep: boolean;
  teamRating: number;
  goldenBoot?: { name: string; goals: number };
}
