"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { isHeicFile, processImageFile } from "@/lib/heicConverter";
import { PhotoTransform } from "@/lib/canvasUtils";
import { fetchAiTitles } from "@/lib/titles";

interface BadgeFormProps {
  name: string;
  stack: string;
  title: string;
  onNameChange: (name: string) => void;
  onStackChange: (stack: string) => void;
  onTitleChange: (title: string) => void;
  onPhotoChange: (photoUrl: string | null) => void;
  onTransformChange?: (transform: PhotoTransform) => void;
}

const STACK_SUGGESTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Rust",
  "Solidity",
  "Python",
  "AI / ML",
  "Go",
  "Swift",
  "Flutter",
  "Node.js",
  "Web3",
  "DevOps",
  "Blockchain",
  "Full-Stack",
  "iOS",
  "Android",
  "Data Science",
  "Cloud / Infra",
  "Systems Programming",
];

export default function BadgeForm({
  name,
  stack,
  title,
  onNameChange,
  onStackChange,
  onTitleChange,
  onPhotoChange,
  onTransformChange,
}: BadgeFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFineTune, setShowFineTune] = useState(false);

  // AI Title Generation states
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const prevStackRef = useRef<string>("");

  // Photo transform state (smart face alignment)
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevObjectUrl = useRef<string | null>(null);

  const updateTransform = (newZoom: number, newX: number, newY: number) => {
    setZoom(newZoom);
    setOffsetX(newX);
    setOffsetY(newY);
    onTransformChange?.({ zoom: newZoom, offsetX: newX, offsetY: newY });
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };

  const loadTitlesForStack = useCallback(
    async (targetStack: string, autoSelect: boolean = false) => {
      setIsGeneratingTitles(true);
      try {
        const titles = await fetchAiTitles(targetStack);
        setSuggestedTitles(titles);
        if (titles.length > 0 && (autoSelect || !title)) {
          onTitleChange(titles[0]);
        }
      } finally {
        setIsGeneratingTitles(false);
      }
    },
    [onTitleChange, title]
  );

  // Trigger AI title fetch when stack changes
  useEffect(() => {
    const trimmedStack = stack.trim();
    if (trimmedStack && trimmedStack !== prevStackRef.current && trimmedStack.length >= 2) {
      prevStackRef.current = trimmedStack;
      loadTitlesForStack(trimmedStack, true);
    }
  }, [stack, loadTitlesForStack]);

  const handleStackInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onStackChange(val);
    setShowSuggestions(val.length > 0);
  };

  const selectSuggestion = (suggestion: string) => {
    onStackChange(suggestion);
    setShowSuggestions(false);
    loadTitlesForStack(suggestion, true);
  };

  const handleRefreshTitles = () => {
    loadTitlesForStack(stack || "", true);
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current);
      }

      const isHeic = isHeicFile(file);
      if (isHeic) {
        setIsConverting(true);
      }

      try {
        const url = await processImageFile(file);
        prevObjectUrl.current = url;
        setPhotoPreview(url);
        onPhotoChange(url);
        updateTransform(1, 0, 0);
        setShowFineTune(true);
      } catch (err) {
        console.error("Failed to process image:", err);
        alert("Failed to process image. Please try a different file.");
      } finally {
        setIsConverting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPhotoChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const removePhoto = () => {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
    setPhotoPreview(null);
    onPhotoChange(null);
    updateTransform(1, 0, 0);
    setShowFineTune(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredSuggestions = STACK_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(stack.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Photo Upload Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-hh-yellow tracking-wider uppercase">
            Your Photo
          </label>
          {photoPreview && (
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ✨ Smart Face Aligned
            </span>
          )}
        </div>

        <div
          className={`
            relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition-all duration-300 ease-out
            ${
              isDragOver
                ? "border-hh-yellow bg-hh-yellow/10 scale-[1.01]"
                : photoPreview
                ? "border-hh-green-600 bg-hh-green-800/40"
                : "border-hh-green-600 hover:border-hh-yellow/60 hover:bg-hh-green-800/30 animate-border-pulse"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.heic,.heif"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />

          {isConverting ? (
            <div className="py-3">
              <div className="w-8 h-8 border-3 border-hh-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-hh-yellow/80 text-xs">
                Converting HEIC image...
              </p>
            </div>
          ) : photoPreview ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover ring-2 ring-hh-yellow/40 shadow"
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">
                    Photo Uploaded
                  </p>
                  <p className="text-[11px] text-white/50">
                    Tap box to change photo
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowFineTune(!showFineTune)}
                  className="px-2.5 py-1.5 rounded-lg bg-hh-green-700 hover:bg-hh-green-600 text-hh-yellow text-xs font-medium transition-colors"
                >
                  {showFineTune ? "Hide Controls" : "🎯 Align Face"}
                </button>

                <button
                  type="button"
                  onClick={removePhoto}
                  className="w-7 h-7 bg-hh-pink/80 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:bg-hh-pink transition-colors"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="py-1">
              <div className="text-2xl mb-1">📸</div>
              <p className="text-white/80 text-xs">
                <span className="text-hh-yellow font-semibold">
                  Tap to upload
                </span>{" "}
                or drag & drop
              </p>
              <p className="text-white/40 text-[10px] mt-0.5">
                JPG, PNG, or HEIC (iPhone)
              </p>
            </div>
          )}
        </div>

        {/* Fine-Tune Face Alignment Controls */}
        {photoPreview && showFineTune && (
          <div className="mt-3 p-3 bg-hh-green-900/80 rounded-xl border border-hh-green-700/60 space-y-2.5 animate-fade-in-up">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-hh-yellow flex items-center gap-1">
                🎯 Face Fine-Tuning Controls
              </span>
              <button
                type="button"
                onClick={() => updateTransform(1, 0, 0)}
                className="text-[10px] text-white/50 hover:text-hh-yellow underline"
              >
                Reset Default
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/60">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) =>
                    updateTransform(parseFloat(e.target.value), offsetX, offsetY)
                  }
                  className="w-full h-1.5 bg-hh-green-700 rounded-lg appearance-none cursor-pointer accent-hh-yellow"
                />
              </div>

              {/* Vertical Position Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/60">
                  <span>Vert ↕️</span>
                  <span>{offsetY}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={offsetY}
                  onChange={(e) =>
                    updateTransform(zoom, offsetX, parseInt(e.target.value))
                  }
                  className="w-full h-1.5 bg-hh-green-700 rounded-lg appearance-none cursor-pointer accent-hh-yellow"
                />
              </div>

              {/* Horizontal Position Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/60">
                  <span>Horiz ↔️</span>
                  <span>{offsetX}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={offsetX}
                  onChange={(e) =>
                    updateTransform(zoom, parseInt(e.target.value), offsetY)
                  }
                  className="w-full h-1.5 bg-hh-green-700 rounded-lg appearance-none cursor-pointer accent-hh-yellow"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Name Input */}
      <div>
        <label
          htmlFor="name-input"
          className="block text-xs font-semibold text-hh-yellow mb-1.5 tracking-wider uppercase"
        >
          Your Name
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={handleNameInput}
          placeholder="Bablu Bhai"
          maxLength={30}
          className="
            w-full px-3.5 py-2.5 rounded-xl
            bg-hh-green-900/60 backdrop-blur-sm
            border border-hh-green-700/70 
            text-white placeholder:text-white/30
            focus:outline-none focus:border-hh-yellow focus:ring-1 focus:ring-hh-yellow/50
            transition-all duration-200
            text-sm
          "
        />
      </div>

      {/* Primary Stack Input */}
      <div className="relative">
        <label
          htmlFor="stack-input"
          className="block text-xs font-semibold text-hh-yellow mb-1.5 tracking-wider uppercase"
        >
          Primary Stack
        </label>
        <input
          id="stack-input"
          type="text"
          value={stack}
          onChange={handleStackInput}
          onFocus={() => stack.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="React / Rust / AI"
          maxLength={30}
          className="
            w-full px-3.5 py-2.5 rounded-xl
            bg-hh-green-900/60 backdrop-blur-sm
            border border-hh-green-700/70
            text-white placeholder:text-white/30
            focus:outline-none focus:border-hh-pink focus:ring-1 focus:ring-hh-pink/50
            transition-all duration-200
            text-sm
          "
        />
        {/* Autocomplete Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-hh-green-800 border border-hh-green-600 rounded-xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={() => selectSuggestion(suggestion)}
                className="w-full text-left px-3.5 py-2 text-xs text-white/80 hover:bg-hh-green-700 hover:text-hh-yellow transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Builder Title Selection Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="title-input"
            className="flex items-center gap-1.5 text-xs font-semibold text-hh-pink tracking-wider uppercase"
          >
            <span>✨ Builder Title (AI Generated)</span>
          </label>
          <button
            type="button"
            onClick={handleRefreshTitles}
            disabled={isGeneratingTitles}
            className="flex items-center gap-1 text-[11px] font-medium text-hh-yellow hover:text-hh-yellow-light disabled:opacity-50 transition-colors cursor-pointer"
          >
            <span
              className={`inline-block text-xs ${
                isGeneratingTitles ? "animate-spin" : ""
              }`}
            >
              🔄
            </span>
            <span>Refresh AI Titles</span>
          </button>
        </div>

        {/* Selected Title Input Field (Allows custom typing too) */}
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Select an AI title or type your own..."
          maxLength={35}
          className="
            w-full px-3.5 py-2.5 rounded-xl
            bg-hh-green-900/60 backdrop-blur-sm
            border border-hh-pink/50
            text-white placeholder:text-white/30
            focus:outline-none focus:border-hh-pink focus:ring-1 focus:ring-hh-pink/60
            transition-all duration-200
            text-sm font-medium
          "
        />

        {/* Candidate Title Chips Grid */}
        {isGeneratingTitles ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-hh-green-900/40 rounded-xl border border-hh-green-700/50">
            <div className="w-4 h-4 border-2 border-hh-pink border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-hh-pink/90 font-medium animate-pulse">
              Generating stack-customized AI titles...
            </span>
          </div>
        ) : suggestedTitles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestedTitles.map((t) => {
              const isSelected =
                title.trim().toLowerCase() === t.trim().toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTitleChange(t)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? "bg-hh-pink text-white font-semibold shadow-md ring-2 ring-hh-pink/50 scale-[1.02]"
                        : "bg-hh-green-800/80 text-white/80 border border-hh-green-700 hover:border-hh-pink/40 hover:text-white hover:bg-hh-green-700/60"
                    }
                  `}
                >
                  {isSelected ? `✓ ${t}` : t}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
