import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HH Goa 2026 ID Generator | Hacker House Goa",
  description:
    "Generate your personalized Hacker House Goa 2026 builder badge. Upload your photo, add your name and tech stack, then share it to X!",
  keywords: [
    "Hacker House",
    "Goa 2026",
    "hackathon",
    "builder badge",
    "ID generator",
  ],
  openGraph: {
    title: "HH Goa 2026 ID Generator",
    description: "Generate your Hacker House Goa 2026 builder badge!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 ID Generator",
    description: "Generate your Hacker House Goa 2026 builder badge!",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#04140d] text-white font-sans overflow-x-hidden relative isolate">
        <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.16),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(255,107,157,0.14),transparent_26%),radial-gradient(circle_at_50%_88%,rgba(26,143,168,0.18),transparent_32%),linear-gradient(180deg,#052411_0%,#04130d_58%,#02100a_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.06] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_82%)] animate-grid-drift" />

          <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-hh-yellow/10 blur-3xl animate-blob-slow" />
          <div className="absolute top-1/3 -right-28 h-[34rem] w-[34rem] rounded-full bg-hh-pink/10 blur-3xl animate-blob-slower" />
          <div className="absolute -bottom-36 left-1/3 h-[30rem] w-[30rem] rounded-full bg-hh-ocean/15 blur-3xl animate-blob-slow" />

          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_18%,transparent_62%)] blur-3xl" />

          <div className="absolute top-12 left-1/4 h-56 w-[42rem] -rotate-12 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_18%,rgba(255,215,0,0.2)_44%,rgba(255,107,157,0.16)_68%,transparent_100%)] blur-3xl opacity-25 animate-light-sweep" />
        </div>

        {children}
      </body>
    </html>
  );
}
