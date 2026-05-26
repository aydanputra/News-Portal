
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestPost() {
  console.log("Checking latest posts...");
  
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      type: true,
      videoUrl: true,
      image: true,
      featuredImageId: true
    }
  });

  console.log(JSON.stringify(posts, null, 2));
}

checkLatestPost()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
