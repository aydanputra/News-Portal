import sanitizeHtml from 'sanitize-html';

const isSafeInlineColor = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(normalized)) return true;
  if (/^rgba?\(\s*(\d{1,3}\s*,\s*){2}\d{1,3}(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.test(normalized)) return true;
  if (/^hsla?\(\s*\d{1,3}(\.\d+)?(?:deg)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.test(normalized)) return true;

  return [
    "black",
    "white",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "gray",
    "grey",
    "brown",
    "teal",
    "cyan",
    "magenta",
    "lime",
    "navy",
    "maroon",
    "olive",
    "silver",
    "aqua",
    "fuchsia",
    "transparent",
    "currentcolor",
    "inherit",
  ].includes(normalized);
};

const cleanInlineStyle = (style: unknown): string | undefined => {
  if (typeof style !== "string") return undefined;
  const parts = style
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);

  const kept: string[] = [];
  for (const part of parts) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const value = part.slice(idx + 1).trim();
    if (!prop || !value) continue;
    if (prop === "color") {
      if (isSafeInlineColor(value)) kept.push(`${prop}: ${value}`);
      continue;
    }
    if (prop === "background" || prop === "background-color") continue;
    if (prop.startsWith("background-")) continue;
    kept.push(`${prop}: ${value}`);
  }

  const cleaned = kept.join("; ");
  return cleaned ? cleaned : undefined;
};

export const sanitizeContent = (html: string): string => {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      // Block elements
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
      "nl", "li", "b", "i", "strong", "em", "u", "s", "del", "strike", "code", "hr", "br", "div",
      "table", "thead", "caption", "tbody", "tr", "th", "td", "pre", "iframe",
      "aside",
      "figure", "figcaption", "img", "video", "source", "span", "oembed"
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
      a: [ 'href', 'name', 'target', 'rel', 'title' ],
      // Images
      img: [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style' ],
      // Videos & Iframes (YouTube embeds)
      iframe: [ 'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title' ],
      video: [ 'src', 'width', 'height', 'controls', 'poster', 'loop', 'muted', 'autoplay' ],
      source: [ 'src', 'type' ],
      oembed: [ 'url' ],
      // Global attributes
      '*': [
        'style',
        'class',
        'id',
        'align',
        'data-print-ad-id',
        'data-print-custom-ad',
        'data-print-ad-position',
        'data-inline-related',
        'data-inline-related-slot',
      ]
    },
    allowedSchemes: [ 'http', 'https', 'mailto' ],
    allowedSchemesByTag: {
      img: [ 'http', 'https', 'data' ], // Allow data URI for images
      source: [ 'http', 'https', 'data' ],
      a: [ 'http', 'https', 'mailto' ] // Explicitly restrict 'a' href
    },
    allowProtocolRelative: false, // Block //evil.com
    allowIframeRelativeUrls: true,
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
    transformTags: {
      '*': (tagName, attribs) => {
        const newAttribs: { [key: string]: string } = { ...attribs };
        if (typeof newAttribs.style === "string") {
          const cleaned = cleanInlineStyle(newAttribs.style);
          if (cleaned) newAttribs.style = cleaned;
          else delete newAttribs.style;
        }
        return { tagName, attribs: newAttribs };
      },
      'a': (tagName, attribs) => {
          // Force secure attributes
          const newAttribs: { [key: string]: string } = { 
              ...attribs, 
              rel: 'noopener noreferrer' 
          };
          
          // Force target="_blank" for external links if needed
          if (newAttribs.href && !newAttribs.href.startsWith('/') && !newAttribs.href.startsWith('#')) {
              newAttribs.target = '_blank';
          }

          if (typeof newAttribs.style === "string") {
            const cleaned = cleanInlineStyle(newAttribs.style);
            if (cleaned) newAttribs.style = cleaned;
            else delete newAttribs.style;
          }

          return {
              tagName: 'a',
              attribs: newAttribs
          };
      }
    }
  });
};

export const sanitizePageContent = (html: string): string => {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "code",
      "hr",
      "br",
      "div",
      "pre",
      "figure",
      "figcaption",
      "img",
      "span",
    ],
    disallowedTagsMode: "discard",
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "class", "style"],
      "*": ["style", "class", "id", "align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      "*": (tagName, attribs) => {
        const newAttribs: { [key: string]: string } = { ...attribs };
        if (typeof newAttribs.style === "string") {
          const cleaned = cleanInlineStyle(newAttribs.style);
          if (cleaned) newAttribs.style = cleaned;
          else delete newAttribs.style;
        }
        return { tagName, attribs: newAttribs };
      },
      a: (tagName, attribs) => {
        const newAttribs: { [key: string]: string } = {
          ...attribs,
          rel: "noopener noreferrer",
        };
        if (newAttribs.href && !newAttribs.href.startsWith("/") && !newAttribs.href.startsWith("#")) {
          newAttribs.target = "_blank";
        }
        if (typeof newAttribs.style === "string") {
          const cleaned = cleanInlineStyle(newAttribs.style);
          if (cleaned) newAttribs.style = cleaned;
          else delete newAttribs.style;
        }
        return { tagName, attribs: newAttribs };
      },
    },
  });
};

export function sanitizeInsertCode(raw: unknown, target: "head" | "body" | "footer"): string {
  const value = typeof raw === "string" ? raw : "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const maxLen = 200_000;
  const bounded = trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;

  const allowedTags =
    target === "head"
      ? ["script", "meta", "link", "noscript", "div", "span"]
      : ["script", "noscript", "iframe", "div", "span", "img"];

  return sanitizeHtml(bounded, {
    allowedTags,
    disallowedTagsMode: "discard",
    allowedAttributes: {
      script: ["src", "async", "defer", "type", "id", "crossorigin", "referrerpolicy"],
      meta: ["charset", "name", "content", "http-equiv", "property"],
      link: ["rel", "href", "as", "type", "sizes", "media", "crossorigin", "referrerpolicy"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "loading", "referrerpolicy", "sandbox", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["id", "class"],
    },
    allowedSchemes: ["http", "https"],
    allowedSchemesByTag: {
      script: ["http", "https"],
      iframe: ["http", "https"],
      img: ["http", "https"],
      link: ["http", "https"],
    },
    allowProtocolRelative: false,
  });
}

export function sanitizeExternalUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("#")) return value;
  if (value.toLowerCase().startsWith("javascript:")) return "";
  if (value.toLowerCase().startsWith("data:")) return "";
  if (value.toLowerCase().startsWith("vbscript:")) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "mailto:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeCssUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) return "";
  if (/[<>"'()\\\n\r]/.test(value)) return "";
  if (value.startsWith("/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return "";
}

export function safeStyleTagCss(raw: string): string {
  const value = typeof raw === "string" ? raw : "";
  if (!value) return "";
  return value
    .replace(/\u0000/g, "")
    .replace(/<\/style/gi, "<\\/style")
    .replace(/<\/script/gi, "<\\/script");
}
