export type AutoSharePlatform = "facebook" | "x" | "whatsapp" | "telegram" | "linkedin" | "email" | "copy";

export type AutoShareSettings = {
  shareTextTemplate: string;
  showFacebook: boolean;
  showX: boolean;
  showWhatsapp: boolean;
  showTelegram: boolean;
  showLinkedin: boolean;
  showEmail: boolean;
  showCopy: boolean;
  autoPublishFacebookPage: boolean;
  facebookPageId: string;
  facebookPageAccessToken: string;
  facebookPageAccessTokenConfigured: boolean;
  autoPublishTelegramChannel: boolean;
  telegramChannelChatId: string;
  telegramBotToken: string;
  telegramBotTokenConfigured: boolean;
};

export const DEFAULT_AUTO_SHARE_SETTINGS: AutoShareSettings = {
  shareTextTemplate: "{title}",
  showFacebook: true,
  showX: true,
  showWhatsapp: true,
  showTelegram: true,
  showLinkedin: false,
  showEmail: false,
  showCopy: true,
  autoPublishFacebookPage: false,
  facebookPageId: "",
  facebookPageAccessToken: "",
  facebookPageAccessTokenConfigured: false,
  autoPublishTelegramChannel: false,
  telegramChannelChatId: "",
  telegramBotToken: "",
  telegramBotTokenConfigured: false,
};

export const AUTO_SHARE_PLATFORM_OPTIONS: Array<{
  key: keyof Omit<AutoShareSettings, "shareTextTemplate">;
  label: string;
}> = [
  { key: "showFacebook", label: "Facebook" },
  { key: "showWhatsapp", label: "WhatsApp" },
  { key: "showTelegram", label: "Telegram" },
];

export function normalizeAutoShareSettings(raw: unknown): AutoShareSettings {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    shareTextTemplate:
      typeof input.shareTextTemplate === "string" && input.shareTextTemplate.trim() !== ""
        ? input.shareTextTemplate.trim()
        : DEFAULT_AUTO_SHARE_SETTINGS.shareTextTemplate,
    showFacebook:
      typeof input.showFacebook === "boolean" ? input.showFacebook : DEFAULT_AUTO_SHARE_SETTINGS.showFacebook,
    showX: typeof input.showX === "boolean" ? input.showX : DEFAULT_AUTO_SHARE_SETTINGS.showX,
    showWhatsapp:
      typeof input.showWhatsapp === "boolean" ? input.showWhatsapp : DEFAULT_AUTO_SHARE_SETTINGS.showWhatsapp,
    showTelegram:
      typeof input.showTelegram === "boolean" ? input.showTelegram : DEFAULT_AUTO_SHARE_SETTINGS.showTelegram,
    showLinkedin:
      typeof input.showLinkedin === "boolean" ? input.showLinkedin : DEFAULT_AUTO_SHARE_SETTINGS.showLinkedin,
    showEmail:
      typeof input.showEmail === "boolean" ? input.showEmail : DEFAULT_AUTO_SHARE_SETTINGS.showEmail,
    showCopy: typeof input.showCopy === "boolean" ? input.showCopy : DEFAULT_AUTO_SHARE_SETTINGS.showCopy,
    autoPublishFacebookPage:
      typeof input.autoPublishFacebookPage === "boolean"
        ? input.autoPublishFacebookPage
        : DEFAULT_AUTO_SHARE_SETTINGS.autoPublishFacebookPage,
    facebookPageId:
      typeof input.facebookPageId === "string" ? input.facebookPageId.trim() : DEFAULT_AUTO_SHARE_SETTINGS.facebookPageId,
    facebookPageAccessToken:
      typeof input.facebookPageAccessToken === "string"
        ? input.facebookPageAccessToken
        : DEFAULT_AUTO_SHARE_SETTINGS.facebookPageAccessToken,
    facebookPageAccessTokenConfigured:
      typeof input.facebookPageAccessTokenConfigured === "boolean"
        ? input.facebookPageAccessTokenConfigured
        : DEFAULT_AUTO_SHARE_SETTINGS.facebookPageAccessTokenConfigured,
    autoPublishTelegramChannel:
      typeof input.autoPublishTelegramChannel === "boolean"
        ? input.autoPublishTelegramChannel
        : DEFAULT_AUTO_SHARE_SETTINGS.autoPublishTelegramChannel,
    telegramChannelChatId:
      typeof input.telegramChannelChatId === "string"
        ? input.telegramChannelChatId.trim()
        : DEFAULT_AUTO_SHARE_SETTINGS.telegramChannelChatId,
    telegramBotToken:
      typeof input.telegramBotToken === "string"
        ? input.telegramBotToken
        : DEFAULT_AUTO_SHARE_SETTINGS.telegramBotToken,
    telegramBotTokenConfigured:
      typeof input.telegramBotTokenConfigured === "boolean"
        ? input.telegramBotTokenConfigured
        : DEFAULT_AUTO_SHARE_SETTINGS.telegramBotTokenConfigured,
  };
}

export function applyAutoShareTemplate(
  template: string,
  values: { title: string; category: string; url: string },
): string {
  const resolvedTemplate = String(template || DEFAULT_AUTO_SHARE_SETTINGS.shareTextTemplate);
  return resolvedTemplate
    .replace(/\{title\}/gi, values.title)
    .replace(/\{category\}/gi, values.category)
    .replace(/\{url\}/gi, values.url)
    .trim();
}

export function hasAnyAutoShareTarget(settings?: AutoShareSettings | null) {
  if (!settings) return false;

  const hasFacebookPage =
    settings.autoPublishFacebookPage &&
    settings.facebookPageId.trim() !== "" &&
    settings.facebookPageAccessTokenConfigured;

  const hasTelegramChannel =
    settings.autoPublishTelegramChannel &&
    settings.telegramChannelChatId.trim() !== "" &&
    settings.telegramBotTokenConfigured;

  return hasFacebookPage || hasTelegramChannel;
}
