import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, generateVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { emailSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    // Validate email format
    const valid = emailSchema.safeParse(email);
    if (!valid.success) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }
    // Generate new verification token
    const token = await generateVerificationToken(user.id);
    await sendVerificationEmail(email, token);
    return NextResponse.json({ success: true, message: "Verification email sent." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to resend verification email." }, { status: 500 });
  }
}
