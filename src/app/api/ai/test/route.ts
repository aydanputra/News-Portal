import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function deriveKey(masterKey: string) {
  return crypto.scryptSync(masterKey, "news-portal-ai-openai", 32);
}

function decryptSecret(ciphertextB64: string, masterKey: string) {
  const key = deriveKey(masterKey);
  const raw = Buffer.from(ciphertextB64, "base64");
  if (raw.length < 12 + 16 + 1) return null;
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return plaintext.trim() ? plaintext.trim() : null;
}

async function sendTelegramMessageWithResult(params: { token: string; chatId: string; message: string }) {
  const url = `https://api.telegram.org/bot${params.token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.message,
      parse_mode: "HTML",
    }),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = String((body as any)?.mode || "ai").toLowerCase();
    const period = String((body as any)?.period || "daily").toLowerCase();

    if (mode === "report") {
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
      const { POST: runReport } = await import("@/app/api/cron/reports/performance-ai/route");
      const internalReq = new Request(`http://internal/api/cron/reports/performance-ai?dryRun=1&period=${encodeURIComponent(period)}`, {
        method: "POST",
        headers: { authorization: `Bearer ${cronSecret}` },
      });
      const res = await runReport(internalReq);
      const json = await res.json().catch(() => null);
      const status = (res as any)?.status || 200;
      return NextResponse.json(json ?? { error: "Failed to read response" }, { status });
    }

    const settings = (await prisma.setting.findUnique({ where: { id: "default" } })) as any;
    const events = { ...(settings?.notificationEvents || {}) } as any;

    if (mode === "telegram_personal" || mode === "telegram_group") {
      const token = settings?.notificationTelegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      const groupChatId = settings?.notificationTelegramChatId || process.env.TELEGRAM_CHAT_ID;

      if (!token) {
        return NextResponse.json({ error: "Telegram bot token belum diatur" }, { status: 400 });
      }

      let chatId: string | null = null;
      if (mode === "telegram_group") {
        if (!groupChatId) {
          return NextResponse.json({ error: "Telegram Chat ID (Grup) belum diatur" }, { status: 400 });
        }
        chatId = String(groupChatId);
      } else {
        const dbUser = await (prisma.user as any).findUnique({
          where: { id: (user as any).id },
          select: { telegramChatId: true, name: true, email: true },
        });
        if (!dbUser?.telegramChatId) {
          return NextResponse.json(
            { error: "Telegram Chat ID pribadi belum diisi di Profil. Isi dulu Telegram Chat ID Anda." },
            { status: 400 },
          );
        }
        chatId = String(dbUser.telegramChatId);
      }

      const now = new Date();
      const aiEnabled = Boolean(events.performanceReportAiEnabled);
      const model = String(events.performanceReportAiModel || process.env.OPENAI_MODEL || "gpt-4o-mini");
      const msg =
        `<b>✅ Test Notifikasi Telegram</b>\n` +
        `Target: <b>${mode === "telegram_group" ? "Grup" : "Pribadi"}</b>\n` +
        `Waktu: ${now.toISOString()}\n` +
        `AI: ${aiEnabled ? "ON" : "OFF"}\n` +
        `Model: ${model}`;

      const result = await sendTelegramMessageWithResult({ token, chatId, message: msg });
      if (!result.ok) {
        return NextResponse.json(
          {
            error: "Gagal mengirim pesan Telegram",
            target: mode === "telegram_group" ? "group" : "personal",
            chatId,
            details: result.json,
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        target: mode === "telegram_group" ? "group" : "personal",
        chatId,
      });
    }

    let keySource: "db" | "env" | "none" | "db_invalid" = "none";
    let apiKey: string | null = null;
    const enc = typeof settings?.aiOpenAiApiKeyEnc === "string" ? settings.aiOpenAiApiKeyEnc : "";
    const master = typeof process.env.MASTER_KEY === "string" ? process.env.MASTER_KEY : "";
    if (enc && master) {
      try {
        apiKey = decryptSecret(enc, master);
        keySource = apiKey ? "db" : "db_invalid";
      } catch {
        apiKey = null;
        keySource = "db_invalid";
      }
    }
    if (!apiKey && typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim() !== "") {
      apiKey = process.env.OPENAI_API_KEY.trim();
      keySource = "env";
    }
    if (!apiKey) return NextResponse.json({ error: "API key not configured", keySource }, { status: 400 });

    const model = String(events.performanceReportAiModel || process.env.OPENAI_MODEL || "gpt-4o-mini");
    const payload = {
      model,
      temperature: 0,
      messages: [
        { role: "system", content: "Balas singkat dan jelas." },
        { role: "user", content: `Tes koneksi AI. Balas persis: OK` },
      ],
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: "AI request failed", keySource, model, details: json }, { status: 400 });
    }
    const content = String(json?.choices?.[0]?.message?.content || "").trim();
    return NextResponse.json({ success: true, keySource, model, content });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Test failed" }, { status: 500 });
  }
}
