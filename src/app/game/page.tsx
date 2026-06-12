"use client";

import Link from "next/link";
import Bunting from "@/components/Bunting";
import FormationBoard from "@/components/FormationBoard";
import DraftPanel from "@/components/DraftPanel";
import SetupPanel from "@/components/SetupPanel";
import ResultCard from "@/components/ResultCard";
import { useGameStore } from "@/lib/store";
import { teamRating } from "@/lib/simulate";

function ReadyPanel() {
  const picks = useGameStore((s) => s.picks);
  const settings = useGameStore((s) => s.settings);
  const simulate = useGameStore((s) => s.simulate);
  const rating = teamRating(Object.values(picks), settings.ratingMode);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-300/15 bg-black/25 p-6 text-center backdrop-blur">
      <div>
        <p className="text-sm uppercase tracking-wider text-emerald-200/60">Squad rating</p>
        <p className="text-5xl font-black text-gold">{rating}</p>
      </div>
      <p className="text-sm text-emerald-100/70">
        Your XI is complete. Simulate three group games and a four-round knockout —
        and find out if you can go a perfect 7-0.
      </p>
      <button
        type="button"
        onClick={simulate}
        className="w-full rounded-xl bg-gold py-4 text-lg font-black text-black transition hover:brightness-105"
      >
        Simulate the tournament →
      </button>
      <p className="text-xs text-emerald-200/50">
        Tap any player on the pitch to swap them out.
      </p>
    </div>
  );
}

export default function GamePage() {
  const phase = useGameStore((s) => s.phase);
  const reset = useGameStore((s) => s.reset);

  return (
    <div className="flex flex-1 flex-col">
      <Bunting />
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-black tracking-tight text-gold">
          7-0
        </Link>
        {phase !== "setup" && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/15 px-4 py-1.5 text-sm font-bold text-white/70 transition hover:bg-white/10"
          >
            New game
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 sm:px-6">
        {phase === "setup" ? (
          <div className="py-6">
            <h1 className="mb-6 text-center text-3xl font-black tracking-tight">
              Draft your all-time World XI
            </h1>
            <SetupPanel />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,400px)]">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <FormationBoard />
            </div>
            <div>
              {phase === "drafting" && <DraftPanel />}
              {phase === "complete" && <ReadyPanel />}
              {phase === "result" && <ResultCard />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
