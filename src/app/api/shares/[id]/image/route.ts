import { NextResponse } from "next/server";
import { readShareBadge, readShareMetadata, getPublicImageUrl } from "@/lib/shareStore";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fast path: redirect to permanent Supabase CDN URL if available
  const meta = await readShareMetadata(id);
  if (meta?.imageUrl) {
    return NextResponse.redirect(meta.imageUrl, { status: 302 });
  }

  // Derive Supabase public URL directly (doesn't need metadata cache)
  const publicUrl = getPublicImageUrl(id);
  if (publicUrl) {
    return NextResponse.redirect(publicUrl, { status: 302 });
  }

  // Fallback: serve from memory / /tmp (local dev)
  let image = await readShareBadge(id);

  if (!image) {
    try {
      const fallbackPath = path.join(process.cwd(), "public", "badge-template.png");
      image = await readFile(fallbackPath);
    } catch {
      return NextResponse.json({ error: "Badge not found." }, { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
