CREATE TABLE IF NOT EXISTS "RedirectRule" (
  "id" TEXT NOT NULL,
  "oldPath" TEXT NOT NULL,
  "newPath" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL DEFAULT 301,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "note" TEXT,
  "hitCount" INTEGER NOT NULL DEFAULT 0,
  "lastHitAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RedirectRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RedirectRule_oldPath_key" ON "RedirectRule"("oldPath");
CREATE INDEX IF NOT EXISTS "RedirectRule_oldPath_idx" ON "RedirectRule"("oldPath");
CREATE INDEX IF NOT EXISTS "RedirectRule_isActive_idx" ON "RedirectRule"("isActive");
CREATE INDEX IF NOT EXISTS "RedirectRule_updatedAt_idx" ON "RedirectRule"("updatedAt");
