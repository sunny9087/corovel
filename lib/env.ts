/**
 * Environment variable validation and configuration
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  // During build time, allow defaults to avoid breaking the build
  if (!value && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || "";
}

export const env = {
  // Database
  DATABASE_URL: getEnvVar("DATABASE_URL", "file:./dev.db"),
  
  // Application
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_URL: getEnvVar("APP_URL", "http://localhost:3000"),
  
  // Session/JWT
  SESSION_SECRET: getEnvVar(
    "SESSION_SECRET",
    process.env.NODE_ENV === "production"
      ? undefined
      : "dev-secret-change-in-production-min-32-chars-please"
  ),
  
  // Email (optional - will use console log if not configured)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM || "noreply@crek.app",
  
  // Redis for rate limiting (optional - will use in-memory if not configured)
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  
  // OAuth (optional)
  NEXTAUTH_URL: getEnvVar("NEXTAUTH_URL", "http://localhost:3000"),
  NEXTAUTH_SECRET: getEnvVar(
    "NEXTAUTH_SECRET",
    process.env.NODE_ENV === "production"
      ? undefined
      : "dev-secret-change-in-production-min-32-chars-please"
  ),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
} as const;

// Validate SESSION_SECRET length in production runtime (not during build)
if (
  env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  env.SESSION_SECRET.length < 32
) {
  throw new Error("SESSION_SECRET must be at least 32 characters in production");
}
