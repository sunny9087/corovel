import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { passwordResetRequestSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { authRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
import { requireCsrfToken } from "@/lib/csrf";

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
    const validationResult = passwordResetRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Create reset token (returns null if user doesn't exist, but we don't reveal this)
    const token = await createPasswordResetToken(email);

    // Always return success to prevent user enumeration
    if (token) {
      try {
        await sendPasswordResetEmail(email, token);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
