/**
 * Input validation schemas using Zod
 */
import { z } from "zod";

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

// Password validation - stronger requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  referralCode: z
    .preprocess(
      (val) => {
        if (!val || typeof val !== "string") return undefined;
        const trimmed = val.trim().toUpperCase();
        return trimmed === "" ? undefined : trimmed;
      },
      z
        .string()
        .regex(/^[A-F0-9]{16}$/, "Invalid referral code format")
        .optional()
    ),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Referral code schema
export const referralCodeSchema = z
  .string()
  .regex(/^[A-F0-9]{16}$/, "Invalid referral code format")
  .transform((val) => val.toUpperCase());

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});

// Sanitize string input (remove dangerous characters)
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove HTML brackets
    .slice(0, 1000); // Limit length
}
