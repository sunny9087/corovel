/**
 * Input validation schemas using Zod
 */
import { z } from "zod";

// List of common disposable/temporary email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
  "temp-mail.org",
  "yopmail.com",
  "getnada.com",
  "mohmal.com",
  "fakeinbox.com",
  "sharklasers.com",
  "trashmail.com",
];

// Enhanced email validation
function isValidEmailFormat(email: string): boolean {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check for valid domain structure (at least one dot after @)
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  
  const domain = parts[1].toLowerCase();
  
  // Reject if domain doesn't have a TLD (like .com, .org, etc.)
  if (!domain.includes(".")) return false;
  
  // Reject if TLD is too short (less than 2 chars) or too long (more than 6 chars)
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 6) return false;
  
  // Reject common fake patterns
  const fakePatterns = [
    /^test\d*@/i,
    /^fake\d*@/i,
    /^example\d*@/i,
    /^sample\d*@/i,
    /^dummy\d*@/i,
    /@test\d*\./i,
    /@fake\d*\./i,
    /@example\d*\./i,
    /@sample\d*\./i,
    /@dummy\d*\./i,
    /@localhost/i,
    /@127\.0\.0\.1/i,
  ];
  
  if (fakePatterns.some(pattern => pattern.test(email))) {
    return false;
  }
  
  // Reject disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return false;
  }
  
  // Additional checks
  // Reject domains that look suspicious (all numbers, too many dots, etc.)
  if (/^\d+$/.test(domainParts[0])) return false; // Domain part is all numbers
  if (domain.split(".").length > 5) return false; // Too many subdomains
  
  // Reject if domain part before TLD is empty or too short
  if (domainParts.length < 2 || domainParts[domainParts.length - 2].length < 2) {
    return false;
  }
  
  return true;
}

// Enhanced email validation with custom refinement
export const emailSchema = z
  .string()
  .toLowerCase()
  .trim()
  .email("Invalid email format")
  .refine((email) => isValidEmailFormat(email), {
    message: "Please use a valid email address. Disposable and fake email addresses are not allowed.",
  })
  .refine((email) => {
    const domain = email.split("@")[1];
    // Block domains that don't have proper structure
    return domain && domain.includes(".") && domain.split(".").length >= 2;
  }, {
    message: "Invalid email domain",
  });

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
        .regex(/^[A-Fa-f0-9]{16}$/, "Invalid referral code format")
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
  .regex(/^[A-Fa-f0-9]{16}$/, "Invalid referral code format")
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
