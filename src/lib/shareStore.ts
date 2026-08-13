import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

const SHARE_DIR = path.join(os.tmpdir(), "hh-goa-share-cache");

function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image payload.");
  }

  return Buffer.from(match[2], "base64");
}

async function ensureShareDir() {
  await mkdir(SHARE_DIR, { recursive: true });
}

export async function storeShareBadge(dataUrl: string): Promise<{
  id: string;
}> {
  await ensureShareDir();

  const id = crypto.randomUUID();
  const filePath = path.join(SHARE_DIR, `${id}.png`);
  const buffer = dataUrlToBuffer(dataUrl);

  await writeFile(filePath, buffer);

  return { id };
}

export async function readShareBadge(id: string): Promise<Buffer | null> {
  await ensureShareDir();

  const filePath = path.join(SHARE_DIR, `${id}.png`);
  try {
    await access(filePath);
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export function getShareBadgeImageUrl(id: string, baseUrl: string): string {
  return `${baseUrl}/api/shares/${id}/image`;
}

