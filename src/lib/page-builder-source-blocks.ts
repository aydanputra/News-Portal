import { prisma } from "@/lib/prisma";
import { SidebarSourceBlocksMap, SidebarSourceLocation } from "@/lib/sidebar-reference";

export async function getBuilderSourceBlocks(activeTheme: string, locations?: SidebarSourceLocation[]) {
  const targetLocations = locations && locations.length > 0 ? locations : ["home", "post", "archive"];
  const rows = await prisma.homepageBlock.findMany({
    where: {
      isActive: true,
      location: { in: targetLocations },
      themeId: activeTheme,
    },
    orderBy: [{ location: "asc" }, { order: "asc" }],
  });

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
