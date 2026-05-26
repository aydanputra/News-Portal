import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { sendTelegramMessage } from "@/lib/external-notifications";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatInt(n: number) {
  try {
    return n.toLocaleString("id-ID");
  } catch {
    return String(n);
  }
}

function periodToDays(period: string) {
  if (period === "weekly") return 7;
  if (period === "monthly") return 30;
  return 1;
}

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
  return plaintext.trim() ? plaintext : null;
}

async function ensureTodaySnapshot(day: Date) {
  const publishedPosts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, published: true },
    select: { id: true, views: true, viewsBase: true },
  });

  const prismaAny = prisma as any;
  await prisma.$transaction([
    prismaAny.postMetricSnapshot.deleteMany({ where: { day } }),
    prismaAny.postMetricSnapshot.createMany({
      data: publishedPosts.map((p) => ({
        postId: p.id,
        day,
        views: typeof p.views === "number" && Number.isFinite(p.views) ? Math.max(0, Math.floor(p.views)) : 0,
        viewsBase:
          typeof p.viewsBase === "number" && Number.isFinite(p.viewsBase) ? Math.max(0, Math.floor(p.viewsBase)) : 0,
      })),
    }),
  ]);

  return publishedPosts.length;
}

async function generateAiInsight({
  periodLabel,
  topPosts,
  topCategories,
  viralPosts,
  model,
  temperature,
  maxChars,
  instruction,
  apiKey,
}: {
  periodLabel: string;
  topPosts: { title: string; category: string; delta: number }[];
  topCategories: { name: string; delta: number }[];
  viralPosts: { title: string; category: string; delta: number }[];
  model: string;
  temperature: number;
  maxChars: number;
  instruction: string;
  apiKey: string;
}) {
  const payload = {
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          `Kamu adalah analis performa portal berita. Beri evaluasi editorial yang praktis, ringkas, dan bisa dieksekusi. Jawab dalam Bahasa Indonesia.${
            instruction ? `\n\nInstruksi tambahan:\n${instruction}` : ""
          }`,
      },
      {
        role: "user",
        content: [
          `Periode: ${periodLabel}`,
          "",
          "Trending artikel (berdasarkan kenaikan views):",
          ...topPosts.map((p, i) => `${i + 1}. ${p.title} | ${p.category} | +${p.delta}`),
          "",
          "Trending kategori:",
          ...topCategories.map((c, i) => `${i + 1}. ${c.name} | +${c.delta}`),
          "",
          viralPosts.length > 0
            ? ["Artikel viral (melewati ambang):", ...viralPosts.map((p, i) => `${i + 1}. ${p.title} | ${p.category} | +${p.delta}`)].join(
                "\n",
              )
            : "Tidak ada artikel yang melewati ambang viral.",
          "",
          "Tolong buat:",
          "1) Ringkasan singkat (2-3 kalimat)",
          "2) 3-5 ide berita turunan dari artikel viral / top artikel (format bullet)",
          "3) 3 ide berita lain yang berpotensi viral besok berdasarkan pola kategori/topik (format bullet)",
          "4) 2 catatan editorial (judul, angle, SEO, distribusi) (format bullet)",
          "",
          `Batas: maksimal ${maxChars} karakter. Jangan pakai markdown; cukup teks biasa dengan bullet '- '.`,
        ].join("\n"),
      },
    ],
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as any;
    const text = String(json?.choices?.[0]?.message?.content || "").trim();
    return text ? text : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const dryRun = String(searchParams.get("dryRun") || "") === "1";

    const settings = (await prisma.setting.findUnique({ where: { id: "default" } })) as any;
    const events = {
      onPerformanceReport: false,
      performanceReportAiEnabled: false,
      performanceReportAiModel: "gpt-4o-mini",
      performanceReportAiTemperature: 0.3,
      performanceReportAiMaxChars: 1200,
      performanceReportAiInstruction: "",
      performanceReportViralThreshold: 2000,
      performanceReportTopPosts: 5,
      performanceReportTopCategories: 5,
      performanceReportPeriod: "daily",
      ...(settings?.notificationEvents || {}),
    } as any;

    if (!events.onPerformanceReport) {
      return NextResponse.json({ skipped: true, reason: "Performance report disabled" });
    }

    const period = String(periodParam || events.performanceReportPeriod || "daily").toLowerCase();

    const token = settings?.notificationTelegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings?.notificationTelegramChatId || process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return NextResponse.json({ error: "Telegram group config missing" }, { status: 400 });
    }

    const now = new Date();
    const endDay = startOfDay(now);
    const lookbackDays = periodToDays(period);
    const startDay = startOfDay(new Date(endDay.getTime() - lookbackDays * 24 * 60 * 60 * 1000));

    const snapshotCount = await ensureTodaySnapshot(endDay);

    const prismaAny = prisma as any;
    const [startSnaps, endSnaps] = await Promise.all([
      prismaAny.postMetricSnapshot.findMany({
        where: { day: startDay },
        select: { postId: true, views: true, viewsBase: true },
      }),
      prismaAny.postMetricSnapshot.findMany({
        where: { day: endDay },
        select: { postId: true, views: true, viewsBase: true },
      }),
    ]);

    const startMap = new Map<string, number>(
      startSnaps.map((s: any) => [String(s.postId), Math.max(0, (s.views || 0) + (s.viewsBase || 0))]),
    );
    const endMap = new Map<string, number>(
      endSnaps.map((s: any) => [String(s.postId), Math.max(0, (s.views || 0) + (s.viewsBase || 0))]),
    );

    const postIds = Array.from(endMap.keys());
    if (postIds.length === 0) {
      return NextResponse.json({ success: true, message: "No published posts to report", snapshotCount });
    }

    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { name: true, slug: true } },
      },
    });

    const perPost = posts
      .map((p) => {
        const endTotal = endMap.get(p.id) ?? 0;
        const startTotal = startMap.get(p.id) ?? 0;
        const delta = Math.max(0, endTotal - startTotal);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          categoryName: p.category?.name || "Tanpa Kategori",
          categorySlug: p.category?.slug || "",
          delta,
        };
      })
      .filter((p) => p.delta > 0);

    perPost.sort((a, b) => b.delta - a.delta);

    const topPostCount = clampInt(events.performanceReportTopPosts, 5, 1, 15);
    const topCatCount = clampInt(events.performanceReportTopCategories, 5, 1, 15);
    const viralThreshold = clampInt(events.performanceReportViralThreshold, 2000, 1, 1_000_000_000);

    const topPosts = perPost.slice(0, topPostCount);
    const viralPosts = perPost.filter((p) => p.delta >= viralThreshold).slice(0, 10);

    const catMap = new Map<string, number>();
    for (const p of perPost) {
      catMap.set(p.categoryName, (catMap.get(p.categoryName) || 0) + p.delta);
    }
    const topCategories = Array.from(catMap.entries())
      .map(([name, delta]) => ({ name, delta }))
      .sort((a, b) => b.delta - a.delta)
      .slice(0, topCatCount);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const periodLabel = period === "weekly" ? "Mingguan" : period === "monthly" ? "Bulanan" : "Harian";

    let message =
      `<b>📊 Laporan Performa ${escapeHtml(periodLabel)}</b>\n` +
      `Tanggal: ${escapeHtml(endDay.toISOString().slice(0, 10))}\n` +
      `Cakupan: ${escapeHtml(startDay.toISOString().slice(0, 10))} → ${escapeHtml(endDay.toISOString().slice(0, 10))}\n` +
      `Snapshot: ${formatInt(snapshotCount)} artikel\n\n`;

    if (viralPosts.length > 0) {
      message += `<b>🚀 Viral Alert (≥ ${formatInt(viralThreshold)})</b>\n`;
      for (const p of viralPosts) {
        const url = p.categorySlug ? `${siteUrl}/${p.categorySlug}/${p.slug}` : `${siteUrl}/${p.slug}`;
        message += `• <b>${escapeHtml(p.title)}</b> (+${formatInt(p.delta)})\n<a href="${escapeHtml(url)}">Buka artikel</a>\n`;
      }
      message += `\n`;
    }

    message += `<b>🔥 Trending Artikel</b>\n`;
    if (topPosts.length === 0) {
      message += `• Belum ada kenaikan views yang terukur untuk periode ini.\n\n`;
    } else {
      topPosts.forEach((p, idx) => {
        const url = p.categorySlug ? `${siteUrl}/${p.categorySlug}/${p.slug}` : `${siteUrl}/${p.slug}`;
        message += `${idx + 1}) <b>${escapeHtml(p.title)}</b> — ${escapeHtml(p.categoryName)} (+${formatInt(p.delta)})\n<a href="${escapeHtml(url)}">Buka artikel</a>\n`;
      });
      message += `\n`;
    }

    message += `<b>📌 Kategori Trending</b>\n`;
    if (topCategories.length === 0) {
      message += `• Belum ada data kategori untuk periode ini.\n`;
    } else {
      for (const c of topCategories) {
        message += `• ${escapeHtml(c.name)} (+${formatInt(c.delta)})\n`;
      }
    }

    let aiUsed = false;
    let aiKeySource: "db" | "env" | "none" | "db_invalid" = "none";
    if (events.performanceReportAiEnabled) {
      let aiApiKey: string | null = null;
      const enc = typeof settings?.aiOpenAiApiKeyEnc === "string" ? settings.aiOpenAiApiKeyEnc : "";
      const master = typeof process.env.MASTER_KEY === "string" ? process.env.MASTER_KEY : "";
      if (enc && master) {
        try {
          aiApiKey = decryptSecret(enc, master);
          aiKeySource = aiApiKey ? "db" : "db_invalid";
        } catch {
          aiApiKey = null;
          aiKeySource = "db_invalid";
        }
      }
      if (!aiApiKey && typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim() !== "") {
        aiApiKey = process.env.OPENAI_API_KEY.trim();
        aiKeySource = "env";
      }

      const aiModel = String(events.performanceReportAiModel || process.env.OPENAI_MODEL || "gpt-4o-mini");
      const aiTemperatureRaw =
        typeof events.performanceReportAiTemperature === "number"
          ? events.performanceReportAiTemperature
          : Number(events.performanceReportAiTemperature);
      const aiTemperature = Number.isFinite(aiTemperatureRaw) ? Math.min(1, Math.max(0, aiTemperatureRaw)) : 0.3;
      const aiMaxChars = clampInt(events.performanceReportAiMaxChars, 1200, 200, 3000);
      const aiInstruction = typeof events.performanceReportAiInstruction === "string" ? events.performanceReportAiInstruction.trim() : "";

      const ai = aiApiKey
        ? await generateAiInsight({
            periodLabel,
            topPosts: topPosts.map((p) => ({ title: p.title, category: p.categoryName, delta: p.delta })),
            topCategories,
            viralPosts: viralPosts.map((p) => ({ title: p.title, category: p.categoryName, delta: p.delta })),
            model: aiModel,
            temperature: aiTemperature,
            maxChars: aiMaxChars,
            instruction: aiInstruction,
            apiKey: aiApiKey,
          })
        : null;

      if (ai) {
        aiUsed = true;
        const cleaned = escapeHtml(ai).slice(0, aiMaxChars);
        message += `\n\n<b>🤖 Insight AI</b>\n${cleaned}`;
      }
    }

    if (message.length > 3800) {
      message = message.slice(0, 3800) + "\n\n(terpotong)";
    }

    if (!dryRun) {
      await sendTelegramMessage(message, { token, chatId });
    }

    return NextResponse.json({
      success: true,
      period,
      dryRun,
      startDay: startDay.toISOString(),
      endDay: endDay.toISOString(),
      ai: {
        enabled: Boolean(events.performanceReportAiEnabled),
        used: aiUsed,
        keySource: aiKeySource,
      },
      ...(dryRun ? { previewMessage: message } : {}),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Report failed" }, { status: 500 });
  }
}
