"use client";

import { useCallback, useEffect, useState } from "react";
import { Block, Category, Tag } from "../../homepage/types";
import { ConfigValue } from "@/lib/page-builder-config";

const DEFAULT_HEADER_BLOCKS: Block[] = [
  {
    id: "section_header_desktop",
    type: "section",
    title: "Header Desktop",
    order: 1,
    isVisible: true,
    placement: "main",
    config: {
      layout: "33-33-33",
      children: [
        { id: "header_logo_1", type: "header_logo", title: "Logo", order: 1, isVisible: true, config: { columnIndex: 0 } },
        { id: "header_menu_primary_1", type: "header_menu_primary", title: "Menu Primary", order: 2, isVisible: true, config: { columnIndex: 1 } },
        { id: "header_theme_toggle_1", type: "header_theme_toggle", title: "Theme Toggle", order: 3, isVisible: true, config: { columnIndex: 2 } },
        { id: "header_search_1", type: "header_search", title: "Search", order: 4, isVisible: true, config: { columnIndex: 2 } },
        { id: "header_login_1", type: "header_login", title: "Tombol Masuk", order: 5, isVisible: true, config: { columnIndex: 2 } },
      ],
      hideOnMobile: true,
    },
  },
  {
    id: "section_header_mobile",
    type: "section",
    title: "Header Mobile",
    order: 2,
    isVisible: true,
    placement: "main",
    config: {
      layout: "66-33",
      children: [
        { id: "header_mobile_toggle_1", type: "header_mobile_menu_toggle", title: "Tombol Menu", order: 1, isVisible: true, config: { columnIndex: 0 } },
        { id: "header_logo_2", type: "header_logo", title: "Logo", order: 2, isVisible: true, config: { columnIndex: 0 } },
        { id: "header_search_2", type: "header_search", title: "Search", order: 3, isVisible: true, config: { columnIndex: 1 } },
      ],
      hideOnDesktop: true,
      hideOnTablet: true,
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

export function useHeaderBuilder() {
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [history, setHistory] = useState<{ past: Block[][]; present: Block[]; future: Block[][] }>({ past: [], present: [], future: [] });
  const blocks = history.present;

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [activeTheme, setActiveTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [homeContainerWidth, _setHomeContainerWidth] = useState("boxed");
  const [homeCustomContainerWidth, _setHomeCustomContainerWidth] = useState("1200");

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
        const [resCat, resTags, resGlobal] = await Promise.all([fetch("/api/categories"), fetch("/api/tags"), fetch("/api/admin/settings")]);
        if (resCat.ok) setCategories(await resCat.json());
        if (resTags.ok) setTags(await resTags.json());
        const globalData = resGlobal.ok ? await resGlobal.json() : {};
        const themeId = globalData.activeTheme || "classic";
        setActiveTheme(themeId);
        setAccentColor(globalData.accentColor || "#f59e0b");
        setBackgroundColor(globalData.backgroundColor || "#ffffff");

        const resBlocks = await fetch(`/api/homepage?location=header&themeId=${encodeURIComponent(themeId)}`);
        const blocksData = resBlocks.ok ? await resBlocks.json() : [];
        const normalized = Array.isArray(blocksData) && blocksData.length > 0 ? (blocksData as Block[]) : DEFAULT_HEADER_BLOCKS;
        setBlocks(normalized);
      } catch (e: any) {
        setBlocks(DEFAULT_HEADER_BLOCKS);
        setToast({ message: e?.message || "Gagal memuat Header Builder", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [setBlocks]);

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const payload = normalizeBlocksForApi(blocks);
      const res = await fetch(`/api/homepage?location=header&themeId=${encodeURIComponent(activeTheme)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload, location: "header", themeId: activeTheme }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menyimpan header");
      }
      setToast({ message: "Header disimpan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menyimpan header", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [activeTheme, blocks]);

  const resetAllSettings = useCallback(() => {
    setBlocksWithHistory(DEFAULT_HEADER_BLOCKS);
    setToast({ message: "Header direset ke default", type: "success" });
  }, [setBlocksWithHistory]);

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

  const getChildren = useCallback((block: Block) => {
    const children = (block.config as any)?.children;
    return Array.isArray(children) ? (children as Block[]) : [];
  }, []);

  const setChildren = useCallback((block: Block, children: Block[]) => {
    return { ...block, config: { ...(block.config || {}), children } };
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
      cloned.config = {
        ...(cloned.config || {}),
        children: children.map(deepCloneBlock),
      };
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
          nextBlocks[i] = setChildren(block, result.newBlocks);
          return { found: true, newBlocks: nextBlocks };
        }
      }
    }
    return { found: false, newBlocks: currentBlocks };
  }, [getChildren, setChildren]);

  const duplicateChildBlockById = useCallback((parentId: string, childId: string) => {
    setBlocksWithHistory((prev) => {
      const { found, newBlocks } = updateBlockRecursive(prev, parentId, (parent) => {
        const children = getChildren(parent);
        const index = children.findIndex((c) => c.id === childId);
        if (index === -1) return parent;
        const clonedChild = deepCloneBlock(children[index]);
        const nextChildren = [...children];
        nextChildren.splice(index + 1, 0, clonedChild);
        return setChildren(parent, nextChildren);
      });
      return found ? newBlocks : prev;
    });
  }, [deepCloneBlock, getChildren, setBlocksWithHistory, setChildren, updateBlockRecursive]);

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
    const id = `section_header_${Date.now()}`;
    const newBlock: Block = {
      id,
      type: "section",
      title: "Header Section",
      order: blocks.length + 1,
      isVisible: true,
      placement: "main",
      config: { layout: layoutType, children: [] },
    };
    setBlocksWithHistory((prev) => [...prev, newBlock]);
  }, [blocks.length, setBlocksWithHistory]);

  const moveChildBlock = useCallback((parentIndex: number, childId: string, direction: "up" | "down") => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const children = [...getChildren(parent)];
      const idx = children.findIndex((c) => c.id === childId);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= children.length) return prev;
      [children[idx], children[target]] = [children[target], children[idx]];
      next[parentIndex] = setChildren(parent, children);
      return next;
    });
  }, [getChildren, setBlocksWithHistory, setChildren]);

  const deleteChildBlock = useCallback((parentIndex: number, childId: string) => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const children = getChildren(parent).filter((c) => c.id !== childId);
      next[parentIndex] = setChildren(parent, children);
      return next;
    });
  }, [getChildren, setBlocksWithHistory, setChildren]);

  const addChildBlock = useCallback((parentIndex: number, type: string, title: string, columnIndex: number) => {
    setBlocksWithHistory((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      if (!parent) return prev;
      const children = [...getChildren(parent)];
      const baseConfig: Record<string, ConfigValue> = { columnIndex };
      if (type === "ad_banner") {
        baseConfig.position = "HEADER";
        baseConfig.showTitle = false;
        baseConfig.useBox = false;
      }
      const child: Block = {
        id: `${type}_${Date.now()}`,
        type,
        title,
        order: children.length + 1,
        isVisible: true,
        config: baseConfig,
      };
      children.push(child);
      next[parentIndex] = setChildren(parent, children);
      return next;
    });
  }, [getChildren, setBlocksWithHistory, setChildren]);

  const getEditingChildBlock = useCallback(() => {
    if (!editingChild) return null;
    const parent = blocks[editingChild.parentIndex];
    if (!parent) return null;
    const child = getChildren(parent).find((c) => c.id === editingChild.childId);
    return child || null;
  }, [blocks, editingChild, getChildren]);

  const cap = useCallback((value: string) => value.charAt(0).toUpperCase() + value.slice(1), []);

  const updateChildConfig = useCallback((key: string, value: ConfigValue) => {
    if (!editingChild) return;
    const childId = editingChild.childId;
    const updateOne = (block: Block): Block => {
      if (block.id === childId) {
        return { ...block, config: { ...(block.config || {}), [key]: value } };
      }
      if (block.type !== "section") return block;
      const cfg: any = block.config || {};
      const children = Array.isArray(cfg.children) ? (cfg.children as Block[]) : null;
      if (!children) return block;
      return { ...block, config: { ...cfg, children: children.map(updateOne) } };
    };
    setBlocksWithHistory((prev) => prev.map(updateOne));
  }, [editingChild, setBlocksWithHistory]);

  const updateChildResponsiveConfig = useCallback((key: string, value: ConfigValue) => {
    const responsiveKey = activeDeviceTab === "desktop" ? key : `${activeDeviceTab}${cap(key)}`;
    updateChildConfig(responsiveKey, value);
  }, [activeDeviceTab, cap, updateChildConfig]);

  const getConfigValue = useCallback((child: Block, key: string) => {
    const config: any = child.config || {};
    if (activeDeviceTab === "tablet") {
      const tabletKey = `tablet${cap(key)}`;
      return config[tabletKey] !== undefined ? config[tabletKey] : config[key];
    }
    if (activeDeviceTab === "mobile") {
      const mobileKey = `mobile${cap(key)}`;
      return config[mobileKey] !== undefined ? config[mobileKey] : config[key];
    }
    return config[key];
  }, [activeDeviceTab, cap]);

  const onUpdateTitle = useCallback((newTitle: string) => {
    if (!editingChild) return;
    const childId = editingChild.childId;
    const updateOne = (block: Block): Block => {
      if (block.id === childId) return { ...block, title: newTitle };
      if (block.type !== "section") return block;
      const cfg: any = block.config || {};
      const children = Array.isArray(cfg.children) ? (cfg.children as Block[]) : null;
      if (!children) return block;
      return { ...block, config: { ...cfg, children: children.map(updateOne) } };
    };
    setBlocksWithHistory((prev) => prev.map(updateOne));
  }, [editingChild, setBlocksWithHistory]);

  const getEditingSectionBlock = useCallback(() => {
    if (!editingSectionId) return null;
    return blocks.find((b) => b.id === editingSectionId) || null;
  }, [blocks, editingSectionId]);

  const updateSectionConfig = useCallback((key: string, value: ConfigValue) => {
    if (!editingSectionId) return;
    setBlocksWithHistory((prev) =>
      prev.map((b) => (b.id === editingSectionId ? { ...b, config: { ...(b.config || {}), [key]: value } } : b))
    );
  }, [editingSectionId, setBlocksWithHistory]);

  const getSectionResponsiveKey = useCallback((baseKey: string) => {
    if (activeSectionDeviceTab === "desktop") return baseKey;
    return `${activeSectionDeviceTab}${cap(baseKey)}`;
  }, [activeSectionDeviceTab, cap]);

  const updateSectionResponsiveConfig = useCallback((key: string, value: ConfigValue) => {
    updateSectionConfig(getSectionResponsiveKey(key), value);
  }, [getSectionResponsiveKey, updateSectionConfig]);

  const getSectionConfigValue = useCallback((key: string) => {
    const section = blocks.find((b) => b.id === editingSectionId);
    const cfg: any = section?.config || {};
    if (activeSectionDeviceTab === "tablet") {
      const tabletKey = `tablet${cap(key)}`;
      return cfg[tabletKey] !== undefined ? cfg[tabletKey] : cfg[key];
    }
    if (activeSectionDeviceTab === "mobile") {
      const mobileKey = `mobile${cap(key)}`;
      const tabletKey = `tablet${cap(key)}`;
      if (cfg[mobileKey] !== undefined) return cfg[mobileKey];
      if (cfg[tabletKey] !== undefined) return cfg[tabletKey];
      return cfg[key];
    }
    return cfg[key];
  }, [activeSectionDeviceTab, blocks, cap, editingSectionId]);

  const updateBlockConfigById = useCallback((blockId: string, key: string, value: ConfigValue) => {
    const updateOne = (block: Block): Block => {
      if (block.id === blockId) {
        return { ...block, config: { ...(block.config || {}), [key]: value } };
      }
      if (block.type === "section") {
        const cfg: any = block.config || {};
        const children = Array.isArray(cfg.children) ? (cfg.children as Block[]) : null;
        if (!children) return block;
        const nextChildren = children.map(updateOne);
        return { ...block, config: { ...cfg, children: nextChildren } };
      }
      return block;
    };
    setBlocksWithHistory((prev) => prev.map(updateOne));
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
      accentColor,
      backgroundColor,
      homeContainerWidth,
      homeCustomContainerWidth,
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
      setActiveDeviceTab,
      setEditingChild,
      setActiveEditTab,
      setEditingSectionId,
      setActiveSectionTab,
      setActiveSectionDeviceTab,
      undo,
      redo,
      canUndo,
      canRedo,
      resetAllSettings,
      handleSave,
      updateBlockConfig,
      deleteBlock,
      moveBlock,
      addSectionBlock,
      moveChildBlock,
      deleteChildBlock,
      addChildBlock,
      getEditingChildBlock,
      updateChildConfig,
      updateChildResponsiveConfig,
      getConfigValue,
      onUpdateTitle,
      getEditingSectionBlock,
      updateSectionConfig,
      updateSectionResponsiveConfig,
      getSectionConfigValue,
      updateBlockConfigById,
      duplicateChildBlockById,
      duplicateBlock,
    },
  };
}
