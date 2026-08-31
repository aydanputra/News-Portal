"use client";

import { useEffect, useRef } from "react";
import { sendViewTracking } from "@/lib/view-tracking";

export default function TrackView({ postId }: { postId: string }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!postId || sentRef.current) return;
    sentRef.current = true;

    const send = () => {
      sendViewTracking({
        url: "/api/track-view",
        dedupeKey: `post:${postId}`,
        payload: { postId },
      });
    };

    const w = globalThis as any;
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(send, { timeout: 1500 });
      return;
    }

    const t = setTimeout(send, 300);
    return () => clearTimeout(t);
  }, [postId]);

  return null;
}
