import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * API route to check which OAuth providers are configured
 * This allows the frontend to conditionally show OAuth buttons
 */
export async function GET() {
  const providers: Record<string, boolean> = {};
  
  // Check if Google OAuth is configured
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = true;
  }
  
  // Check if Facebook OAuth is configured (optional)
  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    providers.facebook = true;
  }

  return NextResponse.json(providers);
}
