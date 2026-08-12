"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { drawCoverImage, loadImage, PhotoTransform } from "@/lib/canvasUtils";
import { getRandomTitle } from "@/lib/titles";

export type BadgeMode = "card" | "pfp";

interface CanvasPreviewProps {
  name: string;
  stack: string;
  photoUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mode: BadgeMode;
  transform?: PhotoTransform;
}

// Card Canvas dimensions (2:3 vertical ID card)
const CARD_W = 600;
const CARD_H = 900;
const TEXT_CENTER_X = CARD_W / 2;

// Photo polaroid frame coordinates for Card
const FRAME_W = 200;
const FRAME_H = 200;
const FRAME_X = (CARD_W - FRAME_W) / 2;
const FRAME_Y = 300;

const PHOTO_PAD = 10;
const PHOTO_BOTTOM_PAD = 30;
const PHOTO_X = FRAME_X + PHOTO_PAD;
const PHOTO_Y = FRAME_Y + PHOTO_PAD;
const PHOTO_W = FRAME_W - PHOTO_PAD * 2;
const PHOTO_H = FRAME_H - PHOTO_PAD - PHOTO_BOTTOM_PAD;

// Dynamic text positions for Card
const NAME_Y = 515;
const STACK_PILL_Y = 562;
const TITLE_PILL_Y = 598;

// PFP Canvas dimensions
const PFP_SIZE = 600;

export default function CanvasPreview({
  name,
  stack,
  photoUrl,
  canvasRef,
  mode = "card",
  transform,
}: CanvasPreviewProps) {
  const cardTemplateRef = useRef<HTMLImageElement | null>(null);
  const pfpTemplateRef = useRef<HTMLImageElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const builderTitleRef = useRef<string>(getRandomTitle());
  const prevStackRef = useRef<string>("");
  const [isReady, setIsReady] = useState(false);

  // Load both templates on mount
  useEffect(() => {
      Promise.all([
        loadImage("/badge-template.png"),
        loadImage("/pfp-template.png"),
      ])
      .then(([cardImg, pfpImg]) => {
        cardTemplateRef.current = cardImg;
        pfpTemplateRef.current = pfpImg;
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to load badge templates:", err);
      });
  }, []);

  // Randomize title when stack input changes
  useEffect(() => {
    if (stack && stack !== prevStackRef.current && stack.length > 1) {
      builderTitleRef.current = getRandomTitle();
    }
    prevStackRef.current = stack;
  }, [stack]);

  /** Helper to draw a rounded rectangle */
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const activeTransform = transform || { zoom: 1, offsetX: 0, offsetY: 0 };

    if (mode === "card") {
      // ═════════════════════════════════════════
      // MODE 1: VERTICAL ID CARD (600 x 900)
      // ═════════════════════════════════════════
      canvas.width = CARD_W;
      canvas.height = CARD_H;

      ctx.fillStyle = "#0B6839";
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      if (cardTemplateRef.current) {
        ctx.drawImage(cardTemplateRef.current, 0, 0, CARD_W, CARD_H);
      }

      // Photo Polaroid Frame
      if (photoImgRef.current) {
        ctx.save();

        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = "#FFFFFF";
        roundRect(ctx, FRAME_X, FRAME_Y, FRAME_W, FRAME_H, 6);
        ctx.fill();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.save();
        roundRect(ctx, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H, 3);
        ctx.clip();
        drawCoverImage(
          ctx,
          photoImgRef.current,
          PHOTO_X,
          PHOTO_Y,
          PHOTO_W,
          PHOTO_H,
          activeTransform
        );
        ctx.restore();

        ctx.restore();
      } else {
        ctx.save();

        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        roundRect(ctx, FRAME_X, FRAME_Y, FRAME_W, FRAME_H, 6);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        roundRect(ctx, FRAME_X, FRAME_Y, FRAME_W, FRAME_H, 6);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "40px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📷", TEXT_CENTER_X, FRAME_Y + FRAME_H / 2);

        ctx.restore();
      }

      // Name Rendering
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      if (name && name.trim().length > 0) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 34px 'Playfair Display', Georgia, serif";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillText(name.trim().toUpperCase(), TEXT_CENTER_X, NAME_Y, CARD_W - 60);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.font = "italic 26px 'Inter', sans-serif";
        ctx.fillText("YOUR NAME", TEXT_CENTER_X, NAME_Y);
      }

      // Primary Stack Pill
      if (stack && stack.trim().length > 0) {
        const stackText = `PRIMARY STACK: ${stack.trim().toUpperCase()}`;
        ctx.font = "bold 13px 'Inter', sans-serif";
        const metrics = ctx.measureText(stackText);
        const pillW = Math.min(metrics.width + 32, CARD_W - 70);
        const pillH = 28;
        const pillX = TEXT_CENTER_X - pillW / 2;

        ctx.fillStyle = "rgba(11, 104, 57, 0.9)";
        roundRect(ctx, pillX, STACK_PILL_Y, pillW, pillH, pillH / 2);
        ctx.fill();

        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#FFE766";
        ctx.textBaseline = "middle";
        ctx.fillText(stackText, TEXT_CENTER_X, STACK_PILL_Y + pillH / 2, pillW - 16);
      }

      // Builder Title Pill
      if (stack && stack.trim().length > 0) {
        const titleText = `BUILDER TITLE: ${builderTitleRef.current.toUpperCase()}`;
        ctx.font = "bold 12px 'Inter', sans-serif";
        const metrics = ctx.measureText(titleText);
        const pillW = Math.min(metrics.width + 32, CARD_W - 70);
        const pillH = 26;
        const pillX = TEXT_CENTER_X - pillW / 2;

        ctx.fillStyle = "rgba(11, 104, 57, 0.9)";
        roundRect(ctx, pillX, TITLE_PILL_Y, pillW, pillH, pillH / 2);
        ctx.fill();

        ctx.strokeStyle = "#FF6B9D";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#FF8DB5";
        ctx.textBaseline = "middle";
        ctx.fillText(titleText, TEXT_CENTER_X, TITLE_PILL_Y + pillH / 2, pillW - 16);
      }

    } else {
      // ═════════════════════════════════════════
      // MODE 2: CIRCULAR PFP AVATAR (600 x 600)
      // ═════════════════════════════════════════
      canvas.width = PFP_SIZE;
      canvas.height = PFP_SIZE;

      // Pure transparent canvas background (no wood box)
      ctx.clearRect(0, 0, PFP_SIZE, PFP_SIZE);

      const cx = PFP_SIZE / 2; // 300
      const cy = 308;          // Center of PFP badge photo hole below emblem
      const photoClipRadius = 275; // Clips photo to green ring outer edge so it covers entire frame without bleeding outside

      // 1. Draw User Photo (Behind Frame)
      if (photoImgRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, photoClipRadius, 0, Math.PI * 2);
        ctx.clip();
        drawCoverImage(
          ctx,
          photoImgRef.current,
          cx - photoClipRadius,
          cy - photoClipRadius,
          photoClipRadius * 2,
          photoClipRadius * 2,
          activeTransform
        );
        ctx.restore();
      } else {
        // Default PFP placeholder inside circle
        ctx.save();
        ctx.fillStyle = "#0B6839";
        ctx.beginPath();
        ctx.arc(cx, cy, photoClipRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "64px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📷", cx, cy);
        ctx.restore();
      }

      // 2. Draw Circular PFP Frame Overlay (On Top)
      if (pfpTemplateRef.current) {
        ctx.drawImage(pfpTemplateRef.current, 0, 0, PFP_SIZE, PFP_SIZE);
      }
    }
  }, [name, stack, photoUrl, mode, transform, canvasRef]);

  // Load photo when URL changes
  useEffect(() => {
    if (!photoUrl) {
      photoImgRef.current = null;
      return;
    }

    loadImage(photoUrl)
      .then((img) => {
        photoImgRef.current = img;
        drawCanvas();
      })
      .catch((err) => {
        console.error("Failed to load photo:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl]);

  // Re-draw canvas whenever dependencies change
  useEffect(() => {
    if (isReady) {
      drawCanvas();
    }
  }, [isReady, name, stack, mode, transform, drawCanvas]);

  return (
    <div className="canvas-wrapper flex justify-center">
      <canvas
        ref={canvasRef}
        width={mode === "card" ? CARD_W : PFP_SIZE}
        height={mode === "card" ? CARD_H : PFP_SIZE}
        className="rounded-2xl shadow-2xl ring-1 ring-white/10"
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
