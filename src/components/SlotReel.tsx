"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Flag from "./Flag";
import { eligibleSquads, getSquad } from "@/lib/data/squads";
import { nationCode } from "@/lib/nations";
import { useGameStore } from "@/lib/store";
import type { TournamentSquad } from "@/lib/types";

const ITEM_H = 66; // px height of one reel tile
const ROWS = 3; // visible rows (centre row is the payline)
const WINDOW_H = ITEM_H * ROWS;
const REEL_LEN = 44; // tiles per spin
const LANDING = REEL_LEN - 5; // index of the winning tile
const SPIN_MS = 3200;

function Tile({ squad }: { squad: TournamentSquad }) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{ height: ITEM_H }}
    >
      <div
        className="shrink-0 overflow-hidden rounded-[3px] shadow ring-1 ring-black/30"
        style={{ width: 48, height: 32 }}
      >
        <Flag nation={squad.nation} colors={squad.colors} className="h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-base font-black tracking-tight text-white">
          {squad.nation}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-200/60">
          {nationCode(squad.nation)} · {squad.year}
        </span>
      </div>
    </div>
  );
}

export default function SlotReel() {
  const minYear = useGameStore((s) => s.settings.minYear);
  const spinSeq = useGameStore((s) => s.spinSeq);
  const spinTargetId = useGameStore((s) => s.spinTargetId);
  const isSpinning = useGameStore((s) => s.isSpinning);
  const completeSpin = useGameStore((s) => s.completeSpin);

  // The strip of tiles for this spin. The winning squad is fixed at LANDING;
  // every other tile is a random eligible squad for visual variety.
  const reel = useMemo<TournamentSquad[]>(() => {
    const pool = eligibleSquads(minYear);
    if (pool.length === 0) return [];
    const target = spinTargetId ? getSquad(spinTargetId) : undefined;
    const arr: TournamentSquad[] = [];
    for (let i = 0; i < REEL_LEN; i++) {
      if (target && i === LANDING) arr.push(target);
      else arr.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinSeq, minYear]);

  // translateY that centres reel index k on the payline.
  const centerY = (k: number) => (1 - k) * ITEM_H;
  const hasSpun = spinSeq > 0 && Boolean(spinTargetId);
  const targetY = centerY(hasSpun ? LANDING : 1);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[min(86vw,360px)]">
        {/* Cabinet */}
        <div className="rounded-2xl border-4 border-gold/50 bg-gradient-to-b from-pitch-light to-pitch-dark p-2 shadow-[0_0_40px_rgba(245,197,66,0.15)]">
          {/* Bulb strip */}
          <div className="mb-2 flex justify-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-gold"
                animate={{ opacity: isSpinning ? [0.3, 1, 0.3] : 0.5 }}
                transition={{ duration: 0.6, repeat: isSpinning ? Infinity : 0, delay: i * 0.08 }}
              />
            ))}
          </div>

          {/* Reel window */}
          <div className="relative overflow-hidden rounded-lg bg-black/40" style={{ height: WINDOW_H }}>
            {reel.length > 0 && (
              <motion.div
                key={spinSeq}
                initial={{ y: centerY(1) }}
                animate={{ y: targetY }}
                transition={
                  hasSpun
                    ? { duration: SPIN_MS / 1000, ease: [0.16, 1, 0.3, 1] }
                    : { duration: 0 }
                }
                onAnimationComplete={() => {
                  if (isSpinning) completeSpin();
                }}
              >
                {reel.map((squad, i) => (
                  <Tile key={`${spinSeq}-${i}`} squad={squad} />
                ))}
              </motion.div>
            )}

            {/* Fade masks top & bottom */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[33%] bg-gradient-to-b from-pitch-dark to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[33%] bg-gradient-to-t from-pitch-dark to-transparent" />

            {/* Payline frame */}
            <div
              className="pointer-events-none absolute inset-x-0 z-10 border-y-2 border-gold/80"
              style={{ top: ITEM_H, height: ITEM_H }}
            />
            {/* Payline pointers */}
            <div
              className="pointer-events-none absolute left-0 z-10 -translate-y-1/2"
              style={{ top: ITEM_H + ITEM_H / 2 }}
            >
              <div className="h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-gold" />
            </div>
            <div
              className="pointer-events-none absolute right-0 z-10 -translate-y-1/2"
              style={{ top: ITEM_H + ITEM_H / 2 }}
            >
              <div className="h-0 w-0 border-y-[7px] border-r-[10px] border-y-transparent border-r-gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
