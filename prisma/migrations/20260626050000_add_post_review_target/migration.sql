-- Add PostReviewTarget table required by current Prisma schema.
-- Keep this migration additive and safe to run across environments.

CREATE TABLE IF NOT EXISTS "PostReviewTarget" (
  "postId" TEXT NOT NULL,
  "editorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostReviewTarget_pkey" PRIMARY KEY ("postId","editorId")
);

CREATE INDEX IF NOT EXISTS "PostReviewTarget_editorId_idx" ON "PostReviewTarget"("editorId");
CREATE INDEX IF NOT EXISTS "PostReviewTarget_postId_idx" ON "PostReviewTarget"("postId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PostReviewTarget_postId_fkey') THEN
    ALTER TABLE "PostReviewTarget"
      ADD CONSTRAINT "PostReviewTarget_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PostReviewTarget_editorId_fkey') THEN
    ALTER TABLE "PostReviewTarget"
      ADD CONSTRAINT "PostReviewTarget_editorId_fkey"
      FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
