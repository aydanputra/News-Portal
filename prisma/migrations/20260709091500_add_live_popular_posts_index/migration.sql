CREATE INDEX IF NOT EXISTS "Post_live_views_publishedAt_updatedAt_id_idx"
ON "Post" ("views" DESC, "publishedAt" DESC, "updatedAt" DESC, "id" DESC)
WHERE "published" = true AND "status" <> 'ARCHIVED'::"PostStatus";
