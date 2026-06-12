"use client";

import { FORMATIONS, getFormation } from "@/lib/formations";
import { useGameStore } from "@/lib/store";

interface Opt<T> {
  value: T;
  label: string;
  hint?: string;
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-200/60">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={[
                "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                active
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/30",
              ].join(" ")}
            >
              {o.label}
              {o.hint && (
                <span className="ml-1 text-[10px] font-normal text-white/40">{o.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SetupPanel() {
  const settings = useGameStore((s) => s.settings);
  const update = useGameStore((s) => s.updateSettings);
  const startDraft = useGameStore((s) => s.startDraft);

  const formation = getFormation(settings.formationId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-emerald-300/15 bg-black/25 p-6 backdrop-blur">
      <Segmented
        label="Formation"
        value={settings.formationId}
        onChange={(v) => update({ formationId: v })}
        options={FORMATIONS.map((f) => ({ value: f.id, label: f.name }))}
      />
      <p className="-mt-3 text-xs text-emerald-200/60">{formation.description}</p>

      <Segmented
        label="Difficulty"
        value={settings.difficulty}
        onChange={(v) => update({ difficulty: v })}
        options={[
          { value: "easy", label: "Easy", hint: "3 rerolls" },
          { value: "normal", label: "Normal", hint: "1 reroll" },
          { value: "hard", label: "Hard", hint: "0 rerolls" },
        ]}
      />

      <Segmented
        label="Show ratings"
        value={settings.showRatings ? "on" : "off"}
        onChange={(v) => update({ showRatings: v === "on" })}
        options={[
          { value: "on", label: "On" },
          { value: "off", label: "Blind mode", hint: "trust your gut" },
        ]}
      />

      <Segmented
        label="Player ratings"
        value={settings.ratingMode}
        onChange={(v) => update({ ratingMode: v })}
        options={[
          { value: "career", label: "Career Season", hint: "rated as that year" },
          { value: "prime", label: "Prime", hint: "career best" },
        ]}
      />

      <Segmented
        label="Draft mode"
        value={settings.draftMode}
        onChange={(v) => update({ draftMode: v })}
        options={[
          { value: "squad-first", label: "Squad First" },
          { value: "position-first", label: "Position First" },
        ]}
      />

      <Segmented
        label="Era"
        value={settings.minYear}
        onChange={(v) => update({ minYear: v })}
        options={[
          { value: 0, label: "All-time" },
          { value: 1970, label: "1970s+" },
          { value: 1990, label: "1990s+" },
          { value: 2000, label: "2000s+" },
          { value: 2010, label: "Modern (2010+)" },
        ]}
      />

      <button
        type="button"
        onClick={startDraft}
        className="mt-2 w-full rounded-xl bg-gold py-4 text-lg font-black text-black transition hover:brightness-105"
      >
        Start Draft →
      </button>
    </div>
  );
}
