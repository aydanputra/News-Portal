import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/external-notifications";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function callTelegramApi(token: string, method: string, payload: any) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

async function sendForceReply(token: string, chatId: string, text: string, placeholder?: string) {
  await callTelegramApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: {
      force_reply: true,
      input_field_placeholder: placeholder || undefined,
      selective: true,
    },
  });
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

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

async function loadActorByChatId(chatId: string) {
  if (!chatId) return null;
  return await (prisma.user as any).findFirst({
    where: { telegramChatId: chatId },
    select: { id: true, role: true, status: true, name: true },
  });
}

function canModerate(actor: any) {
  return actor?.status === "ACTIVE" && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(String(actor?.role || ""));
}

function buildFullActionsKeyboard(postId: string, editUrl: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Publish", callback_data: `pub:${postId}` },
        { text: "❌ Reject/Revisi", callback_data: `askrej:${postId}` },
      ],
      [
        { text: "🏷️ Ubah Kategori", callback_data: `askcat:${postId}` },
        { text: "➕ Tambah Kategori", callback_data: `newcat:${postId}` },
      ],
      [
        { text: "🏷️ Tambah Tag", callback_data: `asktags:${postId}` },
        { text: "🖼️ Ubah Caption", callback_data: `askcap:${postId}` },
      ],
      [{ text: "🛠️ Buka Panel", url: editUrl }],
    ],
  };
}

async function sendPendingReviewList(token: string, chatId: string, actor: any) {
  if (!canModerate(actor)) {
    await sendTelegramMessage("❌ Anda tidak memiliki akses.", { token, chatId });
    return;
  }

  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const take = 10;

  const posts: any[] = await prisma.post.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { updatedAt: "desc" },
    take: 25,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      slug: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  if (!posts.length) {
    await sendTelegramMessage("✅ Tidak ada artikel yang menunggu review.", { token, chatId });
    return;
  }

  const postIds = posts.map((p) => String(p?.id || "")).filter(Boolean);
  let targets: any[] = [];
  try {
    targets = await (prisma as any).postReviewTarget.findMany({
      where: { postId: { in: postIds } },
      select: { postId: true, editorId: true },
    });
  } catch {
    targets = [];
  }

  const targetMap = new Map<string, Set<string>>();
  for (const row of Array.isArray(targets) ? targets : []) {
    const postId = String((row as any)?.postId || "").trim();
    const editorId = String((row as any)?.editorId || "").trim();
    if (!postId || !editorId) continue;
    const set = targetMap.get(postId) || new Set<string>();
    set.add(editorId);
    targetMap.set(postId, set);
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(String(actor?.role || ""));
  const filtered = isAdmin
    ? posts
    : posts.filter((p) => {
        const pid = String(p?.id || "").trim();
        const set = targetMap.get(pid);
        if (set && set.size > 0) return set.has(String(actor?.id || ""));
        return true;
      });

  if (!filtered.length) {
    await sendTelegramMessage("✅ Tidak ada artikel yang ditugaskan ke Anda saat ini.", { token, chatId });
    return;
  }

  await sendTelegramMessage(
    `📋 <b>Daftar Artikel Menunggu Review</b>\n` + `Menampilkan ${Math.min(take, filtered.length)} dari ${filtered.length}.`,
    { token, chatId },
  );

  for (const p of filtered.slice(0, take)) {
    const postId = String(p?.id || "").trim();
    const title = escapeHtml(String(p?.title || "-"));
    const authorName = escapeHtml(String(p?.author?.name || "-"));
    const categoryName = escapeHtml(String(p?.category?.name || "-"));
    const editUrl = `${siteUrl}/admin/posts/${postId}/edit`;

    await sendTelegramMessage(
      `📝 <b>${title}</b>\n` +
        `✍️ ${authorName}\n` +
        `🏷️ ${categoryName}\n` +
        `🆔 <code>${escapeHtml(postId)}</code>`,
      {
        token,
        chatId,
        replyMarkup: {
          inline_keyboard: [
            [
              { text: "📄 Konten", callback_data: `content:${postId}` },
              { text: "🛠️ Panel", url: editUrl },
            ],
            [
              { text: "✅ Publish", callback_data: `pub:${postId}` },
              { text: "❌ Reject/Revisi", callback_data: `askrej:${postId}` },
            ],
          ],
        },
      },
    );
  }
}

async function publishPostById(postId: string, actor: any) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, status: true, title: true, authorId: true },
  });
  if (!post) return { ok: false, message: "Post tidak ditemukan." };
  if (post.status === "PUBLISHED") return { ok: true, message: "Sudah terbit." };

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      published: true,
      publishedAt: new Date(),
      rejectionReason: null,
      approvedBy: { connect: { id: actor.id } },
      approvedAt: new Date(),
    },
  });

  const editors = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
    select: { id: true },
  });
  const editorIds = editors.map((e) => e.id);

  const { notifyWorkflowUpdate } = await import("@/lib/external-notifications");
  notifyWorkflowUpdate({
    title: post.title,
    authorName: "",
    newStatus: "PUBLISHED",
    postId: postId,
    authorId: post.authorId,
    editorIds,
  }).catch(() => {});

  return { ok: true, message: "Berhasil publish.", post };
}

async function rejectPostById(postId: string, reason: string, actor: any) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, status: true, title: true, authorId: true },
  });
  if (!post) return { ok: false, message: "Post tidak ditemukan." };

  const cleanReason = String(reason || "").trim();
  if (!cleanReason) return { ok: false, message: "Alasan revisi wajib diisi." };

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "REJECTED",
      published: false,
      rejectionReason: cleanReason,
      approvedBy: { connect: { id: actor.id } },
      approvedAt: new Date(),
    },
  });

  const editors = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
    select: { id: true },
  });
  const editorIds = editors.map((e) => e.id);

  const { notifyWorkflowUpdate } = await import("@/lib/external-notifications");
  notifyWorkflowUpdate({
    title: post.title,
    authorName: "",
    newStatus: "REJECTED",
    rejectionReason: cleanReason,
    postId: postId,
    authorId: post.authorId,
    editorIds,
  }).catch(() => {});

  return { ok: true, message: "Berhasil mengirim revisi.", post };
}

async function updateCategoryBySlug(postId: string, categorySlug: string) {
  const slug = String(categorySlug || "").trim();
  if (!slug) return { ok: false, message: "Slug kategori wajib diisi." };
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { ok: false, message: "Kategori tidak ditemukan." };
  await prisma.post.update({ where: { id: postId }, data: { category: { connect: { id: category.id } } } });
  try {
    await (prisma.postCategory as any).create({ data: { postId, categoryId: category.id } });
  } catch {}
  return { ok: true, message: `Kategori diubah ke: ${category.name}` };
}

async function addTags(postId: string, tagText: string) {
  const raw = String(tagText || "").trim();
  if (!raw) return { ok: false, message: "Tag wajib diisi." };
  const names = raw
    .split(/[,\n]/g)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!names.length) return { ok: false, message: "Tag wajib diisi." };

  await prisma.post.update({
    where: { id: postId },
    data: {
      tags: {
        connectOrCreate: names.map((name) => ({
          where: { slug: slugify(name) },
          create: { name, slug: slugify(name) },
        })),
      },
    },
  });
  return { ok: true, message: `Tag ditambahkan: ${names.join(", ")}` };
}

async function setImageCaption(postId: string, caption: string) {
  const clean = String(caption || "").trim();
  await prisma.post.update({ where: { id: postId }, data: { imageCaption: clean } });
  return { ok: true, message: "Caption diperbarui." };
}

async function createCategoryIfMissing(name: string) {
  const clean = String(name || "").trim();
  if (!clean) return { ok: false, message: "Nama kategori wajib diisi." as const };

  const baseSlug = slugify(clean);
  if (!baseSlug) return { ok: false, message: "Nama kategori tidak valid." as const };

  const existing = await prisma.category.findUnique({ where: { slug: baseSlug } });
  if (!existing) {
    const created = await prisma.category.create({ data: { name: clean, slug: baseSlug } });
    return { ok: true, category: created };
  }

  let i = 2;
  while (i <= 50) {
    const candidate = `${baseSlug}-${i}`;
    const found = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!found) {
      const created = await prisma.category.create({ data: { name: clean, slug: candidate } });
      return { ok: true, category: created };
    }
    i++;
  }

  return { ok: false, message: "Gagal membuat slug kategori yang unik." as const };
}

async function sendPostPacketToChat(token: string, chatId: string, postId: string) {
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const post: any = await (prisma.post as any).findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      image: true,
      imageCaption: true,
      slug: true,
      category: { select: { slug: true, name: true } },
      tags: { select: { name: true } },
      author: { select: { name: true } },
      featuredImage: { select: { fileUrl: true } },
    },
  });
  if (!post) {
    await sendTelegramMessage("Post tidak ditemukan.", { token, chatId });
    return;
  }

  const tags = Array.isArray(post?.tags) ? post.tags.map((t: any) => String(t?.name || "").trim()).filter(Boolean) : [];
  const tagLine = tags.length ? escapeHtml(tags.join(", ")) : "-";
  const categoryName = escapeHtml(String(post?.category?.name || "-"));
  const caption = escapeHtml(String(post?.imageCaption || "").trim());
  const editUrl = `${siteUrl}/admin/posts/${postId}/edit`;
  const publicUrl =
    post?.slug && post?.category?.slug ? `${siteUrl}/${encodeURIComponent(post.category.slug)}/${encodeURIComponent(post.slug)}` : siteUrl;
  const safeTitle = escapeHtml(String(post.title || ""));
  const safeAuthor = escapeHtml(String(post?.author?.name || "-"));

  await sendTelegramMessage(
    `🧾 <b>Detail Artikel</b>\n\n` +
      `📝 Judul: <b>${safeTitle}</b>\n` +
      `✍️ Penulis: ${safeAuthor}\n` +
      `🏷️ Kategori: ${categoryName}\n` +
      `🏷️ Tag: ${tagLine}\n` +
      `🖼️ Caption: ${caption || "-"}\n` +
      `🆔 ID: <code>${postId}</code>\n\n` +
      `🔗 ${publicUrl}\n` +
      `🛠️ <a href="${editUrl}">Buka di Panel</a>`,
    { token, chatId },
  );

  const photoCandidate = String(post?.featuredImage?.fileUrl || post?.image || "").trim();
  if (photoCandidate) {
    const photoUrl = toAbsoluteUrl(siteUrl, photoCandidate);
    const photoCaption = `🖼️ <b>Foto</b>\n${safeTitle}${caption ? `\n${caption}` : ""}`;
    await sendTelegramPhoto(photoUrl, { token, chatId, caption: photoCaption });
  }

  const plain = htmlToPlainText(String(post?.content || ""));
  const partsPlain = splitPlainTextToChunksByParagraph(plain, 3200);
  if (!partsPlain.length) {
    await sendTelegramMessage("<b>Konten</b>\n\n(konten kosong)", { token, chatId });
    return;
  }

  const parts = partsPlain.map((p) => escapeHtml(p));
  const total = parts.length;
  for (let i = 0; i < total; i++) {
    await sendTelegramMessage((total > 1 ? `<b>Konten (${i + 1}/${total})</b>\n\n` : "<b>Konten</b>\n\n") + parts[i], {
      token,
      chatId,
    });
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const incoming = request.headers.get("x-telegram-bot-api-secret-token");
      if (incoming !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const settings = (await prisma.setting.findUnique({ where: { id: "default" } })) as any;
    const token = settings?.notificationTelegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Telegram token not configured" }, { status: 500 });
    }

    const update = await request.json();
    const callbackQuery = update?.callback_query;
    const messageUpdate = update?.message;

    if (callbackQuery?.data) {
      const data = String(callbackQuery.data || "");
      const callbackId = String(callbackQuery.id || "");
      const msg = callbackQuery.message;
      const chatId = String(msg?.chat?.id ?? callbackQuery?.from?.id ?? "");

      const actor = await loadActorByChatId(chatId);
      if (!canModerate(actor)) {
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Akses ditolak.",
            show_alert: true,
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("content:") || data.startsWith("show:")) {
        const postId = data.includes(":") ? data.slice(data.indexOf(":") + 1).trim() : "";
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Mengirim konten...",
          });
        }
        if (msg?.message_id) {
          await callTelegramApi(token, "editMessageReplyMarkup", {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: { inline_keyboard: [] },
          });
        }
        await sendPostPacketToChat(token, chatId, postId);

        const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
        const editUrl = `${siteUrl}/admin/posts/${postId}/edit`;
        await sendTelegramMessage("⬇️ <b>Aksi Editor</b>", {
          token,
          chatId,
          replyMarkup: buildFullActionsKeyboard(postId, editUrl),
        });
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("askrej:")) {
        const postId = data.slice("askrej:".length).trim();
        await sendForceReply(
          token,
          chatId,
          `❌ <b>Reject / Minta Revisi</b>\n\nBalas pesan ini dengan alasan revisi.\n\n<code>#ACTION:reject|${escapeHtml(postId)}</code>`,
          "Tulis alasan revisi...",
        );
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Silakan ketik alasan revisi.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("askcat:")) {
        const postId = data.slice("askcat:".length).trim();
        await sendForceReply(
          token,
          chatId,
          `🏷️ <b>Ubah Kategori</b>\n\nBalas pesan ini dengan <b>slug</b> kategori.\nContoh: <code>politik</code>\n\n<code>#ACTION:setcategory|${escapeHtml(postId)}</code>`,
          "Isi slug kategori...",
        );
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Silakan isi slug kategori.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("newcat:")) {
        const postId = data.slice("newcat:".length).trim();
        await sendForceReply(
          token,
          chatId,
          `➕ <b>Tambah Kategori Baru</b>\n\nBalas pesan ini dengan <b>nama kategori</b>.\nContoh: <code>Ekonomi Bisnis</code>\n\n<code>#ACTION:newcategory|${escapeHtml(postId)}</code>`,
          "Isi nama kategori...",
        );
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Silakan isi nama kategori baru.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("asktags:")) {
        const postId = data.slice("asktags:".length).trim();
        await sendForceReply(
          token,
          chatId,
          `🏷️ <b>Tambah Tag</b>\n\nBalas pesan ini dengan daftar tag.\nPisahkan dengan koma.\nContoh: <code>kaltim, dprd, angket</code>\n\n<code>#ACTION:addtags|${escapeHtml(postId)}</code>`,
          "Isi tag (pisahkan dengan koma)...",
        );
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Silakan isi tag.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("askcap:")) {
        const postId = data.slice("askcap:".length).trim();
        await sendForceReply(
          token,
          chatId,
          `🖼️ <b>Ubah Caption Foto</b>\n\nBalas pesan ini dengan caption baru.\n\n<code>#ACTION:setcaption|${escapeHtml(postId)}</code>`,
          "Isi caption foto...",
        );
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Silakan isi caption.",
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("pub:")) {
        const postId = data.slice("pub:".length).trim();
        const result = await publishPostById(postId, actor);
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: result.message,
          });
        }
        if (msg?.message_id) {
          await callTelegramApi(token, "editMessageReplyMarkup", {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: { inline_keyboard: [] },
          });
        }
        if (chatId) {
          await sendTelegramMessage(`✅ ${result.message} (oleh ${actor?.name || "Editor"})`, { token, chatId });
        }
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("rej:")) {
        const postId = data.slice("rej:".length).trim();
        if (callbackId) {
          await callTelegramApi(token, "answerCallbackQuery", {
            callback_query_id: callbackId,
            text: "Ketik alasan revisi via chat.",
          });
        }
        if (chatId) {
          await sendTelegramMessage(
            `❌ Untuk minta revisi, ketik:\n<code>/reject ${postId} alasan revisi...</code>`,
            { token, chatId },
          );
        }
        return NextResponse.json({ ok: true });
      }

      if (callbackId) {
        await callTelegramApi(token, "answerCallbackQuery", {
          callback_query_id: callbackId,
          text: "Aksi tidak dikenal.",
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (messageUpdate?.text) {
      const chatId = String(messageUpdate?.chat?.id ?? "");
      const text = String(messageUpdate.text || "").trim();
      const actor = await loadActorByChatId(chatId);
      if (!canModerate(actor)) {
        await sendTelegramMessage("Akses ditolak.", { token, chatId });
        return NextResponse.json({ ok: true });
      }

      const replyText = String(messageUpdate?.reply_to_message?.text || "").trim();
      const tokenMatch = replyText.match(/#ACTION:([a-z_]+)\|([A-Za-z0-9_-]+)/i);
      if (tokenMatch) {
        const action = String(tokenMatch[1] || "").toLowerCase();
        const postId = String(tokenMatch[2] || "").trim();

        if (action === "reject") {
          const result = await rejectPostById(postId, text, actor);
          await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
          return NextResponse.json({ ok: true });
        }

        if (action === "setcategory") {
          const result = await updateCategoryBySlug(postId, text);
          await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
          return NextResponse.json({ ok: true });
        }

        if (action === "newcategory") {
          const created = await createCategoryIfMissing(text);
          if (!created.ok) {
            await sendTelegramMessage(`❌ ${created.message}`, { token, chatId });
            return NextResponse.json({ ok: true });
          }
          const category: any = (created as any).category;
          const result = await updateCategoryBySlug(postId, String(category?.slug || "").trim());
          await sendTelegramMessage(
            result.ok
              ? `✅ Kategori dibuat: ${escapeHtml(String(category?.name || ""))} (${escapeHtml(String(category?.slug || ""))})\n✅ ${result.message}`
              : `❌ ${result.message}`,
            { token, chatId },
          );
          return NextResponse.json({ ok: true });
        }

        if (action === "addtags") {
          const result = await addTags(postId, text);
          await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
          return NextResponse.json({ ok: true });
        }

        if (action === "setcaption") {
          const result = await setImageCaption(postId, text);
          await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
          return NextResponse.json({ ok: true });
        }

        await sendTelegramMessage("Aksi tidak dikenal.", { token, chatId });
        return NextResponse.json({ ok: true });
      }

      const [cmdRaw, ...rest] = text.split(/\s+/);
      const cmd = String(cmdRaw || "").toLowerCase();

      if (cmd === "/help" || cmd === "/start") {
        await sendTelegramMessage(
          `🧰 <b>Perintah Editor</b>\n\n` +
            `<code>/show POST_ID</code>\n` +
            `<code>/pending</code>\n` +
            `<code>/publish POST_ID</code>\n` +
            `<code>/reject POST_ID alasan...</code>\n` +
            `<code>/setcategory POST_ID kategori-slug</code>\n` +
            `<code>/addtags POST_ID tag1, tag2</code>\n` +
            `<code>/setcaption POST_ID caption...</code>`,
          { token, chatId },
        );
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/pending") {
        await sendPendingReviewList(token, chatId, actor);
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/publish") {
        const [postId] = rest;
        const result = await publishPostById(String(postId || "").trim(), actor);
        await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/reject") {
        const [postId, ...reasonParts] = rest;
        const reason = reasonParts.join(" ").trim();
        const result = await rejectPostById(String(postId || "").trim(), reason, actor);
        await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/setcategory") {
        const [postId, slug] = rest;
        const result = await updateCategoryBySlug(String(postId || "").trim(), String(slug || "").trim());
        await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/addtags") {
        const [postId, ...tagsParts] = rest;
        const tagsText = tagsParts.join(" ").trim();
        const result = await addTags(String(postId || "").trim(), tagsText);
        await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/setcaption") {
        const [postId, ...captionParts] = rest;
        const caption = captionParts.join(" ").trim();
        const result = await setImageCaption(String(postId || "").trim(), caption);
        await sendTelegramMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, { token, chatId });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/show") {
        const [postId] = rest;
        if (!postId) {
          await sendTelegramMessage("Gunakan: /show POST_ID", { token, chatId });
          return NextResponse.json({ ok: true });
        }
        await sendPostPacketToChat(token, chatId, String(postId).trim());
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage("Perintah tidak dikenal. Ketik /help", { token, chatId });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
