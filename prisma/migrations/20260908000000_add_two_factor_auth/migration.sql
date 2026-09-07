-- Add Two-Factor Authentication fields to "User" (opt-in TOTP).
-- Additive and safe to re-run.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorRecovery" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabledAt" TIMESTAMP(3);
