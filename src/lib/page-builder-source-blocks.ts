import { prisma } from "@/lib/prisma";
import { SidebarSourceBlocksMap, SidebarSourceLocation } from "@/lib/sidebar-reference";
import { unstable_cache } from "next/cache";

export async function getBuilderSourceBlocks(activeTheme: string, locations?: SidebarSourceLocation[]) {
  const targetLocations = locations && locations.length > 0 ? locations : ["home", "post", "archive"];
  const key = [...targetLocations].sort().join(",");
  const cached = unstable_cache(
    async () => {
      const publicSourceBlockSelect = {
        id: true,
        type: true,
        title: true,
        order: true,
        config: true,
        isActive: true,
        location: true,
      } as const;
      return await prisma.homepageBlock.findMany({
        where: {
          isActive: true,
          location: { in: targetLocations },
          themeId: activeTheme,
        },
        orderBy: [{ location: "asc" }, { order: "asc" }],
        select: publicSourceBlockSelect,
      });
    },
    [`builder-source-blocks:${activeTheme}:${key}`],
    { tags: ["homepage"], revalidate: 300 },
  );
  const rows = await cached();

  const result: SidebarSourceBlocksMap = {
    home: [],
    post: [],
    archive: [],
  };

  for (const row of rows) {
    const location = row.location as SidebarSourceLocation;
    if (!result[location]) result[location] = [];
    result[location]!.push(row);
  }

  return result;
}
