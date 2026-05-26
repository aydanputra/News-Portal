import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

function stripSecrets(setting: any) {
  if (!setting || typeof setting !== "object") return setting;

  const {
    notificationTelegramBotToken: _notificationTelegramBotToken,
    notificationTelegramChatId: _notificationTelegramChatId,
    notificationEmailTo: _notificationEmailTo,
    notificationSmtpHost: _notificationSmtpHost,
    notificationSmtpPort: _notificationSmtpPort,
    notificationSmtpUser: _notificationSmtpUser,
    notificationSmtpPass: _notificationSmtpPass,
    notificationSmtpSecure: _notificationSmtpSecure,
    aiOpenAiApiKeyEnc: _aiOpenAiApiKeyEnc,
    ...rest
  } = setting as any;

  return rest;
}

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
      const themeConfig = await (prisma as any).themeConfig.findUnique({
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

      return stripSecrets(setting);
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
