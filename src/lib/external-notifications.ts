
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

/**
 * Utility untuk mengirim notifikasi ke pihak eksternal (Telegram, Email)
 */

export async function sendEmailNotification(
  message: string, 
  config: { 
    host: string; 
    port: number; 
    user: string; 
    pass: string; 
    secure: boolean;
    from: string;
    to: string;
    subject: string;
  }
) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: config.subject,
      html: message.replace(/\n/g, '<br>'), // Convert plain text newlines to HTML
    });
  } catch (err) {
    console.error("[Notification] Failed to send Email:", err);
  }
}

export async function sendTelegramMessage(
  message: string,
  config?: { token?: string; chatId?: string; replyMarkup?: any }
) {
  const token = config?.token || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config?.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Notification] Telegram config missing, skipping...");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: config?.replyMarkup,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Notification] Telegram API Error:", error);
    }
  } catch (err) {
    console.error("[Notification] Failed to send Telegram message:", err);
  }
}

export async function sendTelegramPhoto(
  photoUrl: string,
  config?: { token?: string; chatId?: string; caption?: string }
) {
  const token = config?.token || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config?.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || !photoUrl) {
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendPhoto`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: config?.caption,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Notification] Telegram API Error:", error);
    }
  } catch (err) {
    console.error("[Notification] Failed to send Telegram photo:", err);
  }
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripTrailingSlash(url: string) {
  return String(url || "").replace(/\/+$/, "");
}

function toAbsoluteUrl(siteUrl: string, maybeUrl: string) {
  const u = String(maybeUrl || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${stripTrailingSlash(siteUrl)}${u}`;
  return `${stripTrailingSlash(siteUrl)}/${u}`;
}

function htmlToPlainText(html: string) {
  let text = String(html || "");
  text = text.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  text = text.replace(/<\/\s*p\s*>/gi, "\n\n");
  text = text.replace(/<\s*p[^>]*>/gi, "");
  text = text.replace(/<\/\s*h[1-6]\s*>/gi, "\n\n");
  text = text.replace(/<\s*h[1-6][^>]*>/gi, "");
  text = text.replace(/<\/\s*li\s*>/gi, "\n");
  text = text.replace(/<\s*li[^>]*>/gi, "• ");
  text = text.replace(/<\/\s*ul\s*>/gi, "\n");
  text = text.replace(/<\s*ul[^>]*>/gi, "");
  text = text.replace(/<\/\s*ol\s*>/gi, "\n");
  text = text.replace(/<\s*ol[^>]*>/gi, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return text;
}

function truncateTextByChars(text: string, maxChars: number) {
  const raw = String(text || "");
  if (raw.length <= maxChars) return { text: raw, truncated: false };
  const sliced = raw.slice(0, Math.max(0, maxChars - 1)).trimEnd();
  return { text: sliced + "…", truncated: true };
}

function splitPlainTextToChunksByParagraph(text: string, maxChars: number) {
  const normalized = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) return [];

  const paragraphs = normalized.split("\n\n");
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = "";
  };

  for (const p of paragraphs) {
    const para = p.trim();
    if (!para) continue;

    if (!current) {
      if (para.length <= maxChars) {
        current = para;
        continue;
      }
      const lines = para.split("\n").filter(Boolean);
      let part = "";
      for (const lineRaw of lines.length ? lines : [para]) {
        const line = String(lineRaw).trim();
        if (!line) continue;
        if ((part ? part.length + 1 : 0) + line.length <= maxChars) {
          part = part ? `${part}\n${line}` : line;
        } else {
          if (part) chunks.push(part);
          part = line.length <= maxChars ? line : line.slice(0, maxChars);
        }
      }
      if (part) chunks.push(part);
      current = "";
      continue;
    }

    const candidate = `${current}\n\n${para}`;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      pushCurrent();
      if (para.length <= maxChars) {
        current = para;
      } else {
        const lines = para.split("\n").filter(Boolean);
        let part = "";
        for (const lineRaw of lines.length ? lines : [para]) {
          const line = String(lineRaw).trim();
          if (!line) continue;
          if ((part ? part.length + 1 : 0) + line.length <= maxChars) {
            part = part ? `${part}\n${line}` : line;
          } else {
            if (part) chunks.push(part);
            part = line.length <= maxChars ? line : line.slice(0, maxChars);
          }
        }
        if (part) chunks.push(part);
        current = "";
      }
    }
  }

  pushCurrent();
  return chunks;
}

/**
 * Fungsi helper untuk memformat pesan notifikasi alur kerja berita
 */
export async function notifyWorkflowUpdate({
  title,
  authorName,
  oldStatus: _oldStatus,
  newStatus,
  rejectionReason,
  postId,
  authorId,
  editorIds
}: {
  title: string;
  authorName?: string;
  oldStatus?: string;
  newStatus: string;
  rejectionReason?: string;
  postId: string;
  authorId?: string;
  editorIds?: string[];
}) {
  // 1. Ambil Pengaturan dari Database
  const settings = await prisma.setting.findUnique({ where: { id: "default" } }) as any;
  
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const editUrl = `${siteUrl}/admin/posts/${postId}/edit`;

  const dbPost: any = await (prisma.post as any).findUnique({
    where: { id: postId },
    select: {
      title: true,
      slug: true,
      content: true,
      image: true,
      imageCaption: true,
      featuredImage: { select: { fileUrl: true } },
      tags: { select: { name: true } },
      author: { select: { name: true, email: true, telegramChatId: true } },
      category: { select: { slug: true, name: true } },
      approvedBy: { select: { name: true } },
    },
  });

  const safeTitle = escapeHtml(dbPost?.title || title || "");
  const safeAuthorName = escapeHtml(dbPost?.author?.name || authorName || "");
  const safeEditorName = escapeHtml(dbPost?.approvedBy?.name || "");
  const safeCategoryName = escapeHtml(dbPost?.category?.name || "");
  const plainContent = htmlToPlainText(String(dbPost?.content || ""));
  const _contentChunksPlain = splitPlainTextToChunksByParagraph(plainContent, 3200);
  const { text: summaryText, truncated: summaryTruncated } = truncateTextByChars(plainContent, 650);
  const safeSummaryText = escapeHtml(summaryText);
  const safeTags = Array.isArray(dbPost?.tags) ? dbPost.tags.map((t: any) => String(t?.name || "").trim()).filter(Boolean) : [];
  const _safeTagLine = safeTags.length ? escapeHtml(safeTags.join(", ")) : "";
  const _safeImageCaption = escapeHtml(String(dbPost?.imageCaption || "").trim());
  const photoCandidate = String(dbPost?.featuredImage?.fileUrl || dbPost?.image || "").trim();
  const _photoUrl = photoCandidate ? toAbsoluteUrl(siteUrl, photoCandidate) : "";
  const postSlug = typeof dbPost?.slug === "string" ? dbPost.slug : "";
  const categorySlug = typeof dbPost?.category?.slug === "string" ? dbPost.category.slug : "";
  const publicUrl =
    postSlug && categorySlug
      ? `${siteUrl}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(postSlug)}`
      : siteUrl;

  // 2. Cek apakah event ini diaktifkan
  const events = settings?.notificationEvents || { onNewPost: true, onPostRejected: true, onPostPublished: true };
  const emailTargetAuthor = Boolean((events as any)?.emailTargetAuthor ?? true);
  const emailTargetEditors = Boolean((events as any)?.emailTargetEditors ?? true);
  const emailTargetAdmins = Boolean((events as any)?.emailTargetAdmins ?? true);
  
  let shouldNotify = false;
  let message = "";
  let targetChatIds: string[] = [];
  let telegramReplyMarkup: any = undefined;
  const targetEmails: string[] = [];

  async function collectRoleEmails(ids: string[] | undefined) {
    if (!ids || ids.length === 0) return { editorEmails: [] as string[], adminEmails: [] as string[] };
    const users = await (prisma.user as any).findMany({
      // @ts-ignore
      where: { id: { in: ids } },
      // @ts-ignore
      select: { email: true, role: true },
    });
    const editorEmails: string[] = [];
    const adminEmails: string[] = [];
    for (const u of users || []) {
      const email = typeof u?.email === "string" ? u.email.trim() : "";
      if (!email || !email.includes("@")) continue;
      const role = String(u?.role || "");
      if (role === "EDITOR") editorEmails.push(email);
      if (role === "ADMIN" || role === "SUPER_ADMIN") adminEmails.push(email);
    }
    return { editorEmails, adminEmails };
  }

  // Logic: Split Personal vs Group
  if (newStatus === "IN_REVIEW" && events.onNewPost) {
    shouldNotify = true;
    message = `🔔 <b>Berita Baru Masuk!</b>\n\n` +
              `📝 Judul: <b>${safeTitle}</b>\n` +
              `✍️ Penulis: ${safeAuthorName}\n` +
              (safeCategoryName ? `🏷️ Kategori: ${safeCategoryName}\n` : "") +
              (safeSummaryText ? `\n🧾 Ringkasan:\n${safeSummaryText}\n` : "") +
              (summaryTruncated ? `\n…(ringkasan dipotong)\n` : "") +
              `🕒 Status: Menunggu Review Editor\n\n` +
              `🔗 <a href="${editUrl}">Buka di Panel</a>`;
    
    // Target: All Editors (Personal)
    if (editorIds && editorIds.length > 0) {
      const editors = await (prisma.user as any).findMany({
        // @ts-ignore
        where: { id: { in: editorIds }, telegramChatId: { not: null } },
        // @ts-ignore
        select: { telegramChatId: true }
      });
      // @ts-ignore
      targetChatIds = editors.map(e => e.telegramChatId!).filter(Boolean);

      const { editorEmails, adminEmails } = await collectRoleEmails(editorIds);
      if (emailTargetEditors) targetEmails.push(...editorEmails);
      if (emailTargetAdmins) targetEmails.push(...adminEmails);
    }

    telegramReplyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Publish", callback_data: `pub:${postId}` },
          { text: "❌ Reject/Revisi", callback_data: `askrej:${postId}` },
        ],
        [
          { text: "📄 Konten", callback_data: `content:${postId}` },
        ],
      ],
    };
  } else if (newStatus === "PUBLISHED" && events.onPostPublished) {
    shouldNotify = true;
    message = `✅ <b>Berita Telah Terbit!</b>\n\n` +
              `📰 Judul: <b>${safeTitle}</b>\n` +
              `✍️ Penulis: ${safeAuthorName}\n` +
              (safeEditorName ? `🧑‍💼 Editor: ${safeEditorName}\n` : "") +
              `🚀 Status: PUBLISHED\n\n` +
              `🔗 ${publicUrl}\n` +
              `🛠️ <a href="${editUrl}">Buka di Panel</a>`;
    
    // Target: Group for Reporting
    if (settings?.notificationTelegramChatId) {
      targetChatIds = [settings.notificationTelegramChatId];
    }

    if (emailTargetAuthor && dbPost?.author?.email) {
      targetEmails.push(dbPost.author.email);
    } else if (emailTargetAuthor && authorId) {
      const author = await (prisma.user as any).findUnique({
        where: { id: authorId },
        select: { email: true },
      });
      if (author?.email) targetEmails.push(author.email);
    }

    if (editorIds && editorIds.length > 0) {
      const { editorEmails, adminEmails } = await collectRoleEmails(editorIds);
      if (emailTargetEditors) targetEmails.push(...editorEmails);
      if (emailTargetAdmins) targetEmails.push(...adminEmails);
    }
  } else if (newStatus === "REJECTED" && events.onPostRejected) {
    shouldNotify = true;
    message = `❌ <b>Berita Perlu Revisi</b>\n\n` +
              `📰 Judul: <b>${safeTitle}</b>\n` +
              `✍️ Penulis: ${safeAuthorName}\n` +
              `⚠️ Alasan: <i>${escapeHtml(rejectionReason || "Tidak disebutkan")}</i>\n\n` +
              `🔗 <a href="${editUrl}">Edit Berita</a>`;
    
    // Target: Author (Personal)
    if (dbPost?.author?.telegramChatId) {
      targetChatIds = [dbPost.author.telegramChatId];
    } else if (authorId) {
      const author = await (prisma.user as any).findUnique({
        where: { id: authorId },
        select: { telegramChatId: true },
      });
      if (author?.telegramChatId) targetChatIds = [author.telegramChatId];
    }
    if (emailTargetAuthor && dbPost?.author?.email) {
      targetEmails.push(dbPost.author.email);
    } else if (emailTargetAuthor && authorId) {
      const author = await (prisma.user as any).findUnique({
        where: { id: authorId },
        select: { email: true },
      });
      if (author?.email) targetEmails.push(author.email);
    }

    if (editorIds && editorIds.length > 0) {
      const { editorEmails, adminEmails } = await collectRoleEmails(editorIds);
      if (emailTargetEditors) targetEmails.push(...editorEmails);
      if (emailTargetAdmins) targetEmails.push(...adminEmails);
    }
  }

  if (shouldNotify && message) {
    // 3. Kirim via Telegram jika aktif
    if (settings?.notificationTelegramEnabled && targetChatIds.length > 0) {
      for (const chatId of targetChatIds) {
        await sendTelegramMessage(message, {
          token: settings.notificationTelegramBotToken,
          chatId: chatId,
          replyMarkup: telegramReplyMarkup,
        });
      }
    } else if (!settings && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      // Fallback
      await sendTelegramMessage(message);
    }
    
    // 4. Kirim via Email jika aktif
    if (settings?.notificationEmailEnabled && settings.notificationSmtpHost) {
      const subjectMap: Record<string, string> = {
        "IN_REVIEW": "🔔 Berita Baru Masuk - Menunggu Review",
        "PUBLISHED": "✅ Berita Telah Terbit",
        "REJECTED": "❌ Berita Perlu Revisi"
      };

      const subject = subjectMap[newStatus] || "Update Berita Portal";
      const baseConfig = {
        host: settings.notificationSmtpHost,
        port: settings.notificationSmtpPort || 587,
        user: settings.notificationSmtpUser || "",
        pass: settings.notificationSmtpPass || "",
        secure: settings.notificationSmtpSecure ?? true,
        from: settings.notificationEmailFrom || "noreply@portal-berita.com",
        subject,
      };

      const normalized = Array.from(
        new Set((targetEmails || []).map((e) => String(e).trim()).filter((e) => e.includes("@"))),
      );
      const fallbackTo = typeof settings.notificationEmailTo === "string" ? settings.notificationEmailTo.trim() : "";
      const recipients = normalized.length > 0 ? normalized : (fallbackTo ? [fallbackTo] : []);

      for (const to of recipients) {
        await sendEmailNotification(message, { ...baseConfig, to });
      }
    }
  }
}
