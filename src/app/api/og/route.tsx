import { ImageResponse } from "next/og";
import { decodeShare, asciiName, type SharePayload } from "@/lib/share";
import { getShare } from "@/lib/shareStore";
import { ratingColor, ratingTextColor } from "@/lib/ui";

export const runtime = "nodejs";
export const contentType = "image/png";

const SIZE = { width: 1200, height: 630 };

const FALLBACK: SharePayload = {
  v: 1,
  t: "BUILD YOUR WORLD XI",
  st: "Spin, draft legends, and chase a perfect 7-0.",
  w: 0,
  d: 0,
  l: 0,
  gf: 0,
  ga: 0,
  r: 0,
  fr: "",
  champ: 0,
  perfect: 0,
  clean: 0,
  f: "4-3-3",
  xi: [],
};

function titleColor(d: SharePayload): string {
  if (d.perfect) return "#f5c542";
  if (d.champ) return "#7ee0a5";
  return "#eafff2";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Short links carry ?id=<slug> (resolved via the store); legacy links carry
  // the full payload in ?d=<base64>.
  const id = searchParams.get("id");
  const param = id ? await getShare(id) : searchParams.get("d");
  const data = (param && decodeShare(param)) || FALLBACK;
  const hasResult = data !== FALLBACK && (data.w || data.d || data.l);
  const stars = data.xi.slice(0, 4);

  const stats: { k: string; v: string }[] = hasResult
    ? [
        { k: "RATING", v: String(data.r) },
        { k: "W-D-L", v: `${data.w}-${data.d}-${data.l}` },
        { k: "FOR", v: String(data.gf) },
        { k: "AGAINST", v: String(data.ga) },
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          color: "#eafff2",
          backgroundColor: "#07140d",
          backgroundImage:
            "radial-gradient(1000px 500px at 50% -10%, rgba(31,158,84,0.30), transparent), radial-gradient(800px 460px at 92% 118%, rgba(245,197,66,0.18), transparent)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: "#f5c542", letterSpacing: -2 }}>
              7-0
            </span>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              color: "rgba(234,255,242,0.55)",
            }}
          >
            ALL-TIME WORLD XI
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
          <span style={{ fontSize: 92, fontWeight: 900, lineHeight: 1, color: titleColor(data) }}>
            {data.t}

          </span>
          <span style={{ fontSize: 30, marginTop: 14, color: "rgba(234,255,242,0.75)" }}>
            {data.st}
          </span>
        </div>

        {/* Stat chips */}
        {stats.length > 0 && (
          <div style={{ display: "flex", marginTop: 36 }}>
            {stats.map((s) => (
              <div
                key={s.k}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 200,
                  height: 116,
                  marginRight: 20,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span style={{ fontSize: 48, fontWeight: 900 }}>{s.v}</span>
                <span
                  style={{
                    fontSize: 18,
                    letterSpacing: 3,
                    marginTop: 6,
                    color: "rgba(126,224,165,0.75)",
                  }}
                >
                  {s.k}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Star players */}
        {stars.length > 0 && (
          <div style={{ display: "flex", marginTop: "auto", marginBottom: 18 }}>
            {stars.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 18,
                  padding: "12px 16px",
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    marginRight: 12,
                    fontSize: 24,
                    fontWeight: 900,
                    backgroundColor: ratingColor(p.r),
                    color: ratingTextColor(p.r),
                  }}
                >
                  {p.r}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>{asciiName(p.n)}</span>
                  <span style={{ fontSize: 17, color: "rgba(234,255,242,0.55)" }}>
                    {p.c} {String(p.y).padStart(2, "0")} · {p.s}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: stars.length > 0 ? 0 : "auto",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span style={{ fontSize: 24, color: "rgba(234,255,242,0.7)" }}>
            {data.gb && data.gb.g > 0
              ? `Golden Boot: ${asciiName(data.gb.n)} (${data.gb.g})`
              : "Spin · Draft · Simulate"}
          </span>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#f5c542" }}>
            Build yours → 7-0.world
          </span>
        </div>
      </div>
    ),
    SIZE,
  );
}
