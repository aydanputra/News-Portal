"use client";

import { useEffect, useRef } from "react";

export default function TrackView({ postId }: { postId: string }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!postId || sentRef.current) return;
    sentRef.current = true;

    try {
      const key = `viewed:${postId}`;
      if (typeof window !== "undefined" && window.sessionStorage?.getItem(key) === "1") {
        return;
      }
      window.sessionStorage?.setItem(key, "1");
    } catch (error) {
      void error;
    }

    const send = () => {
      fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
        keepalive: true,
      }).catch((error) => void error);
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
