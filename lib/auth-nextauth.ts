/**
 * NextAuth configuration for Google OAuth integration
 * Handles both new user creation and existing user login
 */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { env } from "./env";
import { createSession } from "./session";
import { trackEvent } from "./analytics";
import { randomBytes } from "crypto";

// Custom adapter to integrate with existing user creation logic
const baseAdapter = PrismaAdapter(prisma);
const customAdapter = {
  ...baseAdapter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: async (data: any) => {
    // Generate unique referral code (same as email/password signup)
    const referralCode = randomBytes(8).toString("hex").toUpperCase();
    
    // Create user with OAuth data
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: null, // OAuth users don't have passwords
        name: data.name || null,
        image: data.image || null,
        referralCode,
        emailVerified: true, // Google emails are verified
        points: 0,
      },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return user as any;
  },
};

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: customAdapter as any,
  providers: [
    // Only add Google if credentials are configured
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, // Link accounts with same email
          }),
        ]
      : []),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT to integrate with existing session system
  },
  pages: {
    signIn: "/login",
    error: "/login?error=auth_error",
  },
  callbacks: {
    /**
     * Called when user attempts to sign in
     * Returns true to allow sign in, false to deny
     */
    async signIn({ user, account }) {
      // Require email for all sign-ins
      if (!user.email) {
        return false;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        // Existing user - link OAuth account if not already linked
        if (account && account.provider === "google") {
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          // Link account if not already linked
          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token || null,
                access_token: account.access_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
                session_state: account.session_state || null,
              },
            });
          }

          // Update user profile data from Google if available
          if (user.name || user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: true, // Google emails are verified
              },
            });
          }
        }
        // Allow existing user to sign in
        return true;
      }

      // New user - will be created by adapter
      return true;
    },
    /**
     * Called when JWT token is created or updated
     */
    async jwt({ token, user }) {
      // Initial sign in - add user info to token
      if (user) {
        token.userId = user.id;
        token.email = user.email;
      }

      return token;
    },
    /**
     * Called whenever session is checked
     * Returns session data visible to client
     */
    async session({ session, token }) {
      if (token.userId && session.user) {
        // Fetch latest user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: {
            id: true,
            email: true,
            emailVerified: true,
            points: true,
            referralCode: true,
            name: true,
            image: true,
          },
        });

        if (dbUser) {
          // Add custom fields to session
          session.user.id = dbUser.id;
          session.user.email = dbUser.email;
          session.user.emailVerified = dbUser.emailVerified;
          session.user.points = dbUser.points;
          session.user.referralCode = dbUser.referralCode;
          session.user.name = dbUser.name || undefined;
          session.user.image = dbUser.image || undefined;
        }
      }

      return session;
    },
    /**
     * Called after successful sign in
     * Controls where user is redirected
     */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    /**
     * Called when a new user is created via OAuth
     */
    async createUser({ user }) {
      if (user.id) {
        // Track signup analytics
        await trackEvent("signup", user.id, {
          email: user.email || "",
          method: "google",
        });
      }
    },
    /**
     * Called after successful sign in
     */
    async signIn({ user, account, isNewUser }) {
      if (user.id) {
        // Track login analytics
        await trackEvent("login", user.id, {
          email: user.email || "",
          method: account?.provider || "google",
          isNewUser: isNewUser || false,
        });

        // Create session cookie for existing auth system
        try {
          await createSession(user.id);
        } catch (error) {
          console.error("Error creating session:", error);
          // Don't fail sign-in if session creation fails
        }
      }
    },
  },
};

export default NextAuth(authOptions);
