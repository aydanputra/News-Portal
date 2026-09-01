CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx"
ON "Post" ("status", "publishedAt");

CREATE INDEX IF NOT EXISTS "Post_categoryId_status_publishedAt_idx"
ON "Post" ("categoryId", "status", "publishedAt");

CREATE INDEX IF NOT EXISTS "Post_status_updatedAt_idx"
ON "Post" ("status", "updatedAt");
