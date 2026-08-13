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
): Promise<{ id: string; blobUrl?: string }> {
  const id = crypto.randomUUID();
  const buffer = dataUrlToBuffer(dataUrl);

  memoryCache.set(id, buffer);
  if (meta) metaCache.set(id, meta);

  if (memoryCache.size > 200) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
      metaCache.delete(firstKey);
    }
  }

  let blobUrl: string | undefined;

  // PRIMARY: Vercel Blob (permanent, survives cold starts)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const imageResult = await put(`badges/${id}.png`, buffer, {
        access: "public",
        contentType: "image/png",
      });
      blobUrl = imageResult.url;
      if (meta) {
        await put(`badges/${id}.json`, JSON.stringify(meta), {
          access: "public",
          contentType: "application/json",
        });
      }
    } catch (blobErr) {
      console.warn("Vercel Blob store warning:", blobErr);
    }
  }

  // FALLBACK: Local /tmp (dev only, ephemeral on Vercel)
  try {
    await mkdir(SHARE_DIR, { recursive: true });
    await writeFile(path.join(SHARE_DIR, `${id}.png`), buffer);
    if (meta) {
      await writeFile(path.join(SHARE_DIR, `${id}.json`), JSON.stringify(meta));
    }
  } catch (fsErr) {
    console.warn("Temp FS write warning:", fsErr);
  }

  return { id, blobUrl };
}

export async function readShareMetadata(id: string): Promise<BadgeMetadata | null> {
  if (metaCache.has(id)) return metaCache.get(id)!;

  try {
    const content = await readFile(path.join(SHARE_DIR, `${id}.json`), "utf-8");
    const meta = JSON.parse(content) as BadgeMetadata;
    metaCache.set(id, meta);
    return meta;
  } catch { /* continue */ }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `badges/${id}.json` });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          const meta = await res.json() as BadgeMetadata;
          metaCache.set(id, meta);
          return meta;
        }
      }
    } catch (blobReadErr) {
      console.warn("Vercel Blob meta read warning:", blobReadErr);
    }
  }

  return null;
}

export async function readShareBadge(id: string): Promise<Buffer | null> {
  if (memoryCache.has(id)) return memoryCache.get(id)!;

  try {
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await access(filePath);
    const buf = await readFile(filePath);
    memoryCache.set(id, buf);
    return buf;
  } catch { /* continue */ }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `badges/${id}.png` });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          memoryCache.set(id, buffer);
          return buffer;
        }
      }
    } catch (blobReadErr) {
      console.warn("Vercel Blob read warning:", blobReadErr);
    }
  }

  return null;
}

export function getShareBadgeImageUrl(id: string, baseUrl: string): string {
  return `${baseUrl}/api/shares/${id}/image`;
}
