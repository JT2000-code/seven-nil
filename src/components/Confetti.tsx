"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#f5c542", "#7ee0a5", "#ffffff", "#54c08a", "#3aa6c4", "#ef4135"];

interface Piece {
  id: number;
  x: number; // start x in %
  delay: number;
  duration: number;
  drift: number; // horizontal drift in vw
  rotate: number;
  color: string;
  size: number;
  round: boolean;
}

/**
 * A one-shot confetti burst rendered with absolutely-positioned motion divs.
 * Mount it conditionally (e.g. only on a perfect 7-0) to fire the animation.
 */
export default function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.4 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 24,
      rotate: (Math.random() - 0.5) * 720,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 7,
      round: Math.random() > 0.6,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : 2,
          }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: "105vh",
            x: `${p.drift}vw`,
            opacity: [0, 1, 1, 0.9, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.1, 0.6, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}
