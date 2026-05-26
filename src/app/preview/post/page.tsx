"use client";

import { useEffect, useState } from "react";
import ClassicSinglePost from "@/themes/classic/templates/SinglePost";
import PranalaSinglePost from "@/themes/pranala/templates/SinglePost";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";
import { useSidebarSourceBlocks } from "@/hooks/useSidebarSourceBlocks";

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
  const sourceBlocksByLocation = useSidebarSourceBlocks(activeTheme);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get Preview Data
    const previewData = localStorage.getItem("previewData");
    if (!previewData) {
        setLoading(false);
        return;
    }
    const parsedData = JSON.parse(previewData);

    // 2. Fetch dependencies (Settings, Categories)
    Promise.all([
        fetch("/api/public/settings").then(res => res.json()),
        fetch("/api/categories").then(res => res.json()),
    ]).then(async ([settingsData, categoriesData]) => {
        setSettings(settingsData);
        setCategories(categoriesData);
        const currentTheme = settingsData?.activeTheme || "classic";
        setActiveTheme(currentTheme);

        try {
            const resBlocks = await fetch(`/api/homepage?location=post&themeId=${currentTheme}`);
            const blocksData = await resBlocks.json();
            const normalizedBlocks = Array.isArray(blocksData) && blocksData.length > 0
                ? blocksData
                : getThemeDefaultPostBlocks(currentTheme);
            setBlocks(normalizedBlocks);
        } catch (error) {
            console.error("Failed to load post blocks for preview:", error);
            setBlocks(getThemeDefaultPostBlocks(currentTheme));
        }

        // 4. Construct Post Object
        // Need to find category name from ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findCategory = (cats: any[], id: string): any => {
            for (const c of cats) {
                if (c.id === id) return c;
                if (c.children) {
                    const found = findCategory(c.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const category = findCategory(categoriesData, parsedData.categoryId) || { name: "Uncategorized", slug: "#" };

        const constructedPost = {
            id: "preview",
            title: parsedData.title,
            subtitle: parsedData.subtitle, // Add Subtitle
            content: parsedData.content,
            image: parsedData.previewImage || parsedData.image, 
            publishedAt: new Date().toISOString(),
            author: { name: "Preview Mode", image: null },  
            category: category,
            tags: parsedData.tags ? parsedData.tags.map((t: string) => ({ id: t, name: t, slug: t })) : [],
            type: parsedData.type,
            videoUrl: parsedData.videoUrl,
            gallery: parsedData.gallery || []
        };
        
        setPost(constructedPost);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Preview...</div>;
  if (!post) return <div className="flex h-screen items-center justify-center">No Preview Data Found.</div>;

  return (
    activeTheme === "pranala" ? (
      <PranalaSinglePost
        post={post}
        setting={settings}
        categories={categories}
        blocks={blocks}
        blockData={{}}
        sourceBlocksByLocation={sourceBlocksByLocation}
      />
    ) : (
      <ClassicSinglePost
        post={post}
        setting={settings}
        categories={categories}
      />
    )
  );
}
