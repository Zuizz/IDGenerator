import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

// Primary in-memory cache for ultra-fast & permission-safe serverless access
const memoryCache = new Map<string, Buffer>();
const SHARE_DIR = path.join(os.tmpdir(), "hh-goa-share-cache");

function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    // If not a data URL match, try raw base64 string
    const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    return Buffer.from(base64Data, "base64");
  }
  return Buffer.from(match[2], "base64");
}

export async function storeShareBadge(dataUrl: string): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const buffer = dataUrlToBuffer(dataUrl);

  // 1. Always store in memory (never fails)
  memoryCache.set(id, buffer);

  // Keep memory cache size bounded (max 100 recent badges)
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  // 2. Best-effort fallback write to OS temp directory
  try {
    await mkdir(SHARE_DIR, { recursive: true });
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await writeFile(filePath, buffer);
  } catch (fsErr) {
    console.warn("Temp FS write warning (using memory cache):", fsErr);
  }

  return { id };
}

export async function readShareBadge(id: string): Promise<Buffer | null> {
  // 1. Check in-memory cache first
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  // 2. Fallback to OS temp directory
  try {
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await access(filePath);
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export function getShareBadgeImageUrl(id: string, baseUrl: string): string {
  return `${baseUrl}/api/shares/${id}/image`;
}

