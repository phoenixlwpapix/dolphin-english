import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { auth } from "./auth"
import { difficultyValidator } from "./schema"

const TOTAL_MODULES = 6

// ─── Admin Mutations ────────────────────────────────────────────

export const create = mutation({
    args: {
        titleEn: v.string(),
        titleZh: v.string(),
        descriptionEn: v.string(),
        descriptionZh: v.string(),
        difficulty: difficultyValidator,
        courseIds: v.array(v.id("courses")),
        coverGradient: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")
        const user = await ctx.db.get(userId)
        if (user?.role !== "admin") throw new Error("Admin only")

        return await ctx.db.insert("learningPaths", {
            ...args,
            authorId: userId.toString(),
            isPublic: true,
        })
    },
})

export const update = mutation({
    args: {
        id: v.id("learningPaths"),
        titleEn: v.optional(v.string()),
        titleZh: v.optional(v.string()),
        descriptionEn: v.optional(v.string()),
        descriptionZh: v.optional(v.string()),
        difficulty: v.optional(difficultyValidator),
        courseIds: v.optional(v.array(v.id("courses"))),
        coverGradient: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")
        const user = await ctx.db.get(userId)
        if (user?.role !== "admin") throw new Error("Admin only")

        const path = await ctx.db.get(args.id)
        if (!path) throw new Error("Path not found")
        if (path.authorId !== userId.toString()) throw new Error("Not the author")

        const { id, ...updates } = args
        // Filter out undefined values
        const patch: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) patch[key] = value
        }

        await ctx.db.patch(id, patch)
    },
})

export const remove = mutation({
    args: { id: v.id("learningPaths") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")
        const user = await ctx.db.get(userId)
        if (user?.role !== "admin") throw new Error("Admin only")

        const path = await ctx.db.get(args.id)
        if (!path) throw new Error("Path not found")
        if (path.authorId !== userId.toString()) throw new Error("Not the author")

        // Delete all userPaths records for this path
        const userPaths = await ctx.db
            .query("userPaths")
            .filter((q) => q.eq(q.field("pathId"), args.id))
            .collect()
        for (const up of userPaths) {
            await ctx.db.delete(up._id)
        }

        await ctx.db.delete(args.id)
    },
})

// ─── User Mutations ─────────────────────────────────────────────

export const joinPath = mutation({
    args: { pathId: v.id("learningPaths") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        // Check if already joined
        const existing = await ctx.db
            .query("userPaths")
            .withIndex("by_userId_pathId", (q) =>
                q.eq("userId", userId.toString()).eq("pathId", args.pathId)
            )
            .first()
        if (existing) return existing._id

        // Insert userPaths record
        const id = await ctx.db.insert("userPaths", {
            userId: userId.toString(),
            pathId: args.pathId,
            addedAt: Date.now(),
        })

        // Batch-enroll in all courses
        const path = await ctx.db.get(args.pathId)
        if (path) {
            for (const courseId of path.courseIds) {
                const alreadyJoined = await ctx.db
                    .query("userCourses")
                    .withIndex("by_userId_courseId", (q) =>
                        q.eq("userId", userId.toString()).eq("courseId", courseId)
                    )
                    .first()
                if (!alreadyJoined) {
                    await ctx.db.insert("userCourses", {
                        userId: userId.toString(),
                        courseId,
                        addedAt: Date.now(),
                    })
                }
            }
        }

        return id
    },
})

export const leavePath = mutation({
    args: { pathId: v.id("learningPaths") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) throw new Error("Must be logged in")

        const userPath = await ctx.db
            .query("userPaths")
            .withIndex("by_userId_pathId", (q) =>
                q.eq("userId", userId.toString()).eq("pathId", args.pathId)
            )
            .first()

        if (userPath) {
            await ctx.db.delete(userPath._id)
        }
    },
})

// ─── Queries ────────────────────────────────────────────────────

export const listPublic = query({
    args: {},
    handler: async (ctx) => {
        const paths = await ctx.db.query("learningPaths").order("desc").collect()
        return paths.filter((p) => p.isPublic)
    },
})

export const get = query({
    args: { id: v.id("learningPaths") },
    handler: async (ctx, args) => {
        const path = await ctx.db.get(args.id)
        if (!path) return null

        const courses = await Promise.all(
            path.courseIds.map(async (courseId) => {
                const course = await ctx.db.get(courseId)
                if (!course) return null
                const progress = await ctx.db
                    .query("progress")
                    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
                    .first()
                return { ...course, progress }
            })
        )

        const validCourses = courses.filter((c) => c !== null)
        const completedCourses = validCourses.filter(
            (c) => c.progress?.completedModules?.length === TOTAL_MODULES
        ).length

        return {
            ...path,
            courses: validCourses,
            completedCourses,
            totalCourses: validCourses.length,
        }
    },
})

export const listMyPaths = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) return []

        const userPaths = await ctx.db
            .query("userPaths")
            .withIndex("by_userId", (q) => q.eq("userId", userId.toString()))
            .collect()

        const paths = await Promise.all(
            userPaths.map(async (up) => {
                const path = await ctx.db.get(up.pathId)
                if (!path) return null

                // Derive progress
                let completedCourses = 0
                for (const courseId of path.courseIds) {
                    const progress = await ctx.db
                        .query("progress")
                        .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
                        .first()
                    if (progress?.completedModules?.length === TOTAL_MODULES) {
                        completedCourses++
                    }
                }

                return {
                    ...path,
                    addedAt: up.addedAt,
                    completedCourses,
                    totalCourses: path.courseIds.length,
                }
            })
        )

        return paths.filter((p) => p !== null)
    },
})

export const isJoined = query({
    args: { pathId: v.id("learningPaths") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) return false

        const userPath = await ctx.db
            .query("userPaths")
            .withIndex("by_userId_pathId", (q) =>
                q.eq("userId", userId.toString()).eq("pathId", args.pathId)
            )
            .first()

        return userPath !== null
    },
})
