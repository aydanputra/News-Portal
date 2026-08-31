CREATE TABLE IF NOT EXISTS "PublicPageViewDaily" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicPageViewDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PublicPageViewDaily_pageKey_day_key"
ON "PublicPageViewDaily"("pageKey", "day");

CREATE INDEX IF NOT EXISTS "PublicPageViewDaily_day_idx"
ON "PublicPageViewDaily"("day");

CREATE INDEX IF NOT EXISTS "PublicPageViewDaily_pageKey_idx"
ON "PublicPageViewDaily"("pageKey");

CREATE INDEX IF NOT EXISTS "PublicPageViewDaily_pageType_idx"
ON "PublicPageViewDaily"("pageType");
