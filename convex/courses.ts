import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Validators (matching schema)
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

export const list = query({
    args: {},
    handler: async (ctx) => {
        const courses = await ctx.db.query("courses").order("desc").collect()

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
            courses.map(async (course) => {
                const progress = await ctx.db
                    .query("progress")
                    .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
                    .first()
                return { ...course, progress }
            })
        )

        return coursesWithProgress
    },
})

export const get = query({
    args: { id: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    },
})

export const create = mutation({
    args: {
        content: v.string(),
        title: v.string(),
        difficulty: v.union(v.literal("A2"), v.literal("A2+"), v.literal("B1")),
        wordCount: v.number(),
        analyzedData: v.optional(courseAnalysisValidator),
    },
    handler: async (ctx, args) => {
        const courseId = await ctx.db.insert("courses", {
            title: args.title,
            content: args.content,
            difficulty: args.difficulty,
            wordCount: args.wordCount,
            analyzedData: args.analyzedData,
        })
        return courseId
    },
})

export const updateAnalysis = mutation({
    args: {
        id: v.id("courses"),
        analyzedData: courseAnalysisValidator,
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { analyzedData: args.analyzedData })
    },
})

export const remove = mutation({
    args: { id: v.id("courses") },
    handler: async (ctx, args) => {
        // Delete associated progress first
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.id))
            .collect()

        for (const p of progress) {
            await ctx.db.delete(p._id)
        }

        // Delete the course
        await ctx.db.delete(args.id)
    },
})
