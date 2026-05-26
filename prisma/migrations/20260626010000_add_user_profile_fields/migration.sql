-- Add missing profile fields for "User" to match current Prisma schema.
-- Keep this migration additive and safe to re-run.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banner" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "socialAccounts" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
