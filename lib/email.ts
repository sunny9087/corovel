/**
 * Email sending utilities
 */
import nodemailer from "nodemailer";
import { env } from "./env";

// Create transporter (only if SMTP is configured)
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          }
        : undefined,
    })
  : null;

/**
 * Send email (uses SMTP if configured, otherwise logs to console)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  if (!transporter) {
    // In development, just log the email
    console.log("=".repeat(50));
    console.log(`EMAIL TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log("BODY:");
    console.log(text || html);
    console.log("=".repeat(50));
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}`;
  
  await sendEmail(
    email,
    "Verify your email address",
    `
      <h2>Verify Your Email Address</h2>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
    `Verify your email address by visiting: ${verificationUrl}`
  );
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
  
  await sendEmail(
    email,
    "Reset your password",
    `
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `,
    `Reset your password by visiting: ${resetUrl}`
  );
}
