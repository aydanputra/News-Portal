import type { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound, permanentRedirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { getThemePageComponent } from "@/lib/theme-registry.server";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getCachedCategories } from "@/lib/data";
import { getPageSidebarData } from "@/lib/page-sidebar-data";
import TrackPublicPageView from "@/components/TrackPublicPageView";
import { buildCanonicalPath, buildPublicPageMetadata } from "@/lib/public-metadata";
import { normalizeRedirectPath } from "@/lib/redirects";

export const revalidate = 60;

const getPageBySlug = cache(async (slug: string) => {
  const cached = unstable_cache(
    async () => {
      return await prisma.page.findUnique({
        where: { slug, published: true },
      });
    },
    [`page:${slug}`],
    { tags: ["pages"], revalidate },
  );
  return cached();
});

const getCategoryBySlug = cache(async (slug: string) => {
  const cached = unstable_cache(
    async () => {
      return await prisma.category.findUnique({ where: { slug }, select: { id: true, slug: true } });
    },
    [`category:${slug}`],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
});

const getRedirectByPath = cache(async (path: string) => {
  const normalizedPath = normalizeRedirectPath(path);
  const cached = unstable_cache(
    async () => {
      return await prisma.redirectRule.findUnique({
        where: { oldPath: normalizedPath },
        select: {
          newPath: true,
          statusCode: true,
          isActive: true,
        },
      });
    },
    [`redirect:${normalizedPath}`],
    { tags: ["redirects"], revalidate: 300 },
  );
  return cached();
});

const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
  const cached = unstable_cache(
    async () => {
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
      return { headerConfig: headerRows ?? null, footerConfig: footerRows ?? null };
    },
    [`header-footer:${activeTheme}`],
    { tags: ["homepage"], revalidate: 300 },
  );
  return cached();
});

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const [page, parentMetadata] = await Promise.all([getPageBySlug(slug), parent]);

  if (!page) {
    const [redirectRule, category] = await Promise.all([
      getRedirectByPath(`/${slug}`),
      getCategoryBySlug(slug),
    ]);

    if (redirectRule?.isActive && redirectRule.newPath) {
      permanentRedirect(redirectRule.newPath);
    }

    if (category) {
      permanentRedirect(`/kategori/${category.slug}`);
    }

    return {
      title: "Halaman Tidak Ditemukan",
    };
  }

  const descriptionSource = typeof page.content === "string" ? page.content.replace(/<[^>]+>/g, " ") : "";
  const description =
    descriptionSource.replace(/\s+/g, " ").trim().slice(0, 160) || `Halaman ${page.title} di portal ini.`;

  return buildPublicPageMetadata({
    title: page.title,
    description,
    canonicalPath: buildCanonicalPath(`/${page.slug}`),
    parentMetadataBase: parentMetadata.metadataBase,
  });
}

export default async function CustomPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);

  const page = await getPageBySlug(slug);

  if (page) {
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
    const PageComponent: any = await getThemePageComponent(activeTheme);
    return (
      <>
        <TrackPublicPageView
          pageKey={`page:${page.slug}`}
          path={`/${page.slug}`}
          title={page.title}
          pageType="page"
        />
        <PageComponent
          page={page}
          setting={setting}
          categories={categories}
          menusByLocation={menusByLocation}
          headerConfig={headerConfig}
          footerConfig={footerConfig}
          sidebarWidgets={sidebarWidgets}
          blockData={blockData}
        />
      </>
    );
  }

  const redirectRule = await getRedirectByPath(`/${slug}`);
  if (redirectRule?.isActive && redirectRule.newPath) {
    permanentRedirect(redirectRule.newPath);
  }

  const category = await getCategoryBySlug(slug);
  if (category) {
    permanentRedirect(`/kategori/${category.slug}`);
  }

  notFound();
}
