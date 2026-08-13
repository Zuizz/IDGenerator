import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

interface BadgeMetadata {
  name?: string;
  stack?: string;
  title?: string;
  imageUrl?: string; // permanent Supabase public URL
}

const memoryCache = new Map<string, Buffer>();
const metaCache = new Map<string, BadgeMetadata>();
const SHARE_DIR = path.join(os.tmpdir(), "hh-goa-share-cache");
const BUCKET = "badges";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

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
  meta?: Omit<BadgeMetadata, "imageUrl">
): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const buffer = dataUrlToBuffer(dataUrl);

  // 1. Memory cache for same-request fast reads
  memoryCache.set(id, buffer);

  if (memoryCache.size > 200) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
      metaCache.delete(firstKey);
    }
  }

  let imageUrl: string | undefined;

  // 2. PRIMARY: Supabase Storage (permanent CDN URL)
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${id}.png`, buffer, {
          contentType: "image/png",
          upsert: false,
        });

      if (!error) {
        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${id}.png`);
        imageUrl = data.publicUrl;
      } else {
        console.warn("Supabase upload error:", error.message);
      }
    } catch (err) {
      console.warn("Supabase storage error:", err);
    }
  }

  const fullMeta: BadgeMetadata = { ...meta, imageUrl };
  metaCache.set(id, fullMeta);

  // 3. FALLBACK: /tmp for local dev
  try {
    await mkdir(SHARE_DIR, { recursive: true });
    await writeFile(path.join(SHARE_DIR, `${id}.png`), buffer);
    await writeFile(
      path.join(SHARE_DIR, `${id}.json`),
      JSON.stringify(fullMeta)
    );
  } catch (fsErr) {
    console.warn("Temp FS write warning:", fsErr);
  }

  return { id };
}

export async function readShareMetadata(
  id: string
): Promise<BadgeMetadata | null> {
  // 1. Memory cache
  if (metaCache.has(id)) return metaCache.get(id)!;

  // 2. Local /tmp (dev)
  try {
    const content = await readFile(
      path.join(SHARE_DIR, `${id}.json`),
      "utf-8"
    );
    const meta = JSON.parse(content) as BadgeMetadata;
    metaCache.set(id, meta);
    return meta;
  } catch { /* continue */ }

  return null;
}

export async function readShareBadge(id: string): Promise<Buffer | null> {
  // 1. Memory cache
  if (memoryCache.has(id)) return memoryCache.get(id)!;

  // 2. Local /tmp
  try {
    const filePath = path.join(SHARE_DIR, `${id}.png`);
    await access(filePath);
    const buf = await readFile(filePath);
    memoryCache.set(id, buf);
    return buf;
  } catch { /* continue */ }

  // 3. Supabase Storage
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(`${id}.png`);
      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        memoryCache.set(id, buffer);
        return buffer;
      }
    } catch (err) {
      console.warn("Supabase download error:", err);
    }
  }

  return null;
}

export function getPublicImageUrl(id: string): string | null {
  const meta = metaCache.get(id);
  if (meta?.imageUrl) return meta.imageUrl;

  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${BUCKET}/${id}.png`;
}

export function getShareBadgeImageUrl(id: string, baseUrl: string): string {
  return `${baseUrl}/api/shares/${id}/image`;
}
