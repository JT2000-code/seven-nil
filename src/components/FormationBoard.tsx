"use client";

import { useEffect, useMemo, useState } from "react";
import { getFormation } from "@/lib/formations";
import { slotAccepts } from "@/lib/positions";
import { useGameStore } from "@/lib/store";
import { displayRating, ratingColor, ratingTextColor } from "@/lib/ui";

function shortName(name: string): string {
  const parts = name.split(" ");
  return parts.length > 1 && name.length > 11 ? parts[parts.length - 1] : name;
}

export default function FormationBoard() {
  const phase = useGameStore((s) => s.phase);
  const settings = useGameStore((s) => s.settings);
  const picks = useGameStore((s) => s.picks);
  const pendingPlayer = useGameStore((s) => s.pendingPlayer);
  const selectedSlotId = useGameStore((s) => s.selectedSlotId);
  const assignPick = useGameStore((s) => s.assignPick);
  const selectSlot = useGameStore((s) => s.selectSlot);
  const movePick = useGameStore((s) => s.movePick);

  const formation = getFormation(settings.formationId);

  // The pitch is display-only once the tournament has been simulated.
  const editable = phase !== "result";

  // A placed player can be "picked up" and moved to another eligible slot —
  // they are never removed from the team.
  const [movingSlotId, setMovingSlotId] = useState<string | null>(null);
  const movingPlayer = movingSlotId ? (picks[movingSlotId]?.player ?? null) : null;

  // Whichever player is currently being placed drives the highlighted slots.
  const subject = movingPlayer ?? pendingPlayer;

  // A fresh spin takes priority over any in-progress move.
  useEffect(() => {
    if (pendingPlayer) setMovingSlotId(null);
  }, [pendingPlayer]);

  const eligibleSlots = useMemo(() => {
    if (!subject) return new Set<string>();
    return new Set(
      formation.slots
        .filter((s) => !picks[s.id] && slotAccepts(s.role, subject.positions))
        .map((s) => s.id),
    );
  }, [subject, picks, formation]);

  function handleSlotClick(slotId: string, filled: boolean) {
    if (!editable) return;
    if (filled) {
      // Pick the player up to move them — tapping again puts them back down.
      setMovingSlotId((prev) => (prev === slotId ? null : slotId));
      selectSlot(null);
      return;
    }
    if (movingSlotId && eligibleSlots.has(slotId)) {
      movePick(movingSlotId, slotId);
      setMovingSlotId(null);
      return;
    }
    if (settings.draftMode === "position-first") {
      selectSlot(selectedSlotId === slotId ? null : slotId);
      return;
    }
    if (pendingPlayer && eligibleSlots.has(slotId)) {
      assignPick(pendingPlayer, slotId);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="@container relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-2xl border border-emerald-300/15 bg-gradient-to-b from-pitch-light to-pitch-dark shadow-2xl"
        style={{ maxWidth: phase === "result" ? "660px" : "520px" }}
      >
        {/* Pitch markings */}
        <div className="pointer-events-none absolute inset-0">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 h-[14.28%] odd:bg-white/[0.02]"
              style={{ top: `${i * 14.28}%` }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
            style={{ width: "26cqw", height: "26cqw" }}
          />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/15" />
          <div className="absolute left-1/2 top-0 h-[15%] w-[46%] -translate-x-1/2 border border-t-0 border-white/12" />
          <div className="absolute bottom-0 left-1/2 h-[15%] w-[46%] -translate-x-1/2 border border-b-0 border-white/12" />
        </div>

        {formation.slots.map((slot) => {
          const pick = picks[slot.id];
          const filled = Boolean(pick);
          const eligible = eligibleSlots.has(slot.id);
          const isSelected = selectedSlotId === slot.id;
          const isMoving = movingSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => handleSlotClick(slot.id, filled)}
              className={[
                "group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none",
                editable ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
              style={{ left: `${slot.x}%`, top: `${100 - slot.y}%` }}
              aria-label={filled ? `${pick.player.name} (${slot.label})` : `Empty ${slot.label}`}
            >
              {filled ? (
                <div className="flex flex-col items-center gap-0.5" style={{ width: "17cqw" }}>
                  <div
                    className={[
                      "flex items-center justify-center rounded-full font-black shadow-md ring-2 transition",
                      isMoving ? "ring-gold pulse-gold" : "ring-black/30",
                    ].join(" ")}
                    style={{
                      width: "9cqw",
                      height: "9cqw",
                      fontSize: "3.1cqw",
                      backgroundColor: ratingColor(displayRating(pick.player, settings.ratingMode)),
                      color: ratingTextColor(displayRating(pick.player, settings.ratingMode)),
                    }}
                  >
                    {settings.showRatings
                      ? displayRating(pick.player, settings.ratingMode)
                      : slot.label}
                  </div>
                  <span
                    className="truncate rounded bg-black/55 px-1 font-semibold leading-tight text-white"
                    style={{ fontSize: "2.5cqw", maxWidth: "17cqw" }}
                  >
                    {shortName(pick.player.name)}
                  </span>
                  <span
                    className="font-medium uppercase tracking-wide text-emerald-200/70"
                    style={{ fontSize: "1.9cqw" }}
                  >
                    {pick.nation} {String(pick.year).slice(2)}
                  </span>
                </div>
              ) : (
                <div
                  className={[
                    "flex items-center justify-center rounded-full border-2 border-dashed font-bold transition",
                    eligible
                      ? "border-gold bg-gold/20 text-gold pulse-gold"
                      : isSelected
                        ? "border-gold bg-gold/30 text-gold"
                        : "border-white/30 bg-black/20 text-white/60 group-hover:border-white/60",
                  ].join(" ")}
                  style={{ width: "9cqw", height: "9cqw", fontSize: "2.7cqw" }}
                >
                  {slot.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {editable && movingPlayer && (
        <p className="text-center text-xs text-gold">
          Moving {shortName(movingPlayer.name)} — tap a highlighted position, or tap again to
          cancel.
        </p>
      )}
    </div>
  );
}
