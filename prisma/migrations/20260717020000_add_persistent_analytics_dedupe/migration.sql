CREATE TABLE IF NOT EXISTS "PostViewVisitorWindow" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostViewVisitorWindow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PostViewVisitorWindow_postId_visitorHash_windowStart_key"
ON "PostViewVisitorWindow"("postId", "visitorHash", "windowStart");

CREATE INDEX IF NOT EXISTS "PostViewVisitorWindow_postId_idx"
ON "PostViewVisitorWindow"("postId");

CREATE INDEX IF NOT EXISTS "PostViewVisitorWindow_visitorHash_idx"
ON "PostViewVisitorWindow"("visitorHash");

CREATE INDEX IF NOT EXISTS "PostViewVisitorWindow_windowStart_idx"
ON "PostViewVisitorWindow"("windowStart");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'PostViewVisitorWindow_postId_fkey'
          AND table_name = 'PostViewVisitorWindow'
    ) THEN
        ALTER TABLE "PostViewVisitorWindow"
        ADD CONSTRAINT "PostViewVisitorWindow_postId_fkey"
        FOREIGN KEY ("postId") REFERENCES "Post"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "PublicPageViewVisitorWindow" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicPageViewVisitorWindow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PublicPageViewVisitorWindow_pageKey_visitorHash_windowStart_key"
ON "PublicPageViewVisitorWindow"("pageKey", "visitorHash", "windowStart");

CREATE INDEX IF NOT EXISTS "PublicPageViewVisitorWindow_pageKey_idx"
ON "PublicPageViewVisitorWindow"("pageKey");

CREATE INDEX IF NOT EXISTS "PublicPageViewVisitorWindow_visitorHash_idx"
ON "PublicPageViewVisitorWindow"("visitorHash");

CREATE INDEX IF NOT EXISTS "PublicPageViewVisitorWindow_windowStart_idx"
ON "PublicPageViewVisitorWindow"("windowStart");
