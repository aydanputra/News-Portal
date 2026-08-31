"use client";

import parse, { DOMNode, Element } from "html-react-parser";
import dynamic from "next/dynamic";
import React from "react";
import { sanitizeContent, safeStyleTagCss } from "@/lib/sanitizer";
import { getVideoEmbedInfo } from "@/lib/video-embed";

// Lazy load PDFViewer to avoid SSR issues with canvas/window
const PDFViewer = dynamic(() => import("@/components/ui/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[500px] bg-gray-100 rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-gray-500">Memuat PDF Viewer...</span>
    </div>
  ),
});

interface PostContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const INSTAGRAM_EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const TWITTER_EMBED_SCRIPT_SRC = "https://platform.twitter.com/widgets.js";
const THREADS_EMBED_SCRIPT_SRC = "https://www.threads.net/embed.js";
const TIKTOK_EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";
const FACEBOOK_EMBED_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0";

function ensureScriptProcessed(
  scriptSrc: string,
  process: () => void,
) {
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

const renderVideoEmbed = (url: string) => {
  const embedInfo = getVideoEmbedInfo(url);
  if (!embedInfo) return null;

  if (embedInfo.provider === "instagram") {
    return (
      <div className="not-prose social-embed-host social-embed-host--instagram my-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <blockquote
          className="instagram-media !m-0"
          data-instgrm-captioned=""
          data-instgrm-permalink={embedInfo.originalUrl}
          data-instgrm-version="14"
          style={{
            margin: 0,
            maxWidth: "100%",
            width: "calc(100% - 2px)",
            minWidth: "100%",
          }}
        >
          <a href={embedInfo.originalUrl} target="_blank" rel="noopener noreferrer">
            Lihat di Instagram
          </a>
        </blockquote>
      </div>
    );
  }

  if (embedInfo.provider === "twitter") {
    return (
      <div className="not-prose social-embed-host social-embed-host--twitter my-8 overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
        <blockquote className="twitter-tweet !m-0" data-theme="light">
          <a href={embedInfo.originalUrl} target="_blank" rel="noopener noreferrer">
            Lihat posting di X
          </a>
        </blockquote>
      </div>
    );
  }

  if (embedInfo.provider === "threads") {
    return (
      <div className="not-prose social-embed-host social-embed-host--threads my-8 overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
        <blockquote
          className="text-post-embed !m-0"
          data-text-post-permalink={embedInfo.originalUrl}
          data-text-post-version="1"
        >
          <a href={embedInfo.originalUrl} target="_blank" rel="noopener noreferrer">
            Lihat posting di Threads
          </a>
        </blockquote>
      </div>
    );
  }

  if (embedInfo.provider === "facebook-post") {
    return (
      <div className="not-prose social-embed-host social-embed-host--facebook-post my-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div
          className="fb-post"
          data-href={embedInfo.originalUrl}
          data-width="500"
          data-show-text="true"
        />
      </div>
    );
  }

  if (embedInfo.provider === "facebook") {
    return (
      <div className="not-prose social-embed-host social-embed-host--facebook my-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div
          className="fb-video"
          data-href={embedInfo.originalUrl}
          data-width="500"
          data-show-text="false"
          data-allowfullscreen="true"
        />
      </div>
    );
  }

  if (embedInfo.provider === "tiktok") {
    return (
      <div className="not-prose social-embed-host social-embed-host--tiktok my-8 overflow-hidden rounded-xl border border-gray-200 bg-white p-0">
        <blockquote
          className="tiktok-embed !m-0"
          cite={embedInfo.originalUrl}
          data-video-id={embedInfo.embedId || undefined}
          style={{ margin: 0, maxWidth: "100%", minWidth: "100%" }}
        >
          <section>
            <a href={embedInfo.originalUrl} target="_blank" rel="noopener noreferrer">
              Lihat di TikTok
            </a>
          </section>
        </blockquote>
      </div>
    );
  }

  const frameClass =
    embedInfo.aspect === "portrait"
      ? "relative w-full overflow-hidden rounded-xl bg-black [aspect-ratio:9/16]"
      : "relative w-full aspect-video overflow-hidden rounded-xl bg-black";

  return (
    <div className={`not-prose social-embed-host social-embed-host--${embedInfo.provider} my-8`}>
      <div className={frameClass}>
        <iframe
          src={embedInfo.embedSrc}
          title={embedInfo.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
};

const findEmbedUrl = (node: Element): string => {
  if (node.name === "oembed" && typeof node.attribs.url === "string") return node.attribs.url;
  if (node.name === "a" && typeof node.attribs.href === "string") return node.attribs.href;
  if (node.name === "iframe" && typeof node.attribs.src === "string") return node.attribs.src;
  if (node.children) {
    for (const child of node.children) {
      if (child instanceof Element) {
        const found = findEmbedUrl(child);
        if (found) return found;
      }
    }
  }
  return "";
};

export default function PostContent({ content, className, style }: PostContentProps) {
  const safeHtml = sanitizeContent(content);

  React.useEffect(() => {
    if (!safeHtml.includes("instagram.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureInstagramEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [safeHtml]);

  React.useEffect(() => {
    if (!safeHtml.includes("twitter.com/") && !safeHtml.includes("x.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureTwitterEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [safeHtml]);

  React.useEffect(() => {
    if (!safeHtml.includes("threads.net/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureThreadsEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [safeHtml]);

  React.useEffect(() => {
    if (!safeHtml.includes("tiktok.com/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureTikTokEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [safeHtml]);

  React.useEffect(() => {
    if (!safeHtml.includes("facebook.com/") && !safeHtml.includes("fb.watch/")) return;
    const timeoutId = window.setTimeout(() => {
      ensureFacebookEmbedsProcessed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [safeHtml]);

  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.attribs.class?.includes("social-embed")) {
          return renderVideoEmbed(findEmbedUrl(domNode)) || undefined;
        }

        if (domNode.name === "oembed" && typeof domNode.attribs.url === "string") {
          return renderVideoEmbed(domNode.attribs.url) || undefined;
        }

        // console.log("Checking node:", domNode.name, domNode.attribs.class);
        
        // Check for the shared PDF embed wrapper emitted by the editor HTML
        if (domNode.attribs.class?.includes("pdf-embed-wrapper")) {
          // Extract PDF URL from the iframe src or anchor tag inside
          // We can try to find the anchor tag with href ending in .pdf or the iframe src
          let pdfUrl = "";
          const title = "Dokumen PDF";

          // Helper to recursively find PDF URL
          const findPdfUrl = (node: Element): string | null => {
             if (node.name === 'iframe' && node.attribs.src) {
                 // Remove #view=FitH if present
                 return node.attribs.src.split('#')[0];
             }
             if (node.name === 'a' && node.attribs.href && node.attribs.href.endsWith('.pdf')) {
                 return node.attribs.href;
             }
             // Also check generic links that might be the file
             if (node.name === 'a' && node.attribs.href && node.attribs.href.includes('/uploads/')) {
                 return node.attribs.href;
             }

             if (node.children) {
                 for (const child of node.children) {
                     if (child instanceof Element) {
                         const found = findPdfUrl(child);
                         if (found) return found;
                     }
                 }
             }
             return null;
          };

          // Try to find title from text content
          // Simplified: just use default or extract from domNode if we stored it in data-title
          
          pdfUrl = findPdfUrl(domNode) || "";

          // Fallback: if no iframe/link is found inside, we keep relying on the shared embed wrapper shape.

          if (pdfUrl) {
            // console.log("Replacing PDF with Viewer:", pdfUrl);
            return <PDFViewer url={pdfUrl} title={title} />;
          }
        }
      }
    },
  };

  return (
    <div
      className={`prose prose-lg max-w-none post-content-fix ${className || ""}`}
      style={style}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: safeStyleTagCss(`
            .post-content-fix :where(p, span, div, li, blockquote, h1, h2, h3, h4, h5, h6) {
              background-color: transparent !important;
              background: transparent !important;
            }
          `),
        }}
      />
      {parse(safeHtml, options)}
    </div>
  );
}
