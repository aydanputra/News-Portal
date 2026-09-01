"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ArchivePostList from "./ArchivePostList";
import ArchivePostGrid from "./ArchivePostGrid";
import ArchivePagination from "./ArchivePagination";

interface ArchiveFilter {
  categories?: string[];
  tags?: string[];
}

interface ArchiveClientControllerProps {
  listBlock: any;
  paginationBlock: any | null;
  initialPosts: any[];
  pageSize: number;
  initialTotalPages: number;
  basePath: string;
  archiveType: string;
  archiveFilter: ArchiveFilter;
  archiveDisplayCategory?: { name: string; slug: string } | null;
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  setting?: any;
}

const buildPageUrl = (basePath: string, page: number) => {
  if (page <= 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
};

const getPageFromLocation = (): number => {
  if (typeof window === "undefined") return 1;
  const raw = new URLSearchParams(window.location.search).get("page");
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
};

export default function ArchiveClientController({
  listBlock,
  paginationBlock,
  initialPosts,
  pageSize,
  initialTotalPages,
  basePath,
  archiveFilter,
  archiveDisplayCategory,
  customTitle,
  accentColor,
  borderRadius,
  setting,
}: ArchiveClientControllerProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages));
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const initialLoadedRef = useRef(false);

  const buildQuery = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (archiveFilter.categories?.length) {
        params.set("categories", archiveFilter.categories.join(","));
      }
      if (archiveFilter.tags?.length) {
        params.set("tags", archiveFilter.tags.join(","));
      }
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      params.set("sort", "latest");
      return params.toString();
    },
    [archiveFilter, pageSize],
  );

  const applyDisplayCategory = useCallback(
    (list: any[]) => {
      if (!archiveDisplayCategory) return list;
      return list.map((post) => ({ ...post, archiveDisplayCategory }));
    },
    [archiveDisplayCategory],
  );

  const loadPage = useCallback(
    async (page: number, scroll = false) => {
      const safePage = Math.max(1, page);
      const requestId = ++requestIdRef.current;

      if (safePage === 1) {
        setPosts(initialPosts);
        setCurrentPage(1);
        setTotalPages(Math.max(1, initialTotalPages));
        setLoading(false);
        if (scroll) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/public/posts?${buildQuery(safePage)}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (requestId !== requestIdRef.current) return;

        const nextPosts = applyDisplayCategory(
          Array.isArray(json?.data) ? json.data : [],
        );
        const nextTotalPages = Math.max(
          1,
          Number(json?.meta?.totalPages) || safePage,
        );
        setPosts(nextPosts);
        setCurrentPage(safePage);
        setTotalPages(nextTotalPages);
        setLoading(false);

        if (scroll && wrapperRef.current) {
          wrapperRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (error) {
        console.error("Gagal memuat halaman arsip:", error);
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [initialPosts, initialTotalPages, buildQuery, applyDisplayCategory],
  );

  const goToPage = useCallback(
    (page: number) => {
      const safePage = Math.max(1, page);
      if (safePage === currentPage && !loading) return;
      window.history.pushState(null, "", buildPageUrl(basePath, safePage));
      loadPage(safePage, true);
    },
    [basePath, currentPage, loading, loadPage],
  );

  useEffect(() => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;
    const urlPage = getPageFromLocation();
    if (urlPage > 1) {
      loadPage(urlPage, false);
    }
  }, [loadPage]);

  useEffect(() => {
    const onPopState = () => {
      loadPage(getPageFromLocation(), false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [loadPage]);

  const isGrid = listBlock?.type === "archive_post_grid";

  return (
    <div
      ref={wrapperRef}
      className={loading ? "opacity-70 transition-opacity" : "transition-opacity"}
    >
      {isGrid ? (
        <ArchivePostGrid block={listBlock} posts={posts} />
      ) : (
        <ArchivePostList
          block={listBlock}
          posts={posts}
          customTitle={customTitle}
          accentColor={accentColor}
          borderRadius={borderRadius}
          setting={setting}
        />
      )}

      {paginationBlock && totalPages > 1 ? (
        <ArchivePagination
          block={paginationBlock}
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          onPageChange={goToPage}
        />
      ) : null}
    </div>
  );
}
