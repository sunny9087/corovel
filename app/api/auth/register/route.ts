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
    const identifier = getRateLimitKey(request);
    const { success } = await authRateLimiter.limit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
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
    const existingUser = await getUserByEmail(email);
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
    const { user, verificationToken } = await createUser(email, passwordHash, validReferralCode);

    // Track signup event
    await trackEvent("signup", user.id, {
      email: user.email,
      hasReferral: !!validReferralCode,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

