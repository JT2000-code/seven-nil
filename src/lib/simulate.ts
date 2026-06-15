import type {
  Difficulty,
  GameSettings,
  MatchResult,
  Pick,
  Position,
  RatingMode,
  Scorer,
  SimulationResult,
} from "./types";
import { hashString, mulberry32, poisson } from "./rng";

interface RoundDef {
  name: string;
  opp: number;
  knockout: boolean;
}

const ROUNDS: RoundDef[] = [
  { name: "Group Match 1", opp: 73, knockout: false },
  { name: "Group Match 2", opp: 76, knockout: false },
  { name: "Group Match 3", opp: 78, knockout: false },
  { name: "Round of 16", opp: 80, knockout: true },
  { name: "Quarter-final", opp: 83, knockout: true },
  { name: "Semi-final", opp: 86, knockout: true },
  { name: "Final", opp: 89, knockout: true },
];

const DIFFICULTY_MOD: Record<Difficulty, number> = {
  easy: -3,
  normal: 0,
  hard: 4,
};

const OPPONENT_POOL = [
  "Spain", "Germany", "Brazil", "Argentina", "France", "Italy", "England",
  "Netherlands", "Portugal", "Uruguay", "Belgium", "Croatia", "Mexico",
  "Nigeria", "Japan", "Colombia", "Denmark", "Sweden", "Ghana", "Morocco",
];

// The Final should pit you against a realistic heavyweight — the nations that
// have actually contested World Cup finals, ranked by appearances.
const FINALIST_POOL = [
  "Germany", "Brazil", "Italy", "Argentina", "France",
  "Netherlands", "Uruguay", "England", "Spain", "Croatia",
];

const ATTACK_WEIGHT: Record<Position, number> = {
  ST: 6, RW: 4.2, LW: 4.2, CAM: 3.4, RM: 2.2, LM: 2.2,
  CM: 1.3, CDM: 0.5, CB: 0.22, RB: 0.3, LB: 0.3, GK: 0.02,
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Average rating of the chosen XI for the active rating mode. */
export function teamRating(picks: Pick[], mode: RatingMode): number {
  if (picks.length === 0) return 0;
  const sum = picks.reduce(
    (acc, p) => acc + (mode === "prime" ? p.player.prime : p.player.rating),
    0,
  );
  return Math.round(sum / picks.length);
}

function shuffle(arr: readonly string[], rng: () => number): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOpponents(rng: () => number): string[] {
  // Every round before the Final draws from the broad pool…
  const early = shuffle(OPPONENT_POOL, rng).slice(0, ROUNDS.length - 1);
  // …and the Final draws an elite finalist nation, never repeating an opponent.
  const used = new Set(early);
  const finalOpp =
    shuffle(FINALIST_POOL, rng).find((n) => !used.has(n)) ?? FINALIST_POOL[0];
  return [...early, finalOpp];
}

function shootout(rng: () => number, edge: number): { us: number; them: number } {
  const pUs = clamp(0.75 + edge * 0.1, 0.55, 0.92);
  const pThem = clamp(0.75 - edge * 0.1, 0.55, 0.92);
  let us = 0;
  let them = 0;
  for (let i = 0; i < 5; i++) {
    if (rng() < pUs) us++;
    if (rng() < pThem) them++;
  }
  let guard = 0;
  while (us === them && guard < 20) {
    if (rng() < pUs) us++;
    if (rng() < pThem) them++;
    guard++;
  }
  if (us === them) us++; // safety: never tie
  return { us, them };
}

function attackWeights(picks: Pick[]): number[] {
  return picks.map((p) => {
    const slotRole = (p.slotId.replace(/\d+$/, "") as Position) || p.player.positions[0];
    const base = ATTACK_WEIGHT[slotRole] ?? 1;
    return base * Math.pow(p.player.rating / 75, 2);
  });
}

function pickScorerName(
  picks: Pick[],
  weights: number[],
  totalWeight: number,
  rng: () => number,
): string {
  let r = rng() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return picks[i].player.name;
  }
  return picks[picks.length - 1].player.name;
}

/** Assign each goal a scorer and a minute, sorted chronologically. */
function buildScorers(
  picks: Pick[],
  weights: number[],
  totalWeight: number,
  regGoals: number,
  etGoals: number,
  rng: () => number,
): Scorer[] {
  const scorers: Scorer[] = [];
  for (let g = 0; g < regGoals; g++) {
    scorers.push({
      name: pickScorerName(picks, weights, totalWeight, rng),
      minute: 1 + Math.floor(rng() * 90),
    });
  }
  for (let g = 0; g < etGoals; g++) {
    scorers.push({
      name: pickScorerName(picks, weights, totalWeight, rng),
      minute: 91 + Math.floor(rng() * 30),
    });
  }
  return scorers.sort((a, b) => a.minute - b.minute);
}

/**
 * Simulate a full 7-match tournament run for a completed XI.
 * Deterministic: the same XI + settings always yields the same result.
 */
export function simulateTournament(
  picks: Pick[],
  settings: GameSettings,
): SimulationResult {
  const rating = teamRating(picks, settings.ratingMode);
  const seedKey =
    picks
      .map((p) => p.player.id)
      .sort()
      .join("|") +
    `::${settings.formationId}:${settings.difficulty}:${settings.ratingMode}`;
  const rng = mulberry32(hashString(seedKey));
  const opponents = pickOpponents(rng);
  const weights = attackWeights(picks);
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

  const matches: MatchResult[] = [];
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let totalFor = 0;
  let totalAgainst = 0;
  let furthestRound = ROUNDS[0].name;
  let champions = false;
  let eliminated = false;

  for (let i = 0; i < ROUNDS.length; i++) {
    const round = ROUNDS[i];
    const oppRating = round.opp + DIFFICULTY_MOD[settings.difficulty];
    const diff = rating - oppRating;

    const lambdaFor = clamp(1.35 + diff * 0.08, 0.25, 5.5);
    const lambdaAgainst = clamp(1.25 - diff * 0.08, 0.12, 4.5);

    let gf = poisson(lambdaFor, rng);
    let ga = poisson(lambdaAgainst, rng);
    const regGf = gf;
    let etGf = 0;

    let wentToPens = false;
    let pensFor: number | undefined;
    let pensAgainst: number | undefined;
    let outcome: MatchResult["outcome"];
    let advanced: boolean;

    if (!round.knockout) {
      outcome = gf > ga ? "W" : gf === ga ? "D" : "L";
      advanced = true; // group games are always played out
    } else {
      if (gf === ga) {
        // Extra time
        etGf = poisson(clamp(0.4 + diff * 0.03, 0.05, 1.5), rng);
        ga += poisson(clamp(0.35 - diff * 0.03, 0.03, 1.2), rng);
        gf += etGf;
      }
      if (gf > ga) {
        outcome = "W";
        advanced = true;
      } else if (gf < ga) {
        outcome = "L";
        advanced = false;
      } else {
        // Penalty shootout — a pens win counts as a DRAW (keeps you unbeaten
        // but is NOT a clean win, so it breaks a perfect 7-0).
        wentToPens = true;
        const { us, them } = shootout(rng, diff / 15);
        pensFor = us;
        pensAgainst = them;
        outcome = "D";
        advanced = us > them;
      }
    }

    const scorers = buildScorers(picks, weights, totalWeight, regGf, etGf, rng);

    totalFor += gf;
    totalAgainst += ga;
    if (outcome === "W") wins++;
    else if (outcome === "D") draws++;
    else losses++;

    matches.push({
      round: round.name,
      opponent: opponents[i],
      goalsFor: gf,
      goalsAgainst: ga,
      outcome,
      knockout: round.knockout,
      wentToPens,
      pensFor,
      pensAgainst,
      advanced,
      scorers,
    });

    furthestRound = round.name;

    if (round.knockout && !advanced) {
      eliminated = true;
      break;
    }
    if (i === ROUNDS.length - 1 && advanced) {
      champions = true;
    }
  }

  if (champions) furthestRound = "Champions";

  const perfect = champions && wins === ROUNDS.length;
  const cleanSweep = perfect && totalAgainst === 0;

  const bootTally = new Map<string, number>();
  for (const m of matches) {
    for (const s of m.scorers) {
      bootTally.set(s.name, (bootTally.get(s.name) ?? 0) + 1);
    }
  }
  let goldenBoot: SimulationResult["goldenBoot"];
  for (const [name, goals] of bootTally) {
    if (!goldenBoot || goals > goldenBoot.goals) goldenBoot = { name, goals };
  }

  return {
    matches,
    wins,
    draws,
    losses,
    goalsFor: totalFor,
    goalsAgainst: totalAgainst,
    furthestRound,
    champions,
    perfect,
    cleanSweep,
    teamRating: rating,
    goldenBoot,
    // eliminated is implied by !champions && a knockout loss; kept internal.
  } satisfies SimulationResult;
}
