import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export interface CreateUserResult {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    points: number;
    referralCode: string;
    createdAt: Date;
  };
  verificationToken: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateReferralCode(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
      points: true,
      referralCode: true,
      referredBy: true,
      createdAt: true,
      name: true,
      image: true,
    },
  });
}

export async function validateReferralCode(referralCode: string): Promise<boolean> {
  const normalized = referralCode.trim();
  if (!normalized) return false;

  const user = await prisma.user.findFirst({
    where: {
      referralCode: {
        equals: normalized,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return !!user;
}

export async function createUser(
  email: string,
  passwordHash: string,
  referredBy?: string
): Promise<CreateUserResult> {
  const referralCode = generateReferralCode();
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date();
  verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours expiration
  
  // Use transaction to ensure consistency
  const result = await prisma.$transaction(async (tx) => {
    const referredByNormalized = referredBy?.trim();
    let referrer = null;
    
    // Validate referrer if provided
    if (referredByNormalized) {
      referrer = await tx.user.findFirst({
        where: {
          referralCode: {
            equals: referredByNormalized,
            mode: "insensitive",
          },
          emailVerified: true, // Only allow verified users as referrers
        },
        select: { id: true, referralCode: true, email: true },
      });
      
      // Prevent self-referral (check if referrer email matches new user email)
      if (referrer && referrer.email.toLowerCase() === email.toLowerCase()) {
        referrer = null; // Block self-referral
      }
    }

    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        referralCode,
        referredBy: referrer ? referrer.referralCode : null,
        points: referrer ? 10 : 0,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires,
      },
    });

    // Give referrer 10 points if this is a referral (one-time per referral)
    let referrerId: string | null = null;
    if (referrer) {
      referrerId = referrer.id;

      await tx.user.update({
        where: { id: referrer.id },
        data: {
          points: {
            increment: 10,
          },
        },
      });

      // Record transaction for referrer
      await tx.pointTransaction.create({
        data: {
          userId: referrer.id,
          amount: 10,
          type: "referral_reward",
          description: `Referral reward for ${email}`,
        },
      });

      // Record transaction for new user
      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          amount: 10,
          type: "referral_signup",
          description: "Referral signup bonus",
        },
      });
    }

    return { user, referrerId };
  });

  // Complete referral task after transaction (to avoid deadlocks)
  if (result.referrerId) {
    try {
      const { completeReferralTask } = await import("./tasks");
      await completeReferralTask(result.user.id, result.referrerId);
    } catch (err) {
      console.error("Error completing referral task:", err);
      // Don't fail registration if this fails
    }
  }

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
      points: result.user.points,
      referralCode: result.user.referralCode,
      createdAt: result.user.createdAt,
    },
    verificationToken: verificationToken || "",
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      points: true,
      referralCode: true,
      createdAt: true,
      name: true,
      image: true,
    },
  });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
  });

  if (!user) {
    return false;
  }

  // Check if token has expired
  if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
    // Token expired - clean it up
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    },
  });

  return true;
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists
    return null;
  }

  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    },
  });

  return token;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPasswordHash: string
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return true;
}

/**
 * Add points transaction
 */
export async function addPointTransaction(
  userId: string,
  amount: number,
  type: "daily_checkin" | "referral_signup" | "referral_reward" | "profile_completion" | "weekly_challenge" | "manual",
  description?: string
): Promise<void> {
  await prisma.pointTransaction.create({
    data: {
      userId,
      amount,
      type,
      description,
    },
  });
}

/**
 * Get user's point transactions
 */
export async function getUserPointTransactions(userId: string, limit = 50) {
  return prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

