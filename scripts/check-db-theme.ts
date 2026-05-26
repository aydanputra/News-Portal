
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const setting = await prisma.setting.findUnique({ where: { id: "default" } })
  console.log("Current Active Theme:", setting?.activeTheme)

  const modernBlocks = await prisma.homepageBlock.findMany({
      where: { themeId: "modern" },
      orderBy: { order: "asc" }
  })

  console.log("\n=== WIDGET TEMA MODERN ===")
  if (modernBlocks.length === 0) {
      console.log("Tidak ada widget untuk tema modern.")
  } else {
      modernBlocks.forEach((b, index) => {
          console.log(`${index + 1}. [${b.type}] ${b.title || 'Tanpa Judul'}`)
          console.log(`   - ID: ${b.id}`)
          console.log(`   - Placement: ${b.placement}`)
          console.log(`   - Config:`, JSON.stringify(b.config).substring(0, 100) + "...")
          console.log("------------------------------------------------")
      })
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
