import parse, { DOMNode, Element } from "html-react-parser";
import type { CSSProperties } from "react";
import { sanitizeContent } from "@/lib/sanitizer";
import { safeStyleTagCss } from "@/lib/url-safety";
import { getVideoEmbedInfo } from "@/lib/video-embed";
import EmbedScriptProcessor from "@/components/EmbedScriptProcessor";
import PDFViewer from "@/components/PdfViewerLazy";

interface PostContentProps {
  content: string;
  className?: string;
  style?: CSSProperties;
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

  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.name === "img") {
          // Lazy-load content images to reduce initial transfer; sanitizer already
          // allows `loading` so adding it here is safe and keeps CLS low via srcset.
          domNode.attribs.loading = "lazy";
          domNode.attribs.decoding = "async";
        }

        if (domNode.attribs.class?.includes("social-embed")) {
          return renderVideoEmbed(findEmbedUrl(domNode)) || undefined;
        }

        if (domNode.name === "oembed" && typeof domNode.attribs.url === "string") {
          return renderVideoEmbed(domNode.attribs.url) || undefined;
        }

        // Check for the shared PDF embed wrapper emitted by the editor HTML
        if (domNode.attribs.class?.includes("pdf-embed-wrapper")) {
          let pdfUrl = "";
          const title = "Dokumen PDF";

          // Helper to recursively find PDF URL
          const findPdfUrl = (node: Element): string | null => {
            if (node.name === "iframe" && node.attribs.src) {
              // Remove #view=FitH if present
              return node.attribs.src.split("#")[0];
            }
            if (node.name === "a" && node.attribs.href && node.attribs.href.endsWith(".pdf")) {
              return node.attribs.href;
            }
            // Also check generic links that might be the file
            if (node.name === "a" && node.attribs.href && node.attribs.href.includes("/uploads/")) {
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

          pdfUrl = findPdfUrl(domNode) || "";

          if (pdfUrl) {
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
      <EmbedScriptProcessor html={safeHtml} />
      {parse(safeHtml, options)}
    </div>
  );
}
