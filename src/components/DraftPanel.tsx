"use client";

import { useMemo } from "react";
import SlotReel from "./SlotReel";
import { getFormation } from "@/lib/formations";
import { slotAccepts } from "@/lib/positions";
import { useGameStore } from "@/lib/store";
import { displayRating, ratingColor, ratingTextColor, POSITION_FULL } from "@/lib/ui";
import type { Position, SquadPlayer } from "@/lib/types";

export default function DraftPanel() {
  const settings = useGameStore((s) => s.settings);
  const picks = useGameStore((s) => s.picks);
  const rerollsLeft = useGameStore((s) => s.rerollsLeft);
  const isSpinning = useGameStore((s) => s.isSpinning);
  const currentSquad = useGameStore((s) => s.currentSquad);
  const pendingPlayer = useGameStore((s) => s.pendingPlayer);
  const selectedSlotId = useGameStore((s) => s.selectedSlotId);
  const beginSpin = useGameStore((s) => s.beginSpin);
  const reroll = useGameStore((s) => s.reroll);
  const choosePlayer = useGameStore((s) => s.choosePlayer);
  const assignPick = useGameStore((s) => s.assignPick);

  const formation = getFormation(settings.formationId);
  const filled = Object.keys(picks).length;
  const total = formation.slots.length;

  const openSlots = useMemo(
    () => formation.slots.filter((s) => !picks[s.id]),
    [formation, picks],
  );

  // One placement option per open role (first open slot of each role).
  const placementSlots = useMemo(() => {
    const seen = new Set<string>();
    return openSlots.filter((s) => {
      if (seen.has(s.role)) return false;
      seen.add(s.role);
      return true;
    });
  }, [openSlots]);

  // Names already in the XI — a player can only be drafted once.
  const draftedNames = useMemo(
    () => new Set(Object.values(picks).map((p) => p.player.name)),
    [picks],
  );

  const selectedSlot = formation.slots.find((s) => s.id === selectedSlotId);
  const positionFirst = settings.draftMode === "position-first";

  function isEligible(player: SquadPlayer): boolean {
    if (draftedNames.has(player.name)) return false;
    if (positionFirst) {
      return selectedSlot ? slotAccepts(selectedSlot.role, player.positions) : false;
    }
    return openSlots.some((s) => slotAccepts(s.role, player.positions));
  }

  const noFit = Boolean(
    currentSquad && !isSpinning && !currentSquad.players.some(isEligible),
  );

  function handlePlayer(player: SquadPlayer) {
    if (!isEligible(player)) return;
    if (positionFirst && selectedSlot) {
      assignPick(player, selectedSlot.id);
    } else {
      choosePlayer(pendingPlayer?.id === player.id ? null : player);
    }
  }

  const canSpin = !isSpinning && (!positionFirst || Boolean(selectedSlot)) && !currentSquad;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-300/15 bg-black/25 p-4 backdrop-blur">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gold">
          {filled}/{total} drafted
        </span>
        <span className="text-emerald-200/70">
          {rerollsLeft} reroll{rerollsLeft === 1 ? "" : "s"} left
        </span>
      </div>

      <SlotReel />

      {/* Controls */}
      {!currentSquad && (
        <div className="flex flex-col items-center gap-2">
          {positionFirst && !selectedSlot && (
            <p className="text-center text-xs text-amber-300/80">
              Pick an empty position on the pitch, then spin.
            </p>
          )}
          <button
            type="button"
            disabled={!canSpin}
            onClick={beginSpin}
            className="w-full rounded-xl bg-gold py-3 text-base font-black text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSpinning ? "Spinning…" : "SPIN THE REELS"}
          </button>
        </div>
      )}

      {/* Landed squad */}
      {currentSquad && !isSpinning && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black">{currentSquad.label}</p>
              <p className="text-xs text-emerald-200/70">{currentSquad.finish}</p>
            </div>
            {rerollsLeft > 0 && (
              <button
                type="button"
                onClick={reroll}
                className="rounded-lg border border-gold/50 px-3 py-1 text-xs font-bold text-gold transition hover:bg-gold/10"
              >
                Reroll
              </button>
            )}
          </div>

          {noFit ? (
            <div className="flex flex-col items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-center">
              <p className="text-xs text-amber-200">
                No player here fits your open positions.
              </p>
              <button
                type="button"
                onClick={beginSpin}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-black text-black"
              >
                Spin again (free)
              </button>
            </div>
          ) : pendingPlayer && !positionFirst ? (
            <PlacePanel
              player={pendingPlayer}
              slots={placementSlots}
              onPlace={(slotId) => assignPick(pendingPlayer, slotId)}
              onCancel={() => choosePlayer(null)}
            />
          ) : (
            <>
              <p className="text-xs text-emerald-200/60">
                {positionFirst
                  ? `Pick a player for ${selectedSlot?.label}.`
                  : "Tap a player to draft them."}
              </p>
              <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto scroll-slim pr-1">
                {currentSquad.players.map((p) => {
                  const eligible = isEligible(p);
                  const drafted = draftedNames.has(p.name);
                  const selected = pendingPlayer?.id === p.id;
                  const r = displayRating(p, settings.ratingMode);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        disabled={!eligible}
                        onClick={() => handlePlayer(p)}
                        className={[
                          "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition",
                          selected
                            ? "bg-gold/20 ring-1 ring-gold"
                            : eligible
                              ? "bg-white/5 hover:bg-white/10"
                              : "opacity-35",
                        ].join(" ")}
                      >
                        {settings.showRatings && (
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-black"
                            style={{ backgroundColor: ratingColor(r), color: ratingTextColor(r) }}
                          >
                            {r}
                          </span>
                        )}
                        <span className="flex-1 text-sm font-semibold">{p.name}</span>
                        <span
                          className={[
                            "text-[10px] font-medium uppercase tracking-wide",
                            drafted ? "text-emerald-300" : "text-emerald-200/60",
                          ].join(" ")}
                        >
                          {drafted ? "✓ picked" : p.positions.join(" · ")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PlacePanel({
  player,
  slots,
  onPlace,
  onCancel,
}: {
  player: SquadPlayer;
  slots: { id: string; role: Position; label: string }[];
  onPlace: (slotId: string) => void;
  onCancel: () => void;
}) {
  const available = slots.filter((s) => slotAccepts(s.role, player.positions));
  const unavailable = slots.filter((s) => !slotAccepts(s.role, player.positions));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">
          Place <span className="text-gold">{player.name}</span>
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-3 py-1 text-xs font-bold text-white/70 transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>

      {available.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
            Available ({available.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPlace(s.id)}
                className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-bold text-white shadow transition hover:bg-red-500"
              >
                {POSITION_FULL[s.role]} ({s.label})
              </button>
            ))}
          </div>
        </div>
      )}

      {unavailable.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Unavailable
          </p>
          <div className="flex flex-wrap gap-2">
            {unavailable.map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white/30"
              >
                {s.label} · N/A
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-emerald-200/50">
        Or tap a highlighted position on the pitch.
      </p>
    </div>
  );
}
