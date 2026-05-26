-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'REJECTED', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "PostType" ADD VALUE 'INFOGRAPHIC';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "subtitle" TEXT;

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "galleryAutoPlay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "galleryEnableLightbox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "galleryLayout" TEXT NOT NULL DEFAULT 'slider',
ADD COLUMN     "galleryShowExif" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postAuthorBox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "postBottomRelated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "postInlineRelated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postInlineRelatedBgColor" TEXT NOT NULL DEFAULT '#f9fafb',
ADD COLUMN     "postInlineRelatedDateRange" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN     "postInlineRelatedFilterType" TEXT NOT NULL DEFAULT 'category',
ADD COLUMN     "postInlineRelatedFontSize" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "postInlineRelatedHeaderBgColor" TEXT NOT NULL DEFAULT '#f9fafb',
ADD COLUMN     "postInlineRelatedHoverColor" TEXT NOT NULL DEFAULT '#2563eb',
ADD COLUMN     "postInlineRelatedLayout" TEXT NOT NULL DEFAULT 'list',
ADD COLUMN     "postInlineRelatedTextColor" TEXT NOT NULL DEFAULT '#1f2937',
ADD COLUMN     "postInlineRelatedTitleColor" TEXT NOT NULL DEFAULT '#1e293b',
ADD COLUMN     "postInlineRelatedTitleFontSize" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "postNavigation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "postRelatedCount" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "postRelatedFilterType" TEXT NOT NULL DEFAULT 'category',
ADD COLUMN     "postRelatedLayout" TEXT NOT NULL DEFAULT 'grid',
ADD COLUMN     "postRelatedLimit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "postRelatedPosition" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "postRelatedPositions" TEXT NOT NULL DEFAULT '2';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "PostSlugHistory" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostSlugHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostSlugHistory_oldSlug_key" ON "PostSlugHistory"("oldSlug");

-- CreateIndex
CREATE INDEX "PostSlugHistory_oldSlug_idx" ON "PostSlugHistory"("oldSlug");

-- CreateIndex
CREATE INDEX "PostSlugHistory_postId_idx" ON "PostSlugHistory"("postId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSlugHistory" ADD CONSTRAINT "PostSlugHistory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostRevision" ADD CONSTRAINT "PostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
