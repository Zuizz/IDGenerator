import { NextResponse } from "next/server";
import { readShareBadge } from "@/lib/shareStore";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await readShareBadge(id);

  if (!image) {
    return NextResponse.json({ error: "Badge not found." }, { status: 404 });
  }

  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
    },
  });
}
