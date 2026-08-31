import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mergeThemeConfigWithSettings } from "@/lib/settings";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedThemeId = searchParams.get("themeId");

    let setting: any = await prisma.setting.findUnique({ where: { id: "default" } });
    if (!setting) {
      setting = await prisma.setting.create({ data: { id: "default" } });
    }

    const activeTheme = requestedThemeId || setting.activeTheme || "classic";
    const themeConfig = await (prisma as any).themeConfig.findUnique({
      where: { themeId: activeTheme },
    });

    if (themeConfig && (themeConfig as any).config) {
      setting = mergeThemeConfigWithSettings(setting, (themeConfig as any).config);
    }

    return NextResponse.json(stripSecrets(setting));
  } catch (error) {
    console.error("GET /api/public/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
