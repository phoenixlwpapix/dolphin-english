import { z } from 'zod/v4'

// Language point schema
export const languagePointSchema = z.object({
    point: z.string().describe('The language point title, e.g., "Present Perfect Tense"'),
    explanation: z.string().describe('Simple English explanation of the point'),
    example: z.string().describe('An example sentence using this point'),
})

// Paragraph analysis schema
export const paragraphAnalysisSchema = z.object({
    index: z.number().describe('Paragraph index (0-based)'),
    text: z.string().describe('Original paragraph text'),
    summary: z.string().describe('One-sentence summary in simple English'),
    languagePoints: z.array(languagePointSchema).max(3).describe('2-3 key language points'),
})

// Vocabulary item schema
export const vocabularyItemSchema = z.object({
    word: z.string().describe('The vocabulary word'),
    pronunciation: z.string().describe('Phonetic pronunciation, e.g., /ˈwɜːrdz/'),
    definition: z.string().describe('Simple English definition'),
    originalSentence: z.string().describe('The sentence from the article containing this word'),
    category: z.enum(['essential', 'transferable', 'extended']).describe(
        'essential: must understand for this article, transferable: useful for other contexts, extended: for advanced learners'
    ),
})

// Quiz question schema
export const quizQuestionSchema = z.object({
    id: z.string().describe('Unique question ID'),
    type: z.enum(['main-idea', 'detail', 'vocabulary']).describe('Question type'),
    question: z.string().describe('The question text'),
    options: z.array(z.string()).length(4).describe('Four answer options'),
    correctAnswer: z.number().min(0).max(3).describe('Index of correct answer (0-3)'),
    sourceReference: z.string().describe('Quote from article that contains the answer'),
})

// Full course analysis schema
export const courseAnalysisSchema = z.object({
    learningObjectives: z.array(z.string()).min(3).max(5).describe(
        '3-5 learning objectives in simple English, each starting with an action verb'
    ),
    paragraphs: z.array(paragraphAnalysisSchema).describe('Analysis for each paragraph'),
    vocabulary: z.array(vocabularyItemSchema).min(8).max(15).describe(
        '8-15 key vocabulary items from the article'
    ),
    quizQuestions: z.array(quizQuestionSchema).min(5).max(8).describe(
        '5-8 comprehension questions covering main idea, details, and vocabulary'
    ),
})

// Difficulty assessment schema
export const difficultySchema = z.object({
    level: z.enum(['A2', 'A2+', 'B1']).describe('CEFR difficulty level'),
    wordCount: z.number().describe('Total word count'),
    beyondB1Percentage: z.number().describe('Percentage of vocabulary beyond B1 level'),
    assessment: z.string().describe('Brief difficulty assessment explanation'),
})

// Full article analysis response
export const articleAnalysisSchema = z.object({
    title: z.string().describe('Generated title for the article'),
    difficulty: difficultySchema,
    analysis: courseAnalysisSchema,
})

export type LanguagePoint = z.infer<typeof languagePointSchema>
export type ParagraphAnalysis = z.infer<typeof paragraphAnalysisSchema>
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>
export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type CourseAnalysis = z.infer<typeof courseAnalysisSchema>
export type Difficulty = z.infer<typeof difficultySchema>
export type ArticleAnalysis = z.infer<typeof articleAnalysisSchema>
