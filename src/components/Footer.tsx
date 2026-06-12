export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 px-6 py-8 text-center text-xs leading-relaxed text-white/40">
      <p className="mx-auto max-w-3xl">
        7-0 is an independent, fan-made game. It is not affiliated with, endorsed
        by, sponsored by, licensed by, or otherwise associated with any football
        club, competition, league, governing body, organisation, game publisher,
        or ratings provider. All nation names, player names, ratings and tournament
        data are used for informational, descriptive and editorial purposes only.
        No official logos, crests, trophies, player images or likenesses are used.
        All trademarks and intellectual property remain the property of their
        respective owners.
      </p>
      <p className="mt-3">© {new Date().getFullYear()} 7-0 — a nostalgia draft game.</p>
    </footer>
  );
}
