-- CreateTable
CREATE TABLE "PostMetricSnapshot" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL,
    "viewsBase" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostMetricSnapshot_postId_day_key" ON "PostMetricSnapshot"("postId", "day");

-- CreateIndex
CREATE INDEX "PostMetricSnapshot_day_idx" ON "PostMetricSnapshot"("day");

-- CreateIndex
CREATE INDEX "PostMetricSnapshot_postId_idx" ON "PostMetricSnapshot"("postId");

-- AddForeignKey
ALTER TABLE "PostMetricSnapshot" ADD CONSTRAINT "PostMetricSnapshot_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

