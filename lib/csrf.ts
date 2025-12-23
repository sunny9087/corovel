/**
 * CSRF protection utilities
 */
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get or create CSRF token for the session
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Needs to be readable by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
  
  return token;
}

/**
 * Verify CSRF token from request
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}

/**
 * Middleware helper to check CSRF token
 */
export async function requireCsrfToken(request: Request): Promise<void> {
  const isValid = await verifyCsrfToken(request);
  
  if (!isValid) {
    throw new Error("Invalid CSRF token");
  }
}
