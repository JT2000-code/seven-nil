"use client";

import { motion } from "framer-motion";

// Flag-inspired pennant palette (single or two-tone). Trademark-safe: generic
// triangular bunting in national-flag colours, not any official artwork.
const PENNANTS: { top: string; bottom?: string }[] = [
  { top: "#009b3a", bottom: "#f7d417" }, // brazil
  { top: "#74acdf" }, // argentina
  { top: "#1f3a93", bottom: "#ef4135" }, // france
  { top: "#c60b1e", bottom: "#f1bf00" }, // spain
  { top: "#009246", bottom: "#ce2b37" }, // italy
  { top: "#ff7a18" }, // netherlands
  { top: "#111111", bottom: "#ffce00" }, // germany
  { top: "#1b8a3a", bottom: "#c60b1e" }, // portugal
];

interface Props {
  /** Number of pennants to render. */
  count?: number;
  className?: string;
}

export default function Bunting({ count = 24, className }: Props) {
  return (
    <div
      className={`pointer-events-none relative h-10 w-full overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      {/* String */}
      <div className="absolute inset-x-0 top-[3px] h-px bg-gold/40" />

      <div className="flex w-full justify-between px-2">
        {Array.from({ length: count }).map((_, i) => {
          const p = PENNANTS[i % PENNANTS.length];
          return (
            <motion.div
              key={i}
              className="origin-top"
              style={{ transformOrigin: "top center" }}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{
                duration: 2.6 + (i % 5) * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 7) * 0.12,
              }}
            >
              {/* Pin */}
              <div className="mx-auto h-1 w-1 rounded-full bg-gold/70" />
              {/* Triangular pennant (two-tone via stacked clipped halves) */}
              <div className="relative h-7 w-5">
                <div
                  className="absolute inset-0"
                  style={{
                    background: p.bottom
                      ? `linear-gradient(${p.top} 0 50%, ${p.bottom} 50% 100%)`
                      : p.top,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 2px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
