import Image from "next/image";
import { WidgetRenderContext } from "./types";
import { getAuthorImageUrl, toPx } from "./helpers";

export default function PostAuthorBoxWidget({
  post,
  preview,
  metaColor,
  headingColor,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const {
    textAlign: _ignoredTextAlign,
    ...authorWidgetContainerStyle
  } = widgetContainerStyle;
  const sourceValue = getResponsiveConfig("authorSource");
  const authorSource = sourceValue === "editor" ? "editor" : "author";
  const selectedPerson = authorSource === "editor" ? (post as any)?.approvedBy : (post as any)?.author;
  const fallbackPerson = (post as any)?.author;
  const person = selectedPerson || fallbackPerson;
  const authorName = person?.name || "";
  if (!authorName && !preview) return null;

  const showAuthorLabel = getConfigBool("showAuthorLabel", true);
  const showAuthorAvatar = getConfigBool("showAuthorAvatar", true);
  const showAuthorBio = getConfigBool("showAuthorBio", true);
  const designValue = getResponsiveConfig("authorDesign");
  const authorDesign = designValue === "card" || designValue === "split" ? designValue : "minimal";
  const alignValue = getResponsiveConfig("authorAlign");
  const authorAlign = alignValue === "center" || alignValue === "right" ? alignValue : "left";
  const labelTextRaw = getResponsiveConfig("authorLabelText");
  const labelTextCandidate = typeof labelTextRaw === "string" ? labelTextRaw.trim() : "";
  const labelText = labelTextCandidate !== ""
    ? labelTextCandidate
    : authorSource === "editor"
      ? "Editor"
      : "Penulis";
  const labelColor = (getResponsiveConfig("labelColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : metaColor);
  const nameColor = (getResponsiveConfig("nameColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : headingColor);
  const bioColor = (getResponsiveConfig("bioColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : metaColor);
  const avatarSize = toPx(getResponsiveConfig("avatarSize")) || (preview ? "44px" : "56px");
  const avatarRadius = toPx(getResponsiveConfig("avatarRadius")) || "9999px";
  const authorBio = typeof person?.bio === "string" ? person.bio.trim() : "";
  const hasBio = showAuthorBio && (authorBio !== "" || preview);
  const authorImageUrl = getAuthorImageUrl(person);
  const authorInitial = (authorName || "Nama Penulis").trim().charAt(0).toUpperCase() || "A";
  const contentTextAlign: React.CSSProperties["textAlign"] = authorAlign;
  const isCardLayout = authorDesign === "card";
  const isSplitLayout = authorDesign === "split";
  const isCenterAligned = authorAlign === "center";
  const isRightAligned = authorAlign === "right";
  const wrapperClass = isCardLayout
    ? `flex flex-col gap-3 ${isCenterAligned ? "items-center text-center" : isRightAligned ? "items-end text-right" : "items-start text-left"}`
    : isSplitLayout
      ? isCenterAligned
        ? "flex flex-col items-center text-center gap-4"
        : isRightAligned
          ? "grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-center"
          : "grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center"
      : isCenterAligned
        ? "flex flex-col items-center text-center gap-3"
        : `flex gap-3 ${isRightAligned ? "justify-end text-right" : "justify-start text-left"} items-start`;
  const avatarOrderClass = isSplitLayout && isRightAligned ? "md:order-2" : "";
  const contentOrderClass = isSplitLayout && isRightAligned ? "md:order-1" : "";

  return (
    <div
      className={wrapperClass}
      style={authorWidgetContainerStyle}
    >
      {showAuthorAvatar && (
        authorImageUrl ? (
          <span
            className={`relative shrink-0 overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] ${avatarOrderClass}`}
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius }}
          >
            <Image src={authorImageUrl} alt={authorName || "Author"} fill className="object-cover" unoptimized />
          </span>
        ) : (
          <span
            className={`inline-flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--bg-surface)] font-semibold text-[var(--fg-secondary)] ${avatarOrderClass}`}
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius }}
          >
            {authorInitial}
          </span>
        )
      )}

      <div
        className={`min-w-0 ${isCardLayout || isCenterAligned ? "w-full" : ""} ${contentOrderClass}`}
        style={{ textAlign: contentTextAlign }}
      >
        {showAuthorLabel && (
          <div className="mb-1 text-[11px] uppercase tracking-wide" style={{ color: labelColor }}>
            {labelText}
          </div>
        )}
        <div className={`${authorDesign === "split" ? "text-lg" : ""} font-semibold leading-tight`} style={{ color: nameColor }}>
          {authorName || "Nama Penulis"}
        </div>
        {hasBio && (
          <p className="mt-1 text-sm leading-relaxed" style={{ color: bioColor }}>
            {authorBio || "Profil singkat penulis akan tampil di sini."}
          </p>
        )}
      </div>
    </div>
  );
}
