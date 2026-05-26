"use client";

import React from "react";

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
        --font-heading: ${headingFont}, sans-serif;
        --font-body: ${bodyFont}, sans-serif;
        --radius-global: ${globalBorderRadius};
      }

      body {
        font-family: var(--font-body);
        color: var(--heading-color);
        background-color: var(--bg-color);
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
    `}</style>
  );
}
