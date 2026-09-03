CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx"
ON "Notification" ("userId", "read");

CREATE INDEX IF NOT EXISTS "Media_createdAt_idx"
ON "Media" ("createdAt");
