"use client";

import { useEffect, useState } from "react";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

const DEFAULT_SOURCE_BLOCKS: SidebarSourceBlocksMap = {
  home: [],
  post: [],
  archive: [],
};

export function useSidebarSourceBlocks(activeTheme?: string) {
  const [sourceBlocksByLocation, setSourceBlocksByLocation] = useState<SidebarSourceBlocksMap>(DEFAULT_SOURCE_BLOCKS);

  useEffect(() => {
    if (!activeTheme) return;
    let cancelled = false;

    const load = async () => {
      try {
        const locations = ["home", "post", "archive"] as const;
        const responses = await Promise.all(
          locations.map((location) =>
            fetch(`/api/homepage?location=${location}&themeId=${encodeURIComponent(activeTheme)}`, {
              cache: "no-store",
            }).then((res) => res.json())
          )
        );

        if (cancelled) return;

        setSourceBlocksByLocation({
          home: Array.isArray(responses[0]) ? responses[0] : [],
          post: Array.isArray(responses[1]) ? responses[1] : [],
          archive: Array.isArray(responses[2]) ? responses[2] : [],
        });
      } catch {
        if (!cancelled) {
          setSourceBlocksByLocation(DEFAULT_SOURCE_BLOCKS);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTheme]);

  return sourceBlocksByLocation;
}
