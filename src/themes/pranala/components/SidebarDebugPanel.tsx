"use client";

import React, { useEffect, useMemo, useState } from "react";

type SidebarDebugPanelProps = {
  pageKind: "homepage" | "single-post";
};

type DebugSnapshot = {
  renderContext: string;
  widgetId: string;
  widgetType: string;
  sourceLocation: string;
  rootWidth: string;
  rootMaxWidth: string;
  titleText: string;
  titleWidth: string;
  titleHeight: string;
  titleFontSize: string;
  titleFontWeight: string;
  titleLineHeight: string;
  titleFontFamily: string;
  titleColor: string;
  titleLetterSpacing: string;
  headingFontWeight: string;
  headingLineHeight: string;
  homeNewsTitleSizeVar: string;
  homeNewsTitleWeightVar: string;
  homeNewsTitleFontVar: string;
  homeNewsTitleColorVar: string;
  homeHoverColorVar: string;
  tagHoverTextVar: string;
  titleLineCountEstimate: string;
};

const readCssVar = (styles: CSSStyleDeclaration, name: string) => styles.getPropertyValue(name).trim();

export default function SidebarDebugPanel({ pageKind }: SidebarDebugPanelProps) {
  const [enabled, setEnabled] = useState(false);
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("debugSidebar") === "1");
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const collect = () => {
      const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-sidebar-debug-root='true']"));
      const preferredRoot =
        roots.find((root) => root.dataset.renderContext === pageKind) ||
        roots.find((root) => root.dataset.widgetType === "sidebar_widget") ||
        roots[0];

      if (!preferredRoot) {
        setSnapshot(null);
        return;
      }

      const titleEl = preferredRoot.querySelector<HTMLElement>(".popular-title");
      const headingEl = titleEl?.closest("h4") as HTMLElement | null;
      const tagEl = preferredRoot.querySelector<HTMLElement>(".tag-item");
      const rootStyles = window.getComputedStyle(preferredRoot);
      const titleStyles = titleEl ? window.getComputedStyle(titleEl) : null;
      const headingStyles = headingEl ? window.getComputedStyle(headingEl) : null;
      const tagStyles = tagEl ? window.getComputedStyle(tagEl) : null;
      const titleRect = titleEl?.getBoundingClientRect();
      const rootRect = preferredRoot.getBoundingClientRect();
      const titleHeight = titleRect ? `${titleRect.height.toFixed(2)}px` : "-";
      const titleLineHeight = titleStyles?.lineHeight || "-";
      const parsedLineHeight = Number.parseFloat(titleLineHeight);
      const parsedHeight = titleRect?.height || 0;
      const estimatedLines =
        Number.isFinite(parsedLineHeight) && parsedLineHeight > 0 && parsedHeight > 0
          ? String(Math.round((parsedHeight / parsedLineHeight) * 100) / 100)
          : "-";

      setSnapshot({
        renderContext: preferredRoot.dataset.renderContext || "-",
        widgetId: preferredRoot.dataset.widgetId || "-",
        widgetType: preferredRoot.dataset.widgetType || "-",
        sourceLocation: preferredRoot.dataset.sourceLocation || "-",
        rootWidth: `${rootRect.width.toFixed(2)}px`,
        rootMaxWidth: rootStyles.maxWidth || "-",
        titleText: titleEl?.textContent?.trim() || "-",
        titleWidth: titleRect ? `${titleRect.width.toFixed(2)}px` : "-",
        titleHeight,
        titleFontSize: titleStyles?.fontSize || "-",
        titleFontWeight: titleStyles?.fontWeight || "-",
        titleLineHeight,
        titleFontFamily: titleStyles?.fontFamily || "-",
        titleColor: titleStyles?.color || "-",
        titleLetterSpacing: titleStyles?.letterSpacing || "-",
        headingFontWeight: headingStyles?.fontWeight || "-",
        headingLineHeight: headingStyles?.lineHeight || "-",
        homeNewsTitleSizeVar: readCssVar(rootStyles, "--home-news-title-size") || "-",
        homeNewsTitleWeightVar: readCssVar(rootStyles, "--home-news-title-weight") || "-",
        homeNewsTitleFontVar: readCssVar(rootStyles, "--home-news-title-font") || "-",
        homeNewsTitleColorVar: readCssVar(rootStyles, "--home-news-title-color") || "-",
        homeHoverColorVar: readCssVar(rootStyles, "--home-hover-color") || "-",
        tagHoverTextVar:
          (tagStyles && readCssVar(tagStyles, "--tag-hover-color")) ||
          readCssVar(rootStyles, "--post-link-hover-color") ||
          "-",
        titleLineCountEstimate: estimatedLines,
      });
    };

    collect();
    window.addEventListener("resize", collect);
    return () => window.removeEventListener("resize", collect);
  }, [enabled, pageKind]);

  const lines = useMemo(() => {
    if (!snapshot) return [];
    return [
      `pageKind: ${pageKind}`,
      `renderContext: ${snapshot.renderContext}`,
      `widgetId: ${snapshot.widgetId}`,
      `widgetType: ${snapshot.widgetType}`,
      `sourceLocation: ${snapshot.sourceLocation}`,
      `rootWidth: ${snapshot.rootWidth}`,
      `rootMaxWidth: ${snapshot.rootMaxWidth}`,
      `titleText: ${snapshot.titleText}`,
      `titleWidth: ${snapshot.titleWidth}`,
      `titleHeight: ${snapshot.titleHeight}`,
      `titleFontSize: ${snapshot.titleFontSize}`,
      `titleFontWeight: ${snapshot.titleFontWeight}`,
      `titleLineHeight: ${snapshot.titleLineHeight}`,
      `titleFontFamily: ${snapshot.titleFontFamily}`,
      `titleColor: ${snapshot.titleColor}`,
      `titleLetterSpacing: ${snapshot.titleLetterSpacing}`,
      `headingFontWeight: ${snapshot.headingFontWeight}`,
      `headingLineHeight: ${snapshot.headingLineHeight}`,
      `homeNewsTitleSizeVar: ${snapshot.homeNewsTitleSizeVar}`,
      `homeNewsTitleWeightVar: ${snapshot.homeNewsTitleWeightVar}`,
      `homeNewsTitleFontVar: ${snapshot.homeNewsTitleFontVar}`,
      `homeNewsTitleColorVar: ${snapshot.homeNewsTitleColorVar}`,
      `homeHoverColorVar: ${snapshot.homeHoverColorVar}`,
      `tagHoverTextVar: ${snapshot.tagHoverTextVar}`,
      `titleLineCountEstimate: ${snapshot.titleLineCountEstimate}`,
    ];
  }, [snapshot, pageKind]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        width: "min(420px, calc(100vw - 24px))",
        maxHeight: "70vh",
        overflow: "auto",
        background: "rgba(15, 23, 42, 0.96)",
        color: "#e2e8f0",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: 10,
        boxShadow: "0 20px 60px rgba(2, 6, 23, 0.45)",
        padding: 12,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.45,
        whiteSpace: "pre-wrap",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Sidebar Debug</div>
      {snapshot ? lines.join("\n") : "Tidak ada root sidebar debug yang ditemukan."}
    </div>
  );
}
