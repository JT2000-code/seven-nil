import type { Metadata } from "next";
import Link from "next/link";
import Bunting from "@/components/Bunting";
import Footer from "@/components/Footer";
import { decodeShare, asciiName } from "@/lib/share";
import { ratingColor, ratingTextColor } from "@/lib/ui";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function getParam(sp: { [key: string]: string | string[] | undefined }): string | undefined {
  const d = sp.d;
  return typeof d === "string" ? d : undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const d = getParam(sp);
  const data = d ? decodeShare(d) : null;
  const ogUrl = `/api/og${d ? `?d=${encodeURIComponent(d)}` : ""}`;

  const title = data
    ? `${data.t} — my all-time World XI | 7-0`
    : "7-0 — Build your all-time World XI";
  const description = data
    ? `${data.w}W ${data.d}D ${data.l}L · ${data.gf} for, ${data.ga} against · rated ${data.r}. Can you do better?`
    : "Spin the wheel, draft legends, and chase a perfect 7-0.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const d = getParam(sp);
  const data = d ? decodeShare(d) : null;

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Build your all-time <span className="text-gold">World XI</span>
        </h1>
        <p className="max-w-md text-emerald-100/70">
          This share link has no result attached. Start your own run and chase a perfect 7-0.
        </p>
        <Link
          href="/game"
          className="rounded-xl bg-gold px-8 py-4 text-lg font-black text-black transition hover:brightness-105"
        >
          Play 7-0 →
        </Link>
        <Footer />
      </div>
    );
  }

  const stats = [
    { k: "Rating", v: String(data.r) },
    { k: "W-D-L", v: `${data.w}-${data.d}-${data.l}` },
    { k: "For", v: String(data.gf) },
    { k: "Against", v: String(data.ga) },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Bunting />
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-black tracking-tight text-gold">
          7-0
        </Link>
        <Link
          href="/game"
          className="rounded-lg border border-gold/40 px-4 py-1.5 text-sm font-bold text-gold transition hover:bg-gold/10"
        >
          Play
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
        <div
          className={[
            "rounded-2xl p-8 text-center",
            data.perfect
              ? "bg-gradient-to-br from-gold/30 to-amber-600/10 ring-1 ring-gold"
              : data.champ
                ? "bg-emerald-500/15 ring-1 ring-emerald-400/40"
                : "bg-white/5 ring-1 ring-white/10",
          ].join(" ")}
        >
          <p className="text-sm uppercase tracking-widest text-emerald-200/60">
            Someone&apos;s all-time World XI
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-gold">
            {data.t}
            {data.champ ? " 🏆" : ""}
          </h1>
          <p className="mt-2 text-emerald-100/80">{data.st}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          {stats.map((s) => (
            <div key={s.k} className="rounded-xl bg-white/5 py-3">
              <p className="text-2xl font-black">{s.v}</p>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/60">{s.k}</p>
            </div>
          ))}
        </div>

        {data.gb && data.gb.g > 0 && (
          <p className="text-center">
            <span className="text-gold">⚽ Golden Boot:</span>{" "}
            <span className="font-bold">{data.gb.n}</span> ({data.gb.g})
          </p>
        )}

        {data.xi.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-200/60">
              The squad ({data.f})
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {data.xi.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-black"
                    style={{ backgroundColor: ratingColor(p.r), color: ratingTextColor(p.r) }}
                  >
                    {p.r}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{p.n}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-200/60">
                    {p.c} {String(p.y).padStart(2, "0")} · {p.s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/game"
          className="mt-2 w-full rounded-xl bg-gold py-4 text-center text-lg font-black text-black transition hover:brightness-105"
        >
          Build your own XI →
        </Link>
      </main>

      <Footer />
    </div>
  );
}
