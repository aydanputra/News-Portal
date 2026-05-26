import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

function stripTrailingSlash(url: string) {
  return String(url || "").replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

  const [categories, tags, pages, posts] = await Promise.all([
    prisma.category.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.tag.findMany({
      select: { slug: true, createdAt: true },
    }),
    prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
  ]);

  const items: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  for (const c of categories) {
    if (!c.slug) continue;
    items.push({
      url: `${siteUrl}/kategori/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const t of tags) {
    if (!t.slug) continue;
    items.push({
      url: `${siteUrl}/tag/${t.slug}`,
      lastModified: t.createdAt,
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  for (const p of pages) {
    if (!p.slug) continue;
    items.push({
      url: `${siteUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const post of posts) {
    const catSlug = post.category?.slug;
    if (!catSlug || !post.slug) continue;
    items.push({
      url: `${siteUrl}/${catSlug}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return items;
}
