import { prisma } from "@/lib/prisma";
import ClassicPage from "@/themes/classic/templates/Page";
import PranalaPage from "@/themes/pranala/templates/Page";
import { notFound } from "next/navigation";
import ClassicArchive from "@/themes/classic/templates/Archive";
import PranalaArchive from "@/themes/pranala/templates/Archive";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";

export const revalidate = 60;

export default async function CustomPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);

  const page = await prisma.page.findUnique({
    where: { slug, published: true },
  });

  if (page) {
    const [setting, categories, menusByLocation] = await Promise.all([
      prisma.setting.findUnique({ where: { id: "default" } }),
      prisma.category.findMany({ orderBy: { name: "asc" }, take: 5 }),
      getPublicMenusByLocation(),
    ]);
    const activeTheme = (setting as any)?.activeTheme || "classic";
    if (activeTheme === "pranala") {
      const headerRows = await prisma.homepageBlock.findMany({
        where: { location: "header", isActive: true, themeId: activeTheme as any },
        orderBy: { order: "asc" },
      });
      const headerConfig = headerRows ?? null;
      const footerRows = await prisma.homepageBlock.findMany({
        where: { location: "footer", themeId: activeTheme as any },
        orderBy: { order: "asc" },
      });
      const footerConfig = footerRows ?? null;
      return <PranalaPage page={page} setting={setting} categories={categories} menusByLocation={menusByLocation} headerConfig={headerConfig} footerConfig={footerConfig} />;
    }
    const footerRows = await prisma.homepageBlock.findMany({
      where: { location: "footer", themeId: activeTheme as any },
      orderBy: { order: "asc" },
    });
    const footerConfig = footerRows ?? null;
    return <ClassicPage page={page} setting={setting} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />;
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [setting, menusByLocation] = await Promise.all([getSettings(), getPublicMenusByLocation()]);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, take: 10 });

  const allCategories = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenMap = new Map<string, string[]>();
  allCategories.forEach((c: { id: string; parentId: string | null }) => {
    if (!c.parentId) return;
    const arr = childrenMap.get(c.parentId) || [];
    arr.push(c.id);
    childrenMap.set(c.parentId, arr);
  });

  const categoryIds: string[] = [];
  const stack = [category.id];
  while (stack.length > 0) {
    const id = stack.pop()!;
    categoryIds.push(id);
    const children = childrenMap.get(id) || [];
    for (const childId of children) stack.push(childId);
  }

  const now = new Date();
  const posts = await prisma.post.findMany({
    where: {
      AND: [
        {
          OR: [
            { categoryId: { in: categoryIds } },
            { postCategories: { some: { categoryId: { in: categoryIds } } } },
          ],
        },
        {
          published: true,
          status: { not: "ARCHIVED" },
          OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
        },
      ],
    },
    include: {
      category: true,
      author: { select: { name: true } },
      featuredImage: true,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  const activeTheme = (setting as any)?.activeTheme || "classic";
  const ArchiveComponent: any = activeTheme === "pranala" ? PranalaArchive : ClassicArchive;

  const headerRows = await prisma.homepageBlock.findMany({
    where: { location: "header", isActive: true, themeId: activeTheme as any },
    orderBy: { order: "asc" },
  });
  const headerConfig = headerRows ?? null;
  const footerRows = await prisma.homepageBlock.findMany({
    where: { location: "footer", themeId: activeTheme as any },
    orderBy: { order: "asc" },
  });
  const footerConfig = footerRows ?? null;

  return (
    <ArchiveComponent
      title={category.name}
      description={`Arsip berita kategori ${category.name}`}
      posts={posts}
      setting={setting}
      categories={categories}
      menusByLocation={menusByLocation}
      headerConfig={headerConfig}
      footerConfig={footerConfig}
    />
  );
}
