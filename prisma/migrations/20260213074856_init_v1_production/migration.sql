-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('ARTICLE', 'VIDEO', 'GALLERY');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('IMAGE', 'SCRIPT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WRITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "image" TEXT,
    "featuredImageId" TEXT,
    "imageCaption" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "type" "PostType" NOT NULL DEFAULT 'ARTICLE',
    "videoUrl" TEXT,
    "gallery" JSONB,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AdType" NOT NULL,
    "mediaId" TEXT,
    "scriptCode" TEXT,
    "position" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'My News Portal',
    "siteDescription" TEXT,
    "logoUrl" TEXT,
    "activeTheme" TEXT NOT NULL DEFAULT 'classic',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "secondaryColor" TEXT NOT NULL DEFAULT '#64748b',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "headingColor" TEXT NOT NULL DEFAULT '#1e293b',
    "excerptColor" TEXT NOT NULL DEFAULT '#64748b',
    "metaColor" TEXT NOT NULL DEFAULT '#94a3b8',
    "headingFont" TEXT NOT NULL DEFAULT 'Inter',
    "bodyFont" TEXT NOT NULL DEFAULT 'Inter',
    "baseFontSize" INTEGER NOT NULL DEFAULT 16,
    "globalBorderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "homeLayout" TEXT NOT NULL DEFAULT 'right_sidebar',
    "homeSidebarWidth" TEXT NOT NULL DEFAULT 'w-1/3',
    "homeContainerWidth" TEXT NOT NULL DEFAULT 'boxed',
    "homeCustomContainerWidth" TEXT NOT NULL DEFAULT '1200',
    "homeMainColumnBox" BOOLEAN NOT NULL DEFAULT false,
    "homeSidebarColumnBox" BOOLEAN NOT NULL DEFAULT false,
    "homeMainColumnBorderRadius" TEXT NOT NULL DEFAULT 'xl',
    "homeSidebarColumnBorderRadius" TEXT NOT NULL DEFAULT 'xl',
    "homeMainColumnColor" TEXT NOT NULL DEFAULT '#ffffff',
    "homeSidebarColumnColor" TEXT NOT NULL DEFAULT '#ffffff',
    "homeTitleFontSize" TEXT NOT NULL DEFAULT '24px',
    "homeTitleFontWeight" TEXT NOT NULL DEFAULT '700',
    "homeTitleColor" TEXT NOT NULL DEFAULT '#1e293b',
    "mobileTitleFontSize" TEXT NOT NULL DEFAULT '18px',
    "tabletTitleFontSize" TEXT NOT NULL DEFAULT '20px',
    "sectionGap" TEXT NOT NULL DEFAULT '32px',
    "widgetGap" TEXT NOT NULL DEFAULT '24px',
    "homeGlobalMarginTop" TEXT NOT NULL DEFAULT '32',
    "homeGlobalMarginBottom" TEXT NOT NULL DEFAULT '32',
    "homeGlobalPaddingTop" TEXT NOT NULL DEFAULT '0',
    "homeGlobalPaddingBottom" TEXT NOT NULL DEFAULT '0',
    "homeGlobalPaddingLeft" TEXT NOT NULL DEFAULT '0',
    "homeGlobalPaddingRight" TEXT NOT NULL DEFAULT '0',
    "postLayout" TEXT NOT NULL DEFAULT 'right_sidebar',
    "postSidebarWidth" TEXT NOT NULL DEFAULT 'w-1/3',
    "postContainerWidth" TEXT NOT NULL DEFAULT 'boxed',
    "postCustomContainerWidth" TEXT NOT NULL DEFAULT '1200',
    "postMainColumnBox" BOOLEAN NOT NULL DEFAULT true,
    "postSidebarColumnBox" BOOLEAN NOT NULL DEFAULT false,
    "postMainColumnBorderRadius" TEXT NOT NULL DEFAULT 'xl',
    "postSidebarColumnBorderRadius" TEXT NOT NULL DEFAULT 'xl',
    "postMainColumnColor" TEXT NOT NULL DEFAULT '#ffffff',
    "postSidebarColumnColor" TEXT NOT NULL DEFAULT '#ffffff',
    "postPrimaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "postSecondaryColor" TEXT NOT NULL DEFAULT '#64748b',
    "postAccentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "postBackgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "postHeadingColor" TEXT NOT NULL DEFAULT '#1e293b',
    "postExcerptColor" TEXT NOT NULL DEFAULT '#64748b',
    "postMetaColor" TEXT NOT NULL DEFAULT '#94a3b8',
    "postHeadingFont" TEXT NOT NULL DEFAULT 'Inter',
    "postBodyFont" TEXT NOT NULL DEFAULT 'Inter',
    "postGlobalBorderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "postShowFeaturedImage" BOOLEAN NOT NULL DEFAULT true,
    "postShowAuthor" BOOLEAN NOT NULL DEFAULT true,
    "postShowDate" BOOLEAN NOT NULL DEFAULT true,
    "postShowCategory" BOOLEAN NOT NULL DEFAULT true,
    "postShowTags" BOOLEAN NOT NULL DEFAULT true,
    "postShowShare" BOOLEAN NOT NULL DEFAULT true,
    "postTitleFontSize" TEXT NOT NULL DEFAULT '32px',
    "postBodyFontSize" TEXT NOT NULL DEFAULT '18px',
    "postGlobalMarginTop" TEXT NOT NULL DEFAULT '32',
    "postGlobalMarginBottom" TEXT NOT NULL DEFAULT '32',
    "postGlobalPaddingTop" TEXT NOT NULL DEFAULT '0',
    "postGlobalPaddingBottom" TEXT NOT NULL DEFAULT '0',
    "postGlobalPaddingLeft" TEXT NOT NULL DEFAULT '0',
    "postGlobalPaddingRight" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageBlock" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sectionId" TEXT,
    "columnId" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'main',
    "location" TEXT NOT NULL DEFAULT 'home',
    "themeId" TEXT NOT NULL DEFAULT 'modern',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_published_idx" ON "Post"("published");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Advertisement_isActive_idx" ON "Advertisement"("isActive");

-- CreateIndex
CREATE INDEX "Advertisement_position_idx" ON "Advertisement"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeConfig_themeId_key" ON "ThemeConfig"("themeId");

-- CreateIndex
CREATE INDEX "HomepageBlock_themeId_idx" ON "HomepageBlock"("themeId");

-- CreateIndex
CREATE INDEX "HomepageBlock_location_idx" ON "HomepageBlock"("location");

-- CreateIndex
CREATE INDEX "HomepageBlock_order_idx" ON "HomepageBlock"("order");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
