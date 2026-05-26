
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTestPosts() {
  console.log("🗑️ Starting Cleanup Process...");

  try {
    // 1. Delete Posts with 'test-workflow' in slug
    const deleteWorkflow = await prisma.post.deleteMany({
      where: { 
        slug: { contains: 'test-workflow' } 
      }
    });
    console.log(`✅ Deleted ${deleteWorkflow.count} test workflow posts`);

    // 2. Delete Posts with 'test-scheduled' in slug
    const deleteScheduled = await prisma.post.deleteMany({
      where: { 
        slug: { contains: 'test-scheduled' } 
      }
    });
    console.log(`✅ Deleted ${deleteScheduled.count} test scheduled posts`);

    // 3. Optional: Delete specific post if ID known (manual cleanup)
    // const specificId = "cm6...";
    // await prisma.post.delete({ where: { id: specificId } });

  } catch (error) {
    console.error("❌ Cleanup Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestPosts();
