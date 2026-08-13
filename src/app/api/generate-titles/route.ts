import { NextResponse } from "next/server";
import { generateLocalStackTitles } from "@/lib/titles";

export async function POST(req: Request) {
  try {
    const { stack } = (await req.json()) as { stack?: string };

    const cleanStack = (stack || "").trim();
    if (!cleanStack) {
      return NextResponse.json({ titles: generateLocalStackTitles("") });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Generate 5 creative, witty, epic 2-4 word builder/hacker titles specifically tailored for a developer specializing in: "${cleanStack}". Examples: "React Hook Alchemist", "Async Rust Wizard", "Solidity Gas Destroyer", "AI Prompt Surfer", "Midnight Deployer". Return ONLY a valid JSON array of 5 title strings, without any markdown formatting or code blocks. Example format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 250,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText: string =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          const jsonText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleanTitles = parsed
              .filter((t: unknown) => typeof t === "string" && t.length > 0)
              .slice(0, 5);
            if (cleanTitles.length > 0) {
              return NextResponse.json({ titles: cleanTitles });
            }
          }
        }
      } catch (aiErr) {
        console.warn("Gemini API title generation error, using fallback:", aiErr);
      }
    }

    // Fallback if no API key or API request failed
    const fallbackTitles = generateLocalStackTitles(cleanStack);
    return NextResponse.json({ titles: fallbackTitles });
  } catch (err) {
    console.error("Failed to generate titles:", err);
    return NextResponse.json(
      { titles: generateLocalStackTitles("") },
      { status: 500 }
    );
  }
}
