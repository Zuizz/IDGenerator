import Link from "next/link";
import type { Metadata } from "next";
import { readShareMetadata } from "@/lib/shareStore";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getBadgeImageUrl(id: string): string {
  return `${SITE_URL}/api/shares/${id}/image`;
}

function getSharePageUrl(id: string): string {
  return `${SITE_URL}/share/${id}`;
}

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ name?: string; stack?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const sParams = (await searchParams) || {};
  const meta = await readShareMetadata(id);

  const name = meta?.name || sParams.name;
  const imageUrl = getBadgeImageUrl(id);
  const pageUrl = getSharePageUrl(id);

  const titleText = name
    ? `${name}'s Builder Badge | Hacker House Goa 2026`
    : "Hacker House Goa 2026 Builder Badge";

  const descText = name
    ? `${name} just created their official builder badge for Hacker House Goa 2026. Check it out!`
    : "I just created my builder badge for Hacker House Goa 2026. Check out the badge preview and make your own!";

  return {
    title: titleText,
    description: descText,
    openGraph: {
      title: titleText,
      description: descText,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 900,
          alt: titleText,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descText,
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { id } = await params;
  const sParams = (await searchParams) || {};
  const meta = await readShareMetadata(id);

  const name = meta?.name || sParams.name;
  const stack = meta?.stack || sParams.stack;

  const imageUrl = getBadgeImageUrl(id);
  const pageUrl = getSharePageUrl(id);

  const tweetText = encodeURIComponent(
    name
      ? `Just got my Hacker House Goa 2026 Builder ID (${name}) 🌴 #FrameInGoa\n${pageUrl}`
      : `Just got my Hacker House Goa 2026 Builder ID 🌴 #FrameInGoa\n${pageUrl}`
  );
  const xShareUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-transparent">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-hh-yellow/10 blur-3xl animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-hh-pink/10 blur-3xl animate-blob-slower" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Badge label pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hh-yellow/10 border border-hh-yellow/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-hh-yellow animate-pulse" />
          <span className="text-hh-yellow text-xs font-medium tracking-wider uppercase">
            {name ? `${name}'s Builder Badge` : "Builder Badge"}
          </span>
        </div>

        <h1 className="text-3xl font-bold font-serif text-white mb-2">
          <span className="text-hh-yellow">Hacker House</span>{" "}
          <span className="text-hh-pink">Goa</span>{" "}
          <span className="text-white">2026</span>
        </h1>
        <p className="text-white/50 text-sm mb-8">
          {name
            ? `${name} created their builder badge for Hacker House Goa 2026.`
            : "Someone just created their builder badge."}
        </p>

        {/* Badge image */}
        <div className="mb-8 relative max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <img
            src={imageUrl}
            alt={name ? `${name}'s Builder Badge` : "Hacker House Goa 2026 Builder Badge"}
            className="w-full h-auto block"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="share-to-x-btn"
            className="
              inline-flex items-center justify-center gap-2.5
              px-6 py-3.5 rounded-xl
              bg-hh-green-800 text-white border border-hh-green-600
              font-semibold text-base
              hover:bg-hh-green-700 hover:border-hh-yellow/50
              active:scale-[0.97] transition-all duration-300 ease-out
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share to X
          </a>

          <Link
            href="/"
            id="create-badge-btn"
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3.5 rounded-xl
              bg-hh-yellow text-hh-green-900
              font-semibold text-base
              hover:bg-hh-yellow-light active:scale-[0.97]
              transition-all duration-300 ease-out
              animate-pulse-glow
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your Own
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-8">
          Hacker House Goa 2026 • Badge Generator
        </p>
      </div>
    </main>
  );
}
