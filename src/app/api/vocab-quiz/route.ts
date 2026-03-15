import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 30;

type VocabItem = {
  word: string;
  definition: string;
  definitionCN?: string;
  category: string;
};

const quizQuestionSchema = z.object({
  type: z.enum(["definition", "fillBlank", "translate"]),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string(),
  explanationCN: z.string(),
  targetWord: z.string(),
});

const quizResponseSchema = z.object({
  questions: z.array(quizQuestionSchema),
});

export async function POST(req: Request) {
  try {
    const { words, difficulty } = await req.json();

    if (!words || !Array.isArray(words) || words.length < 4) {
      return Response.json(
        { error: "At least 4 vocabulary words required" },
        { status: 400 },
      );
    }

    const wordList = words
      .map(
        (w: VocabItem) =>
          `- "${w.word}": ${w.definition}${w.definitionCN ? ` (${w.definitionCN})` : ""}`,
      )
      .join("\n");

    const questionCount = Math.min(words.length, 10);

    const { output } = await generateText({
      model: google("gemini-3-flash-preview"),
      output: Output.object({ schema: quizResponseSchema }),
      prompt: `You are an English vocabulary quiz generator for ${difficulty || "intermediate"} level learners.

Given these vocabulary words:
${wordList}

Generate exactly ${questionCount} quiz questions with a MIX of these types:

1. **definition** — "What does [word] mean?" with 4 definition options (1 correct, 3 plausible distractors from the word list or generated)
2. **fillBlank** — A natural sentence with the target word replaced by ___. 4 word options (1 correct, 3 other words from the list). The sentence must be different from any original example sentence.
3. **translate** — "Which word means [Chinese definition]?" with 4 word options (1 correct, 3 other words from the list)

Rules:
- Each question must have exactly 4 options
- correctIndex is 0-3 indicating which option is correct
- Randomize the position of the correct answer
- Make distractors plausible but clearly wrong
- explanation: Brief English explanation of why the answer is correct
- explanationCN: Brief Chinese explanation
- targetWord: The vocabulary word being tested
- Distribute question types roughly evenly
- Sentences for fillBlank must sound natural and provide good context clues`,
    });

    if (!output) {
      return Response.json(
        { error: "Failed to generate quiz" },
        { status: 500 },
      );
    }

    return Response.json(output);
  } catch (error) {
    console.error("Vocab quiz error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Quiz generation failed" },
      { status: 500 },
    );
  }
}
