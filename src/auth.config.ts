import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isGoogleOAuthEnabled } from "@/lib/env";

/**
 * Edge-safe shared config. Credentials provider lives in src/auth.ts
 * because it needs bcrypt + prisma (not edge runtime).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(isGoogleOAuthEnabled()
      ? [Google({ allowDangerousEmailAccountLinking: false })]
      : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "BUYER" | "CREATOR" | "MODERATOR" | "ADMIN";
        session.user.status = token.status as "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
