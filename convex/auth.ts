import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { SIGNUP_BONUS_CREDITS } from "./creditConfig";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // Update existing user
        return args.existingUserId;
      }

      // Create new user with default role
      const userId = await ctx.db.insert("users", {
        email: args.profile.email,
        role: "user",
        creditBalance: SIGNUP_BONUS_CREDITS,
        freeCreditsGrantedAt: Date.now(),
        name: args.profile.name,
        image: args.profile.image,
        emailVerificationTime: args.profile.emailVerified
          ? Date.now()
          : undefined,
      });

      await ctx.db.insert("creditTransactions", {
        userId,
        amount: SIGNUP_BONUS_CREDITS,
        balanceAfter: SIGNUP_BONUS_CREDITS,
        type: "signup_bonus",
        description: "Signup bonus credits",
        createdAt: Date.now(),
      });

      return userId;
    },
  },
});
