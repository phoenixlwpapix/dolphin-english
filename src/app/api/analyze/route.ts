import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { articleAnalysisSchema } from '@/lib/schemas'
import { createCourse, updateCourseAnalysis } from '@/lib/courseService'
import { createProgress } from '@/lib/progressService'

export const maxDuration = 60

const ANALYSIS_PROMPT = `You are an expert English language teaching assistant specializing in CEFR A2-B1 level content analysis.

Analyze the following English article and provide:

1. **Title**: Generate a descriptive title for this article
2. **Difficulty Assessment**: 
   - Level: A2, A2+, or B1
   - Word count
   - Percentage of vocabulary beyond B1 level (should be under 8%)
   - Brief explanation of the difficulty

3. **Learning Objectives**: Generate 3-5 clear learning objectives in simple English, each starting with an action verb (understand, recognize, use, explain, etc.)

4. **Paragraph Analysis**: For each paragraph:
   - One-sentence summary in simplified English
   - 2-3 key language points with simple explanations and examples

5. **Vocabulary**: Extract 8-15 key vocabulary items:
   - Essential: Must understand for this article
   - Transferable: Useful for other contexts  
   - Extended: For advanced learners
   Include phonetic pronunciation, simple English definition, and the original sentence from the article.

6. **Quiz Questions**: Create 5-8 comprehension questions:
   - Main idea questions
   - Detail questions (answers can be found in specific parts of the text)
   - Vocabulary in context questions
   Include 4 options each, the correct answer index, and a reference quote from the article.

Important guidelines:
- Use simple, clear English suitable for A2-B1 learners
- All language points should be practical and immediately usable
- Questions should test genuine understanding, not just word matching
- Make sure vocabulary definitions are accessible to intermediate learners`

export async function POST(req: Request) {
    try {
        const { text } = await req.json()

        if (!text || typeof text !== 'string') {
            return Response.json({ error: 'No text provided' }, { status: 400 })
        }

        const wordCount = text.trim().split(/\s+/).filter(Boolean).length

        if (wordCount < 100) {
            return Response.json({ error: 'Article too short' }, { status: 400 })
        }

        // Use Gemini to analyze the article
        const { output } = await generateText({
            model: google('gemini-3-flash-preview'),
            output: Output.object({ schema: articleAnalysisSchema }),
            prompt: `${ANALYSIS_PROMPT}\n\n---\n\nARTICLE:\n${text}`,
        })

        if (!output) {
            return Response.json({ error: 'Analysis failed to produce output' }, { status: 500 })
        }

        // Save course to database
        const courseId = await createCourse(
            text,
            output.title,
            output.difficulty.level,
            output.difficulty.wordCount,
            output.analysis
        )

        // Create initial progress
        await createProgress(courseId)

        return Response.json({
            courseId,
            title: output.title,
            difficulty: output.difficulty,
        })
    } catch (error) {
        console.error('Analysis error:', error)
        return Response.json(
            { error: error instanceof Error ? error.message : 'Analysis failed' },
            { status: 500 }
        )
    }
}
