"use client";

import React, { useState } from "react";

interface ActionButtonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isFormValid: boolean;
  name?: string;
  stack?: string;
}

const CAPTION = "Just got my Hacker House Goa 2026 Builder ID 🌴 #FrameInGoa";

export default function ActionButtons({
  canvasRef,
  isFormValid,
  name,
  stack,
}: ActionButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "hh-goa-2026-badge.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToX = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSharing(true);

    try {
      const dataUrl = canvas.toDataURL("image/png");

      // Step 1: Download badge so user has it ready to attach in X
      const link = document.createElement("a");
      link.download = "hh-goa-2026-badge.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Step 2: Upload to server to get the personalised share URL
      let tweetText = CAPTION;
      try {
        const response = await fetch("/api/shares", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, name, stack }),
        });
        if (response.ok) {
          const { id } = (await response.json()) as { id: string };
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            window.location.origin;
          
          const params = new URLSearchParams();
          if (name) params.set("name", name);
          if (stack) params.set("stack", stack);
          const queryString = params.toString() ? `?${params.toString()}` : "";

          const shareUrl = `${siteUrl}/share/${id}${queryString}`;
          tweetText = `${CAPTION}\n${shareUrl}`;
        }
      } catch {
        // Upload failed — still open X with caption only
      }

      // Step 3: Open X with caption + personalised badge link
      const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      const popup = window.open(
        xIntentUrl,
        "share-to-x",
        "width=600,height=600,noopener,noreferrer"
      );
      if (!popup) window.location.href = xIntentUrl;
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={!isFormValid}
          className={`
            flex-1 flex items-center justify-center gap-2.5
            px-6 py-3.5 rounded-xl
            font-semibold text-base
            transition-all duration-300 ease-out
            ${
              isFormValid
                ? "bg-hh-yellow text-hh-green-900 hover:bg-hh-yellow-light active:scale-[0.97] animate-pulse-glow cursor-pointer"
                : "bg-hh-green-700 text-white/30 cursor-not-allowed"
            }
          `}
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Badge
        </button>

        <button
          onClick={handleShareToX}
          disabled={!isFormValid || isSharing}
          className={`
            flex-1 flex items-center justify-center gap-2.5
            px-6 py-3.5 rounded-xl
            font-semibold text-base
            transition-all duration-300 ease-out
            ${
              isFormValid && !isSharing
                ? "bg-hh-green-800 text-white border border-hh-green-600 hover:bg-hh-green-700 hover:border-hh-yellow/50 active:scale-[0.97] cursor-pointer"
                : "bg-hh-green-800/50 text-white/30 border border-hh-green-700 cursor-not-allowed"
            }
          `}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share to X
        </button>
      </div>
    </div>
  );
}
