/**
 * JWT token management for secure session handling
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "./env";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(env.SESSION_SECRET);
const SESSION_COOKIE_NAME = "user-session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionPayload extends JWTPayload {
  userId: string;
  sessionId: string;
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  
  const token = await new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
    .sign(SECRET);
  
  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create session cookie
 */
export async function createSession(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();
  
  const isProduction = env.NODE_ENV === "production";
  
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  };
  
  if (isProduction && env.APP_URL) {
    try {
      const url = new URL(env.APP_URL);
      if (url.hostname.includes('corovel.com')) {
        cookieOptions.domain = '.corovel.com';
      }
    } catch (e) {
      console.error('Error parsing APP_URL for cookie domain:', e);
    }
  }
  
  cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions);
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return verifySessionToken(token);
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get user ID from session
 */
export async function getUserIdFromSession(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}
