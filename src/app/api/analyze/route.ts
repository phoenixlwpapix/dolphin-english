import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { articleAnalysisSchema } from "@/lib/schemas";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getAnalysisPrompt() {
  return `You are an expert English language teaching assistant specializing in content analysis across all CEFR levels.

Analyze the following English article and provide:

1. **Title**: Generate a descriptive title for this article
2. **Difficulty Assessment**:
   - Level: Assess the CEFR level (A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, or C2)
   - Word count
   - Percentage of vocabulary beyond the assessed level
   - Brief explanation of the difficulty

3. **Learning Objectives**: Generate 3-5 clear learning objectives. For EACH objective, provide BOTH:
   - "en": English version starting with an action verb (understand, recognize, use, explain, etc.)
   - "zh": Chinese version starting with an action verb (理解, 识别, 运用, 解释, 掌握, 学会, etc.)

4. **Paragraph Analysis**: For each paragraph:
   - "summary": One-sentence summary in simplified English
   - "summaryZH": One-sentence summary in Chinese (中文)
   - 2-3 key language points, each with:
     - "point": The language point title (e.g., "Present Perfect Tense")
     - "explanation": Simple English explanation
     - "explanationZH": Chinese explanation (中文解释)
     - "example": An example sentence using this point

5. **Vocabulary**: Extract 8-15 key vocabulary items:
   - Essential: Must understand for this article
   - Transferable: Useful for other contexts
   - Extended: For advanced learners
   Include phonetic pronunciation, simple English definition, Chinese definition (definitionCN), and the original sentence from the article.

6. **Quiz Questions**: Create 5-8 comprehension questions:
   - Main idea questions
   - Detail questions (answers can be found in specific parts of the text)
   - Vocabulary in context questions
   Include 4 options each, the correct answer index, and a reference quote from the article.

Important guidelines:
- Adapt your language complexity based on the assessed CEFR level
- All language points should be practical and immediately usable
- Questions should test genuine understanding, not just word matching
- Make sure vocabulary definitions are accessible to learners at the assessed level
- Learning objectives and paragraph summaries MUST be provided in BOTH English and Chinese`;
}

export async function POST(req: Request) {
  try {
    const { text, isPublic } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 100) {
      return Response.json({ error: "Article too short" }, { status: 400 });
    }

    // Use Gemini to analyze the article with bilingual content
    const { output } = await generateText({
      model: google("gemini-3-flash-preview"),
      output: Output.object({ schema: articleAnalysisSchema }),
      prompt: `${getAnalysisPrompt()}\n\n---\n\nARTICLE:\n${text}`,
    });

    if (!output) {
      return Response.json(
        { error: "Analysis failed to produce output" },
        { status: 500 },
      );
    }

    // Save course to Convex database
    // The analyzedData type uses a union in Convex schema to support both old and new formats
    const courseId = await convex.mutation(api.courses.create, {
      content: text,
      title: output.title,
      difficulty: output.difficulty.level,
      wordCount: output.difficulty.wordCount,
      // Type assertion needed because Convex validator uses union type for backward compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analyzedData: output.analysis as any,
      isPublic: isPublic,
    });

    // Create initial progress
    await convex.mutation(api.progress.create, {
      courseId,
    });

    return Response.json({
      courseId,
      title: output.title,
      difficulty: output.difficulty,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 },
    );
  }
}
