import { NextResponse } from "next/server";
import { storeShareBadge } from "@/lib/shareStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      dataUrl?: string;
      name?: string;
      stack?: string;
      title?: string;
    };

    if (!body.dataUrl) {
      return NextResponse.json(
        { error: "Missing badge image data." },
        { status: 400 }
      );
    }

    const { id } = await storeShareBadge(body.dataUrl, {
      name: body.name,
      stack: body.stack,
      title: body.title,
    });
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to store badge:", error);
    return NextResponse.json(
      { error: "Failed to save badge locally." },
      { status: 500 }
    );
  }
}
