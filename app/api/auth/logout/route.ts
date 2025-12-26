import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { requireCsrfToken } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    await requireCsrfToken(request);
    
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

