import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { auth } from "./auth"
import { difficultyValidator } from "./schema"
import type { MutationCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"

const TOTAL_MODULES = 6

function toPathCoursePreview(course: Doc<"courses">, progress: Doc<"progress"> | null) {
    return {
        _id: course._id,
        _creationTime: course._creationTime,
        title: course.title,
        difficulty: course.difficulty,
        wordCount: course.wordCount,
        isPublic: course.isPublic,
        progress,
    }
}

async function requirePublicCourses(ctx: MutationCtx, courseIds: Array<Id<"courses">>) {
    for (const courseId of courseIds) {
        const course = await ctx.db.get(courseId)
        if (!course) throw new Error("Course not found")
        if (course.isPublic !== true) {
            throw new Error("Learning paths can only include public courses")
        }
    }
}

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

        await requirePublicCourses(ctx, args.courseIds)

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

        if (args.courseIds !== undefined) {
            await requirePublicCourses(ctx, args.courseIds)
        }

        // If courseIds changed, sync new courses to all enrolled users
        if (args.courseIds !== undefined) {
            const oldCourseIds = new Set(path.courseIds.map((id) => id.toString()))
            const newCourseIds = args.courseIds.filter(
                (id) => !oldCourseIds.has(id.toString())
            )

            if (newCourseIds.length > 0) {
                // Find all users who joined this path
                const userPaths = await ctx.db
                    .query("userPaths")
                    .filter((q) => q.eq(q.field("pathId"), args.id))
                    .collect()

                // Enroll each user in the new courses
                for (const up of userPaths) {
                    for (const courseId of newCourseIds) {
                        const alreadyJoined = await ctx.db
                            .query("userCourses")
                            .withIndex("by_userId_courseId", (q) =>
                                q.eq("userId", up.userId).eq("courseId", courseId)
                            )
                            .first()
                        if (!alreadyJoined) {
                            await ctx.db.insert("userCourses", {
                                userId: up.userId,
                                courseId,
                                addedAt: Date.now(),
                            })
                        }
                    }
                }
            }
        }

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

        const path = await ctx.db.get(args.pathId)
        if (!path || path.isPublic !== true) {
            throw new Error("Path not found")
        }

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

        // Batch-enroll in all public courses
        for (const courseId of path.courseIds) {
            const course = await ctx.db.get(courseId)
            if (!course || course.isPublic !== true) continue

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

// ─── Admin Queries ──────────────────────────────────────────────

export const listPublicWithStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) return []
        const user = await ctx.db.get(userId)
        if (user?.role !== "admin") return []

        const paths = await ctx.db.query("learningPaths").order("desc").collect()
        const publicPaths = paths.filter((p) => p.isPublic)

        const result = await Promise.all(
            publicPaths.map(async (path) => {
                const enrollments = await ctx.db
                    .query("userPaths")
                    .filter((q) => q.eq(q.field("pathId"), path._id))
                    .collect()

                return {
                    _id: path._id,
                    titleEn: path.titleEn,
                    titleZh: path.titleZh,
                    descriptionEn: path.descriptionEn,
                    descriptionZh: path.descriptionZh,
                    difficulty: path.difficulty,
                    courseIds: path.courseIds,
                    coverGradient: path.coverGradient,
                    _creationTime: path._creationTime,
                    enrollmentCount: enrollments.length,
                }
            }),
        )

        return result
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
        if (path.isPublic !== true) return null

        const userId = await auth.getUserId(ctx)

        const courses = await Promise.all(
            path.courseIds.map(async (courseId) => {
                const course = await ctx.db.get(courseId)
                if (!course) return null
                if (course.isPublic !== true) return null
                const progress = userId
                    ? await ctx.db
                          .query("progress")
                          .withIndex("by_userId_courseId", (q) =>
                              q.eq("userId", userId.toString()).eq("courseId", courseId)
                          )
                          .first()
                    : null
                return toPathCoursePreview(course, progress)
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

                // Derive progress — parallel queries per course
                const progressList = await Promise.all(
                    path.courseIds.map((courseId) =>
                        ctx.db
                            .query("progress")
                            .withIndex("by_userId_courseId", (q) =>
                                q.eq("userId", userId.toString()).eq("courseId", courseId)
                            )
                            .first()
                    )
                )
                const completedCourses = progressList.filter(
                    (p) => p?.completedModules?.length === TOTAL_MODULES
                ).length

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
