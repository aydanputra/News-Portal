"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Video, Layers, Images, X, Plus, Eye, ChevronDown, User, Shield, Search } from "lucide-react";
import Image from "next/image";
import PostPublishWidget from "@/components/admin/PostPublishWidget";
import PostSeoAuditPanel from "@/components/admin/PostSeoAuditPanel";
import PostImageWatermark from "@/components/post/PostImageWatermark";
import TagInput from "@/components/admin/TagInput";
import MediaLibraryModal, { Media } from "@/app/admin/components/MediaLibraryModal";
import dynamic from "next/dynamic";
import { PostType } from "@prisma/client";
import { getReadableFileName } from "@/lib/seo-audit";
import { getYouTubeThumbnailUrl, slugify } from "@/lib/utils";
import { extractImageUrlsFromHtml } from "@/lib/content-images";
import { sanitizeContent } from "@/lib/sanitizer";
import { normalizePostTypeMedia } from "@/lib/post-type-media";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

const TiptapArticleEditor = dynamic(() => import("@/components/admin/TiptapArticleEditor"), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
});

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAdminSession();
  const [loading, setLoading] = useState(false);
  
  // Post Data
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<PostType>("ARTICLE");
  
  // Meta / Relation
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState("");
  const [approvedById, setApprovedById] = useState("");
  const [reviewEditorIds, setReviewEditorIds] = useState<string[]>([]);
  
  // Media
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState(""); // URL
  const [featuredPreviewUrl, setFeaturedPreviewUrl] = useState(""); // URL
  const [featuredImageRemoved, setFeaturedImageRemoved] = useState(false);
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [postImageWatermarkEnabled, setPostImageWatermarkEnabled] = useState(false);
  const [imageCaption, setImageCaption] = useState("");
  const [gallery, setGallery] = useState<{ id: string; url: string; caption: string }[]>([]);
  const [contentImageCandidates, setContentImageCandidates] = useState<string[]>([]);
  const [thumbnailAutoDisabled, setThumbnailAutoDisabled] = useState(false);
  
  // Status
  const [status, setStatus] = useState("DRAFT");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Fake Counter (Base Views)
  const [viewsBase, setViewsBase] = useState<number>(0);

  // SEO
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");

  // Data Lists
  const [categories, setCategories] = useState<any[]>([]);
  const [watermarkSettings, setWatermarkSettings] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // UI State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSelectMode, setMediaSelectMode] = useState<"single" | "multiple" | "editor" | "file">("single");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Editor Insertion
  const [mediaToInsert, setMediaToInsert] = useState<{ id: string; fileUrl: string; alt?: string; isFile?: boolean } | null>(null);

  const subtitleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (subtitleRef.current) {
      subtitleRef.current.style.height = "auto";
      subtitleRef.current.style.height = subtitleRef.current.scrollHeight + "px";
    }
  }, [subtitle]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    fetch("/api/post-editor-context")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setWatermarkSettings(data?.watermarkSettings || null);
        setUsers(Array.isArray(data?.users) ? data.users : []);
      })
      .catch(() => {
        setWatermarkSettings(null);
        setUsers([]);
      });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setAuthorId((current) => (current && current.trim() !== "" ? current : user.id));
  }, [user?.id]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(title));
  }, [slugTouched, title]);

  useEffect(() => {
    if (!Array.isArray(users) || users.length === 0) return;
    if (reviewEditorIds.length > 0) return;
    const editorIds = users
      .filter((u) => ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(u?.role))
      .map((u) => String(u?.id || "").trim())
      .filter((v) => v !== "");
    if (editorIds.length > 0) setReviewEditorIds(editorIds);
  }, [reviewEditorIds.length, users]);

  useEffect(() => {
    if (type !== "VIDEO") return;
    if (featuredImageId) return;
    const thumbnail = typeof videoUrl === "string" ? getYouTubeThumbnailUrl(videoUrl, "hqdefault") : null;
    if (!thumbnail) return;
    if (!thumbnailImage || thumbnailImage.includes("https://img.youtube.com/vi/")) {
      setThumbnailImage(thumbnail);
    }
  }, [featuredImageId, thumbnailImage, type, videoUrl]);

  useEffect(() => {
    if (type !== "INFOGRAPHIC") return;
    if (typeof content !== "string" || content.trim() === "") {
      setContentImageCandidates([]);
      return;
    }
    const unique = extractImageUrlsFromHtml(content);
    setContentImageCandidates(unique);
    if (!thumbnailAutoDisabled && !thumbnailImage && unique.length > 0) {
      setThumbnailImage(unique[0]);
    }
  }, [content, thumbnailAutoDisabled, thumbnailImage, type]);

  const resolveMediaAlt = (media: Media) => {
    const directAlt = typeof media.altText === "string" ? media.altText.trim() : "";
    if (directAlt) return directAlt;
    const readableName = getReadableFileName(String(media.fileName || ""));
    return readableName || title.trim();
  };

  function handleSelectMedia(media: Media) {
    if (mediaSelectMode === "single") {
      setFeaturedImageId(media.id);
      setFeaturedPreviewUrl(media.fileUrl);
      setFeaturedImageRemoved(false);
      setFeaturedImageAlt(resolveMediaAlt(media));
      if (type !== "INFOGRAPHIC") {
        setThumbnailAutoDisabled(false);
        setThumbnailImage(media.fileUrl);
      } else if (!thumbnailImage) {
        setThumbnailAutoDisabled(false);
        setThumbnailImage(media.fileUrl);
      }
      setShowMediaModal(false);
    } else if (mediaSelectMode === "editor") {
        setMediaToInsert({ id: media.id, fileUrl: media.fileUrl, alt: resolveMediaAlt(media) });
        setShowMediaModal(false);
    } else if (mediaSelectMode === "file") {
        setMediaToInsert({ id: media.id, fileUrl: media.fileUrl, alt: media.fileName, isFile: true });
        setShowMediaModal(false);
    } else {
      if (gallery.some(item => item.id === media.id)) {
        setGallery(prev => prev.filter(item => item.id !== media.id));
      } else {
        setGallery(prev => [...prev, { id: media.id, url: media.fileUrl, caption: "" }]);
      }
    }
  }
  
  function openMediaModal(mode: "single" | "multiple" | "editor" | "file" = "single") {
    setMediaSelectMode(mode);
    setShowMediaModal(true);
  }

  function handlePreview() {
    const primaryCategoryId = selectedCategoryIds[selectedCategoryIds.length - 1] || "";
    const sanitizedPreviewContent = sanitizeContent(content || "");
    const normalizedMedia = normalizePostTypeMedia({ type, videoUrl, gallery });
    const previewData = {
      postId: "",
      title,
      subtitle,
      content: sanitizedPreviewContent,
      categoryId: primaryCategoryId,
      categoryIds: selectedCategoryIds,
      previewImage: thumbnailImage,
      featuredPreviewUrl,
      featuredImageAlt,
      postImageWatermarkEnabled,
      tags,
      type,
      videoUrl: normalizedMedia.videoUrl,
      gallery: normalizedMedia.gallery,
      imageCaption,
      focusKeyword,
      canonicalUrl,
      status: "PREVIEW",
      authorId,
      approvedById,
      viewsBase,
      metaTitle,
      metaDesc,
      publishedAt: publishedAt || new Date().toISOString()
    };
    localStorage.setItem("previewData", JSON.stringify(previewData));
    window.open("/preview/post", "_blank");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPublishedAt = null;
      if (status === "PUBLISHED" || status === "SCHEDULED") {
         finalPublishedAt = publishedAt || new Date().toISOString();
      }
      const primaryCategoryId = selectedCategoryIds[selectedCategoryIds.length - 1] || "";
      const normalizedMedia = normalizePostTypeMedia({ type, videoUrl, gallery });

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          subtitle,
          content,
          categoryId: primaryCategoryId,
          categoryIds: selectedCategoryIds,
          authorId: authorId || undefined,
          approvedById: approvedById || undefined,
          featuredImageId: featuredImageId || (featuredImageRemoved ? "remove" : undefined), 
          featuredImageAlt,
          postImageWatermarkEnabled,
          image: thumbnailImage,
          imageCaption, 
          status,
          rejectionReason,
          publishedAt: finalPublishedAt, 
          tags, 
          type, 
          videoUrl: normalizedMedia.videoUrl,
          gallery: normalizedMedia.gallery,
          focusKeyword,
          canonicalUrl,
          metaTitle,
          metaDesc,
          viewsBase,
          ...(status === "IN_REVIEW" ? { reviewEditorIds } : {})
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: "Berita berhasil disimpan!", type: "success" });
        setTimeout(() => {
          router.push("/admin/posts");
          router.refresh();
        }, 1000);
      } else {
        const details = Array.isArray(data?.details) ? data.details : [];
        const detailMessage = details.length > 0
          ? `: ${details.slice(0, 3).map((d: any) => d?.message).filter(Boolean).join(" | ")}${details.length > 3 ? ` (+${details.length - 3} lainnya)` : ""}`
          : "";
        setToast({ message: `${data?.error || "Gagal menyimpan berita"}${detailMessage}`, type: "error" });
      }
    } catch {
      setToast({ message: "Error jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const postTypes = [
    { id: "ARTICLE", label: "Artikel", icon: FileText, color: "text-blue-600" },
    { id: "VIDEO", label: "Video", icon: Video, color: "text-red-600" },
    { id: "INFOGRAPHIC", label: "Infografis", icon: Layers, color: "text-purple-600" },
    { id: "GALLERY", label: "Galeri", icon: Images, color: "text-green-600" },
  ];

  const handleRequestImage = () => {
    openMediaModal("editor");
  };

  const handleRequestFile = () => {
    openMediaModal("file");
  };

  const siteUrlBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://pranala.site").replace(/\/+$/, "");
  const featuredImageUrl = featuredPreviewUrl;

  return (
    <div className="admin-post-editor-page px-3 py-4 sm:px-4 sm:py-5 md:p-8 admin-form bg-[var(--bg-base)] min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-[var(--fg-primary)] sm:text-2xl">Tulis Berita Baru</h1>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-surface)] sm:px-4"
          >
            <Eye size={18} className="mr-2" />
            Pratinjau
          </button>
        </div>
      </div>

      <form id="post-editor-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="space-y-5 lg:col-span-2 lg:space-y-8">
            
            {/* Post Type */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                {postTypes.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as PostType)}
                        className={`rounded-xl border px-3 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                            type === t.id 
                            ? `bg-white border-${t.color.split('-')[1]}-200 ${t.color} shadow-sm ring-1 ring-${t.color.split('-')[1]}-100` 
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        <t.icon size={18} className={type === t.id ? t.color : "text-gray-400"} />
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="card space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Judul Berita</label>
                <input
                  type="text"
                  className="input w-full text-lg font-semibold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Masukkan judul berita..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Slug URL</label>
                <input
                  type="text"
                  className="input w-full"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="slug-berita"
                />
                <p className="mt-1 text-xs text-gray-400">
                  URL artikel: {siteUrlBase}/kategori/{slug || "slug-berita"}
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Ringkasan / Lead</label>
                <textarea
                  ref={subtitleRef}
                  className="input w-full resize-none"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={2}
                  placeholder="Tulis ringkasan singkat atau lead paragraf..."
                />
              </div>

              {/* Gallery (Only for GALLERY) */}
              {type === "GALLERY" && (
                <div className="pt-4 border-t border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                     <label className="block font-medium text-gray-900">Galeri Foto</label>
                     <button
                        type="button"
                        onClick={() => openMediaModal("multiple")}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium flex items-center transition-colors"
                     >
                       <Plus size={16} className="mr-1" /> Tambah Foto
                     </button>
                   </div>
                   
                   {gallery.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {gallery.map((item, idx) => (
                         <div key={item.id} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
                            <div className="relative aspect-video">
                              <Image src={item.url} alt="Gallery Item" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => setGallery(prev => prev.filter(g => g.id !== item.id))}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="p-2 bg-white">
                              <input 
                                type="text"
                                placeholder="Keterangan foto..."
                                className="w-full text-xs border-none bg-transparent p-1 focus:ring-0 placeholder-gray-400"
                                value={item.caption}
                                onChange={(e) => {
                                  const newGallery = [...gallery];
                                  newGallery[idx].caption = e.target.value;
                                  setGallery(newGallery);
                                }}
                              />
                            </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div 
                        onClick={() => openMediaModal("multiple")}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
                     >
                       <div className="p-3 bg-gray-100 rounded-full mb-3">
                           <Images size={24} className="text-gray-400" />
                       </div>
                       <p className="text-sm font-medium">Klik untuk upload foto galeri</p>
                     </div>
                   )}
                </div>
              )}

              {/* Video URL */}
              {type === "VIDEO" && (
                <div className="p-4 rounded-lg border border-red-100 bg-red-50">
                  <label className="block font-medium mb-1 text-red-700 flex items-center text-sm">
                    <Video size={16} className="mr-2" /> Link Video (YouTube)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-red-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {/* Editor */}
              <div className="relative min-h-[420px] sm:min-h-[500px] -mx-1 sm:mx-0">
                <TiptapArticleEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Mulai menulis cerita..."
                  onRequestImage={handleRequestImage}
                  onRequestFile={handleRequestFile}
                  mediaToInsert={mediaToInsert}
                  onMediaInserted={() => setMediaToInsert(null)}
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card p-4 sm:p-5 lg:p-6">
                    <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                    <Search size={18} className="text-blue-600" />
                    Meta Data SEO
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Focus Keyword</label>
                        <input
                            type="text"
                            value={focusKeyword}
                            onChange={(e) => setFocusKeyword(e.target.value)}
                            className="input w-full"
                            placeholder="contoh: tambang nikel indonesia"
                        />
                        <p className="text-xs text-gray-400 mt-1">Keyword utama yang ingin dikejar oleh artikel ini.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Judul Meta</label>
                        <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            className="input w-full"
                            placeholder={title || "Judul Halaman"}
                        />
                        <p className="text-xs text-gray-400 mt-1">Judul yang muncul di hasil pencarian Google.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Deskripsi Meta</label>
                        <textarea
                            value={metaDesc}
                            onChange={(e) => setMetaDesc(e.target.value)}
                            className="input w-full h-24 resize-none"
                            placeholder={subtitle || "Deskripsi singkat..."}
                        />
                        <p className="text-xs text-gray-400 mt-1">Ringkasan halaman untuk mesin pencari.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Canonical URL</label>
                        <input
                            type="url"
                            value={canonicalUrl}
                            onChange={(e) => setCanonicalUrl(e.target.value)}
                            className="input w-full"
                            placeholder={`${siteUrlBase}/kategori/${slug || "slug-berita"}`}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Kosongkan jika ingin canonical otomatis mengikuti URL artikel utama.
                        </p>
                    </div>
                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pratinjau Google</div>
                        <div className="text-sm text-[#202124] truncate mb-0.5">
                          {siteUrlBase.replace(/^https?:\/\//, "")} {"\u203a"} berita {"\u203a"} {slug || "slug-berita"}
                        </div>
                        <div className="text-xl text-[#1a0dab] truncate hover:underline cursor-pointer font-medium mb-1 font-sans">
                            {metaTitle || title || "Judul Berita"}
                        </div>
                        <div className="text-sm text-[#4d5156] line-clamp-2 font-sans">
                            {metaDesc || subtitle || "Deskripsi meta belum diisi. Google akan mengambil potongan dari konten berita Anda."}
                        </div>
                        <div className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500 break-all">
                          Canonical: {canonicalUrl || `${siteUrlBase}/kategori/${slug || "slug-berita"}`}
                        </div>
                    </div>
                </div>
            </div>

            <PostSeoAuditPanel
              title={title}
              slug={slug}
              subtitle={subtitle}
              content={content}
              metaTitle={metaTitle}
              metaDesc={metaDesc}
              focusKeyword={focusKeyword}
              canonicalUrl={canonicalUrl}
              featuredImageUrl={type === "INFOGRAPHIC" ? featuredImageUrl : (featuredImageUrl || thumbnailImage)}
              featuredImageAlt={featuredImageAlt}
              categoryIds={selectedCategoryIds}
              tags={tags}
            />
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-5 lg:space-y-6">
            <div className="card p-4 sm:p-5">
               <h3 className="font-semibold text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                   Publikasi
               </h3>
               <PostPublishWidget
                 currentStatus={status}
                 publishedAt={publishedAt}
                 rejectionReason={rejectionReason}
                 onStatusChange={setStatus}
                 onDateChange={setPublishedAt}
                 onRejectionReasonChange={setRejectionReason}
                 loading={loading}
               />
            </div>

            <div
              className="sticky z-10 hidden md:block"
              style={{ top: "calc(var(--admin-header-height, 64px) + 12px)" }}
            >
              <div className="card p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex w-full items-center justify-center gap-2 py-3"
                  >
                    {loading ? "Menyimpan..." : "Simpan Berita"}
                  </button>
                </div>
              </div>
            </div>

            {/* Fake Counter */}
            <div className="card p-4 sm:p-5">
              <h3 className="font-semibold text-[var(--fg-primary)] mb-4 text-sm uppercase tracking-wider text-gray-500">Pembaca</h3>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah pembaca awal</label>
              <input
                type="number"
                min={0}
                className="input w-full text-sm"
                value={Number.isFinite(viewsBase) ? viewsBase : 0}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isFinite(next)) return setViewsBase(0);
                  setViewsBase(Math.max(0, Math.floor(next)));
                }}
              />
              <div className="mt-2 text-xs text-[var(--fg-muted)]">
                Angka ini adalah nilai awal. Setelah dipublikasi, total akan bertambah otomatis saat artikel dibuka.
              </div>
            </div>

            {/* Featured Image */}
            <div className="card p-4 sm:p-5">
               <h3 className="font-semibold text-[var(--fg-primary)] mb-3 text-sm uppercase tracking-wider text-gray-500">
                 {type === "INFOGRAPHIC" ? "Gambar Infografis" : "Gambar Utama"}
               </h3>
               {featuredImageUrl ? (
                <>
                  <div className="relative w-full aspect-video bg-[var(--bg-surface)] rounded-lg overflow-hidden mb-3 group border border-gray-200">
                    <Image 
                      src={featuredImageUrl} 
                      alt="Preview" 
                      fill 
                      className={`object-cover ${type === "INFOGRAPHIC" ? "object-top" : "object-center"}`}
                    />
                    <PostImageWatermark setting={watermarkSettings} enabled={postImageWatermarkEnabled} />
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImageId("");
                        setFeaturedPreviewUrl("");
                        setFeaturedImageRemoved(true);
                        setFeaturedImageAlt("");
                        setImageCaption("");
                        if (type !== "INFOGRAPHIC") {
                          setThumbnailImage("");
                        }
                      }}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => openMediaModal("single")}
                    className="btn btn-secondary w-full text-xs"
                  >
                    Ganti Gambar
                  </button>
                  <input 
                    type="text" 
                    placeholder="Caption gambar..." 
                    className="input mt-2 w-full text-xs"
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Alt gambar utama untuk SEO..."
                    className="input mt-2 w-full text-xs"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  />
                </>
              ) : (
                <div 
                    onClick={() => openMediaModal("single")}
                    className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors gap-2"
                >
                    <Images size={24} />
                    <span className="text-xs font-medium">Pilih Gambar</span>
                </div>
              )}
              <label className="mt-3 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={postImageWatermarkEnabled}
                  onChange={(e) => setPostImageWatermarkEnabled(e.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--fg-primary)]">Aktifkan Watermark Foto</span>
                  <span className="mt-1 block text-xs text-[var(--fg-muted)]">
                    Toggle ini berlaku per artikel, jadi berita lama juga bisa diedit lalu diaktifkan watermark-nya.
                    {watermarkSettings?.postImageWatermarkUrl
                      ? " Thumbnail preview di atas akan ikut menampilkan watermark saat aktif."
                      : " Gambar watermark global belum dipilih di Global Styles > Single Post."}
                  </span>
                </span>
              </label>
            </div>

            {type === "INFOGRAPHIC" && (
              <div className="card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-[var(--fg-primary)] text-sm uppercase tracking-wider text-gray-500">
                    Thumbnail Infografis
                  </h3>
                  {thumbnailImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailAutoDisabled(true);
                        setThumbnailImage("");
                      }}
                      className="text-xs font-medium text-purple-700 hover:text-purple-900"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {thumbnailImage ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-purple-100 bg-white">
                    <Image src={thumbnailImage} alt="Thumbnail Infografis" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-3 text-xs text-purple-700">
                    Masukkan gambar ke dalam konten untuk memilih thumbnail.
                  </div>
                )}
                {contentImageCandidates.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {contentImageCandidates.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => {
                          setThumbnailAutoDisabled(false);
                          setThumbnailImage(src);
                        }}
                        className={`relative aspect-square overflow-hidden rounded-md border bg-white ${
                          thumbnailImage === src
                            ? "border-purple-500 ring-2 ring-purple-200"
                            : "border-purple-100 hover:border-purple-300"
                        }`}
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Review Targets */}
            <div className="card p-4 sm:p-5">
              <h3 className="font-semibold text-[var(--fg-primary)] mb-4 text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                Notifikasi Review
              </h3>

              {(() => {
                const editors = users.filter((u) => ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(u?.role));
                const editorIdsAll = editors.map((u) => String(u?.id || "").trim()).filter((v) => v !== "");
                const allSelected = editorIdsAll.length > 0 && editorIdsAll.every((id) => reviewEditorIds.includes(id));

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-800 select-none">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={allSelected}
                          onChange={() => {
                            if (allSelected) setReviewEditorIds([]);
                            else setReviewEditorIds(editorIdsAll);
                          }}
                        />
                        <span className="font-medium">Pilih semua editor</span>
                      </label>
                      <div className="text-xs text-gray-500">
                        {reviewEditorIds.length}/{editorIdsAll.length}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-56 overflow-auto bg-white">
                      {editors.length === 0 ? (
                        <div className="text-sm text-gray-500">Belum ada akun editor.</div>
                      ) : (
                        editors
                          .slice()
                          .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "id-ID"))
                          .map((u) => {
                            const uid = String(u?.id || "").trim();
                            const checked = uid ? reviewEditorIds.includes(uid) : false;
                            return (
                              <label key={uid || u?.name} className="flex items-center gap-2 text-sm text-gray-800 select-none">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={checked}
                                  onChange={() => {
                                    if (!uid) return;
                                    setReviewEditorIds((prev) => {
                                      if (prev.includes(uid)) return prev.filter((id) => id !== uid);
                                      return [...prev, uid];
                                    });
                                  }}
                                />
                                <span className="flex-1">{u?.name}</span>
                              </label>
                            );
                          })
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Saat status diubah ke IN_REVIEW, notifikasi hanya dikirim ke editor yang dicentang.
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Taxonomy */}
            <div className="card p-5">
                <h3 className="font-semibold text-[var(--fg-primary)] mb-4 text-sm uppercase tracking-wider text-gray-500">Kategori & Tag</h3>
                
                {/* Category */}
                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Kategori (bisa pilih lebih dari satu)</label>
                    <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-64 overflow-auto bg-white">
                        {categories
                          .filter((c) => !c.parentId)
                          .slice()
                          .sort((a, b) => String(a.name).localeCompare(String(b.name), "id-ID"))
                          .map((parent) => {
                            const children = categories
                              .filter((c) => c.parentId === parent.id)
                              .slice()
                              .sort((a, b) => String(a.name).localeCompare(String(b.name), "id-ID"));
                            const parentChecked = selectedCategoryIds.includes(parent.id);
                            return (
                              <div key={parent.id} className="space-y-1">
                                <label className="flex items-center gap-2 text-sm text-gray-800 select-none">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={parentChecked}
                                    onChange={() => {
                                      setSelectedCategoryIds((prev) => {
                                        if (prev.includes(parent.id)) return prev.filter((id) => id !== parent.id);
                                        return [...prev, parent.id];
                                      });
                                    }}
                                  />
                                  <span className="font-medium">{parent.name}</span>
                                </label>
                                {children.length > 0 && (
                                  <div className="pl-6 space-y-1">
                                    {children.map((child) => {
                                      const childChecked = selectedCategoryIds.includes(child.id);
                                      return (
                                        <label key={child.id} className="flex items-center gap-2 text-sm text-gray-700 select-none">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={childChecked}
                                            onChange={() => {
                                              setSelectedCategoryIds((prev) => {
                                                if (prev.includes(child.id)) return prev.filter((id) => id !== child.id);
                                                return [...prev, child.id];
                                              });
                                            }}
                                          />
                                          <span>{child.name}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tag / Topik</label>
                    <TagInput tags={tags} onChange={setTags} />
                </div>
            </div>

            {/* Author & Editor */}
            <div className="card p-5">
                <h3 className="font-semibold text-[var(--fg-primary)] mb-4 text-sm uppercase tracking-wider text-gray-500">Atribusi</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={12} /> Penulis
                        </label>
                        <div className="relative">
                            <select
                                className="input w-full text-sm appearance-none"
                                value={authorId}
                                onChange={(e) => setAuthorId(e.target.value)}
                                disabled={users.length === 0}
                            >
                                <option value="">Pilih Penulis...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Shield size={12} /> Editor
                        </label>
                        <div className="relative">
                            <select
                                className="input w-full text-sm appearance-none"
                                value={approvedById}
                                onChange={(e) => setApprovedById(e.target.value)}
                                disabled={users.length === 0}
                            >
                                <option value="">Belum ada editor</option>
                                {users.filter(u => ["EDITOR","ADMIN","SUPER_ADMIN"].includes(u.role)).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </form>

      {/* Media Modal */}
      {showMediaModal && (
        <MediaLibraryModal
            onClose={() => setShowMediaModal(false)}
            onSelect={handleSelectMedia}
            selectedId={mediaSelectMode === "single" ? featuredImageId : undefined}
            allowedTypes={mediaSelectMode === "file" ? "file" : mediaSelectMode === "editor" ? "image" : "all"}
        />
      )}
    </div>
  );
}
