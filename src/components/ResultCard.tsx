"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "./Confetti";
import TournamentBracket from "./TournamentBracket";
import ShareModal from "./ShareModal";
import { useGameStore } from "@/lib/store";
import { buildSharePayload, encodeShare, resultHeadline } from "@/lib/share";
import type { MatchResult } from "@/lib/types";

function scoreLabel(m: MatchResult): string {
  const base = `${m.goalsFor}–${m.goalsAgainst}`;
  if (m.wentToPens) return `${base} (pens ${m.pensFor}–${m.pensAgainst})`;
  return base;
}

const OUTCOME_STYLE: Record<MatchResult["outcome"], string> = {
  W: "bg-emerald-500/20 text-emerald-300",
  D: "bg-amber-500/20 text-amber-300",
  L: "bg-rose-500/20 text-rose-300",
};

const ROUND_SHORT: Record<string, string> = {
  "Group Match 1": "Group 1",
  "Group Match 2": "Group 2",
  "Group Match 3": "Group 3",
  "Round of 16": "Round of 16",
  "Quarter-final": "Quarter-final",
  "Semi-final": "Semi-final",
  Final: "Final",
};

/** How long to dwell on a match before moving on — longer if more goals. */
function readTime(m: MatchResult | undefined): number {
  const n = m?.scorers.length ?? 0;
  return Math.min(1100 + n * 430, 3600);
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.4, delayChildren: 0.35 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

/** The dramatic per-match reveal: scoreline plus goalscorers ticking in. */
function MatchDetail({ match, index }: { match: MatchResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-emerald-300/15 bg-black/30 p-5"
    >
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/60">
        {ROUND_SHORT[match.round] ?? match.round}
      </p>

      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="flex-1 text-right text-sm font-bold text-white/80">Your XI</span>
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.15 }}
          className="rounded-lg bg-white/10 px-3 py-1 font-mono text-2xl font-black tabular-nums"
        >
          {match.goalsFor}–{match.goalsAgainst}
        </motion.span>
        <span className="flex-1 text-left text-sm font-bold text-white/80">{match.opponent}</span>
      </div>

      {match.wentToPens && (
        <p className="mt-2 text-center text-xs font-semibold text-amber-300">
          Penalties: {match.pensFor}–{match.pensAgainst}{" "}
          {match.advanced ? "— you go through!" : "— heartbreak."}
        </p>
      )}

      {match.scorers.length > 0 ? (
        <motion.ul
          key={`scorers-${index}`}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="mx-auto mt-4 flex max-w-[240px] flex-col gap-1.5"
        >
          {match.scorers.map((s, i) => (
            <motion.li key={i} variants={itemVariants} className="flex items-center gap-2 text-sm">
              <span className="text-base">⚽</span>
              <span className="w-10 shrink-0 font-mono font-bold tabular-nums text-gold">
                {s.minute}&apos;
              </span>
              <span className="font-semibold">{s.name}</span>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="mt-4 text-center text-sm text-white/40">No goals for your XI.</p>
      )}
    </motion.div>
  );
}

export default function ResultCard() {
  const result = useGameStore((s) => s.result);
  const picks = useGameStore((s) => s.picks);
  const settings = useGameStore((s) => s.settings);
  const reset = useGameStore((s) => s.reset);
  const [shareOpen, setShareOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const total = result?.matches.length ?? 0;

  // Restart the reveal whenever a fresh simulation result arrives.
  useEffect(() => {
    if (!result) return;
    setRevealed(0);
    setDone(false);
  }, [result]);

  // Drive the game-by-game reveal with suspenseful pacing.
  useEffect(() => {
    if (!result || done) return;
    const delay =
      revealed === 0 ? 500 : readTime(result.matches[Math.min(revealed, total) - 1]);
    const t = setTimeout(() => {
      if (revealed < total) setRevealed((r) => r + 1);
      else setDone(true);
    }, delay);
    return () => clearTimeout(t);
  }, [result, revealed, done, total]);

  // Once the run is done, prepare the share URL: a self-contained ?d= link
  // immediately, then upgrade to a short /s/<slug> link if the store is
  // configured. Done ahead of the click so navigator.share keeps its gesture.
  useEffect(() => {
    if (!done || !result) return;
    const origin = window.location.origin;
    const encoded = encodeShare(buildSharePayload(Object.values(picks), result, settings));
    setShareUrl(`${origin}/share?d=${encoded}`);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ d: encoded }),
        });
        if (!res.ok) return;
        const json = (await res.json()) as { slug?: string | null };
        if (!cancelled && json.slug) setShareUrl(`${origin}/s/${json.slug}`);
      } catch {
        /* keep the ?d= fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [done, result, picks, settings]);

  if (!result) return null;

  const h = resultHeadline(result);
  const skip = () => {
    setRevealed(total);
    setDone(true);
  };

  const shareText = [
    `7-0 ⚽ — my all-time World XI`,
    h.title + (result.champions ? " 🏆" : ""),
    `${result.wins}W ${result.draws}D ${result.losses}L · ${result.goalsFor} for, ${result.goalsAgainst} against · rated ${result.teamRating}`,
    result.goldenBoot && result.goldenBoot.goals > 0
      ? `Golden Boot: ${result.goldenBoot.name} (${result.goldenBoot.goals})`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const effectiveShareUrl =
    shareUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/share?d=${encodeShare(buildSharePayload(Object.values(picks), result, settings))}`
      : "");

  const bracketRevealed = done ? total : revealed;
  const currentIndex = done ? null : revealed - 1;
  const currentMatch = revealed > 0 ? result.matches[revealed - 1] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Confetti celebration for a perfect, unbeaten 7-0 */}
      {done && result.perfect && <Confetti />}

      {/* Headline — hidden until the run has fully played out, to keep suspense */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="headline"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className={[
              "rounded-2xl p-5 text-center",
              result.perfect
                ? "bg-gradient-to-br from-gold/30 to-amber-600/10 ring-1 ring-gold"
                : result.champions
                  ? "bg-emerald-500/15 ring-1 ring-emerald-400/40"
                  : "bg-white/5 ring-1 ring-white/10",
            ].join(" ")}
          >
            <h2 className="text-3xl font-black tracking-tight text-gold">{h.title}</h2>
            <p className="mt-1 text-sm text-emerald-100/80">{h.sub}</p>
          </motion.div>
        ) : (
          <motion.div
            key="suspense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200/70">
              {revealed === 0 ? "Kick-off…" : `Match ${Math.min(revealed, total)} of 7`}
            </p>
            <p className="mt-1 text-xs text-white/50">The tournament is unfolding…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tournament structure */}
      <TournamentBracket
        matches={result.matches}
        revealed={bracketRevealed}
        currentIndex={currentIndex}
        champions={result.champions}
        revealDone={done}
        furthestRound={result.furthestRound}
      />

      {!done ? (
        <>
          <AnimatePresence mode="wait">
            {currentMatch && (
              <MatchDetail key={revealed} match={currentMatch} index={revealed - 1} />
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={skip}
            className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/10"
          >
            Skip to result →
          </button>
        </>
      ) : (
        <>
          {/* Stat strip */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { k: "Rating", v: result.teamRating },
              { k: "W-D-L", v: `${result.wins}-${result.draws}-${result.losses}` },
              { k: "GF", v: result.goalsFor },
              { k: "GA", v: result.goalsAgainst },
            ].map((s) => (
              <div key={s.k} className="rounded-lg bg-white/5 py-2">
                <p className="text-base font-black text-white">{s.v}</p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-200/60">{s.k}</p>
              </div>
            ))}
          </div>

          {result.goldenBoot && result.goldenBoot.goals > 0 && (
            <p className="text-center text-sm">
              <span className="text-gold">⚽ Golden Boot:</span>{" "}
              <span className="font-bold">{result.goldenBoot.name}</span> ({result.goldenBoot.goals})
            </p>
          )}

          {/* Match log with goalscorers */}
          <ul className="flex flex-col gap-1.5">
            {result.matches.map((m, i) => (
              <li key={i} className="rounded-lg bg-white/[0.04] px-3 py-2">
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded text-xs font-black ${OUTCOME_STYLE[m.outcome]}`}
                  >
                    {m.outcome}
                  </span>
                  <span className="w-24 shrink-0 text-xs font-semibold text-emerald-200/80">
                    {ROUND_SHORT[m.round] ?? m.round}
                  </span>
                  <span className="flex-1 truncate text-white/70">vs {m.opponent}</span>
                  <span className="font-mono font-bold tabular-nums">{scoreLabel(m)}</span>
                </div>
                {m.scorers.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 pl-9">
                    {m.scorers.map((s, j) => (
                      <span
                        key={j}
                        className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-white/75"
                      >
                        <span className="font-mono text-gold">{s.minute}&apos;</span> {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex-1 rounded-xl bg-gold py-3 font-black text-black transition hover:brightness-105"
            >
              Share result
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 font-bold text-white/80 transition hover:bg-white/10"
            >
              New game
            </button>
          </div>
        </>
      )}

      {shareOpen && (
        <ShareModal
          result={result}
          picks={Object.values(picks)}
          settings={settings}
          shareUrl={effectiveShareUrl}
          shareText={shareText}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
