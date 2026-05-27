CREATE INDEX IF NOT EXISTS "Post_live_publishedAt_updatedAt_idx"
ON "Post" ("publishedAt" DESC, "updatedAt" DESC)
WHERE "published" = true AND "status" <> 'ARCHIVED'::"PostStatus";

CREATE INDEX IF NOT EXISTS "Post_live_category_publishedAt_updatedAt_idx"
ON "Post" ("categoryId", "publishedAt" DESC, "updatedAt" DESC)
WHERE "published" = true AND "status" <> 'ARCHIVED'::"PostStatus";

CREATE INDEX IF NOT EXISTS "Post_live_views_idx"
ON "Post" ("views" DESC)
WHERE "published" = true AND "status" <> 'ARCHIVED'::"PostStatus";

CREATE INDEX IF NOT EXISTS "PostCategory_categoryId_postId_idx"
ON "PostCategory" ("categoryId", "postId");
