import { NextResponse } from "next/server";
import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
import { normalizeAutoShareSettings } from "@/lib/auto-share";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { encryptSecret } from "@/lib/secret-crypto";

export const dynamic = "force-dynamic";

const AUTO_SHARE_SECRET_NAMESPACE = "news-portal-auto-share";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "auto_share"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settingsRecord: any = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { autoShareSettings: true } as any,
  });

  const normalized = normalizeAutoShareSettings(settingsRecord?.autoShareSettings);
  const safeSettings = {
    ...normalized,
    facebookPageAccessToken: "",
    telegramBotToken: "",
    facebookPageAccessTokenConfigured:
      typeof settingsRecord?.autoShareSettings?.facebookPageAccessTokenEnc === "string" &&
      settingsRecord.autoShareSettings.facebookPageAccessTokenEnc.trim() !== "",
    telegramBotTokenConfigured:
      typeof settingsRecord?.autoShareSettings?.telegramBotTokenEnc === "string" &&
      settingsRecord.autoShareSettings.telegramBotTokenEnc.trim() !== "",
  };

  return NextResponse.json({
    settings: safeSettings,
  });
}

export async function PUT(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "auto_share"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = assertRateLimit(request, "auto-share:write", { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const incoming = normalizeAutoShareSettings(body?.settings);
  const existing: any = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { autoShareSettings: true } as any,
  });

  const masterKey = process.env.MASTER_KEY;
  const existingRaw = existing?.autoShareSettings && typeof existing.autoShareSettings === "object"
    ? { ...(existing.autoShareSettings as Record<string, unknown>) }
    : {};

  const settings: Record<string, unknown> = {
    ...existingRaw,
    ...incoming,
  };

  if (incoming.facebookPageAccessToken.trim() !== "") {
    settings.facebookPageAccessTokenEnc =
      masterKey
        ? encryptSecret(incoming.facebookPageAccessToken.trim(), masterKey, AUTO_SHARE_SECRET_NAMESPACE)
        : incoming.facebookPageAccessToken.trim();
  }
  if (incoming.telegramBotToken.trim() !== "") {
    settings.telegramBotTokenEnc =
      masterKey
        ? encryptSecret(incoming.telegramBotToken.trim(), masterKey, AUTO_SHARE_SECRET_NAMESPACE)
        : incoming.telegramBotToken.trim();
  }

  settings.facebookPageAccessTokenConfigured = Boolean(
    typeof settings.facebookPageAccessTokenEnc === "string" && settings.facebookPageAccessTokenEnc.trim() !== "",
  );
  settings.telegramBotTokenConfigured = Boolean(
    typeof settings.telegramBotTokenEnc === "string" && settings.telegramBotTokenEnc.trim() !== "",
  );
  settings.facebookPageAccessToken = "";
  settings.telegramBotToken = "";

  await prisma.setting.upsert({
    where: { id: "default" },
    update: { autoShareSettings: settings } as any,
    create: { id: "default", autoShareSettings: settings } as any,
  });

  return NextResponse.json({ ok: true, settings });
}
