-- This migration exists to recover from a previously failed migration:
-- 20260626040000_add_pages_and_menus
-- It creates the required enums/tables/indexes/constraints in an idempotent way.

DO $$
BEGIN
  CREATE TYPE "MenuLocation" AS ENUM ('PRIMARY', 'SECONDARY', 'FOOTER', 'MOBILE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "MenuItemType" AS ENUM ('CUSTOM', 'CATEGORY', 'TAG', 'PAGE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Page" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT,
  "blocks" JSONB,
  "featuredImage" TEXT,
  "template" TEXT NOT NULL DEFAULT 'default',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "metaTitle" TEXT,
  "metaDesc" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");
CREATE INDEX IF NOT EXISTS "Page_slug_idx" ON "Page"("slug");

CREATE TABLE IF NOT EXISTS "Menu" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Menu_name_key" ON "Menu"("name");

CREATE TABLE IF NOT EXISTS "MenuItem" (
  "id" TEXT NOT NULL,
  "menuId" TEXT NOT NULL,
  "parentId" TEXT,
  "type" "MenuItemType" NOT NULL,
  "label" TEXT NOT NULL,
  "customUrl" TEXT,
  "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "categoryId" TEXT,
  "tagId" TEXT,
  "pageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MenuItem_menuId_idx" ON "MenuItem"("menuId");
CREATE INDEX IF NOT EXISTS "MenuItem_parentId_idx" ON "MenuItem"("parentId");
CREATE INDEX IF NOT EXISTS "MenuItem_order_idx" ON "MenuItem"("order");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuItem_menuId_fkey') THEN
    ALTER TABLE "MenuItem"
      ADD CONSTRAINT "MenuItem_menuId_fkey"
      FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuItem_parentId_fkey') THEN
    ALTER TABLE "MenuItem"
      ADD CONSTRAINT "MenuItem_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuItem_categoryId_fkey') THEN
    ALTER TABLE "MenuItem"
      ADD CONSTRAINT "MenuItem_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuItem_tagId_fkey') THEN
    ALTER TABLE "MenuItem"
      ADD CONSTRAINT "MenuItem_tagId_fkey"
      FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuItem_pageId_fkey') THEN
    ALTER TABLE "MenuItem"
      ADD CONSTRAINT "MenuItem_pageId_fkey"
      FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "MenuLocationAssignment" (
  "id" TEXT NOT NULL,
  "location" "MenuLocation" NOT NULL,
  "menuId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MenuLocationAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MenuLocationAssignment_location_key" ON "MenuLocationAssignment"("location");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuLocationAssignment_menuId_fkey') THEN
    ALTER TABLE "MenuLocationAssignment"
      ADD CONSTRAINT "MenuLocationAssignment_menuId_fkey"
      FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
