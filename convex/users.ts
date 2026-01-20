import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Get the current authenticated user with their role
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return null;
        }
        const user = await ctx.db.get(userId);
        return user;
    },
});

/**
 * Check if the current user is an admin
 */
export const isAdmin = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return false;
        }
        const user = await ctx.db.get(userId);
        return user?.role === "admin";
    },
});

/**
 * Internal mutation to set user role (used for admin setup)
 */
export const setRole = internalMutation({
    args: {
        email: v.string(),
        role: v.union(v.literal("user"), v.literal("admin")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error(`User with email ${args.email} not found`);
        }

        await ctx.db.patch(user._id, { role: args.role });
        return { success: true, userId: user._id };
    },
});

/**
 * Ensure user has a role set (called after authentication)
 */
export const ensureUserRole = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        if (user && !user.role) {
            // Set default role for new users
            await ctx.db.patch(userId, { role: "user" });
        }

        return user;
    },
});
