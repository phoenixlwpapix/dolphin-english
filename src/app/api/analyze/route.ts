import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { articleAnalysisSchema } from "@/lib/schemas";

export const maxDuration = 60;

/**
 * 尝试从文章文本中提取标题
 * 规则：如果第一行是短文本（≤15个单词）且不以句号结尾，则认为是标题
 */
function extractTitleFromText(text: string): {
  title: string | null;
  contentWithoutTitle: string;
} {
  const lines = text.trim().split(/\n/);
  const firstLine = lines[0]?.trim();

  if (!firstLine) {
    return { title: null, contentWithoutTitle: text };
  }

  const wordCount = firstLine.split(/\s+/).filter(Boolean).length;
  const endsWithPeriod = /[.!?]$/.test(firstLine);
  const isLikelyTitle = wordCount <= 15 && !endsWithPeriod;

  if (isLikelyTitle) {
    // 移除第一行作为标题，剩余内容作为文章正文
    const contentWithoutTitle = lines.slice(1).join("\n").trim();
    return { title: firstLine, contentWithoutTitle };
  }

  return { title: null, contentWithoutTitle: text };
}

function getAnalysisPrompt(extractedTitle: string | null, targetDifficulty: string | null) {
  const titleInstruction = extractedTitle
    ? `1. **Title**: Use the provided title: "${extractedTitle}"`
    : `1. **Title**: Generate a descriptive title for this article`;

  const difficultyNote = targetDifficulty
    ? `\nIMPORTANT: The user has designated this course as **${targetDifficulty}** level. Please calibrate all vocabulary explanations, language point complexity, and quiz difficulty to suit a ${targetDifficulty} learner.\n`
    : '';

  return `You are an expert English language teaching assistant specializing in content analysis across all CEFR levels.${difficultyNote}

Analyze the following English article and provide:

${titleInstruction}
2. **Difficulty Assessment**:
   - Level: Assess the CEFR level (A1, A2, B1, B2, C1, or C2)
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
   IMPORTANT: There must be at least 2 paragraph entries. If the article has only one paragraph, split it into 2-3 logical sections (e.g., by topic shift, time sequence, or idea progression) and analyze each section as a separate paragraph entry.
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

7. **Dolphin Summary (海豚小结)**: Write a casual, warm lesson wrap-up in the voice of a friendly dolphin tutor. Create TWO versions:
   - "dolphinSummary": Chinese version (primary). Aimed at Chinese English learners. Cover 2-3 key grammar points and language structures from this specific article. Reference actual sentences from the article as examples. Explain tricky distinctions learners commonly confuse (e.g., adjective vs. gerund, different tense usages). Use a relaxed, encouraging tone — like a patient friend explaining things over coffee. End with brief encouragement. 200-400 Chinese characters.
   - "dolphinSummaryEN": English version covering the same grammar/language points, adapted for English-speaking learners. 150-300 words.

   Tone: Address the reader directly ("你"/"you"), be conversational not textbook-formal, naturally weave in 1-2 dolphin/ocean metaphors (e.g., "让我们潜入这篇文章的语法海洋", "Let's dive into the grammar"), and keep it fun and approachable.

Important guidelines:
- Adapt your language complexity based on the assessed CEFR level
- All language points should be practical and immediately usable
- Questions should test genuine understanding, not just word matching
- Make sure vocabulary definitions are accessible to learners at the assessed level
- Learning objectives and paragraph summaries MUST be provided in BOTH English and Chinese`;
}

export async function POST(req: Request) {
  try {
    const { text, isPublic, difficulty: targetDifficulty } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    // 尝试从文本中提取标题
    const { title: extractedTitle, contentWithoutTitle } =
      extractTitleFromText(text);

    // 计算文章正文的字数（不含标题）
    const wordCount = contentWithoutTitle
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount < 50) {
      return Response.json({ error: "Article too short (minimum 50 words)" }, { status: 400 });
    }

    // Use Gemini to analyze the article with bilingual content
    const { output } = await generateText({
      model: google("gemini-3-flash-preview"),
      output: Output.object({ schema: articleAnalysisSchema }),
      prompt: `${getAnalysisPrompt(extractedTitle, targetDifficulty ?? null)}\n\n---\n\nARTICLE:\n${contentWithoutTitle}`,
    });

    if (!output) {
      return Response.json(
        { error: "Analysis failed to produce output" },
        { status: 500 },
      );
    }

    // 优先使用提取的标题，如果没有则使用AI生成的标题
    const finalTitle = extractedTitle || output.title;

    // Return the analysis result for the client to handle
    return Response.json({
      content: text, // 保留原始完整文本（包含标题）
      title: finalTitle,
      difficulty: targetDifficulty ?? output.difficulty.level,
      wordCount: wordCount,
      analyzedData: output.analysis,
      isPublic: isPublic,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("timed out") || message.includes("deadline")) {
      return Response.json(
        { error: "Analysis timed out — the article may be too long. Try a shorter excerpt." },
        { status: 504 },
      );
    }
    if (message.includes("parse") || message.includes("schema") || message.includes("validation")) {
      return Response.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 500 },
      );
    }
    return Response.json(
      { error: "Analysis failed. Please try again in a moment." },
      { status: 500 },
    );
  }
}

