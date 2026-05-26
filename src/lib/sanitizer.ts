import sanitizeHtml from 'sanitize-html';

export const sanitizeContent = (html: string): string => {
  if (!html) return "";

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
      if (prop === "color") continue;
      if (prop === "background" || prop === "background-color") continue;
      if (prop.startsWith("background-")) continue;
      kept.push(`${prop}: ${value}`);
    }

    const cleaned = kept.join("; ");
    return cleaned ? cleaned : undefined;
  };

  return sanitizeHtml(html, {
    allowedTags: [
      // Block elements
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
      "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div",
      "table", "thead", "caption", "tbody", "tr", "th", "td", "pre", "iframe",
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
      '*': [ 'style', 'class', 'id', 'align' ]
    },
    allowedSchemes: [ 'http', 'https', 'mailto' ],
    allowedSchemesByTag: {
      img: [ 'http', 'https', 'data' ], // Allow data URI for images
      source: [ 'http', 'https', 'data' ],
      a: [ 'http', 'https', 'mailto' ] // Explicitly restrict 'a' href
    },
    allowProtocolRelative: false, // Block //evil.com
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
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const newAttribs: { [key: string]: string } = {
          ...attribs,
          rel: "noopener noreferrer",
        };
        if (newAttribs.href && !newAttribs.href.startsWith("/") && !newAttribs.href.startsWith("#")) {
          newAttribs.target = "_blank";
        }
        return { tagName, attribs: newAttribs };
      },
    },
  });
};
