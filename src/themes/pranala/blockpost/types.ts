import React from "react";

export interface WidgetRenderContext {
  widget: any;
  post: any;
  setting?: any;
  inlineRelatedPosts?: any[];
  headingColor: string;
  metaColor: string;
  contentColor: string;
  accentColor: string;
  hoverColor: string;
  blockData: Record<string, any[]>;
  preview: boolean;
  previewDeviceTab: "desktop" | "tablet" | "mobile";
  widgetContainerStyle: React.CSSProperties;
  getResponsiveConfig: (key: string) => unknown;
  getConfigBool: (key: string, fallback: boolean) => boolean;
  isPublicDarkMode: boolean;
}
