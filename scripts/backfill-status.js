
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillStatus() {
  console.log("🚀 Starting Backfill Process...");

  // 1. Update PUBLISHED posts
  const publishedUpdate = await prisma.post.updateMany({
    where: { published: true },
    data: { status: 'PUBLISHED' }
  });
  console.log(`✅ Updated ${publishedUpdate.count} posts to PUBLISHED`);

  // 2. Update DRAFT posts
  const draftUpdate = await prisma.post.updateMany({
    where: { published: false },
    data: { status: 'DRAFT' }
  });
  console.log(`✅ Updated ${draftUpdate.count} posts to DRAFT`);

  // 3. Verification
  const totalPosts = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { status: 'PUBLISHED' } });
  const draftCount = await prisma.post.count({ where: { status: 'DRAFT' } });
  
  console.log("--- SUMMARY ---");
  console.log(`Total Posts: ${totalPosts}`);
  console.log(`PUBLISHED: ${publishedCount}`);
  console.log(`DRAFT: ${draftCount}`);
  
  if (publishedCount + draftCount !== totalPosts) {
    console.warn("⚠️ Warning: Some posts might not have a valid status!");
  } else {
    console.log("✨ All posts have been successfully migrated!");
  }
}

backfillStatus()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
