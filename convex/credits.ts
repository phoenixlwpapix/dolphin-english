import { query } from "./_generated/server";
import { auth } from "./auth";
import { AI_COURSE_CREDIT_COST, SIGNUP_BONUS_CREDITS } from "./creditConfig";

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      balance: user.creditBalance ?? SIGNUP_BONUS_CREDITS,
      isAdmin: user.role === "admin",
      aiCourseCost: AI_COURSE_CREDIT_COST,
      signupBonus: SIGNUP_BONUS_CREDITS,
    };
  },
});

export const listMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);
  },
});

