import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getBadgePublicUrl(id: string): string {
  return `${SITE_URL}/api/shares/${id}/image`;
}

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const imageUrl = getBadgePublicUrl(id);
  const pageUrl = `${SITE_URL}/share/${id}`;

  return {
    title: "My Hacker House Goa 2026 Badge",
    description:
      "I just created my builder badge for Hacker House Goa 2026. Check out the badge preview and make your own.",
    openGraph: {
      title: "My Hacker House Goa 2026 Badge",
      description:
        "I just created my builder badge for Hacker House Goa 2026. Check out the badge preview and make your own.",
      type: "website",
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 900,
          alt: "Hacker House Goa 2026 Builder Badge",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "My Hacker House Goa 2026 Badge",
      description:
        "I just created my builder badge for Hacker House Goa 2026. Check out the badge preview and make your own.",
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const imageUrl = getBadgePublicUrl(id);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-transparent">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-hh-yellow/10 blur-3xl animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-hh-pink/10 blur-3xl animate-blob-slower" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hh-yellow/10 border border-hh-yellow/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-hh-yellow animate-pulse" />
          <span className="text-hh-yellow text-xs font-medium tracking-wider uppercase">
            Builder Badge
          </span>
        </div>

        <h1 className="text-3xl font-bold font-serif text-white mb-2">
          <span className="text-hh-yellow">Hacker House</span>{" "}
          <span className="text-hh-pink">Goa</span>{" "}
          <span className="text-white">2026</span>
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Someone just created their builder badge.
        </p>

        <div className="mb-8">
          <img
            src={imageUrl}
            alt="Hacker House Goa 2026 Builder Badge"
            className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl ring-1 ring-white/10"
          />
        </div>

        <Link
          href="/"
          className="
            inline-flex items-center justify-center gap-2.5
            px-8 py-3.5 rounded-xl
            bg-hh-yellow text-hh-green-900
            font-semibold text-base
            hover:bg-hh-yellow-light active:scale-[0.97]
            transition-all duration-300 ease-out
            animate-pulse-glow
          "
        >
          <span>Go back</span>
          Create Your Badge
        </Link>

        <p className="text-white/20 text-xs mt-8">
          Hacker House Goa 2026 • Badge Generator
        </p>
      </div>
    </main>
  );
}
