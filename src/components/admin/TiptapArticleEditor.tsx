"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mergeAttributes, Node as TiptapNode } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { ChevronDown, FileText, Image as ImageIcon, Link as LinkIcon, List, ListOrdered, Quote, Redo2, RemoveFormatting, Settings2, Undo2, X } from "lucide-react";
import { getVideoEmbedInfo } from "@/lib/video-embed";

interface TiptapArticleEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  onRequestImage?: () => void;
  onRequestFile?: () => void;
  mediaToInsert?: { id: string; fileUrl: string; alt?: string; type?: "image" | "file"; isFile?: boolean } | null;
  onMediaInserted?: () => void;
}

const PDF_EMBED_FRAME_STYLE =
  "position: relative; width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f9fafb;";
const PDF_EMBED_IFRAME_STYLE = "width: 100%; height: 100%; border: none;";
const PDF_EMBED_CAPTION_STYLE = "text-align: center; font-size: 12px; color: #6b7280; margin-top: 8px;";
const IMAGE_SIZE_CLASSES = ["sm", "md", "lg", "full"] as const;
const IMAGE_ALIGN_CLASSES = ["left", "center", "right"] as const;
const IMAGE_LAYOUT_CLASSES = ["block", "wrap-left", "wrap-right"] as const;

type ArticleImageSize = (typeof IMAGE_SIZE_CLASSES)[number];
type ArticleImageAlign = (typeof IMAGE_ALIGN_CLASSES)[number];
type ArticleImageLayout = (typeof IMAGE_LAYOUT_CLASSES)[number];
type ImageSettingsDraft = {
  alt: string;
  caption: string;
  captionAlign: ArticleImageAlign;
  linkHref: string;
  openInNewTab: boolean;
  align: ArticleImageAlign;
  size: ArticleImageSize;
  layout: ArticleImageLayout;
};

const PdfEmbed = TiptapNode.create({
  name: "pdfEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
      title: {
        default: "Dokumen PDF",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.pdf-embed-wrapper",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const iframe = element.querySelector("iframe");
          const link = element.querySelector("figcaption a");
          const src = iframe?.getAttribute("src") || link?.getAttribute("href") || "";
          if (!src) return false;
          return {
            src,
            title: iframe?.getAttribute("title") || link?.textContent?.trim() || "Dokumen PDF",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = typeof HTMLAttributes.src === "string" ? HTMLAttributes.src : "";
    const title = typeof HTMLAttributes.title === "string" && HTMLAttributes.title.trim() !== ""
      ? HTMLAttributes.title
      : "Dokumen PDF";

    return [
      "figure",
      mergeAttributes({ class: "pdf-embed-wrapper" }),
      ["div", { style: PDF_EMBED_FRAME_STYLE }, ["iframe", { src, style: PDF_EMBED_IFRAME_STYLE, title }]],
      [
        "figcaption",
        { style: PDF_EMBED_CAPTION_STYLE },
        ["a", { href: src, target: "_blank", rel: "noopener noreferrer" }, title],
      ],
    ];
  },
});

const SocialEmbed = TiptapNode.create({
  name: "socialEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.social-embed",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const oembed = element.querySelector("oembed[url]");
          const anchor = element.querySelector("a[href]");
          const iframe = element.querySelector("iframe[src]");
          const url = oembed?.getAttribute("url") || anchor?.getAttribute("href") || iframe?.getAttribute("src") || "";
          return url ? { url } : false;
        },
      },
      {
        tag: "oembed[url]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const url = element.getAttribute("url") || "";
          return url ? { url } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const rawUrl = typeof HTMLAttributes.url === "string" ? HTMLAttributes.url.trim() : "";
    const embedInfo = getVideoEmbedInfo(rawUrl);
    if (!embedInfo) {
      return [
        "figure",
        { class: "social-embed social-embed--fallback" },
        ["a", { href: rawUrl, target: "_blank", rel: "noopener noreferrer" }, rawUrl || "Embed Video"],
      ];
    }

    if (embedInfo.provider === "twitter" || embedInfo.provider === "threads") {
      return [
        "figure",
        {
          class: `social-embed social-embed--${embedInfo.aspect} social-embed--${embedInfo.provider}`,
        },
        [
          "div",
          { class: "social-embed__placeholder" },
          ["strong", {}, embedInfo.provider === "twitter" ? "X / Twitter" : "Threads"],
          ["p", {}, rawUrl],
        ],
        ["a", { href: embedInfo.originalUrl, target: "_blank", rel: "noopener noreferrer", class: "social-embed__fallback-link" }, "Buka posting"],
        ["oembed", { url: rawUrl }],
      ];
    }

    if (embedInfo.provider === "tiktok") {
      return [
        "figure",
        {
          class: `social-embed social-embed--${embedInfo.aspect} social-embed--${embedInfo.provider}`,
        },
        [
          "blockquote",
          {
            class: "tiktok-embed",
            cite: embedInfo.originalUrl,
            "data-video-id": embedInfo.embedId || "",
            style: "margin: 0; max-width: 100%; min-width: 100%;",
          },
          [
            "section",
            {},
            ["a", { href: embedInfo.originalUrl, target: "_blank", rel: "noopener noreferrer" }, "Lihat di TikTok"],
          ],
        ],
        ["oembed", { url: rawUrl }],
      ];
    }

    if (embedInfo.provider === "facebook") {
      return [
        "figure",
        {
          class: `social-embed social-embed--${embedInfo.aspect} social-embed--${embedInfo.provider}`,
        },
        [
          "div",
          { class: "social-embed__facebook social-embed__facebook--video" },
          [
            "div",
            {
              class: "fb-video",
              "data-href": embedInfo.originalUrl,
              "data-width": "500",
              "data-show-text": "false",
              "data-allowfullscreen": "true",
            },
          ],
        ],
        ["oembed", { url: rawUrl }],
      ];
    }

    if (embedInfo.provider === "facebook-post") {
      return [
        "figure",
        {
          class: `social-embed social-embed--${embedInfo.aspect} social-embed--${embedInfo.provider}`,
        },
        [
          "div",
          { class: "social-embed__facebook social-embed__facebook--post" },
          [
            "div",
            {
              class: "fb-post",
              "data-href": embedInfo.originalUrl,
              "data-width": "500",
              "data-show-text": "true",
            },
          ],
        ],
        ["oembed", { url: rawUrl }],
      ];
    }

    return [
      "figure",
      {
        class: `social-embed social-embed--${embedInfo.aspect} social-embed--${embedInfo.provider}`,
      },
      [
        "div",
        { class: "social-embed__frame" },
        [
          "iframe",
          {
            src: embedInfo.embedSrc,
            title: embedInfo.title,
            class: "social-embed__iframe",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            allowfullscreen: "true",
            loading: "lazy",
            referrerpolicy: "strict-origin-when-cross-origin",
          },
        ],
      ],
      ["oembed", { url: rawUrl }],
    ];
  },
});

const ArticleImage = TiptapNode.create({
  name: "articleImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
      alt: {
        default: "",
      },
      title: {
        default: "",
      },
      caption: {
        default: "",
      },
      captionAlign: {
        default: "center",
      },
      linkHref: {
        default: "",
      },
      openInNewTab: {
        default: true,
      },
      align: {
        default: "center",
      },
      size: {
        default: "full",
      },
      layout: {
        default: "block",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.article-image",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const img = element.querySelector("img");
          if (!img) return false;
          const alignClass = IMAGE_ALIGN_CLASSES.find((value) => element.classList.contains(`article-image--${value}`)) || "center";
          const sizeClass = IMAGE_SIZE_CLASSES.find((value) => element.classList.contains(`article-image--${value}`)) || "full";
          const layoutClass = IMAGE_LAYOUT_CLASSES.find((value) => element.classList.contains(`article-image--${value}`)) || "block";
          const captionEl = element.querySelector("figcaption");
          const captionAlignClass = IMAGE_ALIGN_CLASSES.find((value) => captionEl?.classList.contains(`article-image__caption--${value}`))
            || (layoutClass === "block" ? "center" : "left");
          return {
            src: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || "",
            title: img.getAttribute("title") || "",
            caption: captionEl?.textContent?.trim() || "",
            captionAlign: captionAlignClass,
            linkHref: element.querySelector("a.article-image__link")?.getAttribute("href") || "",
            openInNewTab: element.querySelector("a.article-image__link")?.getAttribute("target") === "_blank",
            align: alignClass,
            size: sizeClass,
            layout: layoutClass,
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          if (element.closest("figure.article-image")) return false;
          return {
            src: element.getAttribute("src") || "",
            alt: element.getAttribute("alt") || "",
            title: element.getAttribute("title") || "",
            caption: "",
            captionAlign: "center",
            linkHref: "",
            openInNewTab: true,
            align: "center",
            size: "full",
            layout: "block",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = typeof HTMLAttributes.src === "string" ? HTMLAttributes.src : "";
    const alt = typeof HTMLAttributes.alt === "string" ? HTMLAttributes.alt : "";
    const title = typeof HTMLAttributes.title === "string" ? HTMLAttributes.title : "";
    const caption = typeof HTMLAttributes.caption === "string" ? HTMLAttributes.caption.trim() : "";
    const linkHref = typeof HTMLAttributes.linkHref === "string" ? HTMLAttributes.linkHref.trim() : "";
    const openInNewTab = HTMLAttributes.openInNewTab !== false;
    const align = IMAGE_ALIGN_CLASSES.includes(HTMLAttributes.align as ArticleImageAlign)
      ? (HTMLAttributes.align as ArticleImageAlign)
      : "center";
    const size = IMAGE_SIZE_CLASSES.includes(HTMLAttributes.size as ArticleImageSize)
      ? (HTMLAttributes.size as ArticleImageSize)
      : "full";
    const layout = IMAGE_LAYOUT_CLASSES.includes(HTMLAttributes.layout as ArticleImageLayout)
      ? (HTMLAttributes.layout as ArticleImageLayout)
      : "block";
    const captionAlign = IMAGE_ALIGN_CLASSES.includes(HTMLAttributes.captionAlign as ArticleImageAlign)
      ? (HTMLAttributes.captionAlign as ArticleImageAlign)
      : layout === "block"
        ? "center"
        : "left";

    const imageElement = [
      "img",
      {
        src,
        alt,
        title,
        class: "article-image__img",
      },
    ] as const;
    const linkAttributes = openInNewTab
      ? {
          href: linkHref,
          class: "article-image__link",
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : {
          href: linkHref,
          class: "article-image__link",
        };

    return [
      "figure",
      {
        class: `article-image article-image--${layout} article-image--${align} article-image--${size}`,
      },
      ...(linkHref
        ? [[
            "a",
            linkAttributes,
            imageElement,
          ]]
        : [imageElement]),
      ...(caption ? [["figcaption", { class: `article-image__caption article-image__caption--${captionAlign}` }, caption]] : []),
    ];
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function buildFileLinkHtml(fileUrl: string, fileName: string): string {
  const safeUrl = escapeHtml(normalizeUrl(fileUrl));
  const safeName = escapeHtml(fileName || "Download File");
  return `<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">📎 ${safeName}</a></p>`;
}

const TIKTOK_EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";
const FACEBOOK_EMBED_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0";

function refreshTikTokEmbeds() {
  if (typeof document === "undefined") return;
  const existingScript = document.querySelector(`script[src="${TIKTOK_EMBED_SCRIPT_SRC}"]`);
  if (existingScript) existingScript.remove();
  const script = document.createElement("script");
  script.async = true;
  script.src = TIKTOK_EMBED_SCRIPT_SRC;
  document.body.appendChild(script);
}

function refreshFacebookEmbeds() {
  if (typeof document === "undefined") return;

  let fbRoot = document.getElementById("fb-root");
  if (!fbRoot) {
    fbRoot = document.createElement("div");
    fbRoot.id = "fb-root";
    document.body.prepend(fbRoot);
  }

  const runParse = () => {
    const facebookWindow = window as typeof window & {
      FB?: { XFBML?: { parse?: (target?: HTMLElement | Document) => void } };
    };
    facebookWindow.FB?.XFBML?.parse?.(document.body);
  };

  const existingScript = document.querySelector(`script[src="${FACEBOOK_EMBED_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
  if (existingScript) {
    if (existingScript.dataset.loaded === "true") {
      runParse();
      return;
    }
    existingScript.addEventListener(
      "load",
      () => {
        existingScript.dataset.loaded = "true";
        runParse();
      },
      { once: true }
    );
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.crossOrigin = "anonymous";
  script.src = FACEBOOK_EMBED_SCRIPT_SRC;
  script.addEventListener(
    "load",
    () => {
      script.dataset.loaded = "true";
      runParse();
    },
    { once: true }
  );
  document.body.appendChild(script);
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-1.5 text-[11px] font-medium shadow-sm transition-colors sm:h-9 sm:min-w-9 sm:px-2 sm:text-xs ${
        active
          ? "border-[#9ec5fe] bg-[#e8f0fe] text-[#0b57d0]"
          : "border-[#c9c9c9] bg-[#f8f9fa] text-[#444] hover:bg-[#f1f3f4]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-[#c9c9c9]" aria-hidden="true" />;
}

function ImageSettingsCollapseCard({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[var(--border)] pb-2 text-sm font-bold text-[var(--fg-primary)]">
        <span className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--accent)]" />
          <span>{title}</span>
        </span>
        <span className="text-[var(--fg-muted)] transition-transform group-open:rotate-180">
          <ChevronDown size={15} />
        </span>
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}

const TEXT_COLOR_PRESETS = [
  "#111827",
  "#374151",
  "#6b7280",
  "#991b1b",
  "#dc2626",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#65a30d",
  "#2563eb",
  "#0ea5e9",
  "#06b6d4",
  "#16a34a",
  "#14b8a6",
  "#0f766e",
  "#ca8a04",
  "#7c3aed",
  "#a855f7",
  "#db2777",
];

const IMAGE_SIZE_OPTIONS: Array<{ value: ArticleImageSize; label: string }> = [
  { value: "sm", label: "Kecil" },
  { value: "md", label: "Sedang" },
  { value: "lg", label: "Besar" },
  { value: "full", label: "Penuh" },
];

const IMAGE_WRAP_SIZE_OPTIONS: Array<{ value: Exclude<ArticleImageSize, "full">; label: string }> = [
  { value: "sm", label: "Kecil" },
  { value: "md", label: "Sedang" },
  { value: "lg", label: "Besar" },
];

const IMAGE_ALIGN_OPTIONS: Array<{ value: ArticleImageAlign; label: string }> = [
  { value: "left", label: "Kiri" },
  { value: "center", label: "Tengah" },
  { value: "right", label: "Kanan" },
];

const IMAGE_LAYOUT_OPTIONS: Array<{ value: ArticleImageLayout; label: string }> = [
  { value: "block", label: "Baris Penuh" },
  { value: "wrap-left", label: "Wrap Kiri" },
  { value: "wrap-right", label: "Wrap Kanan" },
];

export default function TiptapArticleEditor({
  value,
  onChange,
  placeholder,
  onRequestImage,
  onRequestFile,
  mediaToInsert,
  onMediaInserted,
}: TiptapArticleEditorProps) {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const colorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editorStageRef = useRef<HTMLDivElement | null>(null);
  const [colorMenuPosition, setColorMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [hoveredImageOverlay, setHoveredImageOverlay] = useState<{ top: number; left: number; visible: boolean; pos: number | null }>({
    top: 0,
    left: 0,
    visible: false,
    pos: null,
  });
  const [isImageSettingsModalOpen, setIsImageSettingsModalOpen] = useState(false);
  const [editingImagePos, setEditingImagePos] = useState<number | null>(null);
  const [imageSettingsDraft, setImageSettingsDraft] = useState<ImageSettingsDraft>({
    alt: "",
    caption: "",
    captionAlign: "center",
    linkHref: "",
    openInNewTab: true,
    align: "center",
    size: "full",
    layout: "block",
  });

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
        },
      }),
      ArticleImage,
      PdfEmbed,
      SocialEmbed,
      Placeholder.configure({
        placeholder: placeholder || "Tulis konten di sini...",
      }),
      CharacterCount,
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[600px] px-8 py-6 focus:outline-none",
      },
      handlePaste: (view, event) => {
        const pastedText = event.clipboardData?.getData("text/plain")?.trim() || "";
        if (!pastedText || /\s/.test(pastedText)) return false;

        const embedInfo = getVideoEmbedInfo(pastedText);
        if (!embedInfo) return false;

        const socialEmbedType = view.state.schema.nodes.socialEmbed;
        const paragraphType = view.state.schema.nodes.paragraph;
        if (!socialEmbedType || !paragraphType) return false;

        event.preventDefault();

        const embedNode = socialEmbedType.create({ url: pastedText });
        const paragraphNode = paragraphType.create();
        const tr = view.state.tr.replaceSelectionWith(embedNode, false);
        const insertPos = tr.selection.to;
        tr.insert(insertPos, paragraphNode);
        view.dispatch(tr.scrollIntoView());
        return true;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const nextHtml = value || "";
    if (currentHtml === nextHtml) return;
    editor.commands.setContent(nextHtml, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !mediaToInsert) return;

    const isPdf =
      mediaToInsert.fileUrl.toLowerCase().endsWith(".pdf") ||
      (mediaToInsert.isFile && String(mediaToInsert.alt || "").toLowerCase().endsWith(".pdf"));

    if (isPdf) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "pdfEmbed",
          attrs: {
            src: normalizeUrl(mediaToInsert.fileUrl),
            title: mediaToInsert.alt || "Dokumen PDF",
          },
        })
        .run();
      editor.chain().focus().createParagraphNear().run();
    } else if (mediaToInsert.type === "file" || mediaToInsert.isFile) {
      editor.chain().focus().insertContent(buildFileLinkHtml(mediaToInsert.fileUrl, mediaToInsert.alt || "Download File")).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "articleImage",
          attrs: {
          src: normalizeUrl(mediaToInsert.fileUrl),
          alt: mediaToInsert.alt || "",
            title: mediaToInsert.alt || "",
            caption: mediaToInsert.alt || "",
          captionAlign: "center",
            linkHref: "",
            openInNewTab: true,
            align: "center",
            size: "full",
            layout: "block",
          },
        })
        .run();
      editor.chain().focus().createParagraphNear().run();
    }

    onMediaInserted?.();
  }, [editor, mediaToInsert, onMediaInserted]);

  useEffect(() => {
    if (!isColorMenuOpen) return;

    const updateColorMenuPosition = () => {
      if (!colorTriggerRef.current) return;
      const rect = colorTriggerRef.current.getBoundingClientRect();
      const menuWidth = window.innerWidth >= 640 ? 240 : 224;
      const viewportPadding = 12;
      const nextLeft = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - menuWidth - viewportPadding
      );
      setColorMenuPosition({
        top: rect.bottom + 8,
        left: nextLeft,
      });
    };

    updateColorMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as globalThis.Node;
      if (colorMenuRef.current?.contains(target)) return;
      if (colorTriggerRef.current?.contains(target)) return;
      setIsColorMenuOpen(false);
    };

    const handleViewportChange = () => {
      updateColorMenuPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isColorMenuOpen]);

  useEffect(() => {
    const html = value || "";
    if (!html.includes("tiktok.com/")) return;
    const timeoutId = window.setTimeout(() => {
      refreshTikTokEmbeds();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const html = value || "";
    if (!html.includes("facebook.com/") && !html.includes("fb.watch/")) return;
    const timeoutId = window.setTimeout(() => {
      refreshFacebookEmbeds();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Masukkan URL tautan", previousUrl);
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };
  const insertVideoEmbed = () => {
    if (!editor) return;
    const url = window.prompt("Masukkan URL video/embed sosial", "");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!getVideoEmbedInfo(trimmed)) {
      window.alert("Link belum didukung. Gunakan YouTube, Vimeo, Instagram, X/Twitter, Threads, TikTok, Facebook, Facebook Post, atau Dailymotion.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "socialEmbed",
        attrs: { url: trimmed },
      })
      .createParagraphNear()
      .run();
  };

  const blockTypeValue = editor?.isActive("blockquote")
    ? "blockquote"
    : editor?.isActive("heading", { level: 1 })
      ? "h1"
      : editor?.isActive("heading", { level: 2 })
        ? "h2"
        : editor?.isActive("heading", { level: 3 })
          ? "h3"
          : "paragraph";

  const wordCount = editor?.storage.characterCount?.words?.() ?? 0;
  const characterCount = editor?.storage.characterCount?.characters?.() ?? 0;
  const activeTextColor = (editor?.getAttributes("textStyle").color as string | undefined) || "";
  const getImageAttrsAtPos = useCallback((pos: number | null) => {
    if (!editor || pos === null) return null;
    const node = editor.state.doc.nodeAt(pos);
    if (!node || node.type.name !== "articleImage") return null;
    return node.attrs as Record<string, unknown>;
  }, [editor]);
  const getImageDraftFromAttrs = (attrs: Record<string, unknown> | null | undefined): ImageSettingsDraft => ({
    alt: typeof attrs?.alt === "string" ? attrs.alt : "",
    caption: typeof attrs?.caption === "string" ? attrs.caption : "",
    captionAlign: IMAGE_ALIGN_CLASSES.includes(attrs?.captionAlign as ArticleImageAlign)
      ? (attrs?.captionAlign as ArticleImageAlign)
      : "center",
    linkHref: typeof attrs?.linkHref === "string" ? attrs.linkHref : "",
    openInNewTab: attrs?.openInNewTab === false || attrs?.openInNewTab === "false" ? false : true,
    align: IMAGE_ALIGN_CLASSES.includes(attrs?.align as ArticleImageAlign) ? (attrs?.align as ArticleImageAlign) : "center",
    size: IMAGE_SIZE_CLASSES.includes(attrs?.size as ArticleImageSize) ? (attrs?.size as ArticleImageSize) : "full",
    layout: IMAGE_LAYOUT_CLASSES.includes(attrs?.layout as ArticleImageLayout) ? (attrs?.layout as ArticleImageLayout) : "block",
  });
  const selectImageAtPos = (pos: number | null) => {
    if (!editor || pos === null) return false;
    return editor.chain().focus().setNodeSelection(pos).run();
  };
  const applyImageUpdateAtPos = (pos: number | null, attrs: Record<string, string | boolean>) => {
    if (!editor || pos === null) return;
    if (!selectImageAtPos(pos)) return;
    editor.chain().focus().updateAttributes("articleImage", attrs).run();
  };
  const deleteImageAtPos = (pos: number | null) => {
    if (!editor || pos === null) return;
    if (!selectImageAtPos(pos)) return;
    editor.chain().focus().deleteSelection().run();
  };
  const openImageSettingsModal = (pos: number | null) => {
    if (pos === null) return;
    selectImageAtPos(pos);
    const attrs = getImageAttrsAtPos(pos);
    if (!attrs) return;
    setEditingImagePos(pos);
    setImageSettingsDraft(getImageDraftFromAttrs(attrs));
    setIsImageSettingsModalOpen(true);
    setHoveredImageOverlay((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (!editorStageRef.current) return;

    const stageEl = editorStageRef.current;
    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-image-overlay-gear='true']")) return;
      if (isImageSettingsModalOpen) return;

      const figure = target.closest("figure.article-image") as HTMLElement | null;
      if (!figure || !stageEl.contains(figure)) {
        setHoveredImageOverlay((prev) => (prev.visible ? { ...prev, visible: false, pos: null } : prev));
        return;
      }

      if (!editor) return;
      const figureRect = figure.getBoundingClientRect();
      const stageRect = stageEl.getBoundingClientRect();
      let pos: number | null = null;

      try {
        pos = editor.view.posAtDOM(figure, 0);
      } catch {
        pos = null;
      }

      setHoveredImageOverlay({
        top: Math.max(28, figureRect.top - stageRect.top + stageEl.scrollTop + figureRect.height / 2 + 14),
        left: Math.max(20, figureRect.left - stageRect.left + stageEl.scrollLeft + figureRect.width / 2),
        visible: true,
        pos,
      });
    };

    const handleMouseLeave = () => {
      setHoveredImageOverlay((prev) => ({ ...prev, visible: false, pos: null }));
    };

    stageEl.addEventListener("mousemove", handleMouseMove);
    stageEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      stageEl.removeEventListener("mousemove", handleMouseMove);
      stageEl.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor, isImageSettingsModalOpen]);

  useEffect(() => {
    if (!isImageSettingsModalOpen) return;
    if (editingImagePos === null) return;

    const latestAttrs = getImageAttrsAtPos(editingImagePos);
    if (!latestAttrs) {
      setIsImageSettingsModalOpen(false);
      setEditingImagePos(null);
    }
  }, [editingImagePos, getImageAttrsAtPos, isImageSettingsModalOpen]);

  return (
    <div className="tiptap-wrapper mb-6 flex h-full flex-col overflow-visible rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <style jsx global>{`
        .tiptap-wrapper .tiptap-editor p {
          margin: 0 0 0.95em;
        }
        .tiptap-wrapper .tiptap-editor p:last-child {
          margin-bottom: 0;
        }
        .tiptap-wrapper .tiptap-editor h1,
        .tiptap-wrapper .tiptap-editor h2,
        .tiptap-wrapper .tiptap-editor h3 {
          line-height: 1.25;
          margin: 1.2em 0 0.6em;
          font-weight: 700;
        }
        .tiptap-wrapper .tiptap-editor h1 {
          font-size: 2rem;
        }
        .tiptap-wrapper .tiptap-editor h2 {
          font-size: 1.5rem;
        }
        .tiptap-wrapper .tiptap-editor h3 {
          font-size: 1.25rem;
        }
        .tiptap-wrapper .tiptap-editor ul,
        .tiptap-wrapper .tiptap-editor ol {
          margin: 0 0 1rem 1.25rem;
          padding-left: 1.25rem;
        }
        .tiptap-wrapper .tiptap-editor ul {
          list-style: disc;
        }
        .tiptap-wrapper .tiptap-editor ol {
          list-style: decimal;
        }
        .tiptap-wrapper .tiptap-editor li {
          display: list-item;
          margin: 0.25rem 0;
        }
        .tiptap-wrapper .tiptap-editor li > p {
          margin: 0;
        }
        .tiptap-wrapper .tiptap-editor blockquote {
          margin: 1rem 0;
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          color: #4b5563;
        }
        .tiptap-wrapper .tiptap-editor em,
        .tiptap-wrapper .tiptap-editor i {
          font-style: italic !important;
          font-synthesis: style weight;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image {
          margin: 1.25rem auto;
        }
        .tiptap-wrapper .tiptap-editor::after {
          content: "";
          display: block;
          clear: both;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--left {
          margin-left: 0;
          margin-right: auto;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--center {
          margin-left: auto;
          margin-right: auto;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--right {
          margin-left: auto;
          margin-right: 0;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--sm {
          width: min(40%, 320px);
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--md {
          width: min(60%, 520px);
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--lg {
          width: min(80%, 760px);
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--full {
          width: 100%;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left {
          float: left;
          clear: none;
          display: block;
          max-width: min(75%, 760px);
          margin: 0.25rem 1.35rem 1rem 0;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right {
          float: right;
          clear: none;
          display: block;
          max-width: min(75%, 760px);
          margin: 0.25rem 0 1rem 1.35rem;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left.article-image--sm,
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right.article-image--sm {
          width: 25%;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left.article-image--md,
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right.article-image--md {
          width: 50%;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left.article-image--lg,
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right.article-image--lg {
          width: 65%;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left.article-image--full,
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right.article-image--full {
          width: 65%;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image a.article-image__link {
          display: block;
          text-decoration: none;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image img.article-image__img {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 0;
          display: block;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image figcaption.article-image__caption {
          margin-top: 0.65rem;
          font-size: 0.8125rem;
          line-height: 1.6;
          color: #6b7280;
          font-style: italic;
          letter-spacing: 0.01em;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left figcaption.article-image__caption,
        .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right figcaption.article-image__caption {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          line-height: 1.5;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image figcaption.article-image__caption.article-image__caption--left {
          text-align: left;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image figcaption.article-image__caption.article-image__caption--center {
          text-align: center;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image figcaption.article-image__caption.article-image__caption--right {
          text-align: right;
        }
        .tiptap-wrapper .tiptap-editor figure.article-image.ProseMirror-selectednode img.article-image__img {
          outline: 3px solid rgba(59, 130, 246, 0.45);
          outline-offset: 2px;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed {
          margin: 1.5rem 0;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 0.85rem;
          background: #000;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__placeholder {
          display: flex;
          min-height: 180px;
          flex-direction: column;
          justify-content: center;
          gap: 0.75rem;
          border-radius: 0.85rem;
          border: 1px solid #e5e7eb;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          padding: 1rem 1.125rem;
          color: #0f172a;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__placeholder p {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #475569;
          word-break: break-word;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__fallback-link {
          display: inline-flex;
          margin-top: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--tiktok {
          overflow: hidden;
          border-radius: 0.85rem;
          border: 1px solid #e5e7eb;
          background: #fff;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--tiktok .tiktok-embed {
          margin: 0 !important;
          max-width: 100% !important;
          min-width: 100% !important;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook {
          overflow: hidden;
          border-radius: 0.85rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 0;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb-video,
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb-post,
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb_iframe_widget,
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb_iframe_widget span,
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb_iframe_widget iframe {
          width: 100% !important;
          max-width: 100% !important;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed .social-embed__facebook .fb_iframe_widget iframe {
          border: 0 !important;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--portrait .social-embed__frame {
          aspect-ratio: 9 / 16;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--instagram .social-embed__frame {
          height: 1500px;
          aspect-ratio: auto;
          border: 1px solid #e5e7eb;
          background: #fff;
        }
        @media (min-width: 640px) {
          .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--instagram .social-embed__frame {
            height: 1560px;
          }
        }
        @media (min-width: 1024px) {
          .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--instagram .social-embed__frame {
            height: 1480px;
          }
        }
        @media (min-width: 1280px) {
          .tiptap-wrapper .tiptap-editor figure.social-embed.social-embed--instagram .social-embed__frame {
            height: 1400px;
          }
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed iframe.social-embed__iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed oembed {
          display: none;
        }
        .tiptap-wrapper .tiptap-editor figure.social-embed.ProseMirror-selectednode .social-embed__frame {
          outline: 3px solid rgba(59, 130, 246, 0.45);
          outline-offset: 2px;
        }
        .tiptap-wrapper .tiptap-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        .tiptap-wrapper input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .tiptap-wrapper input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 4px;
        }
        .tiptap-wrapper .tiptap-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        @media (max-width: 768px) {
          .tiptap-wrapper {
            border-radius: 0.875rem;
          }
          .tiptap-wrapper .tiptap-editor {
            min-height: 400px;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-left,
          .tiptap-wrapper .tiptap-editor figure.article-image.article-image--wrap-right {
            float: none;
            width: 100%;
            margin: 1rem auto;
          }
        }
      `}</style>

      <div ref={editorStageRef} className="relative flex-1 min-h-0">
        <div
          className="sticky z-10 overflow-x-auto border-b border-[#c7c7c7] bg-[#e9eaed] px-2 py-2 shadow-sm sm:px-3"
          style={{ top: "var(--admin-header-height, 64px)" }}
        >
          <div className="flex min-w-max items-center gap-1">
            <select
              value={blockTypeValue}
              onChange={(e) => {
                if (!editor) return;
                const next = e.target.value;
                if (next === "blockquote") {
                  editor.chain().focus().setParagraph().toggleBlockquote().run();
                  return;
                }
                if (next === "h1") {
                  editor.chain().focus().setHeading({ level: 1 }).run();
                  return;
                }
                if (next === "h2") {
                  editor.chain().focus().setHeading({ level: 2 }).run();
                  return;
                }
                if (next === "h3") {
                  editor.chain().focus().setHeading({ level: 3 }).run();
                  return;
                }
                editor.chain().focus().setParagraph().run();
              }}
              className="h-8 min-w-[96px] rounded border border-[#c9c9c9] bg-[#f8f9fa] px-2 text-[11px] font-medium text-[#444] shadow-sm outline-none focus:border-[#9ec5fe] focus:ring-2 focus:ring-[#d2e3fc] sm:h-9 sm:min-w-[112px] sm:text-xs"
              title="Format blok"
            >
              <option value="paragraph">Normal text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
            </select>
            <ToolbarDivider />
            <ToolbarButton title="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
              <span className="text-sm font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton title="Miring (Italic)" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <span className="text-sm italic font-semibold">I</span>
            </ToolbarButton>
            <ToolbarButton title="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
              <span className="text-sm underline decoration-2 font-semibold">U</span>
            </ToolbarButton>
            <ToolbarButton title="Strike" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}>
              <span className="text-sm line-through font-semibold">S</span>
            </ToolbarButton>
            <div className="relative">
              <button
                ref={colorTriggerRef}
                type="button"
                onClick={() => setIsColorMenuOpen((prev) => !prev)}
                title="Warna teks"
                className={`inline-flex h-8 items-center gap-1 rounded border px-1.5 text-[11px] font-medium shadow-sm transition-colors sm:h-9 sm:px-2 sm:text-xs ${
                  activeTextColor
                    ? "border-[#9ec5fe] bg-[#e8f0fe] text-[#0b57d0]"
                    : "border-[#c9c9c9] bg-[#f8f9fa] text-[#444] hover:bg-[#f1f3f4]"
                }`}
              >
                <span className="inline-flex flex-col items-center leading-none">
                  <span className="text-sm font-semibold">A</span>
                  <span
                    className="mt-0.5 h-[2px] w-4 rounded-full"
                    style={{ backgroundColor: activeTextColor || "#111827" }}
                  />
                </span>
                <ChevronDown size={13} />
              </button>
            </div>
            <ToolbarDivider />
            <ToolbarButton title="Blockquote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton title="Bullet List" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <List size={15} />
            </ToolbarButton>
            <ToolbarButton title="Ordered List" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={15} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Link" active={editor?.isActive("link")} onClick={setLink}>
              <LinkIcon size={15} />
            </ToolbarButton>
            <ToolbarButton title="Embed Video" onClick={insertVideoEmbed}>
              <span className="text-sm font-bold">▶</span>
            </ToolbarButton>
            {onRequestImage && (
              <ToolbarButton title="Insert Image" onClick={onRequestImage}>
                <ImageIcon size={15} />
              </ToolbarButton>
            )}
            {(onRequestFile || onRequestImage) && (
              <ToolbarButton title="Insert PDF" onClick={() => (onRequestFile || onRequestImage)?.()}>
                <FileText size={15} />
              </ToolbarButton>
            )}
            <ToolbarButton title="Hapus Format" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
              <RemoveFormatting size={15} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Undo" onClick={() => editor?.chain().focus().undo().run()}>
              <Undo2 size={15} />
            </ToolbarButton>
            <ToolbarButton title="Redo" onClick={() => editor?.chain().focus().redo().run()}>
              <Redo2 size={15} />
            </ToolbarButton>
          </div>
        </div>

        <div
          data-image-overlay-gear="true"
          className={`absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 transition-opacity ${hoveredImageOverlay.visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{
            top: `${hoveredImageOverlay.top}px`,
            left: `${hoveredImageOverlay.left}px`,
          }}
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => openImageSettingsModal(hoveredImageOverlay.pos)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-black/65 text-white shadow-lg transition hover:bg-black/80"
            title="Pengaturan gambar"
          >
            <Settings2 size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              deleteImageAtPos(hoveredImageOverlay.pos);
              setHoveredImageOverlay((prev) => ({ ...prev, visible: false, pos: null }));
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-[#b42318]/90 text-white shadow-lg transition hover:bg-[#b42318]"
            title="Hapus gambar"
          >
            <X size={15} />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      {isColorMenuOpen && colorMenuPosition
        ? createPortal(
            <div
              ref={colorMenuRef}
              className="fixed z-[120] w-56 rounded border border-[#c9c9c9] bg-white p-2 shadow-lg sm:w-60"
              style={{ top: colorMenuPosition.top, left: colorMenuPosition.left }}
            >
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#666]">Warna teks</div>
              <div className="mb-2 grid grid-cols-6 gap-1.5">
                {TEXT_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor?.chain().focus().setColor(color).run();
                      setIsColorMenuOpen(false);
                    }}
                    className={`h-6 w-6 rounded border ${
                      activeTextColor === color ? "border-[#0b57d0] ring-2 ring-[#d2e3fc]" : "border-[#c9c9c9]"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeTextColor || "#111827"}
                  onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                  className="h-8 w-9 cursor-pointer rounded border border-[#c9c9c9] bg-transparent p-0"
                  title="Pilih warna teks"
                />
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().unsetColor().run();
                    setIsColorMenuOpen(false);
                  }}
                  className="inline-flex h-8 items-center rounded border border-[#c9c9c9] bg-[#f8f9fa] px-2 text-[11px] font-medium text-[#444] hover:bg-[#f1f3f4]"
                >
                  Reset
                </button>
              </div>
            </div>,
            document.body
          )
        : null}

      {isImageSettingsModalOpen && editingImagePos !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[calc(100vh-7rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-6 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-[var(--fg-primary)]">
                  <span>Pengaturan Gambar</span>
                  <span className="rounded-md border border-[var(--border)] bg-[var(--accent-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    Artikel
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImageSettingsModalOpen(false);
                  setEditingImagePos(null);
                }}
                className="rounded-lg p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-base)] hover:text-[var(--fg-primary)]"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto p-4">
              <ImageSettingsCollapseCard title="Informasi Gambar" defaultOpen>
                <div className="space-y-3">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium text-[var(--fg-primary)]">Alt</div>
                    <input
                      type="text"
                      value={imageSettingsDraft.alt}
                      onChange={(e) => setImageSettingsDraft((prev) => ({ ...prev, alt: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                      placeholder="Deskripsi gambar"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1 text-xs font-medium text-[var(--fg-primary)]">Caption</div>
                    <textarea
                      value={imageSettingsDraft.caption}
                      onChange={(e) => setImageSettingsDraft((prev) => ({ ...prev, caption: e.target.value }))}
                      className="min-h-[72px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                      placeholder="Tambahkan caption gambar"
                    />
                  </label>
                  <div>
                    <div className="mb-2 text-xs font-medium text-[var(--fg-primary)]">Align Caption</div>
                    <div className="grid grid-cols-3 gap-2">
                      {IMAGE_ALIGN_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setImageSettingsDraft((prev) => ({ ...prev, captionAlign: option.value }))}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            imageSettingsDraft.captionAlign === option.value
                              ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ImageSettingsCollapseCard>

              <ImageSettingsCollapseCard title="Tautan Gambar">
                <div className="space-y-3">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium text-[var(--fg-primary)]">Link</div>
                    <input
                      type="text"
                      value={imageSettingsDraft.linkHref}
                      onChange={(e) => setImageSettingsDraft((prev) => ({ ...prev, linkHref: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                      placeholder="https://example.com atau /halaman"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2.5">
                    <span className="text-xs font-medium text-[var(--fg-primary)]">Buka di tab baru</span>
                    <input
                      type="checkbox"
                      checked={imageSettingsDraft.openInNewTab}
                      onChange={(e) => setImageSettingsDraft((prev) => ({ ...prev, openInNewTab: e.target.checked }))}
                      className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                  </label>
                </div>
              </ImageSettingsCollapseCard>

              <ImageSettingsCollapseCard title="Tata Letak">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-xs font-medium text-[var(--fg-primary)]">Mode Gambar</div>
                    <div className="grid grid-cols-3 gap-2">
                      {IMAGE_LAYOUT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setImageSettingsDraft((prev) => ({
                              ...prev,
                              layout: option.value,
                              size: option.value !== "block" && prev.size === "full" ? "md" : prev.size,
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            imageSettingsDraft.layout === option.value
                              ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-medium text-[var(--fg-primary)]">
                      {imageSettingsDraft.layout === "block" ? "Ukuran Gambar" : "Ukuran Wrap"}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(imageSettingsDraft.layout === "block" ? IMAGE_SIZE_OPTIONS : IMAGE_WRAP_SIZE_OPTIONS).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setImageSettingsDraft((prev) => ({ ...prev, size: option.value }))}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            imageSettingsDraft.size === option.value
                              ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ImageSettingsCollapseCard>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageSettingsModalOpen(false);
                    setEditingImagePos(null);
                  }}
                  className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const normalizedLayout = imageSettingsDraft.layout;
                    const normalizedAlign =
                      normalizedLayout === "wrap-left"
                        ? "left"
                        : normalizedLayout === "wrap-right"
                          ? "right"
                          : imageSettingsDraft.align;
                    const normalizedSize =
                      normalizedLayout !== "block" && imageSettingsDraft.size === "full"
                        ? "md"
                        : imageSettingsDraft.size;
                    applyImageUpdateAtPos(editingImagePos, {
                      alt: imageSettingsDraft.alt,
                      title: imageSettingsDraft.alt,
                      caption: imageSettingsDraft.caption,
                      captionAlign: imageSettingsDraft.captionAlign,
                      linkHref: imageSettingsDraft.linkHref.trim(),
                      openInNewTab: imageSettingsDraft.openInNewTab,
                      align: normalizedAlign,
                      size: normalizedSize,
                      layout: normalizedLayout,
                    });
                    setIsImageSettingsModalOpen(false);
                  }}
                  className="inline-flex h-10 items-center rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:opacity-90"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <span className="hidden text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] sm:inline-block">Insert:</span>

          {onRequestImage && (
            <button
              type="button"
              onClick={onRequestImage}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 sm:flex-none sm:py-1.5"
              title="Insert Image"
            >
              <ImageIcon size={14} className="text-blue-600" />
              <span>Image</span>
            </button>
          )}

          {(onRequestFile || onRequestImage) && (
            <button
              type="button"
              onClick={() => (onRequestFile || onRequestImage)?.()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 sm:flex-none sm:py-1.5"
              title="Insert PDF Document"
            >
              <FileText size={14} className="text-red-600" />
              <span>PDF</span>
            </button>
          )}
        </div>

        <div className="hidden text-[11px] text-[var(--fg-muted)] lg:block">
          Toolbar disusun menyerupai editor klasik agar format teks lebih cepat dipakai.
        </div>
        <div className="flex w-full items-center justify-end gap-4 rounded-full border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-xs font-medium text-[var(--fg-secondary)] sm:w-auto">
          <span className="flex items-center gap-1">
            <span className="font-bold text-[var(--fg-primary)]">{wordCount}</span>
            <span className="text-[var(--fg-muted)]">words</span>
          </span>
          <span className="h-3 w-px bg-[var(--border)]"></span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-[var(--fg-primary)]">{characterCount}</span>
            <span className="text-[var(--fg-muted)]">chars</span>
          </span>
        </div>
      </div>
    </div>
  );
}
