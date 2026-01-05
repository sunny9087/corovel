import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, hashPassword, validateReferralCode } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { authRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
import { requireCsrfToken } from "@/lib/csrf";
import { sendVerificationEmail } from "@/lib/email";
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
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { email, password, referralCode } = validationResult.data;

    // Check if user exists (don't reveal if email exists)
    let existingUser;
    try {
      existingUser = await getUserByEmail(email);
    } catch (dbError) {
      console.error("Database error in getUserByEmail:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Validate referral code if provided
    let validReferralCode: string | undefined;
    if (referralCode && referralCode.trim() !== "") {
      const isValid = await validateReferralCode(referralCode);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }
      validReferralCode = referralCode;
    }

    // Create user
    const passwordHash = await hashPassword(password);
    let user, verificationToken;
    try {
      const result = await createUser(email, passwordHash, validReferralCode);
      user = result.user;
      verificationToken = result.verificationToken;
    } catch (dbError) {
      console.error("Database error in createUser:", dbError);
      return NextResponse.json(
        { error: "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    // Track signup event
    try {
      await trackEvent("signup", user.id, {
        email: user.email,
        hasReferral: !!validReferralCode,
      });
    } catch (trackError) {
      console.error("Error tracking signup:", trackError);
      // Don't fail if tracking fails
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account before logging in.",
      user: {
        id: user.id,
        email: user.email,
      },
      redirect: "/login?registered=true",
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

