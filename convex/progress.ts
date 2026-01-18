import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

const quizResultValidator = v.object({
    questionId: v.string(),
    selectedAnswer: v.number(),
    isCorrect: v.boolean(),
})

export const get = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()
    },
})

export const create = mutation({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const progressId = await ctx.db.insert("progress", {
            courseId: args.courseId,
            currentModule: 1,
            completedModules: [],
            quizResults: [],
            vocabularyClicks: [],
        })
        return progressId
    },
})

export const updateCurrentModule = mutation({
    args: {
        courseId: v.id("courses"),
        moduleNumber: v.number(),
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                currentModule: args.moduleNumber,
            })
        }
    },
})

export const completeModule = mutation({
    args: {
        courseId: v.id("courses"),
        moduleNumber: v.number(),
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()

        if (progress) {
            const completedModules = [...progress.completedModules]
            if (!completedModules.includes(args.moduleNumber)) {
                completedModules.push(args.moduleNumber)
            }

            const TOTAL_MODULES = 6
            const nextModule = args.moduleNumber < TOTAL_MODULES
                ? args.moduleNumber + 1
                : args.moduleNumber

            await ctx.db.patch(progress._id, {
                completedModules,
                currentModule: nextModule,
            })
        }
    },
})

export const saveQuizResults = mutation({
    args: {
        courseId: v.id("courses"),
        results: v.array(quizResultValidator),
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                quizResults: args.results,
            })
        }
    },
})

export const recordVocabularyClick = mutation({
    args: {
        courseId: v.id("courses"),
        word: v.string(),
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()

        if (progress) {
            const clicks = [...progress.vocabularyClicks]
            if (!clicks.includes(args.word)) {
                clicks.push(args.word)
            }
            await ctx.db.patch(progress._id, {
                vocabularyClicks: clicks,
            })
        }
    },
})

export const reset = mutation({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("progress")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                currentModule: 1,
                completedModules: [],
                quizResults: [],
                vocabularyClicks: [],
            })
        }
    },
})
