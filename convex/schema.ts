import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const languagePointValidator = v.object({
    point: v.string(),
    explanation: v.string(),
    example: v.string(),
})

const paragraphValidator = v.object({
    index: v.number(),
    text: v.string(),
    summary: v.string(),
    languagePoints: v.array(languagePointValidator),
})

const vocabularyValidator = v.object({
    word: v.string(),
    pronunciation: v.string(),
    definition: v.string(),
    originalSentence: v.string(),
    category: v.union(v.literal("essential"), v.literal("transferable"), v.literal("extended")),
})

const quizQuestionValidator = v.object({
    id: v.string(),
    type: v.union(v.literal("main-idea"), v.literal("detail"), v.literal("vocabulary")),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    sourceReference: v.string(),
})

const courseAnalysisValidator = v.object({
    learningObjectives: v.array(v.string()),
    paragraphs: v.array(paragraphValidator),
    vocabulary: v.array(vocabularyValidator),
    quizQuestions: v.array(quizQuestionValidator),
})

const quizResultValidator = v.object({
    questionId: v.string(),
    selectedAnswer: v.number(),
    isCorrect: v.boolean(),
})

export default defineSchema({
    courses: defineTable({
        title: v.string(),
        content: v.string(),
        difficulty: v.union(v.literal("A2"), v.literal("A2+"), v.literal("B1")),
        wordCount: v.number(),
        analyzedData: v.optional(courseAnalysisValidator),
    }),

    progress: defineTable({
        courseId: v.id("courses"),
        currentModule: v.number(),
        completedModules: v.array(v.number()),
        quizResults: v.array(quizResultValidator),
        vocabularyClicks: v.array(v.string()),
    }).index("by_courseId", ["courseId"]),
})
