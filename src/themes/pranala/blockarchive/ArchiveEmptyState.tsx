import Link from "next/link";
import React from "react";
import { sanitizeExternalUrl } from "@/lib/sanitizer";

interface ArchiveEmptyStateProps {
  block: any;
  isEmpty: boolean;
}

export default function ArchiveEmptyState({ block, isEmpty }: ArchiveEmptyStateProps) {
  const config = block?.config || {};
  if (!isEmpty) return null;

  const title = typeof config.emptyTitle === "string" && config.emptyTitle.trim()
    ? config.emptyTitle.trim()
    : "Belum ada artikel";
  const description = typeof config.emptyDescription === "string" && config.emptyDescription.trim()
    ? config.emptyDescription.trim()
    : "Belum ada artikel yang cocok untuk arsip ini saat ini.";
  const ctaLabel = typeof config.emptyButtonText === "string" && config.emptyButtonText.trim()
    ? config.emptyButtonText.trim()
    : "";
  const ctaHref = sanitizeExternalUrl(config.emptyButtonHref) || "/";
  const align = config.textAlign === "left" || config.textAlign === "right" ? config.textAlign : "center";
  const titleColorDesktop = typeof config.titleColor === "string" && config.titleColor.trim() ? config.titleColor : "var(--home-widget-title-color, var(--heading-color, #111827))";
  const titleColorTablet = typeof config.tabletTitleColor === "string" && config.tabletTitleColor.trim() ? config.tabletTitleColor : titleColorDesktop;
  const titleColorMobile = typeof config.mobileTitleColor === "string" && config.mobileTitleColor.trim() ? config.mobileTitleColor : titleColorDesktop;
  const descriptionColorDesktop = typeof config.descriptionColor === "string" && config.descriptionColor.trim() ? config.descriptionColor : "var(--home-excerpt-color,#6b7280)";
  const descriptionColorTablet = typeof config.tabletDescriptionColor === "string" && config.tabletDescriptionColor.trim() ? config.tabletDescriptionColor : descriptionColorDesktop;
  const descriptionColorMobile = typeof config.mobileDescriptionColor === "string" && config.mobileDescriptionColor.trim() ? config.mobileDescriptionColor : descriptionColorDesktop;
  const buttonBgColorDesktop = typeof config.buttonBgColor === "string" && config.buttonBgColor.trim() ? config.buttonBgColor : "var(--accent,#2563eb)";
  const buttonBgColorTablet = typeof config.tabletButtonBgColor === "string" && config.tabletButtonBgColor.trim() ? config.tabletButtonBgColor : buttonBgColorDesktop;
  const buttonBgColorMobile = typeof config.mobileButtonBgColor === "string" && config.mobileButtonBgColor.trim() ? config.mobileButtonBgColor : buttonBgColorDesktop;

  return (
    <div
      className="public-theme archive-empty-block rounded-[var(--home-main-box-radius,0.75rem)] border border-dashed border-[var(--border,#e5e7eb)] bg-[var(--bg-surface,#f9fafb)] px-6 py-12"
      style={{
        textAlign: align as React.CSSProperties["textAlign"],
        "--archive-empty-title-color-mobile": titleColorMobile,
        "--archive-empty-title-color-tablet": titleColorTablet,
        "--archive-empty-title-color-desktop": titleColorDesktop,
        "--archive-empty-description-color-mobile": descriptionColorMobile,
        "--archive-empty-description-color-tablet": descriptionColorTablet,
        "--archive-empty-description-color-desktop": descriptionColorDesktop,
        "--archive-empty-button-bg-mobile": buttonBgColorMobile,
        "--archive-empty-button-bg-tablet": buttonBgColorTablet,
        "--archive-empty-button-bg-desktop": buttonBgColorDesktop,
      } as React.CSSProperties}
    >
      <h2 className="text-2xl font-bold" style={{ color: "var(--archive-empty-title-color)" }}>{title}</h2>
      <p className="mt-3 text-sm leading-6" style={{ color: "var(--archive-empty-description-color)" }}>{description}</p>
      {ctaLabel && (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[var(--home-main-box-radius,0.75rem)] text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: "var(--archive-empty-button-bg)" }}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
