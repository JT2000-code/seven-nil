"use client";

import { useId } from "react";
import { getFlagSpec, type FlagBase, type FlagOverlay } from "@/lib/flags";

const VW = 60;
const VH = 40;

function starPoints(cx: number, cy: number, r: number, points = 5, rotDeg = -90): string {
  const inner = r * (points === 5 ? 0.382 : points === 6 ? 0.55 : 0.5);
  const step = Math.PI / points;
  const start = (rotDeg * Math.PI) / 180;
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = start + i * step;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function cumulative(weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  let acc = 0;
  for (const w of weights) {
    out.push((acc / total));
    acc += w;
  }
  out.push(1);
  return out;
}

function Base({ base, clipId }: { base: FlagBase; clipId: string }) {
  switch (base.kind) {
    case "solid":
      return <rect width={VW} height={VH} fill={base.color} />;
    case "stripes": {
      const weights = base.weights ?? base.colors.map(() => 1);
      const bounds = cumulative(weights);
      return (
        <g>
          {base.colors.map((c, i) => {
            const start = bounds[i];
            const end = bounds[i + 1];
            if (base.dir === "h") {
              return (
                <rect key={i} x={0} y={start * VH} width={VW} height={(end - start) * VH} fill={c} />
              );
            }
            return (
              <rect key={i} x={start * VW} y={0} width={(end - start) * VW} height={VH} fill={c} />
            );
          })}
        </g>
      );
    }
    case "cross": {
      const cw = 10;
      return (
        <g>
          <rect width={VW} height={VH} fill={base.field} />
          <rect x={VW / 2 - cw / 2} y={0} width={cw} height={VH} fill={base.cross} />
          <rect x={0} y={VH / 2 - cw / 2} width={VW} height={cw} fill={base.cross} />
        </g>
      );
    }
    case "nordic": {
      const vx = 22;
      const w = 8;
      const iw = 3.4;
      return (
        <g>
          <rect width={VW} height={VH} fill={base.field} />
          <rect x={vx - w / 2} y={0} width={w} height={VH} fill={base.cross} />
          <rect x={0} y={VH / 2 - w / 2} width={VW} height={w} fill={base.cross} />
          {base.inner && (
            <>
              <rect x={vx - iw / 2} y={0} width={iw} height={VH} fill={base.inner} />
              <rect x={0} y={VH / 2 - iw / 2} width={VW} height={iw} fill={base.inner} />
            </>
          )}
        </g>
      );
    }
    case "saltire": {
      return (
        <g clipPath={`url(#${clipId})`}>
          <rect width={VW} height={VH} fill={base.field} />
          <line x1={0} y1={0} x2={VW} y2={VH} stroke={base.cross} strokeWidth={8} />
          <line x1={VW} y1={0} x2={0} y2={VH} stroke={base.cross} strokeWidth={8} />
        </g>
      );
    }
  }
}

function Overlay({ ov, idBase, i }: { ov: FlagOverlay; idBase: string; i: number }) {
  const cx = "cx" in ov && ov.cx != null ? ov.cx : VW / 2;
  const cy = "cy" in ov && ov.cy != null ? ov.cy : VH / 2;
  switch (ov.kind) {
    case "disc":
      if (ov.color2) {
        const clip = `${idBase}-disc-${i}`;
        return (
          <g>
            <clipPath id={clip}>
              <circle cx={cx} cy={cy} r={ov.r} />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <rect x={cx - ov.r} y={cy - ov.r} width={ov.r * 2} height={ov.r} fill={ov.color} />
              <rect x={cx - ov.r} y={cy} width={ov.r * 2} height={ov.r} fill={ov.color2} />
            </g>
          </g>
        );
      }
      return <circle cx={cx} cy={cy} r={ov.r} fill={ov.color} />;
    case "diamond":
      return (
        <polygon
          points={`${VW / 2},5 ${VW - 6},${VH / 2} ${VW / 2},${VH - 5} 6,${VH / 2}`}
          fill={ov.color}
        />
      );
    case "star":
      return <polygon points={starPoints(cx, cy, ov.r, ov.points ?? 5, ov.rot ?? -90)} fill={ov.color} />;
    case "crescent": {
      return (
        <g>
          <circle cx={cx} cy={cy} r={ov.r} fill={ov.color} />
          <circle cx={cx + ov.r * 0.42} cy={cy} r={ov.r * 0.82} fill={ov.bite} />
        </g>
      );
    }
    case "triangle":
      return <polygon points={`0,0 0,${VH} 28,${VH / 2}`} fill={ov.color} />;
    case "cantonRect":
      return <rect x={ov.x} y={ov.y} width={ov.w} height={ov.h} fill={ov.color} />;
    case "cantonCross": {
      const cw = Math.min(ov.w, ov.h) * 0.32;
      return (
        <g>
          <rect x={ov.x} y={ov.y} width={ov.w} height={ov.h} fill={ov.field} />
          <rect x={ov.x + ov.w / 2 - cw / 2} y={ov.y} width={cw} height={ov.h} fill={ov.cross} />
          <rect x={ov.x} y={ov.y + ov.h / 2 - cw / 2} width={ov.w} height={cw} fill={ov.cross} />
        </g>
      );
    }
  }
}

interface Props {
  nation: string;
  colors: { primary: string; secondary: string };
  className?: string;
}

export default function Flag({ nation, colors, className }: Props) {
  const spec = getFlagSpec(nation, colors);
  const uid = useId().replace(/:/g, "");
  const clipId = `${uid}-clip`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className={className}
      role="img"
      aria-label={`${nation} flag`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={VW} height={VH} rx={2} ry={2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <Base base={spec.base} clipId={clipId} />
        {spec.overlays?.map((ov, i) => (
          <Overlay key={i} ov={ov} idBase={uid} i={i} />
        ))}
        <rect width={VW} height={VH} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} rx={2} ry={2} />
      </g>
    </svg>
  );
}
