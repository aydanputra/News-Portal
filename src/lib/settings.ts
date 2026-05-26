import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getSettings = unstable_cache(
  async () => {
    try {
      let setting: any = await prisma.setting.findUnique({ where: { id: "default" } });
      if (!setting) {
        setting = await prisma.setting.create({
          data: { id: "default" }
        });
      }

      const activeTheme = setting.activeTheme || "modern";
      // @ts-ignore
      const themeConfig = await prisma.themeConfig.findUnique({
          where: { themeId: activeTheme }
      });

      if (themeConfig && themeConfig.config) {
          const mergedSetting = {
              ...setting,
              ...(themeConfig.config as object)
          };

          // Restore Global Styles (Global Wins)
          setting = {
              ...mergedSetting,
              primaryColor: setting.primaryColor,
              secondaryColor: setting.secondaryColor,
              accentColor: setting.accentColor,
              backgroundColor: setting.backgroundColor,
              headingColor: setting.headingColor,
              excerptColor: setting.excerptColor,
              metaColor: setting.metaColor,
              headingFont: setting.headingFont,
              bodyFont: setting.bodyFont,
              baseFontSize: setting.baseFontSize,
              globalBorderRadius: setting.globalBorderRadius,
              
              globalContainerWidth: setting.globalContainerWidth,
              globalCustomContainerWidth: setting.globalCustomContainerWidth,

              homeContainerWidth: setting.homeContainerWidth,
              homeCustomContainerWidth: setting.homeCustomContainerWidth,
              postContainerWidth: setting.postContainerWidth,
              postCustomContainerWidth: setting.postCustomContainerWidth,
          };
      }

      return setting;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return {};
    }
  },
  ["settings"],
  {
    revalidate: false, // Cache forever until manually invalidated
    tags: ["settings"]
  }
);