"use client";

import { forwardRef } from "react";
import { displayRating } from "@/lib/ui";
import type { GameSettings, Pick, Position, SimulationResult } from "@/lib/types";

// Position-group colours, in the 38-0 style but tuned for the World Cup theme.
const POS_COLOR: Record<Position, string> = {
  GK: "#e8a13a",
  RB: "#3b82f6",
  CB: "#3b82f6",
  LB: "#3b82f6",
  CDM: "#1f9e54",
  CM: "#1f9e54",
  CAM: "#1f9e54",
  RM: "#1f9e54",
  LM: "#1f9e54",
  RW: "#e5484d",
  LW: "#e5484d",
  ST: "#e5484d",
};

// Attack → goalkeeper ordering so the two columns read top-down like a team sheet.
const POS_ORDER: Record<Position, number> = {
  ST: 0, RW: 1, LW: 2, CAM: 3, RM: 4, LM: 5, CM: 6, CDM: 7, RB: 8, CB: 9, LB: 10, GK: 11,
};

function roleOf(slotId: string): Position {
  return slotId.replace(/\d+$/, "") as Position;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function achievement(r: SimulationResult): { label: string; gold: boolean } {
  if (r.cleanSweep) return { label: "PERFECT 7-0-0", gold: true };
  if (r.perfect) return { label: "PERFECT 7-0", gold: true };
  if (r.champions) return { label: "CHAMPIONS", gold: true };
  if (r.furthestRound === "Final") return { label: "RUNNERS-UP", gold: false };
  if (r.furthestRound.startsWith("Group")) return { label: "GROUP STAGE", gold: false };
  return { label: r.furthestRound.toUpperCase(), gold: false };
}

const MUTED = "rgba(234,255,242,0.55)";

function PlayerRow({ role, name, rating }: { role: Position; name: string; rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 20,
          borderRadius: 4,
          background: POS_COLOR[role] ?? "#64748b",
          color: "#ffffff",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.2,
          flexShrink: 0,
        }}
      >
        {role}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 600,
          color: "#eafff2",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: rating >= 90 ? "#f5c542" : "#eafff2",
          flexShrink: 0,
        }}
      >
        {rating}
      </span>
    </div>
  );
}

function StatBox({ label, main, sub, icon }: { label: string; main: string; sub: string; icon: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 12,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#7ee0a5" }}>
        {icon} {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 14,
          fontWeight: 800,
          color: "#eafff2",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {main}
      </div>
      <div style={{ fontSize: 11, color: "#f5c542", fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

interface Props {
  result: SimulationResult;
  picks: Pick[];
  settings: GameSettings;
}

/** A shareable, image-exportable summary card in the 38-0 style, World Cup themed. */
const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { result, picks, settings },
  ref,
) {
  const players = picks
    .map((p) => ({
      role: roleOf(p.slotId),
      name: p.player.name,
      rating: displayRating(p.player, settings.ratingMode),
    }))
    .sort((a, b) => (POS_ORDER[a.role] ?? 99) - (POS_ORDER[b.role] ?? 99));

  const mid = Math.ceil(players.length / 2);
  const left = players.slice(0, mid);
  const right = players.slice(mid);
  const star = [...players].sort((a, b) => b.rating - a.rating)[0];
  const ach = achievement(result);
  const hasBoot = Boolean(result.goldenBoot && result.goldenBoot.goals > 0);

  return (
    <div
      ref={ref}
      style={{
        width: 384,
        boxSizing: "border-box",
        padding: 24,
        borderRadius: 20,
        color: "#eafff2",
        backgroundColor: "#06140d",
        backgroundImage:
          "radial-gradient(600px 300px at 50% -10%, rgba(31,158,84,0.28), transparent), radial-gradient(500px 280px at 95% 115%, rgba(245,197,66,0.16), transparent)",
        border: "1px solid rgba(245,197,66,0.25)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: "#f5c542", letterSpacing: -1 }}>
          7-0
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              fontSize: 11,
              fontWeight: 600,
              color: "#cfe9da",
            }}
          >
            {cap(settings.difficulty)} · {settings.ratingMode === "prime" ? "Prime" : "Career"}
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(126,224,165,0.5)",
              fontSize: 11,
              fontWeight: 800,
              color: "#7ee0a5",
            }}
          >
            OVR {result.teamRating}
          </span>
        </div>
      </div>

      {/* Big result */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>
          {result.wins}-{result.draws}-{result.losses}
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, marginTop: 6 }}>
          WON · DRAWN · LOST
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", marginTop: 8 }}>
          {result.goalsFor} for · {result.goalsAgainst} against
        </div>
      </div>

      {/* Achievement badge */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <span
          style={{
            padding: "7px 20px",
            borderRadius: 999,
            background: ach.gold ? "#f5c542" : "rgba(255,255,255,0.08)",
            color: ach.gold ? "#1a1205" : "#eafff2",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          {ach.label}
        </span>
      </div>

      {/* The XI */}
      <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {left.map((p, i) => (
            <PlayerRow key={i} role={p.role} name={p.name} rating={p.rating} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {right.map((p, i) => (
            <PlayerRow key={i} role={p.role} name={p.name} rating={p.rating} />
          ))}
        </div>
      </div>

      {/* Stat boxes */}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {hasBoot && (
          <StatBox
            label="GOLDEN BOOT"
            icon="⚽"
            main={result.goldenBoot!.name}
            sub={`${result.goldenBoot!.goals} goal${result.goldenBoot!.goals === 1 ? "" : "s"}`}
          />
        )}
        {star && (
          <StatBox label="STAR PLAYER" icon="★" main={star.name} sub={`OVR ${star.rating}`} />
        )}
      </div>

      {/* Footer */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "18px 0 14px" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: MUTED }}>Think you can beat this?</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#f5c542", marginTop: 2 }}>
          7-0.world
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
