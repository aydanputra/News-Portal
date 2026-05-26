"use client";

import { useCallback, useEffect, useState } from "react";
import { Block, Category, Tag } from "../../homepage/types";
import { ConfigValue } from "@/lib/page-builder-config";

const DEFAULT_FOOTER_BLOCKS: Block[] = [
  {
    id: "section_footer_main",
    type: "section",
    title: "Footer Main",
    order: 1,
    isVisible: true,
    placement: "main",
    config: {
      layout: "33-33-33",
      children: [
        { id: "footer_logo_1", type: "footer_logo", title: "Logo", order: 1, isVisible: true, config: { columnIndex: 0, textAlign: "left" } },
        { id: "footer_menu_1", type: "footer_menu", title: "Menu Footer", order: 2, isVisible: true, config: { columnIndex: 1, textAlign: "left" } },
        { id: "footer_social_1", type: "footer_social", title: "Social Links", order: 3, isVisible: true, config: { columnIndex: 2, textAlign: "left" } },
      ],
    },
  },
  {
    id: "section_footer_bottom",
    type: "section",
    title: "Footer Bottom",
    order: 2,
    isVisible: true,
    placement: "main",
    config: {
      layout: "100",
      children: [
        { id: "footer_copyright_1", type: "footer_copyright", title: "Copyright", order: 1, isVisible: true, config: { columnIndex: 0, textAlign: "center" } },
      ],
    },
  },
];

const normalizeBlocksForApi = (blocks: Block[]) =>
  blocks.map((b, idx) => ({
    ...b,
    order: idx + 1,
    isActive: (b as any).isActive ?? b.isVisible ?? true,
    config: b.config || {},
    placement: b.placement || "main",
  }));

type HistoryState = { past: Block[][]; present: Block[]; future: Block[][] };

export function useFooterBuilder() {
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [history, setHistory] = useState<HistoryState>({ past: [], present: [], future: [] });
  const blocks = history.present;

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [activeTheme, setActiveTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [activeDeviceTab, _setActiveDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editingChild, setEditingChild] = useState<{ parentIndex: number; childId: string } | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<"content" | "visual">("content");
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

  const setBlocks = useCallback((newBlocksOrFn: Block[] | ((prev: Block[]) => Block[])) => {
    setHistory((prev) => ({
      ...prev,
      present: typeof newBlocksOrFn === "function" ? (newBlocksOrFn as any)(prev.present) : newBlocksOrFn,
    }));
  }, []);

  const setBlocksWithHistory = useCallback((newBlocksOrFn: Block[] | ((prev: Block[]) => Block[])) => {
    setHistory((prev) => {
      const nextBlocks = typeof newBlocksOrFn === "function" ? (newBlocksOrFn as any)(prev.present) : newBlocksOrFn;
      if (JSON.stringify(prev.present) !== JSON.stringify(nextBlocks)) {
        return { past: [...prev.past, prev.present], present: nextBlocks, future: [] };
      }
      return prev;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return { past: prev.past.slice(0, -1), present: previous, future: [prev.present, ...prev.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      return { past: [...prev.past, prev.present], present: next, future: prev.future.slice(1) };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [resCat, resTags, resGlobal] = await Promise.all([fetch("/api/categories"), fetch("/api/tags"), fetch("/api/settings")]);
        if (resCat.ok) setCategories(await resCat.json());
        if (resTags.ok) setTags(await resTags.json());
        const globalData = resGlobal.ok ? await resGlobal.json() : {};
        const themeId = globalData.activeTheme || "classic";
        setActiveTheme(themeId);
        setAccentColor(globalData.accentColor || "#f59e0b");
        setBackgroundColor(globalData.backgroundColor || "#ffffff");

        const resBlocks = await fetch(`/api/homepage?location=footer&themeId=${encodeURIComponent(themeId)}`);
        const blocksData = resBlocks.ok ? await resBlocks.json() : [];
        const normalized = Array.isArray(blocksData) && blocksData.length > 0 ? (blocksData as Block[]) : DEFAULT_FOOTER_BLOCKS;
        setBlocks(normalized);
      } catch (e: any) {
        setBlocks(DEFAULT_FOOTER_BLOCKS);
        setToast({ message: e?.message || "Gagal memuat Footer Builder", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [setBlocks]);

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const payload = normalizeBlocksForApi(blocks);
      const res = await fetch(`/api/homepage?location=footer&themeId=${encodeURIComponent(activeTheme)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload, location: "footer", themeId: activeTheme }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menyimpan footer");
      }
      setToast({ message: "Footer disimpan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menyimpan footer", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [activeTheme, blocks]);

  const resetAllSettings = useCallback(() => {
    setBlocksWithHistory(DEFAULT_FOOTER_BLOCKS);
    setToast({ message: "Footer direset ke default", type: "success" });
  }, [setBlocksWithHistory]);

  const getChildren = useCallback((block: Block) => {
    const children = (block.config as any)?.children;
    return Array.isArray(children) ? (children as Block[]) : [];
  }, []);

  const withChildren = useCallback((block: Block, children: Block[]) => {
    return { ...block, config: { ...(block.config || {}), children } };
  }, []);

  const getLayoutConfig = useCallback((block: Block) => {
    const layout = (block.config as any)?.layout;
    return typeof layout === "string" && layout.trim() !== "" ? layout : "100";
  }, []);

  const getLayoutColumnCount = useCallback((layout: string) => {
    if (layout === "100") return 1;
    return layout.split("-").length;
  }, []);

  const getColumnIndex = useCallback((block: Block) => {
    const raw = (block.config as any)?.columnIndex;
    return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
  }, []);

  const createChildBlock = useCallback((type: string, title: string, columnIndex: number, order: number): Block => {
    const baseConfig: Record<string, any> = { columnIndex, textAlign: "left" };
    const normalizedType = String(type || "");
    const config =
      normalizedType === "footer_copyright"
        ? { ...baseConfig, textAlign: "center" }
        : normalizedType === "footer_social"
        ? {
            ...baseConfig,
            facebook: "",
            twitter: "",
            instagram: "",
            youtube: "",
            linkedin: "",
          }
        : normalizedType === "footer_categories"
        ? { ...baseConfig, limit: 10 }
        : normalizedType === "footer_custom_links"
        ? { ...baseConfig, links: [] }
        : baseConfig;
    return {
      id: `${type}_${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      order,
      isVisible: true,
      config,
    };
  }, []);

  const deepCloneBlock = useCallback((block: Block): Block => {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
    const newId = block.type === "section" ? `section_${suffix}` : `child_${block.type}_${suffix}`;
    const cloned: Block = {
      ...block,
      id: newId,
      title: typeof block.title === "string" && block.title.trim() !== "" ? `${block.title} (Copy)` : block.title,
      config: { ...(block.config || {}) },
    };

    const children = getChildren(block);
    if (children.length > 0) {
      cloned.config = { ...(cloned.config || {}), children: children.map(deepCloneBlock) };
    }
    return cloned;
  }, [getChildren]);

  const updateBlockRecursive = useCallback((
    currentBlocks: Block[],
    targetId: string,
    updateFn: (block: Block) => Block
  ): { found: boolean; newBlocks: Block[] } => {
    const nextBlocks = [...currentBlocks];
    for (let i = 0; i < nextBlocks.length; i++) {
      const block = nextBlocks[i];
      if (block.id === targetId) {
        nextBlocks[i] = updateFn(block);
        return { found: true, newBlocks: nextBlocks };
      }
      const children = getChildren(block);
      if (children.length > 0) {
        const result = updateBlockRecursive(children, targetId, updateFn);
        if (result.found) {
          nextBlocks[i] = withChildren(block, result.newBlocks);
          return { found: true, newBlocks: nextBlocks };
        }
      }
    }
    return { found: false, newBlocks: currentBlocks };
  }, [getChildren, withChildren]);

  const deleteBlockRecursive = useCallback((currentBlocks: Block[], targetId: string): { found: boolean; newBlocks: Block[] } => {
    const filtered = currentBlocks.filter((b) => b.id !== targetId);
    if (filtered.length !== currentBlocks.length) return { found: true, newBlocks: filtered };

    const nextBlocks = [...currentBlocks];
    for (let i = 0; i < nextBlocks.length; i++) {
      const block = nextBlocks[i];
      const children = getChildren(block);
      if (children.length > 0) {
        const result = deleteBlockRecursive(children, targetId);
        if (result.found) {
          nextBlocks[i] = withChildren(block, result.newBlocks);
          return { found: true, newBlocks: nextBlocks };
        }
      }
    }
    return { found: false, newBlocks: currentBlocks };
  }, [getChildren, withChildren]);

  const deleteBlockById = useCallback((blockId: string) => {
    if (!confirm("Yakin ingin menghapus blok ini?")) return;
    setBlocksWithHistory((prev) => {
      const { newBlocks } = deleteBlockRecursive(prev, blockId);
      return newBlocks;
    });
  }, [deleteBlockRecursive, setBlocksWithHistory]);

  const updateBlockConfigById = useCallback((blockId: string, key: string, value: ConfigValue) => {
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, blockId, (block) => ({
        ...block,
        config: { ...(block.config || {}), [key]: value },
      }));
      return found ? newBlocks : prev;
    });
  }, [setBlocksWithHistory, updateBlockRecursive]);

  const findParentIdRecursive = useCallback((currentBlocks: Block[], targetId: string): string | null => {
    for (const b of currentBlocks) {
      const children = getChildren(b);
      if (children.some((c) => c.id === targetId)) return b.id;
      if (children.length > 0) {
        const foundInChild = findParentIdRecursive(children, targetId);
        if (foundInChild) return foundInChild;
      }
    }
    return null;
  }, [getChildren]);

  const addChildBlockById = useCallback((parentId: string, type: string, title: string, columnIndex: number) => {
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const children = getChildren(parent);
        const newChild = createChildBlock(type, title, columnIndex, children.length + 1);
        return withChildren(parent, [...children, newChild]);
      });
      return found ? newBlocks : prev;
    });
  }, [createChildBlock, getChildren, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const moveChildBlockById = useCallback((parentId: string, childId: string, direction: "up" | "down") => {
    setBlocksWithHistory((prev) => {
      const rootParentIndex = prev.findIndex((b) => b.id === parentId);
      const isRootSectionMove = rootParentIndex !== -1 && prev[rootParentIndex]?.type === "section";

      if (!isRootSectionMove) {
        const findBlock = (currentBlocks: Block[], targetId: string): Block | null => {
          for (const b of currentBlocks) {
            if (b.id === targetId) return b;
            const children = getChildren(b);
            if (children.length > 0) {
              const foundChild = findBlock(children, targetId);
              if (foundChild) return foundChild;
            }
          }
          return null;
        };

        const parentBlock = findBlock(prev, parentId);
        if (!parentBlock) return prev;

        const existingChildren = getChildren(parentBlock);
        if (existingChildren.length === 0) return prev;
        const children = [...existingChildren];
        const index = children.findIndex((c) => c.id === childId);
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

            const { found, newBlocks } = updateBlockRecursive(prev, parentId, () => updatedParent);
            return found ? newBlocks : prev;
          }

          const swapA = sameColIndices[pos];
          const swapB = sameColIndices[targetPos];
          [children[swapA], children[swapB]] = [children[swapB], children[swapA]];
          const updatedParent = withChildren(parentBlock, children);
          const { found, newBlocks } = updateBlockRecursive(prev, parentId, () => updatedParent);
          return found ? newBlocks : prev;
        }

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

      const sameColIndices = sourceChildren
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => getColumnIndex(c) === sourceColumnIndex)
        .map(({ i }) => i);
      const pos = sameColIndices.indexOf(sourceIndex);
      const targetPos = direction === "up" ? pos - 1 : pos + 1;

      if (targetPos >= 0 && targetPos < sameColIndices.length) {
        const swapIndex = sameColIndices[targetPos];
        const sibling = sourceChildren[swapIndex];

        if (sibling?.type === "section") {
          const targetLayout = getLayoutConfig(sibling);
          const targetMaxCols = getLayoutColumnCount(targetLayout);
          const clampedColumnIndex = Math.max(0, Math.min(sourceColumnIndex, Math.max(1, targetMaxCols) - 1));
          const movedChild =
            clampedColumnIndex === sourceColumnIndex
              ? moving
              : { ...moving, config: { ...(moving.config || {}), columnIndex: clampedColumnIndex } };

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

          const nextSourceChildren = sourceChildren
            .filter((c) => c.id !== childId)
            .map((c) => (c.id === updatedTargetSection.id ? updatedTargetSection : c));

          next[rootParentIndex] = withChildren(sourceSection, nextSourceChildren);
          return next;
        }

        const swapA = sameColIndices[pos];
        const swapB = sameColIndices[targetPos];
        [sourceChildren[swapA], sourceChildren[swapB]] = [sourceChildren[swapB], sourceChildren[swapA]];
        next[rootParentIndex] = withChildren(sourceSection, sourceChildren);
        return next;
      }

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
  }, [findParentIdRecursive, getChildren, getColumnIndex, getLayoutColumnCount, getLayoutConfig, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const moveChildBlockColumnById = useCallback((parentId: string, childId: string, direction: "left" | "right") => {
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const existingChildren = getChildren(parent);
        if (existingChildren.length === 0) return parent;
        const children = [...existingChildren];
        const index = children.findIndex((c) => c.id === childId);
        if (index === -1) return parent;

        const child = children[index];
        const currentColumnIndex = getColumnIndex(child);
        const layout = getLayoutConfig(parent);
        const maxColumns = getLayoutColumnCount(layout);

        let newColumnIndex = currentColumnIndex;
        if (direction === "left") newColumnIndex = Math.max(0, currentColumnIndex - 1);
        else newColumnIndex = Math.min(maxColumns - 1, currentColumnIndex + 1);

        if (newColumnIndex === currentColumnIndex) return parent;
        children[index] = { ...child, config: { ...(child.config || {}), columnIndex: newColumnIndex } };
        return withChildren(parent, children);
      });
      return found ? newBlocks : prev;
    });
  }, [getChildren, getColumnIndex, getLayoutColumnCount, getLayoutConfig, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const deleteChildBlockById = useCallback((parentId: string, childId: string) => {
    if (!confirm("Hapus widget ini?")) return;
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const existingChildren = getChildren(parent);
        if (existingChildren.length === 0) return parent;
        return withChildren(parent, existingChildren.filter((c) => c.id !== childId));
      });
      return found ? newBlocks : prev;
    });
  }, [getChildren, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const duplicateChildBlockById = useCallback((parentId: string, childId: string) => {
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const existingChildren = getChildren(parent);
        if (existingChildren.length === 0) return parent;
        const children = [...existingChildren];
        const index = children.findIndex((c) => c.id === childId);
        if (index === -1) return parent;
        const clonedChild = deepCloneBlock(children[index]);
        children.splice(index + 1, 0, clonedChild);
        return withChildren(parent, children);
      });
      return found ? newBlocks : prev;
    });
  }, [deepCloneBlock, getChildren, setBlocksWithHistory, updateBlockRecursive, withChildren]);

  const updateBlockConfig = useCallback((index: number, key: string, value: ConfigValue) => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const block = next[index];
      if (!block) return prev;
      next[index] = { ...block, config: { ...(block.config || {}), [key]: value } };
      return next;
    });
  }, [setBlocksWithHistory]);

  const deleteBlock = useCallback((index: number) => {
    if (!confirm("Yakin ingin menghapus blok ini?")) return;
    setBlocksWithHistory((prev) => prev.filter((_, i) => i !== index));
  }, [setBlocksWithHistory]);

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, [setBlocksWithHistory]);

  const duplicateBlock = useCallback((index: number) => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const blockToClone = next[index];
      if (!blockToClone) return prev;
      const clonedBlock = deepCloneBlock(blockToClone);
      next.splice(index + 1, 0, clonedBlock);
      return next;
    });
  }, [deepCloneBlock, setBlocksWithHistory]);

  const addSectionBlock = useCallback((layoutType: string) => {
    const id = `section_footer_${Date.now()}`;
    const newBlock: Block = {
      id,
      type: "section",
      title: "Footer Section",
      order: blocks.length + 1,
      isVisible: true,
      placement: "main",
      config: { layout: layoutType, children: [] },
    };
    setBlocksWithHistory((prev) => [...prev, newBlock]);
  }, [blocks.length, setBlocksWithHistory]);

  const addChildBlock = useCallback((parentIndex: number, type: string, title: string, columnIndex: number) => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const children = getChildren(parent);
      const child = createChildBlock(type, title, columnIndex, children.length + 1);
      next[parentIndex] = withChildren(parent, [...children, child]);
      return next;
    });
  }, [createChildBlock, getChildren, setBlocksWithHistory, withChildren]);

  const moveChildBlock = useCallback((parentIndex: number, childId: string, direction: "up" | "down") => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const existingChildren = getChildren(parent);
      if (existingChildren.length === 0) return prev;
      const children = [...existingChildren];
      const index = children.findIndex((c) => c.id === childId);
      if (index === -1) return prev;

      const currentColumnIndex = getColumnIndex(children[index]);
      const sameColIndices = children
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => getColumnIndex(c) === currentColumnIndex)
        .map(({ i }) => i);
      const pos = sameColIndices.indexOf(index);
      const targetPos = direction === "up" ? pos - 1 : pos + 1;
      if (targetPos < 0 || targetPos >= sameColIndices.length) return prev;
      const swapA = sameColIndices[pos];
      const swapB = sameColIndices[targetPos];
      [children[swapA], children[swapB]] = [children[swapB], children[swapA]];

      next[parentIndex] = withChildren(parent, children);
      return next;
    });
  }, [getChildren, getColumnIndex, setBlocksWithHistory, withChildren]);

  const deleteChildBlock = useCallback((parentIndex: number, childId: string) => {
    if (!confirm("Hapus widget ini?")) return;
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const children = getChildren(parent).filter((c) => c.id !== childId);
      next[parentIndex] = withChildren(parent, children);
      return next;
    });
  }, [getChildren, setBlocksWithHistory, withChildren]);

  const findBlockRecursive = useCallback((currentBlocks: Block[], targetId: string): Block | null => {
    for (const b of currentBlocks) {
      if (b.id === targetId) return b;
      const children = getChildren(b);
      if (children.length > 0) {
        const found = findBlockRecursive(children, targetId);
        if (found) return found;
      }
    }
    return null;
  }, [getChildren]);

  const getEditingChildBlock = useCallback(() => {
    if (!editingChild) return null;
    return findBlockRecursive(blocks, editingChild.childId);
  }, [editingChild, blocks, findBlockRecursive]);

  const getEditingSectionBlock = useCallback(() => {
    if (!editingSectionId) return null;
    return findBlockRecursive(blocks, editingSectionId);
  }, [editingSectionId, blocks, findBlockRecursive]);

  const getResponsiveKey = useCallback((baseKey: string) => {
    if (activeDeviceTab === "desktop") return baseKey;
    if (activeDeviceTab === "tablet") return `tablet${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
    return `mobile${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
  }, [activeDeviceTab]);

  const getConfigValue = useCallback((child: Block, baseKey: string) => {
    const config = child.config || {};
    const key = getResponsiveKey(baseKey);
    if (key === baseKey) return (config as any)[baseKey];
    const override = (config as any)[key];
    return override !== undefined ? override : (config as any)[baseKey];
  }, [getResponsiveKey]);

  const updateChildConfig = useCallback((key: string, value: ConfigValue) => {
    if (!editingChild) return;
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, editingChild.childId, (block) => ({
        ...block,
        config: { ...(block.config || {}), [key]: value },
      }));
      return found ? newBlocks : prev;
    });
  }, [editingChild, setBlocksWithHistory, updateBlockRecursive]);

  const updateChildResponsiveConfig = useCallback((key: string, value: ConfigValue) => {
    updateChildConfig(getResponsiveKey(key), value);
  }, [getResponsiveKey, updateChildConfig]);

  const updateSectionConfig = useCallback((key: string, value: ConfigValue) => {
    if (!editingSectionId) return;
    updateBlockConfigById(editingSectionId, key, value);
  }, [editingSectionId, updateBlockConfigById]);

  const getSectionResponsiveKey = useCallback((baseKey: string) => {
    if (activeSectionDeviceTab === "desktop") return baseKey;
    if (activeSectionDeviceTab === "tablet") return `tablet${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
    return `mobile${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)}`;
  }, [activeSectionDeviceTab]);

  const updateSectionResponsiveConfig = useCallback((key: string, value: ConfigValue) => {
    if (!editingSectionId) return;
    updateBlockConfigById(editingSectionId, getSectionResponsiveKey(key), value);
  }, [editingSectionId, getSectionResponsiveKey, updateBlockConfigById]);

  const getSectionConfigValue = useCallback((key: string) => {
    const section = editingSectionId ? findBlockRecursive(blocks, editingSectionId) : null;
    if (!section) return undefined;
    const config = section.config || {};
    const responsiveKey = getSectionResponsiveKey(key);
    if (responsiveKey === key) return (config as any)[key];
    const override = (config as any)[responsiveKey];
    return override !== undefined ? override : (config as any)[key];
  }, [blocks, editingSectionId, findBlockRecursive, getSectionResponsiveKey]);

  const onUpdateTitle = useCallback((newTitle: string) => {
    if (!editingChild) return;
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, editingChild.childId, (block) => ({ ...block, title: newTitle }));
      return found ? newBlocks : prev;
    });
  }, [editingChild, setBlocksWithHistory, updateBlockRecursive]);

  return {
    state: {
      loading,
      toast,
      showSectionPicker,
      blocks,
      categories,
      tags,
      activeTheme,
      accentColor,
      backgroundColor,
      activeDeviceTab,
      editingChild,
      activeEditTab,
      editingSectionId,
      activeSectionTab,
      activeSectionDeviceTab,
    },
    actions: {
      setShowSectionPicker,
      setActiveDeviceTab,
      setEditingChild,
      setActiveEditTab,
      setEditingSectionId,
      setActiveSectionTab,
      setActiveSectionDeviceTab,

      addSectionBlock,
      updateBlockConfig,
      deleteBlock,
      moveBlock,
      duplicateBlock,
      moveChildBlock,
      deleteChildBlock,
      addChildBlock,

      handleSave,
      resetAllSettings,
      undo,
      redo,
      canUndo,
      canRedo,

      getEditingChildBlock,
      getEditingSectionBlock,
      updateChildConfig,
      updateChildResponsiveConfig,
      getConfigValue,
      updateSectionConfig,
      updateSectionResponsiveConfig,
      getSectionConfigValue,
      onUpdateTitle,

      deleteBlockById,
      updateBlockConfigById,
      addChildBlockById,
      moveChildBlockById,
      moveChildBlockColumnById,
      deleteChildBlockById,
      duplicateChildBlockById,
    },
  };
}
