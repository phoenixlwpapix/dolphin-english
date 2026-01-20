import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

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
        name: args.profile.name,
        image: args.profile.image,
        emailVerificationTime: args.profile.emailVerified
          ? Date.now()
          : undefined,
      });

      return userId;
    },
  },
});
