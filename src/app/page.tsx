"use client";

import React, { useEffect, useRef, useState } from "react";
import BadgeForm from "@/components/BadgeForm";
import CanvasPreview, { BadgeMode } from "@/components/CanvasPreview";
import ActionButtons from "@/components/ActionButtons";
import { PhotoTransform } from "@/lib/canvasUtils";

export default function HomePage() {
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [title, setTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [badgeMode, setBadgeMode] = useState<BadgeMode>("card");
  const [photoTransform, setPhotoTransform] = useState<PhotoTransform>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const isFormValid = name.trim().length > 0 && stack.trim().length > 0;

  useEffect(() => {
    if (!showMobilePreview) return;

    mobilePreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [showMobilePreview]);

  const handleGenerateBadge = () => {
    if (!isFormValid) return;
    setShowMobilePreview(true);
  };

  return (
    <main className="flex-1 flex flex-col justify-center min-h-screen relative overflow-hidden bg-transparent text-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-hh-yellow/10 blur-3xl animate-blob-slow" />
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-hh-pink/10 blur-3xl animate-blob-slower" />
        <div className="absolute -bottom-32 left-1/3 w-[34rem] h-[34rem] rounded-full bg-hh-green-600/18 blur-3xl animate-blob-slow" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-5">
          <header className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-hh-yellow/10 border border-hh-yellow/20 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-hh-yellow animate-pulse" />
              <span className="text-hh-yellow text-[11px] font-semibold tracking-wider uppercase">
                Builder Badge Generator
              </span>
            </div>

            <h1 className="text-3xl font-bold font-serif text-white leading-tight animate-fade-in-up stagger-1">
              <span className="text-hh-yellow">Hacker</span>{" "}
              <span className="text-hh-pink">House</span>{" "}
              <span className="text-white">Goa 2026</span>
            </h1>

            <p className="text-white/60 text-xs animate-fade-in-up stagger-2">
              Upload your photo, enter your details, pick your AI builder title, and generate your badge.
            </p>
          </header>

          <section className="bg-hh-green-800/40 backdrop-blur-md p-4 rounded-2xl border border-hh-green-700/50 shadow-xl">
            <BadgeForm
              name={name}
              stack={stack}
              title={title}
              onNameChange={setName}
              onStackChange={setStack}
              onTitleChange={setTitle}
              onPhotoChange={setPhotoUrl}
              onTransformChange={setPhotoTransform}
            />
          </section>

          <button
            type="button"
            onClick={handleGenerateBadge}
            disabled={!isFormValid}
            className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ease-out ${
              isFormValid
                ? "bg-hh-yellow text-hh-green-900 hover:bg-hh-yellow-light active:scale-[0.98] animate-pulse-glow cursor-pointer"
                : "bg-hh-green-700 text-white/30 cursor-not-allowed"
            }`}
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
            Generate Badge
          </button>

          {showMobilePreview ? (
            <section
              ref={mobilePreviewRef}
              className="space-y-3 bg-hh-green-800/35 backdrop-blur-md p-4 rounded-2xl border border-hh-green-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-hh-yellow/80 font-semibold">
                    Preview
                  </p>
                  <p className="text-xs text-white/55">
                    Your generated badge is ready.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobilePreview(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-medium border border-white/10"
                >
                  Hide
                </button>
              </div>

              <CanvasPreview
                name={name}
                stack={stack}
                title={title}
                photoUrl={photoUrl}
                canvasRef={canvasRef}
                mode={badgeMode}
                transform={photoTransform}
              />

              <ActionButtons canvasRef={canvasRef} isFormValid={isFormValid} name={name} stack={stack} />
            </section>
          ) : (
            <section>
              <ActionButtons canvasRef={canvasRef} isFormValid={isFormValid} name={name} stack={stack} />
            </section>
          )}

          <footer className="text-white/30 text-xs pt-1">
            <p>
              Built with 🤙 for{" "}
              <span className="text-hh-yellow/50">Hacker House Goa 2026</span>
            </p>
          </footer>

          {!showMobilePreview && (
            <div className="absolute -left-[9999px] top-0 w-0 h-0 overflow-hidden" aria-hidden="true">
              <CanvasPreview
                name={name}
                stack={stack}
                title={title}
                photoUrl={photoUrl}
                canvasRef={canvasRef}
                mode={badgeMode}
                transform={photoTransform}
              />
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Form Details & Actions */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Header / Event Branding */}
            <header className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-hh-yellow/10 border border-hh-yellow/20 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-hh-yellow animate-pulse" />
                <span className="text-hh-yellow text-[11px] font-semibold tracking-wider uppercase">
                  Builder Badge Generator
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold font-serif text-white leading-tight animate-fade-in-up stagger-1">
                <span className="text-hh-yellow">Hacker</span>{" "}
                <span className="text-hh-pink">House</span>{" "}
                <span className="text-white">Goa 2026</span>
              </h1>

              <p className="text-white/60 text-xs sm:text-sm animate-fade-in-up stagger-2">
                Upload your photo, enter your details, pick your AI builder title, and instantly generate your badge.
              </p>
            </header>

            {/* Input Form */}
            <section className="bg-hh-green-800/40 backdrop-blur-md p-5 rounded-2xl border border-hh-green-700/50 shadow-xl">
              <BadgeForm
                name={name}
                stack={stack}
                title={title}
                onNameChange={setName}
                onStackChange={setStack}
                onTitleChange={setTitle}
                onPhotoChange={setPhotoUrl}
                onTransformChange={setPhotoTransform}
              />
            </section>

            {/* Action Buttons (Download & Share) */}
            <section>
              <ActionButtons canvasRef={canvasRef} isFormValid={isFormValid} name={name} stack={stack} />
            </section>

            {/* Footer */}
            <footer className="text-white/30 text-xs pt-1">
              <p>
                Built with 🤙 for{" "}
                <span className="text-hh-yellow/50">Hacker House Goa 2026</span>
              </p>
            </footer>
          </div>

          {/* Right Column: Live Badge Preview & Mode Switcher */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-hh-green-800/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-hh-green-700/40 shadow-2xl space-y-3">
              
              {/* Top Controls: Mode Switcher & Dimension Indicator */}
              <div className="flex items-center justify-between gap-2 px-1">
                {/* Segmented Mode Switcher */}
                <div className="flex items-center gap-1 p-1 bg-hh-green-900/80 rounded-xl border border-hh-green-700/60 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setBadgeMode("card")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      badgeMode === "card"
                        ? "bg-hh-yellow text-hh-green-900 shadow-md scale-[1.02]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    📇 ID Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeMode("pfp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      badgeMode === "pfp"
                        ? "bg-hh-yellow text-hh-green-900 shadow-md scale-[1.02]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    ⭕ Profile PFP
                  </button>
                </div>

                <span className="text-[11px] text-white/40 font-mono">
                  {badgeMode === "card" ? "600 × 900" : "600 × 600"}
                </span>
              </div>

              {/* Canvas Renderer */}
              <CanvasPreview
                name={name}
                stack={stack}
                title={title}
                photoUrl={photoUrl}
                canvasRef={canvasRef}
                mode={badgeMode}
                transform={photoTransform}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
