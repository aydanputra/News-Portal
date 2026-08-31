"use client";

import { useEffect, useRef } from "react";
import { sendViewTracking } from "@/lib/view-tracking";

type TrackPublicPageViewProps = {
  pageKey: string;
  path: string;
  title: string;
  pageType: "home" | "category" | "tag" | "search" | "page";
};

export default function TrackPublicPageView({ pageKey, path, title, pageType }: TrackPublicPageViewProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!pageKey || sentRef.current) return;
    sentRef.current = true;

    const send = () => {
      sendViewTracking({
        url: "/api/track-public-page-view",
        dedupeKey: `public-page:${pageKey}`,
        payload: { pageKey, path, title, pageType },
      });
    };

    const w = globalThis as any;
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(send, { timeout: 1500 });
      return;
    }

    const timer = window.setTimeout(send, 300);
    return () => window.clearTimeout(timer);
  }, [pageKey, path, title, pageType]);

  return null;
}
