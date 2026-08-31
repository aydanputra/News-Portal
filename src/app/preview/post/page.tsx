"use client";

import { useEffect, useState } from "react";
import { getThemeSinglePostPreviewComponent } from "@/lib/theme-registry.client";

export default function PreviewPostPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState("classic");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blockData, setBlockData] = useState<Record<string, any[]>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inlineRelatedPosts, setInlineRelatedPosts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceBlocksByLocation, setSourceBlocksByLocation] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [menusByLocation, setMenusByLocation] = useState<any>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [headerConfig, setHeaderConfig] = useState<any>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [footerConfig, setFooterConfig] = useState<any>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previewRaw = localStorage.getItem("previewData");
    if (!previewRaw) {
        setLoading(false);
        return;
    }

    let ignore = false;
    const loadPreview = async () => {
      try {
        const parsedData = JSON.parse(previewRaw);
        const response = await fetch("/api/posts/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData),
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Gagal memuat preview");
        }
        const payload = await response.json();
        if (ignore) return;

        setPost(payload.post || null);
        setSettings(payload.setting || null);
        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
        setBlocks(Array.isArray(payload.blocks) ? payload.blocks : []);
        setBlockData(payload.blockData || {});
        setInlineRelatedPosts(Array.isArray(payload.inlineRelatedPosts) ? payload.inlineRelatedPosts : []);
        setSourceBlocksByLocation(payload.sourceBlocksByLocation || {});
        setMenusByLocation(payload.menusByLocation);
        setHeaderConfig(payload.headerConfig);
        setFooterConfig(payload.footerConfig);
        setActiveTheme(payload.activeTheme || "classic");
      } catch (error) {
        console.error("Failed to load preview post:", error);
        if (!ignore) {
          setPost(null);
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
  if (!post) return <div className="flex h-screen items-center justify-center">No Preview Data Found.</div>;

  const PreviewSinglePostComponent = getThemeSinglePostPreviewComponent(activeTheme, blocks.length > 0);

  return (
    <PreviewSinglePostComponent
      post={post}
      setting={settings}
      categories={categories}
      blocks={blocks}
      blockData={blockData}
      inlineRelatedPosts={inlineRelatedPosts}
      sourceBlocksByLocation={sourceBlocksByLocation}
      menusByLocation={menusByLocation}
      headerConfig={headerConfig}
      footerConfig={footerConfig}
      preview={true}
    />
  );
}
