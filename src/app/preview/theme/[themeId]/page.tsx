import { prisma } from "@/lib/prisma";
import { getThemeComponent } from "@/lib/theme-registry.server";
import { getSettings, mergeThemeConfigWithSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/data";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { toPublicPostPreviewList } from "@/lib/post-preview";
import { getResolvedThemeId } from "@/lib/theme-registry";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getPreviewPosts = unstable_cache(
  async () => {
    const now = new Date();
    const rows = await prisma.post.findMany({
      where: {
        published: true,
        status: { not: "ARCHIVED" },
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        image: true,
        publishedAt: true,
        type: true,
        videoUrl: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { name: true, slug: true },
        },
        author: { select: { name: true, avatar: true, banner: true } },
        featuredImage: {
          select: {
            id: true,
            fileUrl: true,
            width: true,
            height: true,
          },
        },
        views: true,
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 8,
    });

    return toPublicPostPreviewList(rows as any[]);
  },
  ["theme-preview-posts"],
  { tags: ["homepage", "posts"], revalidate: 300 },
);

const getHeaderFooterBlocks = unstable_cache(
  async (activeTheme: string) => {
    const publicBlockSelect = {
      id: true,
      type: true,
      title: true,
      order: true,
      config: true,
      isActive: true,
    } as const;

    const [headerRows, footerRows] = await Promise.all([
      prisma.homepageBlock.findMany({
        where: { location: "header", isActive: true, themeId: activeTheme as any },
        orderBy: { order: "asc" },
        select: publicBlockSelect,
      }),
      prisma.homepageBlock.findMany({
        where: { location: "footer", themeId: activeTheme as any },
        orderBy: { order: "asc" },
        select: publicBlockSelect,
      }),
    ]);

    return {
      headerConfig: headerRows ?? null,
      footerConfig: footerRows ?? null,
    };
  },
  ["theme-preview-header-footer"],
  { tags: ["homepage"], revalidate: 300 },
);

async function getThemePreviewData(themeId: string) {
  const resolvedThemeId = getResolvedThemeId(themeId);
  const [baseSetting, categories, menusByLocation, sourceBlocksByLocation, previewPosts, headerFooter] = await Promise.all([
    getSettings(),
    getCachedCategories(),
    getPublicMenusByLocation(),
    getBuilderSourceBlocks(resolvedThemeId as any),
    getPreviewPosts(),
    getHeaderFooterBlocks(resolvedThemeId),
  ]);

  let setting: any = baseSetting;
  const themeConfig = await (prisma as any).themeConfig.findUnique({
    where: { themeId: resolvedThemeId },
  });

  if (themeConfig?.config) {
    setting = mergeThemeConfigWithSettings(baseSetting, themeConfig.config);
  }

  const blocks = sourceBlocksByLocation.home || [];

  return {
    setting: {
      ...setting,
      activeTheme: resolvedThemeId,
    },
    categories,
    posts: previewPosts,
    blocks,
    blockData: {},
    sourceBlocksByLocation,
    menusByLocation,
    headerConfig: headerFooter.headerConfig,
    footerConfig: headerFooter.footerConfig,
  };
}

export default async function ThemeHomepagePreviewPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const resolvedThemeId = getResolvedThemeId(themeId);
  const ThemeComponent = await getThemeComponent(resolvedThemeId);
  const data = await getThemePreviewData(resolvedThemeId);

  return (
    <div className="min-h-screen bg-white">
      <ThemeComponent data={data} />
    </div>
  );
}
