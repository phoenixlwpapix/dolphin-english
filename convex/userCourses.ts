import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Add a course to user's course list
 */
export const addCourse = mutation({
    args: {
        courseId: v.id("courses"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Must be logged in to add a course");
        }

        // Check if already added
        const existing = await ctx.db
            .query("userCourses")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first();

        if (existing) {
            return existing._id; // Already added
        }

        // Add to user's courses
        const id = await ctx.db.insert("userCourses", {
            userId: userId.toString(),
            courseId: args.courseId,
            addedAt: Date.now(),
        });

        return id;
    },
});

/**
 * Remove a course from user's course list
 */
export const removeCourse = mutation({
    args: {
        courseId: v.id("courses"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Must be logged in to remove a course");
        }

        const userCourse = await ctx.db
            .query("userCourses")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first();

        if (userCourse) {
            await ctx.db.delete(userCourse._id);
        }
    },
});

/**
 * List all courses for the current user
 */
export const listMyCourses = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return [];
        }

        const userCourses = await ctx.db
            .query("userCourses")
            .withIndex("by_userId", (q) => q.eq("userId", userId.toString()))
            .collect();

        // Get full course data for each
        const courses = await Promise.all(
            userCourses.map(async (uc) => {
                const course = await ctx.db.get(uc.courseId);
                if (!course) return null;
                return {
                    ...course,
                    addedAt: uc.addedAt,
                };
            })
        );

        return courses.filter((c) => c !== null);
    },
});

/**
 * Check if user has joined a specific course
 */
export const isJoined = query({
    args: {
        courseId: v.id("courses"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return false;
        }

        const userCourse = await ctx.db
            .query("userCourses")
            .withIndex("by_userId_courseId", (q) =>
                q.eq("userId", userId.toString()).eq("courseId", args.courseId)
            )
            .first();

        return userCourse !== null;
    },
});
