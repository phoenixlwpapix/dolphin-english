import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 15;

const sentenceResponseSchema = z.object({
  sentences: z.array(
    z.object({
      en: z.string(),
      zh: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const { word, definition, difficulty } = await req.json();

    if (!word || typeof word !== "string") {
      return Response.json({ error: "No word provided" }, { status: 400 });
    }

    const { output } = await generateText({
      model: google("gemini-3-flash-preview"),
      output: Output.object({ schema: sentenceResponseSchema }),
      prompt: `Generate 2 natural English example sentences using the word "${word}" (meaning: ${definition || "N/A"}).

Rules:
- Target difficulty: ${difficulty || "B1"} CEFR level
- Each sentence should show a different usage context
- Sentences should be practical and memorable
- For each sentence, provide a Chinese translation

Return 2 sentences, each with "en" (English) and "zh" (Chinese translation).`,
    });

    if (!output) {
      return Response.json(
        { error: "Failed to generate sentences" },
        { status: 500 },
      );
    }

    return Response.json(output);
  } catch (error) {
    console.error("Vocab sentences error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Sentence generation failed" },
      { status: 500 },
    );
  }
}
