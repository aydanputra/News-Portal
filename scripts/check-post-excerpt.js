
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPostExcerpts() {
  console.log("Checking latest posts and their excerpts...");
  
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true
    }
  });

  posts.forEach(post => {
    console.log(`\nPost ID: ${post.id}`);
    console.log(`Title: ${post.title}`);
    console.log(`Excerpt (DB): ${post.excerpt ? `"${post.excerpt}" (Length: ${post.excerpt.length})` : "NULL"}`);
    if (post.excerpt && post.excerpt.length < 150) {
      console.log("⚠️ WARNING: Excerpt in DB is shorter than 150 chars. Increasing excerptLength won't help unless we ignore DB excerpt.");
    }
  });
}

checkPostExcerpts()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
