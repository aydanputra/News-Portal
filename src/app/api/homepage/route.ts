import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { BuilderLocationSchema, HomepageBlocksInputSchema, HomepageBlockConfigSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/audit";
import { normalizeHomepageBlocks } from "@/lib/homepage-block-migrations";
import { assertRateLimit } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";
import { getThemeBlocks, resolveBlockTypeAlias } from "@/lib/block-registry";
import { getThemeArchiveWidgetGroups } from "@/lib/archive-builder-theme-registry";
import { getThemePostWidgetGroups } from "@/lib/post-builder-theme-registry";
import { getThemeFooterWidgetTypes, getThemeHeaderWidgetTypes } from "@/lib/header-footer-builder-theme-registry";

function getAllowedBlockTypes(location: "home" | "post" | "archive" | "header" | "footer", themeId: string) {
  const allowedTypes = new Set<string>(["section"]);

  if (location === "home") {
    for (const block of getThemeBlocks(themeId)) {
      if (block.id) allowedTypes.add(block.id);
    }
    return allowedTypes;
  }

  if (location === "archive") {
    const groups = getThemeArchiveWidgetGroups(themeId);
    for (const widget of [...groups.main, ...groups.support]) {
      if (widget.type) allowedTypes.add(widget.type);
    }
    return allowedTypes;
  }

  if (location === "post") {
    const groups = getThemePostWidgetGroups(themeId);
    for (const widget of [...groups.main, ...groups.support]) {
      if (widget.type) allowedTypes.add(widget.type);
    }
    return allowedTypes;
  }

  if (location === "header") {
    for (const type of getThemeHeaderWidgetTypes(themeId)) {
      allowedTypes.add(type);
    }
    return allowedTypes;
  }

  for (const type of getThemeFooterWidgetTypes(themeId)) {
    allowedTypes.add(type);
  }
  return allowedTypes;
}

function findUnsupportedBlockType(
  blocks: Array<Record<string, unknown>>,
  location: "home" | "post" | "archive" | "header" | "footer",
  themeId: string,
): string | null {
  const allowedTypes = getAllowedBlockTypes(location, themeId);

  const visit = (items: Array<Record<string, unknown>>): string | null => {
    for (const item of items) {
      const blockType = typeof item.type === "string" ? item.type : "";
      const effectiveBlockType = blockType ? resolveBlockTypeAlias(blockType) : blockType;
      if (!effectiveBlockType || !allowedTypes.has(effectiveBlockType)) {
        return blockType || "(empty)";
      }

      const config = item.config;
      const children =
        config && typeof config === "object" && !Array.isArray(config)
          ? (config as Record<string, unknown>).children
          : undefined;
      if (Array.isArray(children)) {
        const unsupportedChild = visit(children.filter((child): child is Record<string, unknown> => Boolean(child && typeof child === "object" && !Array.isArray(child))));
        if (unsupportedChild) return unsupportedChild;
      }
    }
    return null;
  };

  return visit(blocks);
}

// GET: Ambil konfigurasi blok
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLocation = searchParams.get("location") || "home";
    const rawThemeId = searchParams.get("themeId") || "classic";
    const parsedLocation = BuilderLocationSchema.safeParse(rawLocation);
    const location = parsedLocation.success ? parsedLocation.data : "home";
    const themeId = typeof rawThemeId === "string" ? rawThemeId.trim().slice(0, 80) : "classic";

    const blocks = await prisma.homepageBlock.findMany({
      where: {
        location,
        themeId,
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(normalizeHomepageBlocks(blocks));
  } catch (error) {
    console.error("GET /api/homepage error:", error);
    return NextResponse.json({ error: "Gagal mengambil konfigurasi" }, { status: 500 });
  }
}

// PUT: Update konfigurasi (Full Sync: Hapus semua lalu buat ulang berdasarkan lokasi & tema)
export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, "builder:homepage:write", { windowMs: 60_000, max: 20 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const { searchParams } = new URL(request.url);
    const queryLocation = searchParams.get("location");
    const queryThemeId = searchParams.get("themeId"); // Ambil themeId dari query params

    const body = await request.json();
    const rawStringified = (() => {
      try {
        return JSON.stringify(body);
      } catch {
        return "";
      }
    })();
    if (rawStringified && rawStringified.length > 1_000_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const { blocks: rawBlocks, location: bodyLocation, themeId: bodyThemeId, themeConfig } = body || {};
    const locationParsed = BuilderLocationSchema.safeParse(bodyLocation || queryLocation || "home");
    if (!locationParsed.success) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }
    const location = locationParsed.data;
    const themeIdRaw = typeof (bodyThemeId || queryThemeId) === "string" ? String(bodyThemeId || queryThemeId) : "classic";
    const themeId = themeIdRaw.trim().slice(0, 80) || "classic";

    const parsedBlocks = HomepageBlocksInputSchema.safeParse(rawBlocks);
    if (!parsedBlocks.success) {
      return NextResponse.json({ error: "Invalid blocks payload" }, { status: 400 });
    }

    const normalizedBlocks = normalizeHomepageBlocks(parsedBlocks.data).map((block, index) => {
      const configValue = (block as any)?.config ?? {};
      const config = configValue && typeof configValue === "object" && !Array.isArray(configValue) ? configValue : {};
      const parsedConfig = HomepageBlockConfigSchema.parse(config);
      return {
        id: block.id,
        type: block.type,
        title: typeof block.title === "string" ? block.title : block.title === null ? null : undefined,
        order: index + 1,
        isActive: (block as any).isActive ?? (block as any).isVisible ?? true,
        placement: typeof (block as any).placement === "string" && (block as any).placement.trim() !== "" ? (block as any).placement.trim() : "main",
        config: parsedConfig,
      };
    });

    const unsupportedBlockType = findUnsupportedBlockType(
      normalizedBlocks as Array<Record<string, unknown>>,
      location,
      themeId,
    );
    if (unsupportedBlockType) {
      return NextResponse.json(
        { error: `Block type "${unsupportedBlockType}" tidak terdaftar untuk tema "${themeId}" pada lokasi "${location}"` },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.homepageBlock.findMany({
        where: { location, themeId },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((b) => b.id));
      const incomingIds = new Set(normalizedBlocks.map((b) => b.id));

      for (const block of normalizedBlocks) {
        if (existingIds.has(block.id)) {
          await tx.homepageBlock.update({
            where: { id: block.id },
            data: {
              type: block.type,
              title: block.title ?? null,
              order: block.order,
              isActive: Boolean(block.isActive),
              config: (block.config || {}) as any,
              placement: block.placement || "main",
              location,
              themeId,
            },
          });
        } else {
          await tx.homepageBlock.create({
            data: {
              id: block.id,
              type: block.type,
              title: block.title ?? null,
              order: block.order,
              isActive: Boolean(block.isActive),
              config: (block.config || {}) as any,
              placement: block.placement || "main",
              location,
              themeId,
            },
          });
        }
      }

      if (incomingIds.size === 0) {
        await tx.homepageBlock.deleteMany({ where: { location, themeId } });
      } else {
        await tx.homepageBlock.deleteMany({
          where: {
            location,
            themeId,
            id: { notIn: Array.from(incomingIds) },
          },
        });
      }

      if (themeConfig && typeof themeConfig === "object" && !Array.isArray(themeConfig) && themeId) {
        const existingThemeConfig = await (tx as any).themeConfig.findUnique({
          where: { themeId },
          select: { config: true },
        });
        const existingConfig =
          existingThemeConfig?.config &&
          typeof existingThemeConfig.config === "object" &&
          !Array.isArray(existingThemeConfig.config)
            ? (existingThemeConfig.config as Record<string, unknown>)
            : {};
        const mergedThemeConfig = {
          ...existingConfig,
          ...(themeConfig as Record<string, unknown>),
        };

        await (tx as any).themeConfig.upsert({
          where: { themeId },
          update: { config: mergedThemeConfig as object },
          create: { themeId, config: mergedThemeConfig as object },
        });
      }
    });

    await logActivity(admin.id, "UPDATE", "Homepage", location, { themeId }, request);

    revalidateTag("homepage");
    revalidateTag("settings");
    revalidateTag("posts");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal update homepage:", error);
    return NextResponse.json({ error: "Gagal update konfigurasi" }, { status: 500 });
  }
}
