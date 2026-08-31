-- Add global surface tokens for shared border/surface/elevated/muted defaults.
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "globalBorderColor" TEXT NOT NULL DEFAULT '#e5e7eb';
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "globalSurfaceColor" TEXT NOT NULL DEFAULT '#f9fafb';
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "globalElevatedColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "globalMutedTextColor" TEXT NOT NULL DEFAULT '#9ca3af';
