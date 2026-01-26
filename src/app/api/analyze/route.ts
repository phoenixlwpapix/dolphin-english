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

function getAnalysisPrompt(extractedTitle: string | null) {
  const titleInstruction = extractedTitle
    ? `1. **Title**: Use the provided title: "${extractedTitle}"`
    : `1. **Title**: Generate a descriptive title for this article`;

  return `You are an expert English language teaching assistant specializing in content analysis across all CEFR levels.

Analyze the following English article and provide:

${titleInstruction}
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

    // 尝试从文本中提取标题
    const { title: extractedTitle, contentWithoutTitle } =
      extractTitleFromText(text);

    // 计算文章正文的字数（不含标题）
    const wordCount = contentWithoutTitle
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount < 100) {
      return Response.json({ error: "Article too short" }, { status: 400 });
    }

    // Use Gemini to analyze the article with bilingual content
    const { output } = await generateText({
      model: google("gemini-3-flash-preview"),
      output: Output.object({ schema: articleAnalysisSchema }),
      prompt: `${getAnalysisPrompt(extractedTitle)}\n\n---\n\nARTICLE:\n${contentWithoutTitle}`,
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
      difficulty: output.difficulty.level,
      wordCount: wordCount,
      analyzedData: output.analysis,
      isPublic: isPublic,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 },
    );
  }
}

