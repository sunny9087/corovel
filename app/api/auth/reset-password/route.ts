import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { passwordResetSchema } from "@/lib/validation";
import { authRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
import { requireCsrfToken } from "@/lib/csrf";

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
    const validationResult = passwordResetSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Reset password
    const resetSuccess = await resetPassword(token, passwordHash);

    if (!resetSuccess) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
