-- Add email verification token expiration field
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "email_verification_token_expires" TIMESTAMP(3);

-- Add indexes for token lookups (improves performance)
CREATE INDEX IF NOT EXISTS "users_email_verification_token_idx" ON "public"."users"("email_verification_token");
CREATE INDEX IF NOT EXISTS "users_reset_password_token_idx" ON "public"."users"("reset_password_token");

-- Add constraint to prevent negative points
ALTER TABLE "public"."users" 
ADD CONSTRAINT "users_points_non_negative" CHECK ("points" >= 0);

