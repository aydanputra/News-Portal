import parse, { attributesToProps, DOMNode, domToReact, Element, HTMLReactParserOptions } from "html-react-parser";
import { createElement, Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import EmbedScriptProcessor from "@/components/EmbedScriptProcessor";
import PDFViewer from "@/components/PdfViewerLazy";
import { getVideoEmbedInfo } from "@/lib/video-embed";
import AdBanner from "../blocks/AdBanner";
import InlineRelatedBlock from "./InlineRelatedBlock";
import type { InlineRelatedConfig, InlineRelatedItem } from "./InlineRelatedBlock";

interface InlineAdsConfig {
  enabled: boolean;
  positions: number[];
}

interface PranalaPostContentProps {
  content: string;
  className?: string;
  style?: CSSProperties;
  inlineRelatedItems?: InlineRelatedItem[];
  inlineRelatedConfig?: InlineRelatedConfig;
  inlineAdsConfig?: InlineAdsConfig;
}

const GLOBAL_MEDIA_RADIUS = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";

const renderVideoEmbed = (url: string) => {
  const embedInfo = getVideoEmbedInfo(url);
  if (!embedInfo) return null;

  if (embedInfo.provider === "instagram") {
    return (
      <div
        className="not-prose social-embed-host social-embed-host--instagram my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      <div
        className="not-prose social-embed-host social-embed-host--twitter my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white p-4"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      <div
        className="not-prose social-embed-host social-embed-host--threads my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white p-4"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      <div
        className="not-prose social-embed-host social-embed-host--facebook-post my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      <div
        className="not-prose social-embed-host social-embed-host--facebook my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      <div
        className="not-prose social-embed-host social-embed-host--tiktok my-8 overflow-hidden border border-[color:var(--border,#e5e7eb)] bg-white p-0"
        style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}
      >
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
      ? "relative w-full overflow-hidden bg-black [aspect-ratio:9/16]"
      : "relative w-full aspect-video overflow-hidden bg-black";

  return (
    <div className={`not-prose social-embed-host social-embed-host--${embedInfo.provider} my-8`}>
      <div className={frameClass} style={{ borderRadius: GLOBAL_MEDIA_RADIUS }}>
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

function InlineAdBlock({ positionCode }: { positionCode: string }) {
  const fallbackPositions = positionCode === "ARTICLE_INLINE_1" ? ["ARTICLE_MIDDLE"] : [];
  return (
    <aside className="not-prose inline-ad-root my-8">
      <AdBanner
        block={{
          id: `inline-${positionCode.toLowerCase()}`,
          config: {
            position: positionCode,
            fallbackPositions,
            useBox: false,
            showTitle: false,
          },
        }}
        borderRadius="var(--radius-global, 0.5rem)"
        hideWhenEmpty
      />
    </aside>
  );
}

export default function PranalaPostContent({
  content,
  className,
  style,
  inlineRelatedItems = [],
  inlineRelatedConfig,
  inlineAdsConfig,
}: PranalaPostContentProps) {
  const isInlineRelatedEnabled = Boolean(
    inlineRelatedConfig?.enabled &&
    Array.isArray(inlineRelatedConfig.positions) &&
    inlineRelatedConfig.positions.length > 0 &&
    inlineRelatedItems.length > 0
  );
  const isInlineAdsEnabled = Boolean(
    inlineAdsConfig?.enabled &&
    Array.isArray(inlineAdsConfig.positions) &&
    inlineAdsConfig.positions.length > 0
  );

  const positions = isInlineRelatedEnabled ? inlineRelatedConfig!.positions : [];
  const adPositions = isInlineAdsEnabled ? inlineAdsConfig!.positions : [];
  const countPerPosition = inlineRelatedConfig?.count || 1;
  const groupedInlineItems = positions.map((_, index) => inlineRelatedItems.slice(index * countPerPosition, (index + 1) * countPerPosition));
  const optionsRef = { current: null as HTMLReactParserOptions | null };
  let paragraphCount = 0;
  let insertedBlockCount = 0;

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.attribs.class?.includes("social-embed")) {
          return renderVideoEmbed(findEmbedUrl(domNode)) || undefined;
        }

        if (domNode.name === "oembed" && typeof domNode.attribs.url === "string") {
          return renderVideoEmbed(domNode.attribs.url) || undefined;
        }

        if (domNode.attribs.class?.includes("pdf-embed-wrapper")) {
          let pdfUrl = "";
          const title = "Dokumen PDF";
          const findPdfUrl = (node: Element): string | null => {
            if (node.name === "iframe" && node.attribs.src) return node.attribs.src.split("#")[0];
            if (node.name === "a" && node.attribs.href && node.attribs.href.endsWith(".pdf")) return node.attribs.href;
            if (node.name === "a" && node.attribs.href && node.attribs.href.includes("/uploads/")) return node.attribs.href;
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
          if (pdfUrl) return <PDFViewer url={pdfUrl} title={title} />;
        }

        if (domNode.name === "p") {
          paragraphCount += 1;
          const insertIndex = positions.indexOf(paragraphCount);
          const adInsertIndex = adPositions.indexOf(paragraphCount);
          const paragraphElement = createElement(
            "p",
            attributesToProps(domNode.attribs),
            domToReact(domNode.children as DOMNode[], optionsRef.current || options)
          );

          const blocksToInsert: ReactNode[] = [];

          if (insertIndex !== -1 && groupedInlineItems[insertIndex]?.length && inlineRelatedConfig) {
            insertedBlockCount += 1;
            blocksToInsert.push(
              <InlineRelatedBlock
                key={`inline-related-${paragraphCount}-${insertIndex}`}
                items={groupedInlineItems[insertIndex]}
                layout={inlineRelatedConfig.layout}
                gridColumns={inlineRelatedConfig.gridColumns}
                cardColumns={inlineRelatedConfig.cardColumns}
                titleFontSize={inlineRelatedConfig.titleFontSize}
                titleFont={inlineRelatedConfig.titleFont}
                titleFontWeight={inlineRelatedConfig.titleFontWeight}
                titleLineHeight={inlineRelatedConfig.titleLineHeight}
                headingText={inlineRelatedConfig.headingText}
                headingFont={inlineRelatedConfig.headingFont}
                headingFontWeight={inlineRelatedConfig.headingFontWeight}
                headingLetterSpacing={inlineRelatedConfig.headingLetterSpacing}
                fontSize={inlineRelatedConfig.fontSize}
                headingColor={inlineRelatedConfig.headingColor}
                textColor={inlineRelatedConfig.textColor}
                hoverColor={inlineRelatedConfig.hoverColor}
              />
            );
          }

          if (isInlineAdsEnabled && adInsertIndex !== -1) {
            blocksToInsert.push(
              <InlineAdBlock
                key={`inline-ad-${paragraphCount}-${adInsertIndex}`}
                positionCode={`ARTICLE_INLINE_${adInsertIndex + 1}`}
              />
            );
          }

          if (blocksToInsert.length === 0) {
            return paragraphElement;
          }

          return (
            <Fragment>
              {paragraphElement}
              {blocksToInsert}
            </Fragment>
          );
        }
      }
      return undefined;
    },
  };

  optionsRef.current = options;
  // `content` sudah disanitasi di sisi server (SinglePost/Page) sebelum sampai
  // ke sini, sehingga modul `sanitize-html` tidak perlu ikut ke bundle client.
  const safeHtml = content;
  const parsedContent = parse(safeHtml, options);
  const fallbackInlineItems = groupedInlineItems.find((items) => items.length > 0) || inlineRelatedItems.slice(0, countPerPosition);
  const shouldRenderFallbackInlineBlock = isInlineRelatedEnabled && insertedBlockCount === 0 && fallbackInlineItems.length > 0;

  return (
    <div
      className={`prose prose-lg max-w-none post-content-fix ${className || ""}`}
      style={style}
    >
      <EmbedScriptProcessor html={safeHtml} />
      {parsedContent}
      {shouldRenderFallbackInlineBlock && inlineRelatedConfig && (
        <InlineRelatedBlock
          items={fallbackInlineItems}
          layout={inlineRelatedConfig.layout}
          gridColumns={inlineRelatedConfig.gridColumns}
          cardColumns={inlineRelatedConfig.cardColumns}
          titleFontSize={inlineRelatedConfig.titleFontSize}
          titleFont={inlineRelatedConfig.titleFont}
          titleFontWeight={inlineRelatedConfig.titleFontWeight}
          titleLineHeight={inlineRelatedConfig.titleLineHeight}
          headingText={inlineRelatedConfig.headingText}
          headingFont={inlineRelatedConfig.headingFont}
          headingFontWeight={inlineRelatedConfig.headingFontWeight}
          headingLetterSpacing={inlineRelatedConfig.headingLetterSpacing}
          fontSize={inlineRelatedConfig.fontSize}
          headingColor={inlineRelatedConfig.headingColor}
          textColor={inlineRelatedConfig.textColor}
          hoverColor={inlineRelatedConfig.hoverColor}
        />
      )}
    </div>
  );
}
