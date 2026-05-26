import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Block, Category, Tag } from "@/components/admin/page-builder/types";
import { ConfigValue } from "@/lib/page-builder-config";
import { buildPageChildConfig } from "@/lib/page-builder-child-presets";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";

export type PageLocation = "home" | "post";

export function usePageBuilder(location: PageLocation = "home") {
  const router = useRouter();
  const prefix = location === "home" ? "home" : "post"; // e.g. homeLayout vs postLayout

  // --- STATE ---
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  // Unified History State
  const [history, setHistory] = useState<{
      past: Block[][];
      present: Block[];
      future: Block[][];
  }>({
      past: [],
      present: [],
      future: []
  });

  // Derived state
  const blocks = history.present;

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTheme, setActiveTheme] = useState("classic");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Layout Settings
  const [layout, setLayout] = useState("right_sidebar");
  const [sidebarWidth, setSidebarWidth] = useState("w-1/3");
  const [mainColumnBox, setMainColumnBox] = useState(false);
  const [sidebarColumnBox, setSidebarColumnBox] = useState(false);

  // Radius Settings
  const [mainColumnBorderRadius, setMainColumnBorderRadius] = useState("xl");
  const [sidebarColumnBorderRadius, setSidebarColumnBorderRadius] = useState("xl");

  // Color Settings
  const [mainColumnColor, setMainColumnColor] = useState("#ffffff");
  const [sidebarColumnColor, setSidebarColumnColor] = useState("#ffffff");

  // Container Settings
  const [containerWidth, setContainerWidth] = useState("boxed");
  const [customContainerWidth, setCustomContainerWidth] = useState("1200"); // Default custom width

  // Global Style Settings
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [headingColor, setHeadingColor] = useState("#1e293b");
  const [excerptColor, setExcerptColor] = useState("#64748b");
  const [metaColor, setMetaColor] = useState("#94a3b8");
  const [headingFont, setHeadingFont] = useState("Inter");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [globalBorderRadius, setGlobalBorderRadius] = useState("0.5rem");

  // Global Margin & Padding
  const [globalMarginTop, setGlobalMarginTop] = useState("32"); // Default 32px (my-8)
  const [globalMarginBottom, setGlobalMarginBottom] = useState("32");
  const [globalPaddingTop, setGlobalPaddingTop] = useState("0");
  const [globalPaddingBottom, setGlobalPaddingBottom] = useState("0");
  const [globalPaddingLeft, setGlobalPaddingLeft] = useState("0");
  const [globalPaddingRight, setGlobalPaddingRight] = useState("0");

  const [showStyleModal, setShowStyleModal] = useState(false);

  // UI Tabs State
  const [activeDeviceTab, _setActiveDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Editing Child State
  const [editingChild, setEditingChild] = useState<{ parentIndex: number, childId: string } | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<"content" | "visual">("content");
  
  // Section Editing State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [activeSectionTab, setActiveSectionTab] = useState<"layout" | "style">("layout");
  const [activeSectionDeviceTab, _setActiveSectionDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const setActiveDeviceTab = useCallback((device: "desktop" | "tablet" | "mobile") => {
    _setActiveDeviceTab(device);
    _setActiveSectionDeviceTab(device);
  }, []);

  const setActiveSectionDeviceTab = useCallback((device: "desktop" | "tablet" | "mobile") => {
    _setActiveSectionDeviceTab(device);
    _setActiveDeviceTab(device);
  }, []);

  // Helper to update blocks (without history) - e.g. for initial load
  const setBlocks = useCallback((newBlocksOrFn: Block[] | ((prev: Block[]) => Block[])) => {
      setHistory(prev => ({
          ...prev,
          present: typeof newBlocksOrFn === 'function' ? newBlocksOrFn(prev.present) : newBlocksOrFn
      }));
  }, []);

  // Helper to set blocks with history
  const setBlocksWithHistory = useCallback((newBlocksOrFn: Block[] | ((prev: Block[]) => Block[])) => {
      setHistory(prev => {
          const newBlocks = typeof newBlocksOrFn === 'function' ? newBlocksOrFn(prev.present) : newBlocksOrFn;
          
          if (JSON.stringify(prev.present) !== JSON.stringify(newBlocks)) {
              return {
                  past: [...prev.past, prev.present],
                  present: newBlocks,
                  future: []
              };
          }
          return prev;
      });
  }, []);

  const undo = useCallback(() => {
      setHistory(prev => {
          if (prev.past.length === 0) return prev;
          const previous = prev.past[prev.past.length - 1];
          const newPast = prev.past.slice(0, prev.past.length - 1);
          
          return {
              past: newPast,
              present: previous,
              future: [prev.present, ...prev.future]
          };
      });
  }, []);

  const redo = useCallback(() => {
      setHistory(prev => {
          if (prev.future.length === 0) return prev;
          const next = prev.future[0];
          const newFuture = prev.future.slice(1);
          
          return {
              past: [...prev.past, prev.present],
              present: next,
              future: newFuture
          };
      });
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function initData() {
      try {
        const [resCat, resTags, resGlobal] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
          fetch("/api/settings"),
        ]);

        const [catsData, tagsData, globalData] = await Promise.all([
          resCat.json(),
          resTags.json(),
          resGlobal.json(),
        ]);

        setCategories(Array.isArray(catsData) ? catsData : []);
        setTags(Array.isArray(tagsData) ? tagsData : []);

        const currentTheme = globalData?.activeTheme || "classic";
        setActiveTheme(currentTheme);

        const [resThemeConfig, resBlocks] = await Promise.all([
          fetch(`/api/settings?themeId=${currentTheme}`),
          fetch(`/api/homepage?location=${location}&themeId=${currentTheme}`),
        ]);

        const [themeConfigData, blocksData] = await Promise.all([
          resThemeConfig.json(),
          resBlocks.ok ? resBlocks.json() : Promise.resolve([]),
        ]);

        if (themeConfigData) {
          setLayout(themeConfigData[`${prefix}Layout`] || "right_sidebar");
          setSidebarWidth(themeConfigData[`${prefix}SidebarWidth`] || "w-1/3");
          setMainColumnBox(themeConfigData[`${prefix}MainColumnBox`] || false);
          setSidebarColumnBox(themeConfigData[`${prefix}SidebarColumnBox`] || false);
          setMainColumnBorderRadius(themeConfigData[`${prefix}MainColumnBorderRadius`] || "xl");
          setSidebarColumnBorderRadius(themeConfigData[`${prefix}SidebarColumnBorderRadius`] || "xl");
          setMainColumnColor(themeConfigData[`${prefix}MainColumnColor`] || "#ffffff");
          setSidebarColumnColor(themeConfigData[`${prefix}SidebarColumnColor`] || "#ffffff");
          setContainerWidth(themeConfigData[`${prefix}ContainerWidth`] || "boxed");
          setCustomContainerWidth(themeConfigData[`${prefix}CustomContainerWidth`] || "1200");

          setPrimaryColor(themeConfigData[`${prefix}PrimaryColor`] || "#2563eb");
          setSecondaryColor(themeConfigData[`${prefix}SecondaryColor`] || "#64748b");
          setAccentColor(themeConfigData[`${prefix}AccentColor`] || "#f59e0b");
          setBackgroundColor(themeConfigData[`${prefix}BackgroundColor`] || "#f8fafc");
          setHeadingColor(themeConfigData[`${prefix}HeadingColor`] || "#1e293b");
          setExcerptColor(themeConfigData[`${prefix}ExcerptColor`] || "#64748b");
          setMetaColor(themeConfigData[`${prefix}MetaColor`] || "#94a3b8");
          setHeadingFont(themeConfigData[`${prefix}HeadingFont`] || "Inter");
          setBodyFont(themeConfigData[`${prefix}BodyFont`] || "Inter");
          setGlobalBorderRadius(themeConfigData[`${prefix}GlobalBorderRadius`] || "0.5rem");

          setGlobalMarginTop(themeConfigData[`${prefix}GlobalMarginTop`] || "32");
          setGlobalMarginBottom(themeConfigData[`${prefix}GlobalMarginBottom`] || "32");
          setGlobalPaddingTop(themeConfigData[`${prefix}GlobalPaddingTop`] || "0");
          setGlobalPaddingBottom(themeConfigData[`${prefix}GlobalPaddingBottom`] || "0");
          setGlobalPaddingLeft(themeConfigData[`${prefix}GlobalPaddingLeft`] || "0");
          setGlobalPaddingRight(themeConfigData[`${prefix}GlobalPaddingRight`] || "0");
        }

        const normalizedBlocks = Array.isArray(blocksData) ? blocksData : [];
        if (location === "post" && normalizedBlocks.length === 0) {
          setBlocks(getThemeDefaultPostBlocks(currentTheme) as Block[]);
        } else {
          setBlocks(normalizedBlocks);
        }
      } catch (error) {
        console.error("Error init page builder:", error);
        setBlocks([]);
        setToast({ message: "Gagal memuat layout. Menggunakan default.", type: "error" });
      }
    }

    initData();
  }, [location, prefix, setBlocks]);

  // --- RECURSIVE HELPERS ---
  const getChildren = useCallback((block: Block): Block[] => {
      return Array.isArray(block.config?.children) ? block.config.children : [];
  }, []);

  const withChildren = useCallback((block: Block, children: Block[]): Block => {
      return {
          ...block,
          config: {
              ...(block.config || {}),
              children
          }
      };
  }, []);

  const getColumnIndex = useCallback((block: Block): number => {
      return typeof block.config?.columnIndex === "number" ? block.config.columnIndex : 0;
  }, []);

  const createChildBlock = useCallback((type: string, title: string, columnIndex: number, order: number): Block => {
      const config = buildPageChildConfig(type, title, columnIndex) as Block["config"];
      return {
          id: "child_" + type + "_" + Date.now(),
          type: type,
          title: title,
          order,
          isVisible: true,
          config
      };
  }, []);

  const deepCloneBlock = useCallback((block: Block): Block => {
      const newId = block.type === "section" ? "section_" + Date.now() + Math.random().toString(36).substr(2, 5) : "child_" + block.type + "_" + Date.now() + Math.random().toString(36).substr(2, 5);
      
      const clonedBlock: Block = {
          ...block,
          id: newId,
          title: block.title + " (Copy)",
          config: { ...block.config }
      };

      const children = getChildren(clonedBlock);
      if (children.length > 0) {
          clonedBlock.config = {
              ...(clonedBlock.config || {}),
              children: children.map(deepCloneBlock)
          };
      }
      
      return clonedBlock;
  }, [getChildren]);

  const findBlockRecursive = useCallback((blocks: Block[], targetId: string): Block | null => {
      for (const block of blocks) {
          if (block.id === targetId) return block;
          const children = getChildren(block);
          if (children.length > 0) {
              const found = findBlockRecursive(children, targetId);
              if (found) return found;
          }
      }
      return null;
  }, [getChildren]);

  const findParentIdRecursive = useCallback((blocks: Block[], targetId: string, parentId: string | null = null): string | null => {
    for (const block of blocks) {
      if (block.id === targetId) return parentId;
      const children = getChildren(block);
      if (children.length > 0) {
        const found = findParentIdRecursive(children, targetId, block.id);
        if (found) return found;
      }
    }
    return null;
  }, [getChildren]);

  const updateBlockRecursive = useCallback((blocks: Block[], targetId: string, updateFn: (block: Block) => Block): { found: boolean, newBlocks: Block[] } => {
      const newBlocks = [...blocks];
      for (let i = 0; i < newBlocks.length; i++) {
          if (newBlocks[i].id === targetId) {
              newBlocks[i] = updateFn(newBlocks[i]);
              return { found: true, newBlocks };
          }
          const children = getChildren(newBlocks[i]);
          if (children.length > 0) {
              const result = updateBlockRecursive(children, targetId, updateFn);
              if (result.found) {
                  newBlocks[i] = withChildren(newBlocks[i], result.newBlocks);
                  return { found: true, newBlocks };
              }
          }
      }
      return { found: false, newBlocks: blocks };
  }, [getChildren, withChildren]);

  const deleteBlockRecursive = useCallback((blocks: Block[], targetId: string): { found: boolean, newBlocks: Block[] } => {
    const newBlocks = blocks.filter(b => b.id !== targetId);
    if (newBlocks.length !== blocks.length) return { found: true, newBlocks };

    for (let i = 0; i < newBlocks.length; i++) {
      const children = getChildren(newBlocks[i]);
      if (children.length > 0) {
        const result = deleteBlockRecursive(children, targetId);
        if (result.found) {
          newBlocks[i] = withChildren(newBlocks[i], result.newBlocks);
          return { found: true, newBlocks };
        }
      }
    }
    return { found: false, newBlocks: blocks };
  }, [getChildren, withChildren]);

  const getLayoutConfig = useCallback((block: Block): string => {
    return typeof block.config?.layout === "string" ? block.config.layout : "100";
  }, []);

  const getLayoutColumnCount = useCallback((layout: string): number => {
    switch (layout) {
      case "50-50":
      case "33-66":
      case "66-33":
        return 2;
      case "33-33-33":
        return 3;
      case "25-25-25-25":
        return 4;
      default:
        return 1;
    }
  }, []);

  // --- ACTIONS ---

  const deleteBlockById = useCallback((blockId: string) => {
    if (confirm("Yakin ingin menghapus blok ini?")) {
      setBlocksWithHistory(prev => {
        const { newBlocks } = deleteBlockRecursive(prev, blockId);
        return newBlocks;
      });
    }
  }, [deleteBlockRecursive, setBlocksWithHistory]);

  const updateBlockConfigById = useCallback((blockId: string, key: string, value: ConfigValue) => {
    setBlocksWithHistory(prev => {
      const { found, newBlocks } = updateBlockRecursive(prev, blockId, (block) => {
        return {
          ...block,
          config: { ...(block.config || {}), [key]: value }
        };
      });
      return found ? newBlocks : prev;
    });
  }, [setBlocksWithHistory, updateBlockRecursive]);

  const addChildBlockById = useCallback((parentId: string, type: string, title: string, columnIndex: number = 0) => {
    setBlocksWithHistory(prev => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const children = getChildren(parent);
        const newChild = createChildBlock(type, title, columnIndex, children.length + 1);

        return {
          ...parent,
          config: {
            ...(parent.config || {}),
            children: [...children, newChild]
          }
        };
      });
      return found ? newBlocks : prev;
    });
  }, [createChildBlock, getChildren, setBlocksWithHistory, updateBlockRecursive]);

  const moveChildBlockById = useCallback((parentId: string, childId: string, direction: "up" | "down") => {
    setBlocksWithHistory(prev => {
      const rootParentIndex = prev.findIndex((b) => b.id === parentId);
      const isRootSectionMove = rootParentIndex !== -1 && prev[rootParentIndex]?.type === "section";

      const findBlock = (currentBlocks: Block[], targetId: string): Block | null => {
        return findBlockRecursive(currentBlocks, targetId);
      };

      const parentBlock = isRootSectionMove ? prev[rootParentIndex] : findBlock(prev, parentId);
      if (!parentBlock) return prev;

      const existingChildren = getChildren(parentBlock);
      if (existingChildren.length === 0) return prev;
      const children = [...existingChildren];

      const index = children.findIndex((c: Block) => c.id === childId);
      if (index === -1) return prev;

      const current = children[index];
      const currentColumnIndex = getColumnIndex(current);

      const sameColIndices = children
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => getColumnIndex(c) === currentColumnIndex)
        .map(({ i }) => i);
      const pos = sameColIndices.indexOf(index);
      const targetPos = direction === "up" ? pos - 1 : pos + 1;

      if (targetPos >= 0 && targetPos < sameColIndices.length) {
        const swapIndex = sameColIndices[targetPos];
        const sibling = children[swapIndex];

        if (sibling?.type === "section") {
          const targetLayout = getLayoutConfig(sibling);
          const targetMaxCols = getLayoutColumnCount(targetLayout);
          const clampedColumnIndex = Math.max(0, Math.min(currentColumnIndex, Math.max(1, targetMaxCols) - 1));
          const movedChild =
            clampedColumnIndex === currentColumnIndex
              ? current
              : { ...current, config: { ...(current.config || {}), columnIndex: clampedColumnIndex } };

          const targetChildrenExisting = getChildren(sibling);
          const targetChildren = [...targetChildrenExisting];
          const targetColIndices = targetChildren
            .map((c, i) => ({ c, i }))
            .filter(({ c }) => getColumnIndex(c) === clampedColumnIndex)
            .map(({ i }) => i);

          const insertAt =
            direction === "up"
              ? targetColIndices.length > 0
                ? targetColIndices[0]
                : 0
              : targetColIndices.length > 0
                ? targetColIndices[targetColIndices.length - 1] + 1
                : targetChildren.length;

          targetChildren.splice(insertAt, 0, movedChild);
          const updatedTargetSection = withChildren(sibling, targetChildren);

          const nextChildren = children
            .filter((c) => c.id !== childId)
            .map((c) => (c.id === updatedTargetSection.id ? updatedTargetSection : c));
          const updatedParent = withChildren(parentBlock, nextChildren);

          if (isRootSectionMove) {
            const next = [...prev];
            next[rootParentIndex] = updatedParent;
            return next;
          }

          const { found, newBlocks } = updateBlockRecursive(prev, parentId, () => updatedParent);
          return found ? newBlocks : prev;
        }

        const swapA = sameColIndices[pos];
        const swapB = sameColIndices[targetPos];
        [children[swapA], children[swapB]] = [children[swapB], children[swapA]];
        const updatedParent = withChildren(parentBlock, children);

        if (isRootSectionMove) {
          const next = [...prev];
          next[rootParentIndex] = updatedParent;
          return next;
        }

        const { found, newBlocks } = updateBlockRecursive(prev, parentId, () => updatedParent);
        return found ? newBlocks : prev;
      }

      if (!isRootSectionMove) {
        const grandParentId = findParentIdRecursive(prev, parentId);
        if (!grandParentId) return prev;

        const { found, newBlocks } = updateBlockRecursive(prev, grandParentId, (grandParent) => {
          const gpChildrenExisting = getChildren(grandParent);
          if (gpChildrenExisting.length === 0) return grandParent;
          const gpChildren = [...gpChildrenExisting];
          const sectionIndex = gpChildren.findIndex((c) => c.id === parentId);
          if (sectionIndex === -1) return grandParent;

          const innerSection = gpChildren[sectionIndex];
          if (!innerSection || innerSection.type !== "section") return grandParent;

          const sectionColumnIndex = getColumnIndex(innerSection);
          const gpLayout = getLayoutConfig(grandParent);
          const gpMaxCols = getLayoutColumnCount(gpLayout);
          const clampedColumnIndex = Math.max(0, Math.min(sectionColumnIndex, Math.max(1, gpMaxCols) - 1));
          const movedChild =
            clampedColumnIndex === sectionColumnIndex
              ? current
              : { ...current, config: { ...(current.config || {}), columnIndex: clampedColumnIndex } };

          const updatedInner = withChildren(innerSection, getChildren(innerSection).filter((c) => c.id !== childId));
          gpChildren[sectionIndex] = updatedInner;

          const insertAt = direction === "up" ? sectionIndex : sectionIndex + 1;
          gpChildren.splice(insertAt, 0, movedChild);
          return withChildren(grandParent, gpChildren);
        });

        return found ? newBlocks : prev;
      }

      const next = [...prev];
      const sourceSection = next[rootParentIndex];
      if (!sourceSection) return prev;

      const sourceChildrenExisting = getChildren(sourceSection);
      if (sourceChildrenExisting.length === 0) return prev;
      const sourceChildren = [...sourceChildrenExisting];

      const sourceIndex = sourceChildren.findIndex((c) => c.id === childId);
      if (sourceIndex === -1) return prev;

      const moving = sourceChildren[sourceIndex];
      const sourceColumnIndex = getColumnIndex(moving);

      const targetSectionIndex = direction === "up" ? rootParentIndex - 1 : rootParentIndex + 1;
      const targetSection = next[targetSectionIndex];
      if (!targetSection || targetSection.type !== "section") return prev;

      const targetLayout = getLayoutConfig(targetSection);
      const targetMaxCols = getLayoutColumnCount(targetLayout);
      const clampedColumnIndex = Math.max(0, Math.min(sourceColumnIndex, Math.max(1, targetMaxCols) - 1));

      const movedChild =
        clampedColumnIndex === sourceColumnIndex
          ? moving
          : { ...moving, config: { ...(moving.config || {}), columnIndex: clampedColumnIndex } };

      const nextSourceChildren = sourceChildren.filter((c) => c.id !== childId);
      const targetChildrenExisting = getChildren(targetSection);
      const targetChildren = [...targetChildrenExisting];

      const targetColIndices = targetChildren
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => getColumnIndex(c) === clampedColumnIndex)
        .map(({ i }) => i);

      const insertAt =
        direction === "up"
          ? targetColIndices.length > 0
            ? targetColIndices[targetColIndices.length - 1] + 1
            : targetChildren.length
          : targetColIndices.length > 0
            ? targetColIndices[0]
            : targetChildren.length;

      targetChildren.splice(insertAt, 0, movedChild);

      next[rootParentIndex] = withChildren(sourceSection, nextSourceChildren);
      next[targetSectionIndex] = withChildren(targetSection, targetChildren);
      return next;
    });
  }, [
    findBlockRecursive,
    findParentIdRecursive,
    getChildren,
    getColumnIndex,
    getLayoutColumnCount,
    getLayoutConfig,
    setBlocksWithHistory,
    updateBlockRecursive,
    withChildren
  ]);

  const moveChildBlockColumnById = useCallback((parentId: string, childId: string, direction: "left" | "right") => {
    setBlocksWithHistory(prev => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const existingChildren = getChildren(parent);
        if (existingChildren.length === 0) return parent;
        const children = [...existingChildren];
        const index = children.findIndex((c: Block) => c.id === childId);
        if (index === -1) return parent;

        const child = children[index];
        const currentColumnIndex = getColumnIndex(child);
        const layout = getLayoutConfig(parent);
        const maxColumns = getLayoutColumnCount(layout);

        let newColumnIndex = currentColumnIndex;
        if (direction === "left") newColumnIndex = Math.max(0, currentColumnIndex - 1);
        else if (direction === "right") newColumnIndex = Math.min(maxColumns - 1, currentColumnIndex + 1);

        if (newColumnIndex !== currentColumnIndex) {
          children[index] = {
            ...child,
            config: { ...child.config, columnIndex: newColumnIndex }
          };
          return withChildren(parent, children);
        }
        return parent;
      });
      return found ? newBlocks : prev;
    });
  }, [getChildren, getColumnIndex, getLayoutColumnCount, getLayoutConfig, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const deleteChildBlockById = useCallback((parentId: string, childId: string) => {
    if (confirm("Hapus widget ini?")) {
      setBlocksWithHistory(prev => {
        const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
          const existingChildren = getChildren(parent);
          if (existingChildren.length === 0) return parent;
          return {
            ...parent,
            config: {
              ...parent.config,
              children: existingChildren.filter((c: Block) => c.id !== childId)
            }
          };
        });
        return found ? newBlocks : prev;
      });
    }
  }, [getChildren, setBlocksWithHistory, updateBlockRecursive]);

  const deleteBlock = useCallback((index: number) => {
    if (confirm("Yakin ingin menghapus blok ini?")) {
      setBlocksWithHistory(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(index, 1);
        return newBlocks;
      });
    }
  }, [setBlocksWithHistory]);

  const duplicateBlock = useCallback((index: number) => {
      setBlocksWithHistory(prev => {
          const newBlocks = [...prev];
          const blockToClone = newBlocks[index];
          const clonedBlock = deepCloneBlock(blockToClone);
          
          newBlocks.splice(index + 1, 0, clonedBlock);
          return newBlocks;
      });
  }, [deepCloneBlock, setBlocksWithHistory]);

  const updateBlockConfig = useCallback((index: number, key: string, value: ConfigValue) => {
    setBlocksWithHistory(prev => {
        const newBlocks = [...prev];
        const block = { ...newBlocks[index] };
        block.config = { ...(block.config || {}), [key]: value };
        newBlocks[index] = block;
        return newBlocks;
    });
  }, [setBlocksWithHistory]);

  const addChildBlock = useCallback((parentIndex: number, type: string, title: string, columnIndex: number = 0) => {
      setBlocksWithHistory(prev => {
        const newBlocks = [...prev];
        // Create shallow copy of parent
        const parent = { ...newBlocks[parentIndex] };
        const children = getChildren(parent);
        const newChild = createChildBlock(type, title, columnIndex, children.length + 1);

        // Immutable update
        parent.config = {
            ...(parent.config || {}),
            children: [...children, newChild]
        };
        newBlocks[parentIndex] = parent;
        
        return newBlocks;
      });
  }, [createChildBlock, getChildren, setBlocksWithHistory]);

  const moveChildBlock = useCallback((parentIndex: number, childId: string, direction: "up" | "down") => {
    setBlocksWithHistory(prev => {
      const newBlocks = [...prev];
      const parent = { ...newBlocks[parentIndex] };
      
      const existingChildren = getChildren(parent);
      if (existingChildren.length === 0) return prev;
      const children = [...existingChildren];
      const index = children.findIndex((c: Block) => c.id === childId);
      if (index === -1) return prev;

      const currentChild = children[index];
      const currentColumnIndex = getColumnIndex(currentChild);

      const sameColSiblings = children
          .map((c: Block, idx: number) => ({ ...c, originalIndex: idx }))
          .filter((c: Block & { originalIndex: number }) => getColumnIndex(c) === currentColumnIndex);

      const filteredIndex = sameColSiblings.findIndex((c: Block & { originalIndex: number }) => c.id === childId);

      let swapTargetIndex = -1;
      if (direction === "up" && filteredIndex > 0) {
          swapTargetIndex = sameColSiblings[filteredIndex - 1].originalIndex;
      } else if (direction === "down" && filteredIndex < sameColSiblings.length - 1) {
          swapTargetIndex = sameColSiblings[filteredIndex + 1].originalIndex;
      }

      if (swapTargetIndex !== -1) {
          [children[index], children[swapTargetIndex]] = [children[swapTargetIndex], children[index]];
          parent.config = { ...parent.config, children };
          newBlocks[parentIndex] = parent;
          return newBlocks;
      }

      return prev;
    });
  }, [getChildren, getColumnIndex, setBlocksWithHistory]);

  const addSectionBlock = useCallback((layoutType: string) => {
      const newBlock: Block = {
          id: "section_" + Date.now(),
          type: "section",
          title: "Section Baru",
          order: blocks.length + 1,
          isVisible: true,
          config: { 
              layout: layoutType, 
              children: [] 
          }
      };
      setBlocksWithHistory(prev => [...prev, newBlock]);
  }, [blocks.length, setBlocksWithHistory]);

  const deleteChildBlock = useCallback((parentIndex: number, childId: string) => {
      if (confirm("Hapus widget ini?")) {
          setBlocksWithHistory(prev => {
            const newBlocks = [...prev];
            // Create shallow copy of parent
            const parent = { ...newBlocks[parentIndex] };
            
            const existingChildren = getChildren(parent);
            if (existingChildren.length > 0) {
                // Update children immutably
                const newChildren = existingChildren.filter((c: Block) => c.id !== childId);
                
                // Update parent config immutably
                parent.config = {
                    ...parent.config,
                    children: newChildren
                };
                
                // Update parent in newBlocks
                newBlocks[parentIndex] = parent;
                
                return newBlocks;
            }
            return prev;
          });
      }
  }, [getChildren, setBlocksWithHistory]);

  const resetAllSettings = useCallback(async () => {
      if (confirm("PERINGATAN: Ini akan mereset SELURUH konfigurasi ke default awal. Semua perubahan akan hilang. Lanjutkan?")) {
          setLoading(true);
          try {
              const defaultBlocks: Block[] = [];
              setBlocksWithHistory(defaultBlocks);
              
              setLayout("right_sidebar");
              setSidebarWidth("w-1/3");
              setMainColumnBox(false);
              setSidebarColumnBox(false);
              setMainColumnBorderRadius("xl");
              setSidebarColumnBorderRadius("xl");
              setMainColumnColor("#ffffff");
              setSidebarColumnColor("#ffffff");
              setContainerWidth("boxed");
              setCustomContainerWidth("1200");

              setPrimaryColor("#2563eb");
              setSecondaryColor("#64748b");
              setAccentColor("#f59e0b");
              setBackgroundColor("#f8fafc");
              setHeadingColor("#1e293b");
              setExcerptColor("#64748b");
              setMetaColor("#94a3b8");
              setHeadingFont("Inter");
              setBodyFont("Inter");
              setGlobalBorderRadius("0.5rem");

              setGlobalMarginTop("32");
              setGlobalMarginBottom("32");
              setGlobalPaddingTop("0");
              setGlobalPaddingBottom("0");
              setGlobalPaddingLeft("0");
              setGlobalPaddingRight("0");

              setToast({ message: "Konfigurasi berhasil direset ke default. Silakan klik Simpan.", type: "success" });
          } catch (error) {
              console.error(error);
              setToast({ message: "Gagal mereset konfigurasi.", type: "error" });
          } finally {
              setLoading(false);
          }
      }
  }, [setBlocksWithHistory]);

  // Helper Functions for Config
  const getEditingChildBlock = useCallback(() => {
      if (!editingChild) return null;
      return findBlockRecursive(blocks, editingChild.childId); // Use recursive find logic if available or implement it
  }, [editingChild, blocks, findBlockRecursive]);

  const updateChildConfigState = useCallback((key: string, value: ConfigValue) => {
      if (!editingChild) return;
      
      setBlocksWithHistory(prev => {
        const { found, newBlocks } = updateBlockRecursive(prev, editingChild.childId, (block) => {
             return {
                 ...block,
                 config: { ...(block.config || {}), [key]: value }
             };
        });
        return found ? newBlocks : prev;
      });
  }, [editingChild, setBlocksWithHistory, updateBlockRecursive]);

  const getResponsiveKey = useCallback((baseKey: string) => {
      if (activeDeviceTab === "desktop") return baseKey;
      if (activeDeviceTab === "tablet") return `tablet${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
      if (activeDeviceTab === "mobile") return `mobile${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
      return baseKey;
  }, [activeDeviceTab]);

  const getConfigValue = useCallback((block: Block, baseKey: string) => {
      const config = block.config || {};
      const key = getResponsiveKey(baseKey);
      if (key === baseKey) return config[baseKey];
      const override = config[key];
      return override !== undefined ? override : config[baseKey];
  }, [getResponsiveKey]);

  const updateChildResponsiveConfig = useCallback((baseKey: string, value: ConfigValue) => {
      const key = getResponsiveKey(baseKey);
      updateChildConfigState(key, value);
  }, [getResponsiveKey, updateChildConfigState]);

  const getEditingSectionBlock = useCallback(() => {
      if (!editingSectionId) return null;
      return findBlockRecursive(blocks, editingSectionId);
  }, [editingSectionId, blocks, findBlockRecursive]);

  const updateSectionConfig = useCallback((key: string, value: ConfigValue) => {
      if (!editingSectionId) return;
      
      setBlocksWithHistory(prev => {
        const { found, newBlocks } = updateBlockRecursive(prev, editingSectionId, (block) => {
            return { ...block, config: { ...(block.config || {}), [key]: value } };
        });
        return found ? newBlocks : prev;
      });
  }, [editingSectionId, setBlocksWithHistory, updateBlockRecursive]);

  const getSectionResponsiveKey = useCallback((baseKey: string) => {
      if (activeSectionDeviceTab === "desktop") return baseKey;
      if (activeSectionDeviceTab === "tablet") return `tablet${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
      if (activeSectionDeviceTab === "mobile") return `mobile${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
      return baseKey;
  }, [activeSectionDeviceTab]);

  const getSectionConfigValue = useCallback((key: string) => {
      if (!editingSectionId) return null;
      const section = findBlockRecursive(blocks, editingSectionId);
      const config = section?.config || {};
      const responsiveKey = getSectionResponsiveKey(key);
      if (responsiveKey === key) return config[key];
      const override = config[responsiveKey];
      return override !== undefined ? override : config[key];
  }, [editingSectionId, blocks, findBlockRecursive, getSectionResponsiveKey]);

  const updateSectionResponsiveConfig = useCallback((baseKey: string, value: ConfigValue) => {
      updateSectionConfig(getSectionResponsiveKey(baseKey), value);
  }, [getSectionResponsiveKey, updateSectionConfig]);

  async function handleSave() {
    setLoading(true);
    try {
      const resBlocks = await fetch(`/api/homepage?location=${location}&themeId=${activeTheme}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, location, themeId: activeTheme }),
      });

      const settingsPayload = {
          themeId: activeTheme,
          [`${prefix}Layout`]: layout,
          [`${prefix}SidebarWidth`]: sidebarWidth,
          [`${prefix}MainColumnBox`]: mainColumnBox,
          [`${prefix}SidebarColumnBox`]: sidebarColumnBox,
          [`${prefix}MainColumnBorderRadius`]: mainColumnBorderRadius,
          [`${prefix}SidebarColumnBorderRadius`]: sidebarColumnBorderRadius,
          [`${prefix}MainColumnColor`]: mainColumnColor,
          [`${prefix}SidebarColumnColor`]: sidebarColumnColor,
          [`${prefix}ContainerWidth`]: containerWidth,
          [`${prefix}CustomContainerWidth`]: customContainerWidth,
          
          [`${prefix}PrimaryColor`]: primaryColor,
          [`${prefix}SecondaryColor`]: secondaryColor,
          [`${prefix}AccentColor`]: accentColor,
          [`${prefix}BackgroundColor`]: backgroundColor,
          [`${prefix}HeadingColor`]: headingColor,
          [`${prefix}ExcerptColor`]: excerptColor,
          [`${prefix}MetaColor`]: metaColor,
          [`${prefix}HeadingFont`]: headingFont,
          [`${prefix}BodyFont`]: bodyFont,
          [`${prefix}GlobalBorderRadius`]: globalBorderRadius,

          // Margin & Padding
          [`${prefix}GlobalMarginTop`]: globalMarginTop,
          [`${prefix}GlobalMarginBottom`]: globalMarginBottom,
          [`${prefix}GlobalPaddingTop`]: globalPaddingTop,
          [`${prefix}GlobalPaddingBottom`]: globalPaddingBottom,
          [`${prefix}GlobalPaddingLeft`]: globalPaddingLeft,
          [`${prefix}GlobalPaddingRight`]: globalPaddingRight
      };

      const resSettings = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsPayload),
      });

      if (resBlocks.ok && resSettings.ok) {
        setToast({ message: "Konfigurasi berhasil diupdate!", type: "success" });
        router.refresh(); 
      } else {
        const errBlocks = !resBlocks.ok ? await resBlocks.json() : null;
        const errSettings = !resSettings.ok ? await resSettings.json() : null;
        const errMsg = (errBlocks?.error || "") + (errSettings?.error ? (errBlocks?.error ? " & " : "") + errSettings.error : "");
        setToast({ message: "Gagal menyimpan: " + (errMsg || "Unknown Error"), type: "error" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown";
      setToast({ message: "Error jaringan: " + errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const duplicateChildBlockById = useCallback((parentId: string, childId: string) => {
      setBlocksWithHistory(prev => {
          const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
             const existingChildren = getChildren(parent);
             if (existingChildren.length === 0) return parent;
             
             const children = [...existingChildren];
             const index = children.findIndex((c: Block) => c.id === childId);
             if (index === -1) return parent;
             
             const childToClone = children[index];
             const clonedChild = deepCloneBlock(childToClone);
             
             children.splice(index + 1, 0, clonedChild);
             
             return {
                 ...parent,
                 config: {
                     ...parent.config,
                     children
                 }
             };
          });
          return found ? newBlocks : prev;
      });
  }, [deepCloneBlock, getChildren, setBlocksWithHistory, updateBlockRecursive]);

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
        setBlocksWithHistory(prev => {
            const newBlocks = [...prev];
            if (direction === "up" && index > 0) {
                [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
            } else if (direction === "down" && index < newBlocks.length - 1) {
                [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            }
            return newBlocks;
        });
  }, [setBlocksWithHistory]);

  return {
    state: {
      showSectionPicker,
      blocks,
      categories,
      tags,
      activeTheme,
      loading,
      toast,
      layout,
      sidebarWidth,
      mainColumnBox,
      sidebarColumnBox,
      mainColumnBorderRadius,
      sidebarColumnBorderRadius,
      mainColumnColor,
      sidebarColumnColor,
      containerWidth,
      customContainerWidth,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      headingColor,
      excerptColor,
      metaColor,
      headingFont,
      bodyFont,
      globalBorderRadius,
      globalMarginTop,
      globalMarginBottom,
      globalPaddingTop,
      globalPaddingBottom,
      globalPaddingLeft,
      globalPaddingRight,
      showStyleModal,
      activeDeviceTab,
      editingChild,
      activeEditTab,
      editingSectionId,
      activeSectionTab,
      activeSectionDeviceTab,
    },
    actions: {
      setShowSectionPicker,
      setBlocks,
      setCategories,
      setTags,
      setLoading,
      setToast,
      setLayout,
      setSidebarWidth,
      setMainColumnBox,
      setSidebarColumnBox,
      setMainColumnBorderRadius,
      setSidebarColumnBorderRadius,
      setMainColumnColor,
      setSidebarColumnColor,
      setContainerWidth,
      setCustomContainerWidth,
      setPrimaryColor,
      setSecondaryColor,
      setAccentColor,
      setBackgroundColor,
      setHeadingColor,
      setExcerptColor,
      setMetaColor,
      setHeadingFont,
      setBodyFont,
      setGlobalBorderRadius,
      setGlobalMarginTop,
      setGlobalMarginBottom,
      setGlobalPaddingTop,
      setGlobalPaddingBottom,
      setGlobalPaddingLeft,
      setGlobalPaddingRight,
      setShowStyleModal,
      setActiveDeviceTab,
      setEditingChild,
      setActiveEditTab,
      setEditingSectionId,
      setActiveSectionTab,
      setActiveSectionDeviceTab,
      
      deleteBlock,
      duplicateBlock,
      updateBlockConfig,
      addChildBlock,
      moveChildBlock,
      addSectionBlock,
      deleteChildBlock,
      resetAllSettings,
      getEditingChildBlock,
      getEditingSectionBlock,
      updateChildConfig: updateChildConfigState,
      getConfigValue,
      updateChildResponsiveConfig,
      updateSectionConfig,
      getSectionConfigValue,
      updateSectionResponsiveConfig,
      handleSave,
      onUpdateTitle: (newTitle: string) => {
        if (!editingChild) return;
        setBlocksWithHistory(prev => {
            const { found, newBlocks } = updateBlockRecursive(prev, editingChild.childId, (block) => {
                return { ...block, title: newTitle };
            });
            return found ? newBlocks : prev;
        });
      },
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      moveBlock,
      deleteBlockById,
      updateBlockConfigById,
      addChildBlockById,
      moveChildBlockById,
      moveChildBlockColumnById,
      deleteChildBlockById,
      duplicateChildBlockById
    }
  };
}
