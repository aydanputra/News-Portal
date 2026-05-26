"use client";

import parse, { DOMNode, Element } from "html-react-parser";
import dynamic from "next/dynamic";
import React from "react";
import { getYouTubeEmbedUrl } from "@/lib/utils";

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

const getEmbedSrc = (url: string): string | null => {
  const youtube = getYouTubeEmbedUrl(url);
  if (youtube) return youtube;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "vimeo.com" || parsed.hostname.endsWith(".vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = parts.find((part) => /^\d+$/.test(part));
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch (error) {
    void error;
  }
  return null;
};

export default function PostContent({ content, className, style }: PostContentProps) {
  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.name === "oembed" && typeof domNode.attribs.url === "string") {
          const embedSrc = getEmbedSrc(domNode.attribs.url);
          if (!embedSrc) return undefined;
          return (
            <div className="not-prose my-8">
              <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={embedSrc}
                  title="Embedded Video"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          );
        }

        // console.log("Checking node:", domNode.name, domNode.attribs.class);
        
        // Check for PDF embed wrapper from CKEditor
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

          // Fallback: If no iframe/link found inside, maybe check data attributes if we added them?
          // For now, CKEditor structure is known.

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
          __html: `
            .post-content-fix :where(p, span, div, li, blockquote, h1, h2, h3, h4, h5, h6) {
              background-color: transparent !important;
              background: transparent !important;
              color: inherit !important;
            }
          `,
        }}
      />
      {parse(content, options)}
    </div>
  );
}
