import { useEffect, useState } from "react";
import { Link2, Mail, Share2, Printer } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

type ShareNetwork = "facebook" | "x" | "whatsapp" | "telegram" | "linkedin" | "email" | "copy";
type ShareButtonNetwork = ShareNetwork | "print";

function BrandIcon({ network, size }: { network: ShareNetwork; size: number }) {
  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8H16l.4-3h-2.9V8.2c0-.9.3-1.5 1.6-1.5h1.5V4.1c-.3 0-1.1-.1-2.2-.1-2.9 0-4.4 1.6-4.4 4.4V10H7.5v3H10v8h3.5Z" />
      </svg>
    );
  }

  if (network === "x") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M18.9 3H21l-4.6 5.3L22 21h-4.8l-3.8-5-4.4 5H7l4.9-5.7L6.4 3h4.9l3.4 4.6L18.9 3Zm-1.7 15.2h1.3L11 4.7H9.6l7.6 13.5Z" />
      </svg>
    );
  }

  if (network === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M19.1 4.9A9.93 9.93 0 0 0 12 2C6.5 2 2 6.4 2 11.9c0 1.8.5 3.5 1.4 5L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.4 10-9.9 0-2.6-1-5.1-2.9-7ZM12 20c-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A7.93 7.93 0 0 1 4 12c0-4.4 3.6-8 8-8 2.1 0 4.1.8 5.7 2.3A7.95 7.95 0 0 1 20 12c0 4.4-3.6 8-8 8Zm4.4-5.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.4.6c-.1.2-.3.2-.5.1-.8-.4-1.5-.9-2.2-1.6-.5-.5-.9-1.1-1.2-1.7-.1-.2 0-.3.1-.5l.3-.4.2-.3c.1-.1 0-.3 0-.4l-.7-1.6c-.1-.3-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.6.6-.9 1.4-.9 2.2 0 .2.1.5.1.7.4 1.2 1.1 2.3 2 3.2.2.2 1.7 1.8 4.1 2.5.7.2 1.4.2 2.1.1.4-.1 1.2-.5 1.4-1 .2-.5.2-1 .1-1.1-.1-.1-.3-.2-.5-.3Z" />
      </svg>
    );
  }

  if (network === "telegram") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M21.4 4.6c.3-.9-.3-1.6-1.2-1.3L3.8 9.5c-1 .4-1 1 .2 1.4l4.2 1.3 1.6 5.1c.2.7.1 1 .9 1 .6 0 .8-.3 1.1-.7l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8L21.4 4.6Zm-11.3 7.3 8.2-5.2c.4-.3.8-.1.5.2l-6.7 6.1-.3 3.3-1.7-4.4Z" />
      </svg>
    );
  }

  if (network === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M6.2 8.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM4.7 9.8h3v9.5h-3V9.8Zm4.9 0h2.9v1.3h.1c.4-.7 1.4-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.9v4.9h-3v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.5h-3V9.8Z" />
      </svg>
    );
  }

  if (network === "email") return <Mail size={size} />;
  if (network === "copy") return <Link2 size={size} />;
  return <Printer size={size} />;
}

export default function PostShareWidget({
  post,
  accentColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const [isCopied, setIsCopied] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState("");
  useEffect(() => {
    if (preview) return;
    if (typeof window !== "undefined") setCurrentPageUrl(window.location.href);
  }, [preview]);

  const postPath = `/${post?.category?.slug || "kategori"}/${post?.slug || "post"}`;
  const postUrl = preview ? `https://preview.local${postPath}` : (currentPageUrl || `https://localhost${postPath}`);
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post?.title || "");
  const contentAlignValue = String(getResponsiveConfig("textAlign") || getResponsiveConfig("align") || "left");
  const justifyClass = contentAlignValue === "center" ? "justify-center" : contentAlignValue === "right" ? "justify-end" : "justify-start";
  const shareSize = String(getResponsiveConfig("shareSize") || "md");
  const shareShowContainerBorderValue = getResponsiveConfig("shareShowContainerBorder");
  const shareShowContainerBorder = typeof shareShowContainerBorderValue === "boolean" ? shareShowContainerBorderValue : getConfigBool("shareShowBorder", true);
  const showShareLabel = getConfigBool("showShareLabel", true);
  const rawLabelText = getResponsiveConfig("shareLabelText");
  const shareLabelText = typeof rawLabelText === "string" && rawLabelText.trim() !== "" ? rawLabelText.trim() : "Bagikan :";
  const labelPositionValue = String(getResponsiveConfig("shareLabelPosition") || "inline");
  const shareLabelPosition = labelPositionValue === "top" ? "top" : "inline";
  const shareThemeValue = String(getResponsiveConfig("shareTheme") || "brand");
  const shareTheme = shareThemeValue === "minimal" ? "minimal" : shareThemeValue === "outline" ? "outline" : "brand";
  const shareThemeColorValue = getResponsiveConfig("shareThemeColor");
  const shareOutlineColorValue = getResponsiveConfig("shareOutlineColor");
  const shareBrandColorValue = getResponsiveConfig("shareBrandColor");
  const contentModeValue = String(getResponsiveConfig("shareContentMode") || "icon_text");
  const shareContentMode = contentModeValue === "icon_only" ? "icon_only" : "icon_text";
  const iconOnlyShapeValue = String(getResponsiveConfig("iconOnlyShape") || "square");
  const iconOnlyShape = iconOnlyShapeValue === "circle" ? "circle" : "square";
  const shareLabelColorValue = getResponsiveConfig("shareLabelColor");
  const shareLabelColor = isPublicDarkMode ? "var(--fg-primary)" : (typeof shareLabelColorValue === "string" && shareLabelColorValue.trim() !== "" ? shareLabelColorValue : "var(--fg-primary)");
  const shareLabelFontSize = toPx(getResponsiveConfig("shareLabelFontSize")) || (preview ? "11px" : "14px");
  const shareLabelLineHeightValue = getResponsiveConfig("shareLabelLineHeight");
  const shareLabelLineHeight = typeof shareLabelLineHeightValue === "number"
    ? shareLabelLineHeightValue
    : (typeof shareLabelLineHeightValue === "string" && shareLabelLineHeightValue.trim() !== "" ? shareLabelLineHeightValue.trim() : 1.4);
  const shareLabelFontWeight = toFontWeight(getResponsiveConfig("shareLabelFontWeight"), "600");
  const gapValue = Number(getResponsiveConfig("shareGap"));
  const gap = Number.isFinite(gapValue) && gapValue >= 0 ? `${gapValue}px` : "8px";
  const radiusValue = String(getResponsiveConfig("shareRadius") || "global");
  const resolvedRadius = radiusValue === "sm" || radiusValue === "md" || radiusValue === "pill" || radiusValue === "global" ? radiusValue : "global";
  const containerRadius = resolvedRadius === "pill"
    ? "9999px"
    : resolvedRadius === "sm"
      ? "0.125rem"
      : resolvedRadius === "md"
        ? "0.375rem"
        : "var(--home-main-box-radius, var(--radius-global, 0.5rem))";
  const showFacebook = getConfigBool("showFacebook", true);
  const showTwitter = getConfigBool("showTwitter", true);
  const showWhatsapp = getConfigBool("showWhatsapp", true);
  const showTelegram = getConfigBool("showTelegram", false);
  const showLinkedIn = getConfigBool("showLinkedIn", false);
  const showEmail = getConfigBool("showEmail", false);
  const showCopyLink = getConfigBool("showCopyLink", true);
  const rawShareIconSize = Number(getResponsiveConfig("shareIconSize"));
  const defaultShareIconSize = shareContentMode === "icon_only" ? 20 : 14;
  const shareIconSize = Number.isFinite(rawShareIconSize) && rawShareIconSize >= 10 ? rawShareIconSize : defaultShareIconSize;
  const iconBadgeSize = Math.max(shareIconSize + (preview ? 8 : 10), shareIconSize);
  const shareThemeColor = typeof shareThemeColorValue === "string" && shareThemeColorValue.trim() !== ""
    ? shareThemeColorValue
    : (accentColor || "#111827");
  const shareThemeBorderColor = typeof shareThemeColorValue === "string" && shareThemeColorValue.trim() !== ""
    ? `${shareThemeColor}33`
    : (accentColor ? `${accentColor}33` : "rgba(17, 24, 39, 0.2)");
  const shareOutlineColor = typeof shareOutlineColorValue === "string" && shareOutlineColorValue.trim() !== ""
    ? shareOutlineColorValue
    : undefined;
  const shareBrandColor = typeof shareBrandColorValue === "string" && shareBrandColorValue.trim() !== ""
    ? shareBrandColorValue
    : undefined;
  const containerPadding = shareShowContainerBorder ? (preview ? "8px" : "12px") : "0px";
  const containerBorder = shareShowContainerBorder
    ? (isPublicDarkMode ? "1px solid rgba(148, 163, 184, 0.35)" : "1px solid var(--border)")
    : "none";
  const containerBackground = shareShowContainerBorder
    ? (isPublicDarkMode ? "rgba(15, 23, 42, 0.32)" : "var(--bg-elevated, rgba(248, 250, 252, 0.75))")
    : "transparent";
  const labelIconSize = preview ? 12 : 14;
  const baseClass = shareSize === "sm" ? (preview ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs") : shareSize === "lg" ? (preview ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm") : (preview ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-sm");
  const iconOnlyBaseClass = shareSize === "sm" ? (preview ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs") : shareSize === "lg" ? (preview ? "w-8 h-8 text-[11px]" : "w-11 h-11 text-sm") : (preview ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs");
  const getBtnClass = () => {
    const shapeClass = shareContentMode === "icon_only"
      ? (iconOnlyShape === "circle" ? "rounded-full" : (resolvedRadius === "global" ? "" : resolvedRadius === "pill" ? "rounded-full" : resolvedRadius === "sm" ? "rounded" : "rounded-md"))
      : (resolvedRadius === "global" ? "" : resolvedRadius === "pill" ? "rounded-full" : resolvedRadius === "sm" ? "rounded" : "rounded-md");
    const sizeClass = shareContentMode === "icon_only" ? `${iconOnlyBaseClass} ${shapeClass} justify-center` : `${baseClass} ${shapeClass}`;
    const themeHoverClass = isPublicDarkMode
      ? ""
      : shareTheme === "outline"
        ? " hover:bg-[color:var(--share-hover-bg)] hover:text-[color:var(--share-hover-text)] hover:border-[color:var(--share-hover-border)]"
        : shareTheme === "minimal"
          ? " hover:bg-[color:var(--share-hover-bg)] hover:border-[color:var(--share-hover-border)]"
          : "";
    return `${sizeClass} border inline-flex items-center gap-1.5 whitespace-nowrap font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md${themeHoverClass}`;
  };
  const getBtnStyle = (network: ShareButtonNetwork): React.CSSProperties & Record<string, string | undefined> => {
    if (isPublicDarkMode) return { backgroundColor: "rgba(30, 41, 59, 0.92)", color: "var(--fg-primary)", borderColor: "rgba(148, 163, 184, 0.35)", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined };
    const colorMap = { facebook: "#1877F2", x: "#111827", whatsapp: "#25D366", telegram: "#229ED9", linkedin: "#0A66C2", email: "#6B7280", copy: accentColor || "#111827", print: "#111827" } as const;
    const outlineColor = shareOutlineColor || colorMap[network];
    const brandColor = shareBrandColor || colorMap[network];
    if (shareTheme === "minimal") {
      return {
        color: shareThemeColor,
        backgroundColor: "var(--bg-base, #ffffff)",
        borderColor: shareThemeBorderColor,
        borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined,
        "--share-hover-bg": `${shareThemeColor}12`,
        "--share-hover-border": typeof shareThemeColorValue === "string" && shareThemeColorValue.trim() !== ""
          ? `${shareThemeColor}55`
          : (accentColor ? `${accentColor}55` : "rgba(17, 24, 39, 0.35)")
      };
    }
    if (shareTheme === "outline") {
      return {
        color: outlineColor,
        backgroundColor: "transparent",
        borderColor: outlineColor,
        borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined,
        "--share-hover-bg": outlineColor,
        "--share-hover-border": outlineColor,
        "--share-hover-text": "#ffffff"
      };
    }
    return { color: "#ffffff", backgroundColor: brandColor, borderColor: "transparent", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined };
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };
  const iconBadgeClass = isPublicDarkMode ? "inline-flex items-center justify-center rounded-full bg-[rgba(15,23,42,0.7)] text-[var(--fg-primary)] font-bold leading-none" : "inline-flex items-center justify-center rounded-full font-bold leading-none";
  const getIconBadgeStyle = (network: ShareButtonNetwork): React.CSSProperties | undefined => {
    if (isPublicDarkMode) return undefined;
    if (shareTheme === "minimal") {
      return {
        backgroundColor: `${shareThemeColor}14`,
        color: shareThemeColor
      };
    }
    if (shareTheme === "outline") {
      const iconColorMap = { facebook: "#1877F2", x: "#111827", whatsapp: "#25D366", telegram: "#229ED9", linkedin: "#0A66C2", email: "#6B7280", copy: shareThemeColor, print: "#111827" } as const;
      const outlineIconColor = shareOutlineColor || iconColorMap[network];
      return {
        backgroundColor: `${outlineIconColor}14`,
        color: outlineIconColor
      };
    }
    const iconColorMap = { facebook: "#1877F2", x: "#111827", whatsapp: "#25D366", telegram: "#229ED9", linkedin: "#0A66C2", email: "#6B7280", copy: shareThemeColor, print: "#111827" } as const;
    const brandIconColor = shareBrandColor || iconColorMap[network];
    return {
      backgroundColor: `${brandIconColor}20`,
      color: "#ffffff"
    };
  };
  const renderIcon = (network: ShareNetwork) => {
    const icon = <BrandIcon network={network} size={shareIconSize} />;
    if (shareContentMode === "icon_only") return icon;
    return (
      <span
        className={iconBadgeClass}
        style={{ width: `${iconBadgeSize}px`, height: `${iconBadgeSize}px`, fontSize: `${Math.max(Math.round(shareIconSize * 0.7), 10)}px`, ...getIconBadgeStyle(network) }}
      >
        {icon}
      </span>
    );
  };
  const buttons = (
    <>
      {showFacebook && <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" className={getBtnClass()} style={getBtnStyle("facebook")}>{renderIcon("facebook")}{shareContentMode === "icon_text" && <span>Facebook</span>}</a>}
      {showTwitter && <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" className={getBtnClass()} style={getBtnStyle("x")}>{renderIcon("x")}{shareContentMode === "icon_text" && <span>X</span>}</a>}
      {showWhatsapp && <a href={`https://wa.me/?text=${encodeURIComponent(`${post?.title || ""} ${postUrl}`)}`} target="_blank" rel="noreferrer" className={getBtnClass()} style={getBtnStyle("whatsapp")}>{renderIcon("whatsapp")}{shareContentMode === "icon_text" && <span>WhatsApp</span>}</a>}
      {showTelegram && <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" className={getBtnClass()} style={getBtnStyle("telegram")}>{renderIcon("telegram")}{shareContentMode === "icon_text" && <span>Telegram</span>}</a>}
      {showLinkedIn && <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" className={getBtnClass()} style={getBtnStyle("linkedin")}>{renderIcon("linkedin")}{shareContentMode === "icon_text" && <span>LinkedIn</span>}</a>}
      {showEmail && <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} className={getBtnClass()} style={getBtnStyle("email")}>{renderIcon("email")}{shareContentMode === "icon_text" && <span>Email</span>}</a>}
      {showCopyLink && <button type="button" onClick={handleCopyLink} className={getBtnClass()} style={getBtnStyle("copy")}>{renderIcon("copy")}{shareContentMode === "icon_text" && <span>{isCopied ? "Tersalin" : "Salin Link"}</span>}</button>}
      <a
        href={`/print/${post?.category?.slug || "berita"}/${post?.slug || ""}`}
        target="_blank"
        rel="noreferrer"
        className={getBtnClass()}
        style={getBtnStyle("print")}
      >
        {shareContentMode === "icon_only" ? <Printer size={shareIconSize} /> : (
          <span
            className={iconBadgeClass}
            style={{ width: `${iconBadgeSize}px`, height: `${iconBadgeSize}px`, fontSize: `${Math.max(Math.round(shareIconSize * 0.7), 10)}px`, ...getIconBadgeStyle("print") }}
          >
            <Printer size={shareIconSize} />
          </span>
        )}
        {shareContentMode === "icon_text" && <span>Print</span>}
      </a>
    </>
  );
  const labelNode = showShareLabel ? (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{ color: shareLabelColor, fontSize: shareLabelFontSize, lineHeight: shareLabelLineHeight, fontWeight: shareLabelFontWeight }}
    >
      <Share2 size={labelIconSize} />
      {shareLabelText}
    </span>
  ) : null;

  return (
    <div className="w-full" style={widgetContainerStyle}>
      {shareLabelPosition === "top" && labelNode && (
        <div className={`mb-2 w-full flex ${justifyClass}`}>
          {labelNode}
        </div>
      )}
      <div
        className={`w-full flex flex-wrap items-center ${justifyClass}`}
        style={{
          gap,
          rowGap: gap,
          borderRadius: containerRadius,
          border: containerBorder,
          backgroundColor: containerBackground,
          padding: containerPadding
        }}
      >
        {shareLabelPosition === "inline" && labelNode && (
          <span className="mr-1">
            {labelNode}
          </span>
        )}
        {buttons}
      </div>
    </div>
  );
}
