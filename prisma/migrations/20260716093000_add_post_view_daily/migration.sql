CREATE TABLE IF NOT EXISTS "PostViewDaily" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostViewDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PostViewDaily_postId_day_key" ON "PostViewDaily"("postId", "day");
CREATE INDEX IF NOT EXISTS "PostViewDaily_day_idx" ON "PostViewDaily"("day");
CREATE INDEX IF NOT EXISTS "PostViewDaily_postId_idx" ON "PostViewDaily"("postId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'PostViewDaily_postId_fkey'
          AND table_name = 'PostViewDaily'
    ) THEN
        ALTER TABLE "PostViewDaily"
        ADD CONSTRAINT "PostViewDaily_postId_fkey"
        FOREIGN KEY ("postId") REFERENCES "Post"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
