
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting migration: Settings -> ThemeConfig")

  // 1. Ambil Setting Global Lama
  const setting = await prisma.setting.findUnique({ where: { id: "default" } })
  if (!setting) {
      console.log("❌ No default setting found. Skipping.")
      return
  }

  // 2. Siapkan data config untuk Modern (Default)
  const modernConfig = {
      homeLayout: setting.homeLayout,
      homeSidebarWidth: setting.homeSidebarWidth,
      homeContainerWidth: setting.homeContainerWidth,
      homeMainColumnBox: setting.homeMainColumnBox,
      homeSidebarColumnBox: setting.homeSidebarColumnBox,
      homeMainColumnBorderRadius: setting.homeMainColumnBorderRadius,
      homeSidebarColumnBorderRadius: setting.homeSidebarColumnBorderRadius,
      homeMainColumnColor: setting.homeMainColumnColor,
      homeSidebarColumnColor: setting.homeSidebarColumnColor,
      
      // Style Settings
      primaryColor: setting.primaryColor,
      secondaryColor: setting.secondaryColor,
      accentColor: setting.accentColor,
      backgroundColor: setting.backgroundColor,
      headingColor: setting.headingColor,
      excerptColor: setting.excerptColor,
      metaColor: setting.metaColor,
      headingFont: setting.headingFont,
      bodyFont: setting.bodyFont,
      globalBorderRadius: setting.globalBorderRadius,

      // Global Margins
      homeGlobalMarginTop: setting.homeGlobalMarginTop,
      homeGlobalMarginBottom: setting.homeGlobalMarginBottom,
      homeGlobalPaddingTop: setting.homeGlobalPaddingTop,
      homeGlobalPaddingBottom: setting.homeGlobalPaddingBottom,
      homeGlobalPaddingLeft: setting.homeGlobalPaddingLeft,
      homeGlobalPaddingRight: setting.homeGlobalPaddingRight
  }

  // 3. Upsert ke ThemeConfig (Modern)
  await prisma.themeConfig.upsert({
      where: { themeId: "modern" },
      create: {
          themeId: "modern",
          config: modernConfig
      },
      update: {
          config: modernConfig // Overwrite jika sudah ada, untuk memastikan sinkron
      }
  })

  console.log("✅ Migrated settings to ThemeConfig: Modern")

  // 4. Buat Default untuk Classic (biar ga kosong)
  const classicConfig = {
      ...modernConfig,
      homeLayout: "right_sidebar",
      primaryColor: "#000000", // Default Classic Black
      headingFont: "Playfair Display",
      bodyFont: "Lora"
  }

  await prisma.themeConfig.upsert({
      where: { themeId: "classic" },
      create: {
          themeId: "classic",
          config: classicConfig
      },
      update: {} // Jangan overwrite jika sudah ada
  })

  console.log("✅ Created default config for: Classic")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
