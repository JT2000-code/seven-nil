"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import ShareCard from "./ShareCard";
import type { GameSettings, Pick, SimulationResult } from "@/lib/types";

interface Props {
  result: SimulationResult;
  picks: Pick[];
  settings: GameSettings;
  shareUrl: string;
  shareText: string;
  onClose: () => void;
}

/** Full-screen share sheet: the card plus WhatsApp / X / Copy / Save image actions. */
export default function ShareModal({
  result,
  picks,
  settings,
  shareUrl,
  shareText,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const full = `${shareText}\n${shareUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function shareLink() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "7-0", text: shareText, url: shareUrl });
        return;
      } catch {
        /* user dismissed or unsupported — fall back to copy */
      }
    }
    await copy();
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(full)}`, "_blank", "noopener");
  }

  function tweet() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener",
    );
  }

  async function saveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#06140d",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "my-world-xi-7-0.png";
      a.click();
    } catch {
      /* export failed — other share options still work */
    } finally {
      setSaving(false);
    }
  }

  const secondaryBtn =
    "flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="m-auto flex w-full max-w-sm flex-col gap-3"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <ShareCard ref={cardRef} result={result} picks={picks} settings={settings} />
        </div>

        <button
          type="button"
          onClick={shareLink}
          className="w-full rounded-xl bg-gold py-3.5 text-base font-black text-black transition hover:brightness-105"
        >
          🔗 Share link
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={whatsapp} className={secondaryBtn}>
            WhatsApp
          </button>
          <button type="button" onClick={tweet} className={secondaryBtn}>
            X
          </button>
          <button type="button" onClick={copy} className={secondaryBtn}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={saveImage} disabled={saving} className={secondaryBtn}>
            {saving ? "Saving…" : "⬇ Save image"}
          </button>
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
