
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting Fix: ThemeConfig Keys")

  const configs = await prisma.themeConfig.findMany();

  for (const config of configs) {
      const data = config.config as any;
      let updated = false;

      // Map old keys to new keys
      const mappings: Record<string, string> = {
          'homeHeadingFont': 'headingFont',
          'homeBodyFont': 'bodyFont',
          'homePrimaryColor': 'primaryColor',
          'homeSecondaryColor': 'secondaryColor',
          'homeAccentColor': 'accentColor',
          'homeBackgroundColor': 'backgroundColor',
          'homeHeadingColor': 'headingColor',
          'homeExcerptColor': 'excerptColor',
          'homeMetaColor': 'metaColor',
          'homeGlobalBorderRadius': 'globalBorderRadius'
      };

      for (const [oldKey, newKey] of Object.entries(mappings)) {
          if (data[oldKey] !== undefined) {
              data[newKey] = data[oldKey];
              delete data[oldKey]; // Optional: delete old key to keep it clean
              updated = true;
          }
      }

      if (updated) {
          await prisma.themeConfig.update({
              where: { id: config.id },
              data: { config: data }
          });
          console.log(`✅ Updated config for theme: ${config.themeId}`);
      }
  }

  console.log("🎉 Fix completed!")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
