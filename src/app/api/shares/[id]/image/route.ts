import { NextResponse } from "next/server";
import { readShareBadge } from "@/lib/shareStore";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let image = await readShareBadge(id);

  // Fallback to default template image if not found in cache
  if (!image) {
    try {
      const fallbackPath = path.join(process.cwd(), "public", "badge-template.png");
      image = await readFile(fallbackPath);
    } catch {
      return NextResponse.json({ error: "Badge template not found." }, { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
