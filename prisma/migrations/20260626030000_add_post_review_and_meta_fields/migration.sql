-- Add missing columns on "Post" that are required by the current Prisma schema.
-- Keep this migration additive and safe to run across environments.

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "submittedForReviewAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaDesc" TEXT;
