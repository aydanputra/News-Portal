import { prisma } from "@/lib/prisma";

export type PublicMenuItem = {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: PublicMenuItem[];
};

export type MenuLocation = "PRIMARY" | "SECONDARY" | "FOOTER" | "MOBILE";

export type PublicMenusByLocation = Partial<Record<MenuLocation, PublicMenuItem[]>>;

const db = prisma as any;

const buildTree = (rows: Array<{ id: string; parentId: string | null; label: string; href: string; openInNewTab: boolean; order: number }>) => {
  const map = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const key = row.parentId ?? null;
    const arr = map.get(key) || [];
    arr.push(row);
    map.set(key, arr);
  }
  for (const [key, arr] of map) {
    arr.sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));
    map.set(key, arr);
  }

  const walk = (parentId: string | null, depth: number): PublicMenuItem[] => {
    if (depth >= 3) return [];
    const children = map.get(parentId) || [];
    return children.map((child) => ({
      id: child.id,
      label: child.label,
      href: child.href,
      openInNewTab: child.openInNewTab,
      children: walk(child.id, depth + 1),
    }));
  };

  return walk(null, 0);
};

type MenuItemRow = {
  id: string;
  parentId: string | null;
  label: string;
  href: string;
  openInNewTab: boolean;
  order: number;
};

type RawMenuItem = {
  id: string;
  parentId: string | null;
  type: "CUSTOM" | "CATEGORY" | "TAG" | "PAGE" | string;
  label: string;
  customUrl?: string | null;
  openInNewTab?: boolean | null;
  order?: number | null;
  category?: { slug?: string | null } | null;
  tag?: { slug?: string | null } | null;
  page?: { slug?: string | null; published?: boolean | null } | null;
};

const resolveHref = (item: RawMenuItem): string => {
  if (item.type === "CUSTOM") return item.customUrl || "#";
  if (item.type === "CATEGORY") return item.category?.slug ? `/category/${item.category.slug}` : "#";
  if (item.type === "TAG") return item.tag?.slug ? `/tag/${item.tag.slug}` : "#";
  if (item.type === "PAGE") return item.page?.slug ? `/${item.page.slug}` : "#";
  return "#";
};

export async function getPublicMenusByLocation(locations: MenuLocation[] = ["PRIMARY", "SECONDARY", "FOOTER", "MOBILE"]): Promise<PublicMenusByLocation> {
  try {
    if (!db?.menuLocationAssignment?.findMany || !db?.menu?.findMany) return {};

    const assignments = (await db.menuLocationAssignment.findMany({
      where: { location: { in: locations as any } },
      select: { location: true, menuId: true },
    })) as Array<{ location: MenuLocation; menuId: string }>;

    const menuIds = Array.from(new Set(assignments.map((a) => a.menuId)));
    if (menuIds.length === 0) return {};

    const menus = (await db.menu.findMany({
      where: { id: { in: menuIds } },
      include: {
        items: {
          include: {
            category: { select: { slug: true } },
            tag: { select: { slug: true } },
            page: { select: { slug: true, published: true } },
          },
        },
      },
    })) as Array<{ id: string; items: RawMenuItem[] }>;

    const menuMap = new Map<string, { id: string; items: RawMenuItem[] }>(menus.map((m) => [m.id, m]));
    const result: PublicMenusByLocation = {};

    for (const assignment of assignments) {
      const menu = menuMap.get(assignment.menuId);
      if (!menu) continue;
      const rows: MenuItemRow[] = (menu.items || [])
        .filter((it) => it.type !== "PAGE" || !!it.page?.published)
        .map((it) => ({
          id: it.id,
          parentId: it.parentId ?? null,
          label: it.label,
          href: resolveHref(it),
          openInNewTab: !!it.openInNewTab,
          order: typeof it.order === "number" ? it.order : Number(it.order || 0),
        }));
      result[assignment.location] = buildTree(rows);
    }

    return result;
  } catch {
    return {};
  }
}
