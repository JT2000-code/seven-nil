"use client";

import { motion } from "framer-motion";
import type { MatchResult } from "@/lib/types";

interface Props {
  matches: MatchResult[];
  /** Number of matches revealed so far (group + knockout, in order). */
  revealed: number;
  /** Index of the match currently being revealed, for highlight. */
  currentIndex: number | null;
  champions: boolean;
  /** Reveal the final champion/elimination node (kept hidden during suspense). */
  revealDone: boolean;
  furthestRound: string;
}

const KO_ROUNDS = [
  { label: "R16", full: "Round of 16", idx: 3 },
  { label: "QF", full: "Quarter-final", idx: 4 },
  { label: "SF", full: "Semi-final", idx: 5 },
  { label: "F", full: "Final", idx: 6 },
];

function scoreText(m: MatchResult): string {
  const base = `${m.goalsFor}–${m.goalsAgainst}`;
  if (m.wentToPens) return `${base} (${m.pensFor}–${m.pensAgainst}p)`;
  return base;
}

function GroupPill({
  match,
  shown,
  current,
  label,
}: {
  match?: MatchResult;
  shown: boolean;
  current: boolean;
  label: string;
}) {
  const color = !match
    ? "border-white/10 text-white/40"
    : match.outcome === "W"
      ? "border-emerald-400/50 text-emerald-200"
      : match.outcome === "D"
        ? "border-amber-400/50 text-amber-200"
        : "border-rose-400/50 text-rose-200";
  return (
    <motion.div
      animate={{ opacity: shown ? 1 : 0.35, scale: current ? 1.04 : 1 }}
      transition={{ duration: 0.35 }}
      className={[
        "flex flex-1 flex-col items-center rounded-lg border bg-black/30 px-1 py-1.5 text-center",
        shown ? color : "border-white/10 text-white/40",
        current ? "ring-2 ring-gold" : "",
      ].join(" ")}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-sm font-black tabular-nums">
        {shown && match ? `${match.goalsFor}–${match.goalsAgainst}` : "—"}
      </span>
    </motion.div>
  );
}

function KnockoutNode({
  match,
  label,
  full,
  shown,
  current,
  locked,
}: {
  match?: MatchResult;
  label: string;
  full: string;
  shown: boolean;
  current: boolean;
  locked: boolean;
}) {
  const accent =
    locked || !match
      ? "border-l-white/10"
      : !shown
        ? "border-l-white/15"
        : match.advanced
          ? "border-l-emerald-400"
          : "border-l-rose-400";

  return (
    <motion.div
      animate={{
        opacity: locked ? 0.3 : shown ? 1 : 0.4,
        scale: current ? 1.03 : 1,
      }}
      transition={{ duration: 0.35 }}
      className={[
        "flex items-center gap-3 rounded-lg border border-white/10 border-l-4 bg-black/30 px-3 py-2",
        accent,
        current ? "ring-2 ring-gold pulse-gold" : "",
      ].join(" ")}
    >
      <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-white/10 text-[11px] font-black text-white/80">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">
          {shown && match ? `vs ${match.opponent}` : locked ? "—" : full}
        </span>
        {shown && match?.wentToPens && (
          <span className="text-[10px] text-amber-300/80">decided on penalties</span>
        )}
      </div>
      <span
        className={[
          "shrink-0 font-mono text-sm font-black tabular-nums",
          shown && match ? "text-white" : "text-white/40",
        ].join(" ")}
      >
        {shown && match ? scoreText(match) : "—"}
      </span>
    </motion.div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="flex h-4 justify-center">
      <div className={`w-0.5 ${active ? "bg-emerald-400/60" : "bg-white/15"}`} />
    </div>
  );
}

export default function TournamentBracket({
  matches,
  revealed,
  currentIndex,
  champions,
  revealDone,
  furthestRound,
}: Props) {
  return (
    <div className="rounded-2xl border border-emerald-300/15 bg-black/20 p-4">
      <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/60">
        Road to glory
      </h3>

      {/* Group stage */}
      <div className="mb-1">
        <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-white/40">
          Group stage
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <GroupPill
              key={i}
              match={matches[i]}
              shown={i < revealed}
              current={i === currentIndex}
              label={`G${i + 1}`}
            />
          ))}
        </div>
      </div>

      <Connector active={revealed > 3 && matches.length > 3} />

      {/* Knockout ladder */}
      <div className="flex flex-col">
        {KO_ROUNDS.map((r, i) => {
          const reached = r.idx < matches.length;
          const shown = r.idx < revealed && reached;
          const locked = revealDone && !reached;
          return (
            <div key={r.label}>
              {i > 0 && (
                <Connector
                  active={shown && (matches[r.idx]?.advanced ?? false)}
                />
              )}
              <KnockoutNode
                match={matches[r.idx]}
                label={r.label}
                full={r.full}
                shown={shown}
                current={r.idx === currentIndex}
                locked={locked}
              />
            </div>
          );
        })}
      </div>

      <Connector active={revealDone && champions} />

      {/* Champion node */}
      <motion.div
        animate={{ opacity: revealDone ? 1 : 0.3, scale: revealDone && champions ? 1 : 0.98 }}
        transition={{ duration: 0.4 }}
        className={[
          "flex items-center justify-center gap-2 rounded-xl py-3 text-center",
          revealDone && champions
            ? "bg-gradient-to-br from-gold/30 to-amber-600/10 ring-1 ring-gold"
            : revealDone
              ? "bg-rose-500/10 ring-1 ring-rose-400/30"
              : "bg-white/5 ring-1 ring-white/10",
        ].join(" ")}
      >
        <span className="text-xl">{revealDone && champions ? "🏆" : "🏁"}</span>
        <span
          className={[
            "text-sm font-black uppercase tracking-wider",
            revealDone && champions ? "text-gold" : "text-white/70",
          ].join(" ")}
        >
          {!revealDone
            ? "Final destination"
            : champions
              ? "World Champions"
              : `Out in the ${furthestRound}`}
        </span>
      </motion.div>
    </div>
  );
}
