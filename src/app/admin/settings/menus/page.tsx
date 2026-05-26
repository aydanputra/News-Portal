"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Save, Trash2, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, ExternalLink, GripVertical } from "lucide-react";

type MenuSummary = { id: string; name: string; _count?: { items: number } };
type MenuLocation = "PRIMARY" | "SECONDARY" | "FOOTER" | "MOBILE";
type MenuItemType = "CUSTOM" | "CATEGORY" | "TAG" | "PAGE";

type MenuItem = {
  id: string;
  menuId: string;
  parentId: string | null;
  type: MenuItemType;
  label: string;
  customUrl?: string | null;
  openInNewTab: boolean;
  order: number;
  category?: { id: string; name: string; slug: string } | null;
  tag?: { id: string; name: string; slug: string } | null;
  page?: { id: string; title: string; slug: string; published: boolean } | null;
};

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };
type Page = { id: string; title: string; slug: string; published: boolean };

type FlatRow = { item: MenuItem; depth: number };

const LOCATION_LABEL: Record<MenuLocation, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  FOOTER: "Footer",
  MOBILE: "Mobile",
};

const MAX_DEPTH = 3;
const INDENT_STEP = 28;
const DND_BASE_X = 60;

const clampInt = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.trunc(value)));

function buildChildrenMap(items: MenuItem[]) {
  const map = new Map<string | null, MenuItem[]>();
  for (const item of items) {
    const key = item.parentId ?? null;
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  }
  for (const [key, arr] of map) {
    arr.sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));
    map.set(key, arr);
  }
  return map;
}

function flattenPreorder(items: MenuItem[], depthLimit = 100) {
  const childrenMap = buildChildrenMap(items);
  const out: FlatRow[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = childrenMap.get(parentId) || [];
    for (const child of children) {
      out.push({ item: child, depth });
      if (depth + 1 < depthLimit) walk(child.id, depth + 1);
    }
  };

  walk(null, 0);
  return out;
}

function computeDepthMap(items: MenuItem[]) {
  const parentMap = new Map<string, string | null>();
  for (const item of items) parentMap.set(item.id, item.parentId ?? null);
  const depthCache = new Map<string, number>();
  const getDepth = (id: string): number => {
    const cached = depthCache.get(id);
    if (cached !== undefined) return cached;
    const parentId = parentMap.get(id) || null;
    const d = parentId ? getDepth(parentId) + 1 : 0;
    depthCache.set(id, d);
    return d;
  };
  for (const item of items) getDepth(item.id);
  return depthCache;
}

function normalizeSiblingOrders(items: MenuItem[]) {
  const childrenMap = buildChildrenMap(items);
  const updates = new Map<string, number>();
  for (const [, arr] of childrenMap) {
    arr.sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));
    arr.forEach((item, idx) => updates.set(item.id, idx + 1));
  }
  return items.map((it) => (updates.has(it.id) ? { ...it, order: updates.get(it.id)! } : it));
}

function sanitizeTree(items: MenuItem[]) {
  const byId = new Map(items.map((it) => [it.id, it] as const));

  const withoutMissingOrCycles = items.map((it) => {
    let parentId = it.parentId ?? null;
    if (parentId && !byId.has(parentId)) parentId = null;

    if (parentId) {
      const seen = new Set<string>([it.id]);
      let p: string | null = parentId;
      while (p) {
        if (seen.has(p)) {
          parentId = null;
          break;
        }
        seen.add(p);
        const parent = byId.get(p);
        if (!parent) {
          parentId = null;
          break;
        }
        p = parent.parentId ?? null;
      }
    }

    if ((it.parentId ?? null) === parentId) return it;
    return { ...it, parentId };
  });

  const byId2 = new Map(withoutMissingOrCycles.map((it) => [it.id, it] as const));
  const depthCache = new Map<string, number>();
  const getDepth = (id: string): number => {
    const cached = depthCache.get(id);
    if (cached !== undefined) return cached;
    const it = byId2.get(id);
    if (!it || !it.parentId) {
      depthCache.set(id, 0);
      return 0;
    }
    const d = getDepth(it.parentId) + 1;
    depthCache.set(id, d);
    return d;
  };

  return withoutMissingOrCycles.map((it) => {
    const maxDepth = MAX_DEPTH - 1;
    const depth = getDepth(it.id);
    if (depth <= maxDepth) return it;

    let parentId = it.parentId ?? null;
    while (parentId) {
      const parent = byId2.get(parentId);
      if (!parent) {
        parentId = null;
        break;
      }
      const parentDepth = getDepth(parent.id);
      if (parentDepth + 1 <= maxDepth) break;
      parentId = parent.parentId ?? null;
    }

    if ((it.parentId ?? null) === parentId) return it;
    return { ...it, parentId };
  });
}

function collectDescendantIds(items: MenuItem[], rootId: string) {
  const childrenMap = buildChildrenMap(items);
  const result = new Set<string>();
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    const children = childrenMap.get(id) || [];
    for (const child of children) stack.push(child.id);
  }
  return result;
}

function applyDragDrop(items: MenuItem[], dragRootId: string, dropIndex: number, requestedDepth: number) {
  const dragIds = collectDescendantIds(items, dragRootId);
  const fullFlat = flattenPreorder(items, 100);
  const draggedFlat: FlatRow[] = fullFlat.filter((row) => dragIds.has(row.item.id));
  const withoutFlat: FlatRow[] = fullFlat.filter((row) => !dragIds.has(row.item.id));

  const boundedIndex = clampInt(dropIndex, 0, withoutFlat.length);

  let maxRelativeDepth = 0;
  if (draggedFlat.length > 0) {
    const rootDepth = draggedFlat[0].depth;
    for (const row of draggedFlat) {
      const rel = row.depth - rootDepth;
      if (rel > maxRelativeDepth) maxRelativeDepth = rel;
    }
  }

  const maxValidDepthAtPosition = boundedIndex > 0 ? withoutFlat[boundedIndex - 1].depth + 1 : 0;
  const maxAllowedDepth = Math.max(0, Math.min(MAX_DEPTH - 1 - maxRelativeDepth, maxValidDepthAtPosition));
  const desiredDepth = clampInt(requestedDepth, 0, maxAllowedDepth);

  let newParentId: string | null = null;
  if (desiredDepth > 0) {
    for (let i = boundedIndex - 1; i >= 0; i -= 1) {
      if (withoutFlat[i].depth === desiredDepth - 1) {
        newParentId = withoutFlat[i].item.id;
        break;
      }
    }
  }

  const nextRootDepth = desiredDepth > 0 && !newParentId ? 0 : desiredDepth;
  if (nextRootDepth === 0) newParentId = null;

  const draggedUpdated = draggedFlat.map((row) => {
    if (row.item.id !== dragRootId) return { ...row.item };
    return { ...row.item, parentId: newParentId };
  });

  const merged = [
    ...withoutFlat.slice(0, boundedIndex).map((r) => ({ ...r.item })),
    ...draggedUpdated,
    ...withoutFlat.slice(boundedIndex).map((r) => ({ ...r.item })),
  ];

  const counters = new Map<string | null, number>();
  const withOrders = merged.map((it) => {
    const key = it.parentId ?? null;
    const next = (counters.get(key) || 0) + 1;
    counters.set(key, next);
    return { ...it, order: next };
  });

  return withOrders;
}

export default function AdminMenusPage() {
  const [activeTab, setActiveTab] = useState<"edit" | "locations">("edit");
  const [menus, setMenus] = useState<MenuSummary[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedMenuName, setSelectedMenuName] = useState<string>("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTree, setSavingTree] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pages, setPages] = useState<Page[]>([]);

  const [locations, setLocations] = useState<Record<MenuLocation, string | null>>({
    PRIMARY: null,
    SECONDARY: null,
    FOOTER: null,
    MOBILE: null,
  });
  const [savingLocations, setSavingLocations] = useState(false);

  const [newMenuName, setNewMenuName] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customNewTab, setCustomNewTab] = useState(false);
  const [openPanel, setOpenPanel] = useState<"custom" | "pages" | "categories" | "tags" | null>("custom");

  const listRef = useRef<HTMLDivElement | null>(null);
  const rowElsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 16, y: 16 });
  const rafMoveRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingIds, setDraggingIds] = useState<Set<string>>(new Set());
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [dropDepth, setDropDepth] = useState<number>(0);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);

  const itemsRef = useRef(items);
  const flatRef = useRef<FlatRow[]>([]);
  const depthMapRef = useRef<Map<string, number>>(new Map());
  const withoutFlatRef = useRef<FlatRow[]>([]);
  const draggingIdRef = useRef<string | null>(null);
  const draggingIdsRef = useRef<Set<string>>(new Set());
  const dropIndexRef = useRef<number | null>(null);
  const dropDepthRef = useRef<number>(0);
  const persistTreeRef = useRef<(nextItems: MenuItem[]) => Promise<void>>((async () => {}) as any);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const flat = useMemo(() => flattenPreorder(items), [items]);
  const depthMap = useMemo(() => computeDepthMap(items), [items]);
  const withoutFlat = useMemo(() => (draggingId ? flat.filter((row) => !draggingIds.has(row.item.id)) : flat), [draggingId, draggingIds, flat]);
  const draggingItem = useMemo(() => (draggingId ? items.find((it) => it.id === draggingId) ?? null : null), [draggingId, items]);
  const dragPreview = useMemo(() => {
    if (!draggingId) return { parentId: null as string | null, depth: 0 };
    if (dropIndex === null) return { parentId: null as string | null, depth: clampInt(depthMap.get(draggingId) ?? 0, 0, MAX_DEPTH - 1) };

    const dragIds = draggingIds;
    const fullFlat = flat;
    const draggedFlat = fullFlat.filter((r) => dragIds.has(r.item.id));
    const without = withoutFlat;

    let maxRelativeDepth = 0;
    if (draggedFlat.length > 0) {
      const rootDepth = draggedFlat[0].depth;
      for (const row of draggedFlat) {
        const rel = row.depth - rootDepth;
        if (rel > maxRelativeDepth) maxRelativeDepth = rel;
      }
    }

    const boundedIndex = clampInt(dropIndex, 0, without.length);
    const maxValidDepthAtPosition = boundedIndex > 0 ? without[boundedIndex - 1].depth + 1 : 0;
    const maxAllowedDepth = Math.max(0, Math.min(MAX_DEPTH - 1 - maxRelativeDepth, maxValidDepthAtPosition));
    const desiredDepth = clampInt(dropDepth, 0, maxAllowedDepth);

    let parentId: string | null = null;
    if (desiredDepth > 0) {
      for (let i = boundedIndex - 1; i >= 0; i -= 1) {
        if (without[i].depth === desiredDepth - 1) {
          parentId = without[i].item.id;
          break;
        }
      }
    }

    if (desiredDepth > 0 && !parentId) return { parentId: null as string | null, depth: 0 };
    return { parentId, depth: desiredDepth };
  }, [depthMap, draggingId, draggingIds, dropDepth, dropIndex, flat, withoutFlat]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    flatRef.current = flat;
  }, [flat]);
  useEffect(() => {
    depthMapRef.current = depthMap;
  }, [depthMap]);
  useEffect(() => {
    withoutFlatRef.current = withoutFlat;
  }, [withoutFlat]);
  useEffect(() => {
    draggingIdRef.current = draggingId;
  }, [draggingId]);
  useEffect(() => {
    draggingIdsRef.current = draggingIds;
  }, [draggingIds]);
  useEffect(() => {
    dropIndexRef.current = dropIndex;
  }, [dropIndex]);
  useEffect(() => {
    dropDepthRef.current = dropDepth;
  }, [dropDepth]);

  const fetchMenus = useCallback(async () => {
    const res = await fetch("/api/menus");
    if (!res.ok) throw new Error("Gagal mengambil menu");
    const data = await res.json();
    setMenus(data);
    if (!selectedMenuId && data.length > 0) setSelectedMenuId(data[0].id);
  }, [selectedMenuId]);

  const fetchLookups = useCallback(async () => {
    const [cRes, tRes, pRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/tags"),
      fetch("/api/pages"),
    ]);
    if (cRes.ok) setCategories(await cRes.json());
    if (tRes.ok) setTags(await tRes.json());
    if (pRes.ok) setPages(await pRes.json());
  }, []);

  const fetchLocations = useCallback(async () => {
    const res = await fetch("/api/menu-locations");
    if (!res.ok) return;
    const data = await res.json();
    const next: Record<MenuLocation, string | null> = { PRIMARY: null, SECONDARY: null, FOOTER: null, MOBILE: null };
    for (const row of data as Array<{ location: MenuLocation; menuId: string }>) next[row.location] = row.menuId;
    setLocations(next);
  }, []);

  const fetchSelectedMenu = useCallback(async (id: string) => {
    const res = await fetch(`/api/menus/${id}`);
    if (!res.ok) throw new Error("Gagal mengambil detail menu");
    const data = await res.json();
    setSelectedMenuName(data.name);
    setItems((data.items || []) as MenuItem[]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchMenus(), fetchLookups(), fetchLocations()]);
      } catch (e: any) {
        setToast({ message: e?.message || "Gagal memuat data", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMenus, fetchLookups, fetchLocations]);

  useEffect(() => {
    if (!selectedMenuId) return;
    (async () => {
      try {
        await fetchSelectedMenu(selectedMenuId);
      } catch (e: any) {
        setToast({ message: e?.message || "Gagal memuat menu", type: "error" });
      }
    })();
  }, [selectedMenuId, fetchSelectedMenu]);

  const persistTree = useCallback(async (nextItems: MenuItem[]) => {
    if (!selectedMenuId) return;
    setSavingTree(true);
    try {
      const payload = normalizeSiblingOrders(nextItems).map((it) => ({ id: it.id, parentId: it.parentId ?? null, order: it.order }));
      const res = await fetch(`/api/menus/${selectedMenuId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menyimpan urutan menu");
      }
      setItems(normalizeSiblingOrders(nextItems));
      setToast({ message: "Urutan menu disimpan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menyimpan urutan menu", type: "error" });
    } finally {
      setSavingTree(false);
    }
  }, [selectedMenuId]);
 
  useEffect(() => {
    persistTreeRef.current = persistTree;
  }, [persistTree]);

  const computeDepthFromEvent = useCallback((clientX: number) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const raw = clientX - rect.left - DND_BASE_X;
    const depth = raw <= 0 ? 0 : Math.floor(raw / INDENT_STEP) + 1;
    return clampInt(depth, 0, MAX_DEPTH - 1);
  }, []);

  const startPointerDrag = useCallback((id: string, e: React.PointerEvent) => {
    if (!selectedMenuId) return;
    e.preventDefault();
    e.stopPropagation();

    const baseItems = itemsRef.current;
    const dragIds = collectDescendantIds(baseItems, id);
    setDraggingId(id);
    setDraggingIds(dragIds);

    const baseFlat = flatRef.current.length ? flatRef.current : flattenPreorder(baseItems);
    const sourceFlatIndex = baseFlat.findIndex((r) => r.item.id === id);
    const sourceInsertIndex = sourceFlatIndex <= 0 ? 0 : baseFlat.slice(0, sourceFlatIndex).filter((r) => !dragIds.has(r.item.id)).length;
    setDropIndex(sourceInsertIndex);

    const depth = depthMapRef.current.get(id) ?? 0;
    setDropDepth(depth);

    const rowEl = rowElsRef.current.get(id);
    if (rowEl) {
      const rect = rowEl.getBoundingClientRect();
      dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } else {
      dragOffsetRef.current = { x: 16, y: 16 };
    }

    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setDragPointer({ x: e.clientX, y: e.clientY });
  }, [selectedMenuId]);

  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      if (rafMoveRef.current !== null) return;
      rafMoveRef.current = window.requestAnimationFrame(() => {
        rafMoveRef.current = null;
        const { x, y } = lastPointerRef.current;
        setDragPointer({ x, y });

        const depth = computeDepthFromEvent(x);
        setDropDepth(depth);

        const rows = withoutFlatRef.current;
        let idx = rows.length;
        for (let i = 0; i < rows.length; i++) {
          const id = rows[i].item.id;
          const el = rowElsRef.current.get(id);
          const rect = el?.getBoundingClientRect?.();
          if (!rect) continue;
          const mid = rect.top + rect.height / 2;
          if (y < mid) {
            idx = i;
            break;
          }
        }
        setDropIndex(idx);
      });
    };

    const onUp = async () => {
      const dragId = draggingIdRef.current;
      if (!dragId) return;
      const idx = dropIndexRef.current ?? withoutFlatRef.current.length;
      const depth = dropDepthRef.current;
      const baseItems = itemsRef.current;
      const moved = applyDragDrop(baseItems, dragId, idx, depth);
      const next = normalizeSiblingOrders(sanitizeTree(moved));

      setItems(next);
      setDraggingId(null);
      setDraggingIds(new Set());
      setDropIndex(null);
      setDropDepth(0);
      setDragPointer(null);

      await persistTreeRef.current(next);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true, once: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (rafMoveRef.current !== null) {
        window.cancelAnimationFrame(rafMoveRef.current);
        rafMoveRef.current = null;
      }
    };
  }, [computeDepthFromEvent, draggingId]);

  const createMenu = useCallback(async () => {
    try {
      const name = newMenuName.trim();
      if (!name) return;
      const res = await fetch("/api/menus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal membuat menu");
      }
      setNewMenuName("");
      await fetchMenus();
      const created = await res.json();
      setSelectedMenuId(created.id);
      setToast({ message: "Menu dibuat", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal membuat menu", type: "error" });
    }
  }, [newMenuName, fetchMenus]);

  const renameMenu = useCallback(async () => {
    if (!selectedMenuId) return;
    try {
      const name = selectedMenuName.trim();
      if (!name) return;
      const res = await fetch(`/api/menus/${selectedMenuId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal rename menu");
      }
      await fetchMenus();
      setToast({ message: "Nama menu disimpan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal rename menu", type: "error" });
    }
  }, [selectedMenuId, selectedMenuName, fetchMenus]);

  const deleteMenu = useCallback(async () => {
    if (!selectedMenuId) return;
    const ok = window.confirm("Hapus menu ini? Semua item akan ikut terhapus.");
    if (!ok) return;
    try {
      const res = await fetch(`/api/menus/${selectedMenuId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menghapus menu");
      }
      setSelectedMenuId(null);
      setItems([]);
      setSelectedMenuName("");
      await fetchMenus();
      await fetchLocations();
      setToast({ message: "Menu dihapus", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menghapus menu", type: "error" });
    }
  }, [selectedMenuId, fetchMenus, fetchLocations]);

  const addMenuItem = useCallback(async (payload: any) => {
    if (!selectedMenuId) return;
    try {
      const res = await fetch(`/api/menus/${selectedMenuId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menambah item");
      }
      await fetchSelectedMenu(selectedMenuId);
      setToast({ message: "Item ditambahkan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menambah item", type: "error" });
    }
  }, [selectedMenuId, fetchSelectedMenu]);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      const ok = window.confirm("Hapus item menu ini?");
      if (!ok) return;
      const res = await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menghapus item");
      }
      const childrenMap = buildChildrenMap(items);
      const toDelete = new Set<string>();
      const walk = (itemId: string) => {
        toDelete.add(itemId);
        const children = childrenMap.get(itemId) || [];
        for (const child of children) walk(child.id);
      };
      walk(id);
      const next = items.filter((it) => !toDelete.has(it.id));
      setItems(normalizeSiblingOrders(next));
      setToast({ message: "Item dihapus", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menghapus item", type: "error" });
    }
  }, [items]);

  const updateMenuItem = useCallback(async (id: string, patch: Partial<Pick<MenuItem, "label" | "customUrl" | "openInNewTab">>) => {
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal mengupdate item");
      }
      const updated = await res.json();
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal mengupdate item", type: "error" });
    }
  }, []);

  const moveUpDown = useCallback((id: string, direction: "up" | "down") => {
    const current = items.find((it) => it.id === id);
    if (!current) return;
    const siblings = items
      .filter((it) => (it.parentId ?? null) === (current.parentId ?? null))
      .sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));
    const idx = siblings.findIndex((s) => s.id === id);
    const swapWith = direction === "up" ? siblings[idx - 1] : siblings[idx + 1];
    if (!swapWith) return;
    const next = items.map((it) => {
      if (it.id === current.id) return { ...it, order: swapWith.order };
      if (it.id === swapWith.id) return { ...it, order: current.order };
      return it;
    });
    persistTree(normalizeSiblingOrders(next));
  }, [items, persistTree]);

  const indentItem = useCallback((id: string) => {
    const list = flattenPreorder(items, MAX_DEPTH + 1);
    const idx = list.findIndex((r) => r.item.id === id);
    if (idx <= 0) return;
    const prev = list[idx - 1];
    const prevDepth = prev.depth;
    const nextDepth = prevDepth + 1;
    if (nextDepth >= MAX_DEPTH) {
      setToast({ message: "Maksimal kedalaman submenu 3 level", type: "error" });
      return;
    }
    const maxSiblingOrder = items
      .filter((it) => (it.parentId ?? null) === prev.item.id)
      .reduce((m, it) => Math.max(m, it.order), 0);
    const next = items.map((it) => (it.id === id ? { ...it, parentId: prev.item.id, order: maxSiblingOrder + 1 } : it));
    persistTree(normalizeSiblingOrders(next));
  }, [items, persistTree]);

  const outdentItem = useCallback((id: string) => {
    const current = items.find((it) => it.id === id);
    if (!current || !current.parentId) return;
    const parent = items.find((it) => it.id === current.parentId);
    const newParentId = parent?.parentId ?? null;
    const maxSiblingOrder = items
      .filter((it) => (it.parentId ?? null) === (newParentId ?? null))
      .reduce((m, it) => Math.max(m, it.order), 0);
    const next = items.map((it) => (it.id === id ? { ...it, parentId: newParentId, order: maxSiblingOrder + 1 } : it));
    persistTree(normalizeSiblingOrders(next));
  }, [items, persistTree]);

  const saveLocations = useCallback(async () => {
    try {
      setSavingLocations(true);
      const payload = (Object.keys(locations) as MenuLocation[]).map((loc) => ({ location: loc, menuId: locations[loc] }));
      const res = await fetch("/api/menu-locations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignments: payload }) });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Gagal menyimpan lokasi menu");
      }
      setToast({ message: "Lokasi menu disimpan", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Gagal menyimpan lokasi menu", type: "error" });
    } finally {
      setSavingLocations(false);
    }
  }, [locations]);

  const renderItemHref = useCallback((item: MenuItem) => {
    if (item.type === "CUSTOM") return item.customUrl || "#";
    if (item.type === "CATEGORY") return item.category ? `/category/${item.category.slug}` : "#";
    if (item.type === "TAG") return item.tag ? `/tag/${item.tag.slug}` : "#";
    if (item.type === "PAGE") return item.page ? `/${item.page.slug}` : "#";
    return "#";
  }, []);

  const canEdit = !!selectedMenuId;

  if (loading) {
    return <div className="p-8 bg-[var(--bg-base)] min-h-screen">Memuat...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">Menu</h1>
          <p className="text-[var(--fg-secondary)] mt-1">Kelola menu dan tentukan lokasi menu di tampilkan</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${activeTab === "edit" ? "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg-primary)]" : "bg-transparent border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
        >
          Edit Menus
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("locations")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${activeTab === "locations" ? "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg-primary)]" : "bg-transparent border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
        >
          Manage Locations
        </button>
      </div>

      {activeTab === "locations" && (
        <div className="card p-6">
          <div className="grid gap-4 max-w-xl">
            {(Object.keys(LOCATION_LABEL) as MenuLocation[]).map((loc) => (
              <div key={loc} className="flex items-center justify-between gap-4">
                <div className="font-semibold text-[var(--fg-primary)]">{LOCATION_LABEL[loc]}</div>
                <select
                  className="input max-w-sm"
                  value={locations[loc] ?? ""}
                  onChange={(e) => setLocations((prev) => ({ ...prev, [loc]: e.target.value ? e.target.value : null }))}
                >
                  <option value="">(Tidak dipakai)</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="pt-2">
              <button
                type="button"
                onClick={saveLocations}
                disabled={savingLocations}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Save size={18} />
                {savingLocations ? "Menyimpan..." : "Simpan Lokasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "edit" && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="card p-6 h-full">
              <div className="font-semibold text-[var(--fg-primary)] mb-3">Buat Menu Baru</div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-8"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="Nama menu"
                />
                <button type="button" onClick={createMenu} className="btn btn-primary col-span-4 inline-flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Buat
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="card p-6 h-full">
              <div className="grid md:grid-cols-12 gap-3 items-center">
                <div className="text-sm font-semibold text-[var(--fg-primary)] md:col-span-3">Pilih menu:</div>
                <select
                  className="input md:col-span-6 w-full"
                  value={selectedMenuId ?? ""}
                  onChange={(e) => setSelectedMenuId(e.target.value || null)}
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {typeof m._count?.items === "number" ? `(${m._count.items})` : ""}
                    </option>
                  ))}
                </select>
                <div className="md:col-span-3 flex md:justify-end">
                  <button type="button" onClick={deleteMenu} disabled={!selectedMenuId} className="btn btn-ghost text-red-600 inline-flex items-center gap-2">
                    <Trash2 size={18} />
                    Hapus Menu
                  </button>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-12 gap-3 items-center">
                <div className="text-sm font-semibold text-[var(--fg-primary)] md:col-span-3">Nama menu:</div>
                <input className="input md:col-span-6 w-full" value={selectedMenuName} onChange={(e) => setSelectedMenuName(e.target.value)} disabled={!selectedMenuId} />
                <div className="md:col-span-3 flex md:justify-end">
                  <button type="button" onClick={renameMenu} disabled={!selectedMenuId} className="btn btn-primary inline-flex items-center gap-2">
                    <Save size={18} />
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="card p-6">
              <div className="font-semibold text-[var(--fg-primary)] mb-3">Tambah Item</div>

              <button
                type="button"
                onClick={() => setOpenPanel((p) => (p === "custom" ? null : "custom"))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
              >
                <span className="font-medium text-[var(--fg-primary)]">Custom Link</span>
                {openPanel === "custom" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {openPanel === "custom" && (
                <div className="mt-3 space-y-3">
                  <input className="input w-full" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Label" />
                  <input className="input w-full" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://..." />
                  <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                    <input type="checkbox" checked={customNewTab} onChange={(e) => setCustomNewTab(e.target.checked)} />
                    Buka tab baru
                  </label>
                  <button
                    type="button"
                    disabled={!canEdit || !customLabel.trim() || !customUrl.trim()}
                    onClick={() => {
                      addMenuItem({ type: "CUSTOM", label: customLabel.trim(), customUrl: customUrl.trim(), openInNewTab: customNewTab });
                      setCustomLabel("");
                      setCustomUrl("");
                      setCustomNewTab(false);
                    }}
                    className="btn btn-primary w-full"
                  >
                    Tambah ke Menu
                  </button>
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenPanel((p) => (p === "pages" ? null : "pages"))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
                >
                  <span className="font-medium text-[var(--fg-primary)]">Halaman</span>
                  {openPanel === "pages" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {openPanel === "pages" && (
                  <div className="mt-3 max-h-64 overflow-auto border border-[var(--border)] rounded-lg">
                    {pages.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => addMenuItem({ type: "PAGE", label: p.title, pageId: p.id })}
                        className="w-full text-left px-3 py-2 hover:bg-[var(--bg-base)] flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-[var(--fg-primary)]">{p.title}</span>
                        <span className="text-xs text-[var(--fg-muted)] font-mono">/{p.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenPanel((p) => (p === "categories" ? null : "categories"))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
                >
                  <span className="font-medium text-[var(--fg-primary)]">Kategori</span>
                  {openPanel === "categories" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {openPanel === "categories" && (
                  <div className="mt-3 max-h-64 overflow-auto border border-[var(--border)] rounded-lg">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => addMenuItem({ type: "CATEGORY", label: c.name, categoryId: c.id })}
                        className="w-full text-left px-3 py-2 hover:bg-[var(--bg-base)] flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-[var(--fg-primary)]">{c.name}</span>
                        <span className="text-xs text-[var(--fg-muted)] font-mono">/category/{c.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenPanel((p) => (p === "tags" ? null : "tags"))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
                >
                  <span className="font-medium text-[var(--fg-primary)]">Tag</span>
                  {openPanel === "tags" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {openPanel === "tags" && (
                  <div className="mt-3 max-h-64 overflow-auto border border-[var(--border)] rounded-lg">
                    {tags.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => addMenuItem({ type: "TAG", label: t.name, tagId: t.id })}
                        className="w-full text-left px-3 py-2 hover:bg-[var(--bg-base)] flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-[var(--fg-primary)]">{t.name}</span>
                        <span className="text-xs text-[var(--fg-muted)] font-mono">/tag/{t.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[var(--fg-primary)]">Struktur Menu</div>
                <div className="text-xs text-[var(--fg-muted)]">{savingTree ? "Menyimpan..." : "Maks 3 level (mobile 2 level)"}</div>
              </div>

              {!selectedMenuId && <div className="text-sm text-[var(--fg-muted)]">Buat atau pilih menu terlebih dahulu.</div>}

              {selectedMenuId && flat.length === 0 && <div className="text-sm text-[var(--fg-muted)]">Belum ada item. Tambahkan dari panel kiri.</div>}

              {selectedMenuId && flat.length > 0 && (
                <div
                  ref={listRef}
                  className={`space-y-2 ${draggingId ? "select-none" : ""}`}
                >
                  {flat.map((row) => {
                    const item = row.item;
                    const href = renderItemHref(item);
                    const depthLabel = depthMap.get(item.id) ?? row.depth;
                    const indent = depthLabel * INDENT_STEP;
                    const isDragging = draggingId === item.id;
                    const isDraggingDesc = !isDragging && draggingIds.has(item.id);
                    const isPreviewParent = !!draggingId && dragPreview.parentId === item.id;
                    return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          rowElsRef.current.set(item.id, el);
                        }}
                        className={`border border-[var(--border)] rounded-lg bg-[var(--bg-surface)] ${isPreviewParent ? "ring-2 ring-[var(--accent)]" : ""} ${isDragging ? "opacity-40" : ""} ${isDraggingDesc ? "opacity-40" : ""}`}
                        style={{ marginLeft: indent }}
                      >
                        <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                onPointerDown={(e) => startPointerDrag(item.id, e)}
                                className="text-[var(--fg-muted)] cursor-grab active:cursor-grabbing"
                                title="Drag untuk pindah/indent"
                                role="button"
                                tabIndex={0}
                              >
                                <GripVertical size={16} />
                              </span>
                              <div className="font-semibold text-[var(--fg-primary)] truncate">{item.label}</div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border)] text-[var(--fg-muted)]">
                                {item.type}
                              </span>
                              {href !== "#" && (
                                <a className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]" href={href} target="_blank" rel="noreferrer">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <div className="text-xs text-[var(--fg-muted)] font-mono truncate">{href}</div>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button type="button" onClick={() => moveUpDown(item.id, "up")} className="p-2 hover:bg-[var(--bg-base)] rounded" title="Naik">
                              <ArrowUp size={16} />
                            </button>
                            <button type="button" onClick={() => moveUpDown(item.id, "down")} className="p-2 hover:bg-[var(--bg-base)] rounded" title="Turun">
                              <ArrowDown size={16} />
                            </button>
                            <button type="button" onClick={() => indentItem(item.id)} className="p-2 hover:bg-[var(--bg-base)] rounded" title="Indent">
                              <ArrowRight size={16} />
                            </button>
                            <button type="button" onClick={() => outdentItem(item.id)} className="p-2 hover:bg-[var(--bg-base)] rounded" title="Outdent">
                              <ArrowLeft size={16} />
                            </button>
                            <button type="button" onClick={() => deleteMenuItem(item.id)} className="p-2 hover:bg-[var(--bg-base)] rounded text-red-600" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {item.type === "CUSTOM" && (
                          <div className="px-3 pb-3 grid md:grid-cols-12 gap-3">
                            <div className="md:col-span-5">
                              <div className="text-xs font-semibold text-[var(--fg-muted)] mb-1">Label</div>
                              <input
                                className="input w-full"
                                value={item.label}
                                onChange={(e) => setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it)))}
                                onBlur={(e) => updateMenuItem(item.id, { label: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-5">
                              <div className="text-xs font-semibold text-[var(--fg-muted)] mb-1">URL</div>
                              <input
                                className="input w-full"
                                value={item.customUrl || ""}
                                onChange={(e) => setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, customUrl: e.target.value } : it)))}
                                onBlur={(e) => updateMenuItem(item.id, { customUrl: e.target.value || null })}
                              />
                            </div>
                            <div className="md:col-span-2 flex items-end">
                              <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                                <input
                                  type="checkbox"
                                  checked={item.openInNewTab}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, openInNewTab: checked } : it)));
                                    updateMenuItem(item.id, { openInNewTab: checked });
                                  }}
                                />
                                Tab baru
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {draggingId && dragPointer && draggingItem && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragPointer.x - dragOffsetRef.current.x,
            top: dragPointer.y - dragOffsetRef.current.y,
            width: rowElsRef.current.get(draggingId)?.getBoundingClientRect?.().width ?? 360,
          }}
        >
          <div className="border border-[var(--border)] rounded-lg bg-[var(--bg-surface)] shadow-xl">
            <div
              className="p-3 flex items-center justify-between gap-3"
              style={{ paddingLeft: dragPreview.depth * INDENT_STEP }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical size={16} className="text-[var(--fg-muted)]" />
                  <div className="font-semibold text-[var(--fg-primary)] truncate">{draggingItem.label}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border)] text-[var(--fg-muted)]">
                    {draggingItem.type}
                  </span>
                </div>
                <div className="text-xs text-[var(--fg-muted)] font-mono truncate">{renderItemHref(draggingItem)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
