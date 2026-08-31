import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { getSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/data";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { sanitizePageContent } from "@/lib/sanitizer";
import { getPageSidebarData } from "@/lib/page-sidebar-data";

async function getHeaderFooterBlocks(activeTheme: string) {
  const [headerRows, footerRows] = await Promise.all([
    prisma.homepageBlock.findMany({
      where: { location: "header", isActive: true, themeId: activeTheme as any },
      orderBy: { order: "asc" },
    }),
    prisma.homepageBlock.findMany({
      where: { location: "footer", themeId: activeTheme as any },
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    headerConfig: headerRows ?? null,
    footerConfig: footerRows ?? null,
  };
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [setting, categories, menusByLocation] = await Promise.all([
      getSettings(),
      getCachedCategories(),
      getPublicMenusByLocation(),
    ]);

    const activeTheme = (setting as any)?.activeTheme || "classic";
    const [{ headerConfig, footerConfig }, { sidebarWidgets, blockData }] = await Promise.all([
      getHeaderFooterBlocks(activeTheme),
      getPageSidebarData(activeTheme),
    ]);

    const page = {
      id: typeof body?.pageId === "string" ? body.pageId : "",
      title: typeof body?.title === "string" ? body.title : "",
      slug: typeof body?.slug === "string" ? body.slug : "",
      content: sanitizePageContent(typeof body?.content === "string" ? body.content : ""),
      published: body?.published === true,
      metaTitle: typeof body?.metaTitle === "string" ? body.metaTitle : "",
      metaDesc: typeof body?.metaDesc === "string" ? body.metaDesc : "",
      featuredImage: typeof body?.featuredImage === "string" ? body.featuredImage : null,
      template: typeof body?.template === "string" && body.template.trim() !== "" ? body.template : "default",
    };

    return NextResponse.json({
      page,
      setting,
      categories,
      menusByLocation,
      headerConfig,
      footerConfig,
      activeTheme,
      sidebarWidgets,
      blockData,
    });
  } catch (error) {
    console.error("POST /api/pages/preview error:", error);
    return NextResponse.json({ error: "Gagal memuat pratinjau halaman" }, { status: 500 });
  }
}
