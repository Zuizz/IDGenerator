import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

interface BadgeMetadata {
  name?: string;
  stack?: string;
  title?: string;
}

const memoryCache = new Map<string, Buffer>();
const metaCache = new Map<string, BadgeMetadata>();
const SHARE_DIR = path.join(os.tmpdir(), "hh-goa-share-cache");

function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    return Buffer.from(base64Data, "base64");
  }
  return Buffer.from(match[2], "base64");
}

export async function storeShareBadge(
  dataUrl: string,
  meta?: BadgeMetadata
): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const buffer = dataUrlToBuffer(dataUrl);

  // 1. Store in memory cache
  memoryCache.set(id, buffer);
  if (meta) metaCache.set(id, meta);

  if (memoryCache.size > 200) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
      metaCache.delete(firstKey);
    }
  }

  // 2. Attempt Vercel Blob if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      // @ts-ignore - optional Vercel Blob dynamic import
      const { put } = await import("@vercel/blob");
      await put(`badges/${id}.png`, buffer, {
        access: "public",
        contentType: "image/png",
      });
    } catch (blobErr) {
      console.warn("Vercel Blob store warning:", blobErr);
    }
  }

  // 3. Best-effort fallback write to OS temp directory
  try {
    await mkdir(SHARE_DIR, { recursive: true });
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await writeFile(filePath, buffer);

    if (meta) {
      const metaPath = path.join(SHARE_DIR, `${id}.json`);
      await writeFile(metaPath, JSON.stringify(meta));
    }
  } catch (fsErr) {
    console.warn("Temp FS write warning:", fsErr);
  }

  return { id };
}

export async function readShareMetadata(id: string): Promise<BadgeMetadata | null> {
  if (metaCache.has(id)) {
    return metaCache.get(id)!;
  }
  try {
    const metaPath = path.join(SHARE_DIR, `${id}.json`);
    const content = await readFile(metaPath, "utf-8");
    const meta = JSON.parse(content) as BadgeMetadata;
    metaCache.set(id, meta);
    return meta;
  } catch {
    return null;
  }
}

export async function readShareBadge(id: string): Promise<Buffer | null> {
  // 1. Check in-memory cache first
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  // 2. Check OS temp directory
  try {
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await access(filePath);
    return await readFile(filePath);
  } catch {
    // 3. Check Vercel Blob if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobUrl = `https://public.blob.vercel-storage.com/badges/${id}.png`;
        const res = await fetch(blobUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          memoryCache.set(id, buffer);
          return buffer;
        }
      } catch (blobReadErr) {
        console.warn("Vercel Blob read warning:", blobReadErr);
      }
    }
    return null;
  }
}

export function getShareBadgeImageUrl(id: string, baseUrl: string): string {
  return `${baseUrl}/api/shares/${id}/image`;
}

