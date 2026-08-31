import { NextResponse } from "next/server";
import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
import { applyAutoShareTemplate, normalizeAutoShareSettings } from "@/lib/auto-share";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { decryptSecret } from "@/lib/secret-crypto";

export const dynamic = "force-dynamic";

const AUTO_SHARE_SECRET_NAMESPACE = "news-portal-auto-share";

function stripTrailingSlash(value: string) {
  return String(value || "").replace(/\/+$/, "");
}

function getSiteUrl(request: Request) {
  const envUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (envUrl) return stripTrailingSlash(envUrl);

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return `${forwardedProto}://${stripTrailingSlash(forwardedHost)}`;
  }

  return stripTrailingSlash(new URL(request.url).origin);
}

function toAbsoluteUrl(siteUrl: string, maybeUrl: string | null | undefined) {
  const raw = String(maybeUrl || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${siteUrl}${raw}`;
  return `${siteUrl}/${raw}`;
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function shareToFacebookPage(input: {
  pageId: string;
  accessToken: string;
  message: string;
  url: string;
}) {
  const response = await fetch(`https://graph.facebook.com/v25.0/${encodeURIComponent(input.pageId)}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      message: input.message,
      link: input.url,
      access_token: input.accessToken,
    }),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.error?.message || "Gagal mengirim ke Facebook Page.");
  }

  return {
    ok: true,
    provider: "facebook_page",
    postId: json?.id || null,
  };
}

async function shareToTelegramChannel(input: {
  token: string;
  chatId: string;
  message: string;
  photoUrl?: string;
}) {
  const method = input.photoUrl ? "sendPhoto" : "sendMessage";
  const url = `https://api.telegram.org/bot${input.token}/${method}`;
  const body = input.photoUrl
    ? {
        chat_id: input.chatId,
        photo: input.photoUrl,
        caption: input.message,
        parse_mode: "HTML",
      }
    : {
        chat_id: input.chatId,
        text: input.message,
        parse_mode: "HTML",
      };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || json?.ok === false) {
    throw new Error(json?.description || "Gagal mengirim ke Telegram Channel.");
  }

  return {
    ok: true,
    provider: "telegram_channel",
    messageId: json?.result?.message_id || null,
  };
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "auto_share"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = assertRateLimit(request, "auto-share:dispatch", { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const postId = typeof body?.postId === "string" ? body.postId.trim() : "";
  if (!postId) {
    return NextResponse.json({ error: "Post tidak valid." }, { status: 400 });
  }

  const [settingsRecord, post]: any = await Promise.all([
    prisma.setting.findUnique({
      where: { id: "default" },
      select: { autoShareSettings: true } as any,
    }),
    prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        published: true,
        image: true,
        excerpt: true,
        featuredImage: { select: { fileUrl: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  if (!post) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const isPublished = String(post.status || "").toUpperCase() === "PUBLISHED" || post.published === true;
  if (!isPublished || !post.slug || !post.category?.slug) {
    return NextResponse.json({ error: "Hanya artikel published yang bisa di-share otomatis." }, { status: 400 });
  }

  const rawSettings = settingsRecord?.autoShareSettings && typeof settingsRecord.autoShareSettings === "object"
    ? settingsRecord.autoShareSettings
    : {};
  const settings = normalizeAutoShareSettings(rawSettings);
  const masterKey = process.env.MASTER_KEY;
  const siteUrl = getSiteUrl(request);
  const articleUrl = `${siteUrl}/${post.category.slug}/${post.slug}`;
  const shareText = applyAutoShareTemplate(settings.shareTextTemplate, {
    title: post.title || "",
    category: post.category?.name || "",
    url: articleUrl,
  });
  const featuredImageUrl = toAbsoluteUrl(siteUrl, post.featuredImage?.fileUrl || post.image || "");

  const results: Array<Record<string, unknown>> = [];

  if (settings.autoPublishFacebookPage) {
    try {
      const tokenCipher = typeof rawSettings.facebookPageAccessTokenEnc === "string" ? rawSettings.facebookPageAccessTokenEnc : "";
      const accessToken = tokenCipher
        ? masterKey
          ? decryptSecret(tokenCipher, masterKey, AUTO_SHARE_SECRET_NAMESPACE)
          : tokenCipher
        : "";

      if (!settings.facebookPageId || !accessToken) {
        throw new Error("Konfigurasi Facebook Page belum lengkap.");
      }

      const result = await shareToFacebookPage({
        pageId: settings.facebookPageId,
        accessToken,
        message: shareText,
        url: articleUrl,
      });
      results.push(result);
    } catch (error: any) {
      results.push({
        ok: false,
        provider: "facebook_page",
        error: error?.message || "Gagal mengirim ke Facebook Page.",
      });
    }
  }

  if (settings.autoPublishTelegramChannel) {
    try {
      const tokenCipher = typeof rawSettings.telegramBotTokenEnc === "string" ? rawSettings.telegramBotTokenEnc : "";
      const botToken = tokenCipher
        ? masterKey
          ? decryptSecret(tokenCipher, masterKey, AUTO_SHARE_SECRET_NAMESPACE)
          : tokenCipher
        : "";

      if (!settings.telegramChannelChatId || !botToken) {
        throw new Error("Konfigurasi Telegram Channel belum lengkap.");
      }

      const messageBody = shareText || post.title || "";
      const safeTitle = escapeHtml(post.title || "");
      const safeMessageBody = escapeHtml(messageBody);
      const safeArticleUrl = escapeHtml(articleUrl);

      let message = `<b>${safeTitle}</b>`;

      if (safeMessageBody && safeMessageBody !== safeTitle) {
        message += `\n${safeMessageBody}`;
      }

      if (!messageBody.includes(articleUrl)) {
        message += `\n<a href="${safeArticleUrl}">Baca selengkapnya</a>`;
      }

      const result = await shareToTelegramChannel({
        token: botToken,
        chatId: settings.telegramChannelChatId,
        message,
        photoUrl: featuredImageUrl || undefined,
      });
      results.push(result);
    } catch (error: any) {
      results.push({
        ok: false,
        provider: "telegram_channel",
        error: error?.message || "Gagal mengirim ke Telegram Channel.",
      });
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "Belum ada provider auto-share resmi yang aktif." }, { status: 400 });
  }

  const successCount = results.filter((item) => item.ok === true).length;
  const failureCount = results.length - successCount;

  return NextResponse.json({
    ok: failureCount === 0,
    successCount,
    failureCount,
    results,
    unsupported: {
      whatsappChannel: "WhatsApp Channel belum tersedia via API resmi yang stabil untuk auto-post backend.",
      facebookPersonal: "Facebook personal profile tidak didukung sebagai target auto-post backend yang aman.",
    },
  });
}
