
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const postCount = await prisma.post.count()
  const categoryCount = await prisma.category.count()
  const blocksCount = await prisma.homepageBlock.count()
  
  console.log(`Posts: ${postCount}`)
  console.log(`Categories: ${categoryCount}`)
  console.log(`Blocks: ${blocksCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
