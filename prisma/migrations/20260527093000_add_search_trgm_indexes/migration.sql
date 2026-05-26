CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Post_title_trgm_idx" ON "Post" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Post_excerpt_trgm_idx" ON "Post" USING GIN ("excerpt" gin_trgm_ops);
