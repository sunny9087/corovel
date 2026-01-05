import { NextRequest, NextResponse } from "next/server";
import { referralCodeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "pending_referral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body?.referralCode === "string" ? body.referralCode : "";

    const parsed = referralCodeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, parsed.data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Set referral cookie error:", error);
    return NextResponse.json({ error: "Failed to set referral" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
