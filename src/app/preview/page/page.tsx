"use client";

import { useEffect, useState } from "react";
import { getThemePagePreviewComponent } from "@/lib/theme-registry.client";

export default function PreviewPagePage() {
  const [page, setPage] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menusByLocation, setMenusByLocation] = useState<any>(undefined);
  const [headerConfig, setHeaderConfig] = useState<any>(undefined);
  const [footerConfig, setFooterConfig] = useState<any>(undefined);
  const [sidebarWidgets, setSidebarWidgets] = useState<any[]>([]);
  const [blockData, setBlockData] = useState<Record<string, any[]>>({});
  const [activeTheme, setActiveTheme] = useState("classic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previewRaw = localStorage.getItem("pagePreviewData");
    if (!previewRaw) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const loadPreview = async () => {
      try {
        const parsedData = JSON.parse(previewRaw);
        const response = await fetch("/api/pages/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat pratinjau halaman");
        }

        const payload = await response.json();
        if (ignore) return;

        setPage(payload.page || null);
        setSettings(payload.setting || null);
        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
        setMenusByLocation(payload.menusByLocation);
        setHeaderConfig(payload.headerConfig);
        setFooterConfig(payload.footerConfig);
        setSidebarWidgets(Array.isArray(payload.sidebarWidgets) ? payload.sidebarWidgets : []);
        setBlockData(payload.blockData || {});
        setActiveTheme(payload.activeTheme || "classic");
      } catch (error) {
        console.error("Failed to load preview page:", error);
        if (!ignore) {
          setPage(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadPreview();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Preview...</div>;
  if (!page) return <div className="flex h-screen items-center justify-center">No Preview Data Found.</div>;

  const PreviewPageComponent = getThemePagePreviewComponent(activeTheme);

  return (
    <PreviewPageComponent
      page={page}
      setting={settings}
      categories={categories}
      menusByLocation={menusByLocation}
      headerConfig={headerConfig}
      footerConfig={footerConfig}
      sidebarWidgets={sidebarWidgets}
      blockData={blockData}
      preview={true}
    />
  );
}
