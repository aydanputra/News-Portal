"use client";

import React from "react";

const INSTAGRAM_EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const TWITTER_EMBED_SCRIPT_SRC = "https://platform.twitter.com/widgets.js";
const THREADS_EMBED_SCRIPT_SRC = "https://www.threads.net/embed.js";
const TIKTOK_EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";
const FACEBOOK_EMBED_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0";

function ensureScriptProcessed(scriptSrc: string, process: () => void) {
  if (typeof document === "undefined") return;

  const existingScript = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement | null;
  if (existingScript) {
    if (existingScript.dataset.loaded === "true") {
      process();
      return;
    }
    existingScript.addEventListener(
      "load",
      () => {
        existingScript.dataset.loaded = "true";
        process();
      },
      { once: true }
    );
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = scriptSrc;
  script.addEventListener(
    "load",
    () => {
      script.dataset.loaded = "true";
      process();
    },
    { once: true }
  );
  document.body.appendChild(script);
}

function ensureInstagramEmbedsProcessed() {
  ensureScriptProcessed(INSTAGRAM_EMBED_SCRIPT_SRC, () => {
    const instagramWindow = window as typeof window & {
      instgrm?: { Embeds?: { process?: () => void } };
    };
    instagramWindow.instgrm?.Embeds?.process?.();
  });
}

function ensureTwitterEmbedsProcessed() {
  ensureScriptProcessed(TWITTER_EMBED_SCRIPT_SRC, () => {
    const twitterWindow = window as typeof window & {
      twttr?: { widgets?: { load?: (target?: HTMLElement | Document) => void } };
    };
    twitterWindow.twttr?.widgets?.load?.(document.body);
  });
}

function ensureThreadsEmbedsProcessed() {
  ensureScriptProcessed(THREADS_EMBED_SCRIPT_SRC, () => {
    const threadsWindow = window as typeof window & {
      instgrm?: { Threads?: { process?: () => void } };
    };
    threadsWindow.instgrm?.Threads?.process?.();
  });
}

function ensureTikTokEmbedsProcessed() {
  if (typeof document === "undefined") return;
  const existingScript = document.querySelector(`script[src="${TIKTOK_EMBED_SCRIPT_SRC}"]`);
  if (existingScript) existingScript.remove();
  const script = document.createElement("script");
  script.async = true;
  script.src = TIKTOK_EMBED_SCRIPT_SRC;
  document.body.appendChild(script);
}

function ensureFacebookEmbedsProcessed() {
  if (typeof document === "undefined") return;

  let fbRoot = document.getElementById("fb-root");
  if (!fbRoot) {
    fbRoot = document.createElement("div");
    fbRoot.id = "fb-root";
    document.body.prepend(fbRoot);
  }

  ensureScriptProcessed(FACEBOOK_EMBED_SCRIPT_SRC, () => {
    const facebookWindow = window as typeof window & {
      FB?: { XFBML?: { parse?: (target?: HTMLElement | Document) => void } };
    };
    facebookWindow.FB?.XFBML?.parse?.(document.body);
  });
}

interface EmbedScriptProcessorProps {
  html: string;
}

/**
 * Menjalankan skrip embed pihak ketiga (Instagram/X/Threads/TikTok/Facebook)
 * setelah HTML konten dirender di server. Tidak merender markup apa pun.
 */
export default function EmbedScriptProcessor({ html }: EmbedScriptProcessorProps) {
  React.useEffect(() => {
    if (!html.includes("instagram.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureInstagramEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [html]);

  React.useEffect(() => {
    if (!html.includes("twitter.com/") && !html.includes("x.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureTwitterEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [html]);

  React.useEffect(() => {
    if (!html.includes("threads.net/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureThreadsEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [html]);

  React.useEffect(() => {
    if (!html.includes("tiktok.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureTikTokEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [html]);

  React.useEffect(() => {
    if (!html.includes("facebook.com/") && !html.includes("fb.watch/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureFacebookEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [html]);

  return null;
}
