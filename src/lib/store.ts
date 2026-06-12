"use client";

import { create } from "zustand";
import type {
  GameSettings,
  Pick,
  SimulationResult,
  SquadPlayer,
  TournamentSquad,
} from "./types";
import { getFormation } from "./formations";
import { eligibleSquads, getSquad } from "./data/squads";
import { simulateTournament } from "./simulate";

export type Phase = "setup" | "drafting" | "complete" | "result";

function rerollsFor(difficulty: GameSettings["difficulty"]): number {
  if (difficulty === "easy") return 3;
  if (difficulty === "normal") return 1;
  return 0;
}

interface GameState {
  phase: Phase;
  settings: GameSettings;

  picks: Record<string, Pick>; // keyed by slotId
  rerollsLeft: number;

  // Spin / draft transient state
  isSpinning: boolean;
  spinTargetId: string | null;
  spinSeq: number;
  lastSquadId: string | null;
  currentSquad: TournamentSquad | null;
  pendingPlayer: SquadPlayer | null;
  selectedSlotId: string | null;

  result: SimulationResult | null;

  // actions
  updateSettings: (partial: Partial<GameSettings>) => void;
  startDraft: () => void;
  beginSpin: () => void;
  completeSpin: () => void;
  reroll: () => void;
  selectSlot: (slotId: string | null) => void;
  choosePlayer: (player: SquadPlayer | null) => void;
  assignPick: (player: SquadPlayer, slotId: string) => void;
  movePick: (fromSlotId: string, toSlotId: string) => void;
  eligibleSlotsFor: (player: SquadPlayer) => string[];
  simulate: () => void;
  backToDraft: () => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  formationId: "4-3-3",
  difficulty: "normal",
  showRatings: true,
  ratingMode: "career",
  draftMode: "squad-first",
  minYear: 0,
};

function pickRandomSquadId(minYear: number, excludeId: string | null): string {
  const pool = eligibleSquads(minYear).filter((s) => s.id !== excludeId);
  const list = pool.length > 0 ? pool : eligibleSquads(minYear);
  return list[Math.floor(Math.random() * list.length)].id;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "setup",
  settings: DEFAULT_SETTINGS,

  picks: {},
  rerollsLeft: rerollsFor(DEFAULT_SETTINGS.difficulty),

  isSpinning: false,
  spinTargetId: null,
  spinSeq: 0,
  lastSquadId: null,
  currentSquad: null,
  pendingPlayer: null,
  selectedSlotId: null,

  result: null,

  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  startDraft: () => {
    const { settings } = get();
    set({
      phase: "drafting",
      picks: {},
      rerollsLeft: rerollsFor(settings.difficulty),
      isSpinning: false,
      spinTargetId: null,
      spinSeq: 0,
      lastSquadId: null,
      currentSquad: null,
      pendingPlayer: null,
      selectedSlotId: null,
      result: null,
    });
  },

  beginSpin: () => {
    const { settings, lastSquadId, isSpinning } = get();
    if (isSpinning) return;
    const targetId = pickRandomSquadId(settings.minYear, lastSquadId);
    set((state) => ({
      isSpinning: true,
      spinTargetId: targetId,
      spinSeq: state.spinSeq + 1,
      currentSquad: null,
      pendingPlayer: null,
    }));
  },

  completeSpin: () => {
    const { spinTargetId } = get();
    if (!spinTargetId) return;
    const squad = getSquad(spinTargetId) ?? null;
    set({ isSpinning: false, currentSquad: squad, lastSquadId: spinTargetId });
  },

  reroll: () => {
    const { rerollsLeft, isSpinning, currentSquad } = get();
    if (rerollsLeft <= 0 || isSpinning || !currentSquad) return;
    set((state) => ({ rerollsLeft: state.rerollsLeft - 1 }));
    get().beginSpin();
  },

  selectSlot: (slotId) => set({ selectedSlotId: slotId }),

  choosePlayer: (player) => set({ pendingPlayer: player }),

  eligibleSlotsFor: (player) => {
    const { settings, picks } = get();
    const formation = getFormation(settings.formationId);
    return formation.slots
      .filter((s) => !picks[s.id] && player.positions.includes(s.role))
      .map((s) => s.id);
  },

  assignPick: (player, slotId) => {
    const { currentSquad, settings, picks } = get();
    if (!currentSquad || picks[slotId]) return;
    // A player can only appear in the XI once.
    if (Object.values(picks).some((pk) => pk.player.name === player.name)) return;
    const formation = getFormation(settings.formationId);
    const slot = formation.slots.find((s) => s.id === slotId);
    if (!slot || !player.positions.includes(slot.role)) return;

    const pick: Pick = {
      slotId,
      player,
      squadId: currentSquad.id,
      squadLabel: currentSquad.label,
      nation: currentSquad.nation,
      year: currentSquad.year,
    };
    const nextPicks = { ...picks, [slotId]: pick };
    const filled = Object.keys(nextPicks).length;
    const total = formation.slots.length;

    set({
      picks: nextPicks,
      currentSquad: null,
      pendingPlayer: null,
      selectedSlotId: null,
      spinTargetId: null,
      phase: filled >= total ? "complete" : "drafting",
    });
  },

  movePick: (fromSlotId, toSlotId) =>
    set((state) => {
      const pick = state.picks[fromSlotId];
      if (!pick || fromSlotId === toSlotId || state.picks[toSlotId]) return state;
      const formation = getFormation(state.settings.formationId);
      const toSlot = formation.slots.find((s) => s.id === toSlotId);
      if (!toSlot || !pick.player.positions.includes(toSlot.role)) return state;
      const next = { ...state.picks };
      delete next[fromSlotId];
      next[toSlotId] = { ...pick, slotId: toSlotId };
      return { picks: next };
    }),

  simulate: () => {
    const { picks, settings } = get();
    const list = Object.values(picks);
    const result = simulateTournament(list, settings);
    set({ result, phase: "result" });
  },

  backToDraft: () =>
    set((state) => ({
      phase: Object.keys(state.picks).length >= getFormation(state.settings.formationId).slots.length
        ? "complete"
        : "drafting",
      result: null,
    })),

  reset: () =>
    set({
      phase: "setup",
      picks: {},
      currentSquad: null,
      pendingPlayer: null,
      selectedSlotId: null,
      spinTargetId: null,
      isSpinning: false,
      result: null,
    }),
}));
