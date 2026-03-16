import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { auth } from "./auth"

const quizResultValidator = v.object({
    questionId: v.string(),
    selectedAnswer: v.number(),
    isCorrect: v.boolean(),
})

export const get = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) return null
        return await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()
    },
})

export const create = mutation({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        // Avoid creating duplicate progress records
        const existing = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()
        if (existing) return existing._id

        const progressId = await ctx.db.insert("progress", {
            userId: userId.toString(),
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
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                currentModule: args.moduleNumber,
                lastStudiedAt: Date.now(),
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
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
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

            const existingCompletions = progress.moduleCompletions ?? []
            const alreadyLogged = existingCompletions.some(
                (mc) => mc.moduleNumber === args.moduleNumber
            )
            const moduleCompletions = alreadyLogged
                ? existingCompletions
                : [...existingCompletions, { moduleNumber: args.moduleNumber, completedAt: Date.now() }]

            await ctx.db.patch(progress._id, {
                completedModules,
                currentModule: nextModule,
                moduleCompletions,
                lastStudiedAt: Date.now(),
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
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                quizResults: args.results,
                lastStudiedAt: Date.now(),
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
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()

        if (progress) {
            const clicks = [...progress.vocabularyClicks]
            if (!clicks.includes(args.word)) {
                clicks.push(args.word)
            }
            await ctx.db.patch(progress._id, {
                vocabularyClicks: clicks,
                lastStudiedAt: Date.now(),
            })
        }
    },
})

export const reset = mutation({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first()

        if (progress) {
            await ctx.db.patch(progress._id, {
                currentModule: 1,
                completedModules: [],
                moduleCompletions: [],
                lastStudiedAt: undefined,
                quizResults: [],
                vocabularyClicks: [],
            })
        }
    },
})
