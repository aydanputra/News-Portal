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

// We can also add getCachedSettings here later if we want to consolidate.
