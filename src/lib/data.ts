import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cached Categories (Global)
export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  },
  ["categories:top5"],
  { tags: ["categories"], revalidate: 3600 },
);

export function getCachedCategoriesList(take = 10) {
  const safeTake = Math.max(1, Math.min(50, Number.isFinite(take) ? Math.floor(take) : 10));
  const cached = unstable_cache(
    async () => {
      return await prisma.category.findMany({
        orderBy: { name: "asc" },
        take: safeTake,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    },
    [`categories:list:${safeTake}`],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
}

// We can also add getCachedSettings here later if we want to consolidate.
