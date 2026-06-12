// Decorative, non-interactive backdrop for the landing hero: pitch mowing
// stripes receding to a horizon, a faint stadium bowl, and a trophy silhouette.
// Trademark-safe — all generic shapes, no official artwork.
export default function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Pitch: perspective mowing stripes anchored to the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(31,158,84,0.28) 0 7%, rgba(15,99,52,0.28) 7% 14%)",
          maskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          transform: "perspective(420px) rotateX(58deg)",
          transformOrigin: "bottom center",
        }}
      />

      {/* Stadium bowl + trophy silhouette */}
      <svg
        className="absolute left-1/2 top-0 h-[66%] w-[150%] -translate-x-1/2 opacity-[0.13]"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
      >
        {/* Stadium bowl */}
        <path
          d="M0 600 Q 0 220 600 180 Q 1200 220 1200 600 Z"
          fill="#eafff2"
          opacity="0.25"
        />
        <path
          d="M120 600 Q 120 320 600 290 Q 1080 320 1080 600 Z"
          fill="#07140d"
        />
        {/* Floodlight pylons */}
        <g stroke="#eafff2" strokeWidth="6" opacity="0.5">
          <line x1="220" y1="120" x2="220" y2="300" />
          <line x1="980" y1="120" x2="980" y2="300" />
        </g>
        <rect x="170" y="96" width="100" height="34" rx="6" fill="#eafff2" opacity="0.55" />
        <rect x="930" y="96" width="100" height="34" rx="6" fill="#eafff2" opacity="0.55" />

        {/* Trophy silhouette, centred */}
        <g fill="#f5c542" opacity="0.85" transform="translate(600 300)">
          <path d="M-46 -150 H46 V-120 Q46 -70 0 -56 Q-46 -70 -46 -120 Z" />
          {/* handles */}
          <path
            d="M-46 -148 Q-86 -148 -86 -118 Q-86 -86 -52 -86 L-52 -100 Q-70 -100 -70 -118 Q-70 -132 -46 -132 Z"
          />
          <path
            d="M46 -148 Q86 -148 86 -118 Q86 -86 52 -86 L52 -100 Q70 -100 70 -118 Q70 -132 46 -132 Z"
          />
          {/* stem + base */}
          <rect x="-10" y="-56" width="20" height="34" />
          <rect x="-34" y="-22" width="68" height="16" rx="3" />
          <rect x="-46" y="-6" width="92" height="18" rx="4" />
        </g>
      </svg>

      {/* Vignette so text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
    </div>
  );
}
