"use client";

import React, { useState } from "react";

interface ActionButtonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isFormValid: boolean;
}

export default function ActionButtons({
  canvasRef,
  isFormValid,
}: ActionButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "hh-goa-2026-badge.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToX = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSharing(true);
    setShareError(null);

    const CAPTION =
      "Just got my Hacker House Goa 2026 Builder ID 🌴 #FrameInGoa";

    try {
      const dataUrl = canvas.toDataURL("image/png");

      // 1. Download the badge PNG to user's device so it's ready to attach in X
      const link = document.createElement("a");
      link.download = "hh-goa-2026-badge.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Best-effort upload to server to generate share page link
      let sharePageUrl = "";
      try {
        const response = await fetch("/api/shares", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        if (response.ok) {
          const { id } = (await response.json()) as { id: string };
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (typeof window !== "undefined" ? window.location.origin : "");
          sharePageUrl = `${siteUrl}/share/${id}`;
        }
      } catch (e) {
        console.warn("Share API upload skipped:", e);
      }

      // 3. Open X compose window directly with caption + optional share link
      const tweetText = sharePageUrl ? `${CAPTION}\n${sharePageUrl}` : CAPTION;
      const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      const popup = window.open(
        xIntentUrl,
        "share-to-x",
        "width=600,height=600,noopener,noreferrer"
      );
      if (!popup) window.location.href = xIntentUrl;
    } catch (err) {
      console.error("Share error:", err);
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
          {isSharing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share to X
            </>
          )}
        </button>
      </div>

      {shareError && (
        <p className="text-hh-pink text-sm text-center animate-fade-in-up">
          {shareError}
        </p>
      )}
    </div>
  );
}
