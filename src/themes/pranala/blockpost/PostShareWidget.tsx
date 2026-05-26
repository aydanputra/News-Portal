import { useEffect, useState } from "react";
import { Facebook, Link2, Linkedin, Mail, MessageCircle, Send, Share2, Twitter, Printer } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

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
  const alignValue = getResponsiveConfig("align");
  const justifyClass = alignValue === "center" ? "justify-center" : alignValue === "right" ? "justify-end" : "justify-start";
  const shareSize = String(getResponsiveConfig("shareSize") || "md");
  const shareShowContainerBorderValue = getResponsiveConfig("shareShowContainerBorder");
  const shareShowContainerBorder = typeof shareShowContainerBorderValue === "boolean" ? shareShowContainerBorderValue : getConfigBool("shareShowBorder", true);
  const showShareLabel = getConfigBool("showShareLabel", true);
  const rawLabelText = getResponsiveConfig("shareLabelText");
  const shareLabelText = typeof rawLabelText === "string" && rawLabelText.trim() !== "" ? rawLabelText.trim() : "Bagikan :";
  const labelPositionValue = String(getResponsiveConfig("shareLabelPosition") || "inline");
  const shareLabelPosition = labelPositionValue === "top" ? "top" : "inline";
  const contentModeValue = String(getResponsiveConfig("shareContentMode") || "icon_text");
  const shareContentMode = contentModeValue === "icon_only" ? "icon_only" : "icon_text";
  const iconOnlyShapeValue = String(getResponsiveConfig("iconOnlyShape") || "square");
  const iconOnlyShape = iconOnlyShapeValue === "circle" ? "circle" : "square";
  const shareLabelColorValue = getResponsiveConfig("shareLabelColor");
  const shareLabelColor = isPublicDarkMode ? "var(--fg-primary)" : (typeof shareLabelColorValue === "string" && shareLabelColorValue.trim() !== "" ? shareLabelColorValue : "var(--fg-primary)");
  const shareLabelFontSize = toPx(getResponsiveConfig("shareLabelFontSize")) || (preview ? "11px" : "14px");
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
  const baseClass = shareSize === "sm" ? (preview ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs") : shareSize === "lg" ? (preview ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm") : (preview ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-sm");
  const iconOnlyBaseClass = shareSize === "sm" ? (preview ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs") : shareSize === "lg" ? (preview ? "w-8 h-8 text-[11px]" : "w-11 h-11 text-sm") : (preview ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs");
  const getBtnClass = () => {
    const shapeClass = shareContentMode === "icon_only"
      ? (iconOnlyShape === "circle" ? "rounded-full" : (resolvedRadius === "global" ? "" : resolvedRadius === "pill" ? "rounded-full" : resolvedRadius === "sm" ? "rounded" : "rounded-md"))
      : (resolvedRadius === "global" ? "" : resolvedRadius === "pill" ? "rounded-full" : resolvedRadius === "sm" ? "rounded" : "rounded-md");
    const sizeClass = shareContentMode === "icon_only" ? `${iconOnlyBaseClass} ${shapeClass} justify-center` : `${baseClass} ${shapeClass}`;
    return `${sizeClass} border inline-flex items-center gap-1.5 font-medium transition-all hover:-translate-y-0.5`;
  };
  const getBtnStyle = (network: "facebook" | "x" | "whatsapp" | "telegram" | "linkedin" | "email" | "copy"): React.CSSProperties => {
    if (isPublicDarkMode) return { backgroundColor: "rgba(30, 41, 59, 0.92)", color: "var(--fg-primary)", borderColor: "rgba(148, 163, 184, 0.35)", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined };
    const colorMap = { facebook: "#1877F2", x: "#111827", whatsapp: "#25D366", telegram: "#229ED9", linkedin: "#0A66C2", email: "#6B7280", copy: accentColor || "#111827" } as const;
    return { color: "#ffffff", backgroundColor: colorMap[network], borderColor: "transparent", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined };
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
  const iconBadgeClass = isPublicDarkMode ? "inline-flex items-center justify-center rounded-full w-4 h-4 bg-[rgba(15,23,42,0.85)] text-[var(--fg-primary)] text-[9px] font-bold leading-none" : "inline-flex items-center justify-center rounded-full w-4 h-4 bg-white/25 text-[9px] font-bold leading-none";
  const renderIcon = (network: "facebook" | "x" | "whatsapp" | "telegram" | "linkedin" | "email" | "copy") => {
    const iconSize = shareContentMode === "icon_only" ? 16 : 12;
    const iconMap = { facebook: <Facebook size={iconSize} />, x: <Twitter size={iconSize} />, whatsapp: <MessageCircle size={iconSize} />, telegram: <Send size={iconSize} />, linkedin: <Linkedin size={iconSize} />, email: <Mail size={iconSize} />, copy: <Link2 size={iconSize} /> } as const;
    const icon = iconMap[network];
    if (shareContentMode === "icon_only") return icon;
    return <span className={iconBadgeClass}>{icon}</span>;
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
        style={isPublicDarkMode ? { backgroundColor: "rgba(30, 41, 59, 0.92)", color: "var(--fg-primary)", borderColor: "rgba(148, 163, 184, 0.35)", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined } : { backgroundColor: "#111827", color: "#ffffff", borderColor: "transparent", borderRadius: resolvedRadius === "global" ? "var(--home-main-box-radius, var(--radius-global, 0.5rem))" : undefined }}
      >
        {shareContentMode === "icon_only" ? <Printer size={16} /> : <span className={iconBadgeClass}><Printer size={12} /></span>}
        {shareContentMode === "icon_text" && <span>Print</span>}
      </a>
    </>
  );

  return (
    <div className="w-full" style={widgetContainerStyle}>
      {shareLabelPosition === "top" && showShareLabel && (
        <div className={`w-full flex ${justifyClass} mb-2`}>
          <span className="inline-flex items-center gap-1.5" style={{ color: shareLabelColor, fontSize: shareLabelFontSize, fontWeight: shareLabelFontWeight }}>
            <Share2 size={14} />
            {shareLabelText}
          </span>
        </div>
      )}
      <div className={`w-full p-3 flex flex-wrap items-center ${justifyClass}`} style={{ gap, borderRadius: containerRadius, border: shareShowContainerBorder ? (isPublicDarkMode ? "1px solid rgba(148, 163, 184, 0.35)" : "1px solid var(--border)") : "none", backgroundColor: "transparent" }}>
        {shareLabelPosition === "inline" && showShareLabel && (
          <span className="inline-flex items-center gap-1.5 mr-1" style={{ color: shareLabelColor, fontSize: shareLabelFontSize, fontWeight: shareLabelFontWeight }}>
            <Share2 size={14} />
            {shareLabelText}
          </span>
        )}
        {buttons}
      </div>
    </div>
  );
}
