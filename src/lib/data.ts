import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Cached Categories (Global)
export const getCachedCategories = cache(async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
    }
  });
});

// We can also add getCachedSettings here later if we want to consolidate.
