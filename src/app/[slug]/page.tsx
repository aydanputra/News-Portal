import { prisma } from "@/lib/prisma";
import ClassicPage from "@/themes/classic/templates/Page";
import PranalaPage from "@/themes/pranala/templates/Page";
import { notFound, permanentRedirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getCachedCategories } from "@/lib/data";

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

const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
  const cached = unstable_cache(
    async () => {
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
      return { headerConfig: headerRows ?? null, footerConfig: footerRows ?? null };
    },
    [`header-footer:${activeTheme}`],
    { tags: ["homepage"], revalidate: 300 },
  );
  return cached();
});

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
    if (activeTheme === "pranala") {
      const { headerConfig, footerConfig } = await getHeaderFooterBlocks(activeTheme);
      return <PranalaPage page={page} setting={setting} categories={categories} menusByLocation={menusByLocation} headerConfig={headerConfig} footerConfig={footerConfig} />;
    }
    const { footerConfig } = await getHeaderFooterBlocks(activeTheme);
    return <ClassicPage page={page} setting={setting} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />;
  }

  const category = await getCategoryBySlug(slug);
  if (category) {
    permanentRedirect(`/kategori/${category.slug}`);
  }

  notFound();
}
