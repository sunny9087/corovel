import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { authRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
import { requireCsrfToken } from "@/lib/csrf";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      const identifier = getRateLimitKey(request);
      const { success } = await authRateLimiter.limit(identifier);
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      // Fail closed to avoid disabling protections on infrastructure issues
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    // CSRF protection
    try {
      await requireCsrfToken(request);
    } catch {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Verify user exists and password is correct
    // Use same error message to prevent user enumeration
    let user;
    try {
      user = await getUserByEmail(email);
    } catch (dbError) {
      console.error("Database error in getUserByEmail:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500 }
      );
    }
    
    if (!user) {
      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 100));
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (OAuth users don't have passwords)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account uses social login. Please sign in with Google or Facebook." },
        { status: 401 }
      );
    }
    // Require email verification for credential-based accounts
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id);

    // Track login event
    await trackEvent("login", user.id, {
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

