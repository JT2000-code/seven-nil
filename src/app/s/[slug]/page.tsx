import type { Metadata } from "next";
import ShareView from "@/components/ShareView";
import { decodeShare } from "@/lib/share";
import { getShare } from "@/lib/shareStore";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const encoded = await getShare(slug);
  const data = encoded ? decodeShare(encoded) : null;
  const ogUrl = `/api/og${slug ? `?id=${encodeURIComponent(slug)}` : ""}`;

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

export default async function ShortSharePage({ params }: { params: Params }) {
  const { slug } = await params;
  const encoded = await getShare(slug);
  const data = encoded ? decodeShare(encoded) : null;
  return <ShareView data={data} />;
}
