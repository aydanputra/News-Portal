"use client";

import React from "react";
import { resolveThemeFontFamily } from "@/lib/font-utils";

interface ThemeStylesProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  headingColor?: string;
  excerptColor?: string;
  metaColor?: string;
  headingFont?: string;
  bodyFont?: string;
  globalBorderRadius?: string;
}

export default function ThemeStyles({
  primaryColor = "#2563eb",
  secondaryColor = "#64748b",
  accentColor = "#f59e0b",
  backgroundColor = "#ffffff",
  headingColor = "#1e293b",
  excerptColor = "#64748b",
  metaColor = "#94a3b8",
  headingFont = "Inter",
  bodyFont = "Inter",
  globalBorderRadius = "0.5rem",
}: ThemeStylesProps) {
  const resolvedHeadingFont = resolveThemeFontFamily(headingFont);
  const resolvedBodyFont = resolveThemeFontFamily(bodyFont);
  const headingSizeAdjust = "none";
  const bodySizeAdjust = "none";

  return (
    <style jsx global>{`
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --accent-color: ${accentColor};
        --bg-color: ${backgroundColor};
        --heading-color: ${headingColor};
        --excerpt-color: ${excerptColor};
        --meta-color: ${metaColor};
        --font-heading: ${resolvedHeadingFont};
        --font-body: ${resolvedBodyFont};
        --font-heading-size-adjust: ${headingSizeAdjust};
        --font-body-size-adjust: ${bodySizeAdjust};
        --radius-global: ${globalBorderRadius};
        --global-image-radius: ${globalBorderRadius};
        --home-main-box-radius: ${globalBorderRadius};
        --main-box-radius: ${globalBorderRadius};
        --sidebar-box-radius: ${globalBorderRadius};
      }

      body {
        font-family: var(--font-body);
        font-synthesis: var(--font-body-synthesis, none);
        font-size-adjust: var(--font-body-size-adjust);
        color: var(--heading-color);
        background-color: var(--bg-color);
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
        font-synthesis: var(--font-heading-synthesis, none);
        font-size-adjust: var(--font-heading-size-adjust);
      }
    `}</style>
  );
}
