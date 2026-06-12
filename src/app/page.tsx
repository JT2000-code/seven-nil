import Link from "next/link";
import Bunting from "@/components/Bunting";
import HeroBackdrop from "@/components/HeroBackdrop";
import Footer from "@/components/Footer";
import { SQUADS } from "@/lib/data/squads";

const playerCount = SQUADS.reduce((acc, s) => acc + s.players.length, 0);
const minYear = Math.min(...SQUADS.map((s) => s.year));
const maxYear = Math.max(...SQUADS.map((s) => s.year));

const STATS = [
  { value: `${SQUADS.length}`, label: "Legendary squads" },
  { value: `${playerCount}+`, label: "Player tournaments" },
  { value: `${minYear}–${maxYear}`, label: "Finals covered" },
];

const STEPS = [
  { n: 1, title: "Spin the reels", body: "Each spin lands on a real nation from a specific tournament — Brazil '70, France '98, Argentina '86 and more." },
  { n: 2, title: "Draft a legend", body: "Pick a player from that squad and slot them into your formation, one position at a time." },
  { n: 3, title: "Build your XI", body: "Repeat until all eleven positions are filled with all-time international talent." },
  { n: 4, title: "Simulate the run", body: "Play out three group games and a four-round knockout. Chase a perfect, unbeaten 7-0." },
];

const CHALLENGES = [
  "Go the whole run unbeaten",
  "Chase a perfect 7-0-0 (no goals conceded)",
  "Win it without a single penalty shootout",
  "Build a single-decade XI",
  "Win on Hard mode with ratings hidden",
  "Lift the trophy with no player rated 90+",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Bunting />
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-xl font-black tracking-tight text-gold">7-0</span>
      </header>

      <main className="flex flex-1 flex-col items-center px-6">
        {/* Hero */}
        <section className="relative flex w-full flex-col items-center overflow-hidden py-16 text-center sm:py-24">
          <HeroBackdrop />
          <div className="flex w-full max-w-3xl flex-col items-center">
          <span className="mb-4 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-200/70">
            Unofficial fan draft game
          </span>
          <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
            Build the ultimate
            <span className="block text-gold">World XI.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-emerald-100/70">
            Spin the reels. Draft legends from football&apos;s greatest international
            tournament squads. Simulate a seven-game run. Can you win every game and
            go a perfect <span className="font-bold text-gold">7-0</span>?
          </p>
          <Link
            href="/game"
            className="mt-8 rounded-xl bg-gold px-8 py-4 text-lg font-black text-black transition hover:brightness-105"
          >
            Start New Run →
          </Link>

          <div className="mt-12 grid w-full grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-black text-gold">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-emerald-200/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* How to play */}
        <section className="w-full max-w-4xl py-12">
          <h2 className="mb-8 text-center text-3xl font-black tracking-tight">How to play</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-black text-black">
                  {s.n}
                </span>
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-emerald-100/60">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className="w-full max-w-3xl py-12">
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight">Popular challenges</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CHALLENGES.map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-emerald-100/80"
              >
                <span className="text-gold">▸</span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="w-full max-w-2xl py-16 text-center">
          <h2 className="text-3xl font-black tracking-tight">
            Can you build the perfect team?
          </h2>
          <p className="mt-3 text-emerald-100/70">
            Draft your XI, simulate the tournament, and see if your team can achieve
            the impossible: seven wins from seven.
          </p>
          <Link
            href="/game"
            className="mt-6 inline-block rounded-xl bg-gold px-8 py-4 text-lg font-black text-black transition hover:brightness-105"
          >
            Play 7-0 →
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
