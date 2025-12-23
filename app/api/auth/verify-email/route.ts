import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyEmail(token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Redirect to login with success message
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("verified", "true");
    
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
