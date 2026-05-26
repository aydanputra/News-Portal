export type SidebarSourceLocation = "home" | "post" | "archive";

export type SidebarSourceBlocksMap = Partial<Record<SidebarSourceLocation, any[]>>;

const SIDEBAR_SOURCE_LOCATIONS: SidebarSourceLocation[] = ["home", "post", "archive"];

export function normalizeSidebarSourceLocation(value: unknown): SidebarSourceLocation | null {
  if (typeof value !== "string") return null;
  return SIDEBAR_SOURCE_LOCATIONS.includes(value as SidebarSourceLocation)
    ? (value as SidebarSourceLocation)
    : null;
}

export function getSidebarSourceOptions(currentLocation?: SidebarSourceLocation) {
  const labels: Record<SidebarSourceLocation, string> = {
    home: "Homepage Builder",
    post: "Post Builder",
    archive: "Archive Builder",
  };

  return SIDEBAR_SOURCE_LOCATIONS
    .filter((location) => location !== currentLocation)
    .map((location) => ({
      value: location,
      label: labels[location],
    }));
}

export function getSidebarColumnIndex(layout: unknown): number | null {
  if (typeof layout !== "string") return null;
  const widths = layout
    .split("-")
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part) && part > 0);

  if (widths.length !== 2 || widths[0] === widths[1]) return null;
  return widths[0] < widths[1] ? 0 : 1;
}

const isVisible = (block: any) => block?.isVisible !== false;

const getChildren = (block: any): any[] => {
  const children = block?.config?.children;
  return Array.isArray(children) ? children.filter(isVisible) : [];
};

function deepCloneBlock<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepCloneBlock(item)) as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      result[key] = deepCloneBlock(nestedValue);
    }
    return result as T;
  }
  return value;
}

function cloneSidebarBlock(
  block: any,
  targetColumnIndex: number,
  cloneKey: string,
  sourceLocation?: SidebarSourceLocation,
  isTopLevel = true
): any {
  const cloned = deepCloneBlock(block);
  cloned.id = `${block?.id || "sidebar"}__${cloneKey}`;
  cloned.sourceWidgetId = block?.sourceWidgetId || block?.id;
  cloned.inheritedSidebarLocation = sourceLocation || block?.inheritedSidebarLocation;
  if (isTopLevel) {
    cloned.config = {
      ...(cloned.config || {}),
      columnIndex: targetColumnIndex,
      inheritedSidebarSource: true,
      sourceWidgetId: block?.sourceWidgetId || block?.id,
      inheritedSidebarLocation: sourceLocation || block?.inheritedSidebarLocation,
    };
  }

  if (Array.isArray(cloned?.config?.children)) {
    cloned.config.children = cloned.config.children.map((child: any, index: number) =>
      cloneSidebarBlock(child, targetColumnIndex, `${cloneKey}-${index}`, sourceLocation, false)
    );
  }

  return cloned;
}

export function extractFirstSidebarChildren(blocks: any[]): any[] {
  const section = extractFirstSidebarSection(blocks);
  if (!section) return [];
  const children = getChildren(section);
  const sidebarIndex = getSidebarColumnIndex(section?.config?.layout);
  if (sidebarIndex === null) return [];
  return children.filter((child) => {
    const columnIndex = typeof child?.config?.columnIndex === "number" ? child.config.columnIndex : 0;
    return columnIndex === sidebarIndex;
  });
}

export function extractFirstSidebarSection(blocks: any[]): any | null {
  const walk = (items: any[]): any[] | null => {
    for (const block of items || []) {
      if (!isVisible(block) || block?.type !== "section") continue;

      const children = getChildren(block);
      const sidebarIndex = getSidebarColumnIndex(block?.config?.layout);
      if (sidebarIndex !== null) {
        const sidebarChildren = children.filter((child) => {
          const columnIndex = typeof child?.config?.columnIndex === "number" ? child.config.columnIndex : 0;
          return columnIndex === sidebarIndex;
        });
        if (sidebarChildren.length > 0) return [block];
      }

      const nested = walk(children);
      if (nested && nested.length > 0) return nested;
    }
    return null;
  };

  return (walk(blocks) || [])[0] || null;
}

export function resolveSectionChildrenWithSidebarSource(
  section: any,
  sourceBlocksByLocation?: SidebarSourceBlocksMap,
  currentLocation?: SidebarSourceLocation
) {
  const config = section?.config || {};
  const rawChildren = Array.isArray(config.children) ? config.children : Array.isArray(section?.children) ? section.children : [];
  const sourceLocation = normalizeSidebarSourceLocation(config.sidebarSourceLocation);
  const followSidebar = config.followSharedSidebar === true && !!sourceLocation;
  const sidebarIndex = getSidebarColumnIndex(config.layout);

  if (!followSidebar || sidebarIndex === null || !sourceLocation || sourceLocation === currentLocation) {
    return rawChildren;
  }

  const sourceBlocks = sourceBlocksByLocation?.[sourceLocation];
  if (!Array.isArray(sourceBlocks) || sourceBlocks.length === 0) return rawChildren;

  const sourceSidebarChildren = extractFirstSidebarChildren(sourceBlocks);
  if (sourceSidebarChildren.length === 0) return rawChildren;

  const resolvedMainChildren = rawChildren.filter((child: any) => {
    const columnIndex = typeof child?.config?.columnIndex === "number" ? child.config.columnIndex : 0;
    return columnIndex !== sidebarIndex;
  });

  const clonedSidebarChildren = sourceSidebarChildren.map((child, index) =>
    cloneSidebarBlock(child, sidebarIndex, `${section?.id || "section"}-${sourceLocation}-${index}`, sourceLocation)
  );

  return [...resolvedMainChildren, ...clonedSidebarChildren];
}
