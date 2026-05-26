"use client";

import { useState, useCallback } from "react";
import { Save, ArrowLeft, Loader2, Settings, Layout, Eye, Image as ImageIcon, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import MediaLibraryModal from "../../components/MediaLibraryModal";

// Dynamic import for CKEditor to avoid SSR issues
const CKEditorComponent = dynamic(() => import("@/components/admin/CKEditorComponent"), { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
});

interface PageFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    published: boolean;
    metaTitle?: string;
    metaDesc?: string;
    featuredImage?: string | null;
    template?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function PageForm({ initialData, onSubmit, isEditing = false }: PageFormProps) {
  const [loading, setLoading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  
  // Status State (Replacing boolean published)
  const [status, setStatus] = useState(initialData?.published ? "PUBLISHED" : "DRAFT");
  
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || null);
  const [template, setTemplate] = useState(initialData?.template || "default");

  // Media Insertion State
  const [mediaToInsert, setMediaToInsert] = useState<{ id: string; fileUrl: string; alt?: string } | null>(null);
  const [mediaMode, setMediaMode] = useState<'featured' | 'editor'>('featured');

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draf",
    PUBLISHED: "Terbit",
    ARCHIVED: "Diarsipkan"
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-200 text-gray-500"
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!isEditing && slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        slug,
        content,
        published: status === "PUBLISHED",
        metaTitle,
        metaDesc,
        featuredImage,
        template
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (slug) {
        window.open(`/${slug}`, '_blank');
    } else {
        alert("Harap isi judul/slug terlebih dahulu untuk melihat preview.");
    }
  };

  const handleRequestImage = useCallback(() => {
      setMediaMode('editor');
      setShowMediaModal(true);
  }, []);

  return (
    <div className="p-6 md:p-8 admin-form bg-[var(--bg-base)] min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="p-2 -ml-2 text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] rounded-full transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--fg-primary)]">
                {isEditing ? "Edit Halaman" : "Halaman Baru"}
            </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-secondary)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--bg-surface)] transition-colors flex items-center"
          >
            <Eye size={18} className="mr-2" />
            Pratinjau
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            {loading ? "Menyimpan..." : "Simpan Halaman"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] shadow-sm">
              {/* Judul */}
              <div>
                <label className="block font-medium mb-1 text-[var(--fg-secondary)]">Judul Halaman</label>
                <input
                  type="text"
                  className="input w-full text-lg font-medium px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  placeholder="Judul Halaman"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-medium mb-1 text-[var(--fg-secondary)]">Slug URL</label>
                <div className="flex items-center">
                    <span className="bg-[var(--bg-surface)] border border-r-0 border-[var(--border)] px-3 py-2 rounded-l-lg text-[var(--fg-muted)] text-sm">
                        /
                    </span>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="flex-1 input px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-r-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="slug-halaman"
                    />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col relative min-h-[500px]">
                <CKEditorComponent
                  value={content}
                  onChange={setContent}
                  placeholder="Tulis konten halaman di sini..."
                  onRequestImage={handleRequestImage}
                  mediaToInsert={mediaToInsert}
                  onMediaInserted={() => setMediaToInsert(null)}
                />
              </div>

              {/* SEO Settings */}
              <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                      <Settings size={18} />
                      Meta Data SEO
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Judul Meta</label>
                          <input
                              type="text"
                              value={metaTitle}
                              onChange={(e) => setMetaTitle(e.target.value)}
                              className="input w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg"
                              placeholder={title}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1">Deskripsi Meta</label>
                          <textarea
                              value={metaDesc}
                              onChange={(e) => setMetaDesc(e.target.value)}
                              className="input w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg h-24 resize-none"
                              placeholder="Deskripsi singkat halaman..."
                          />
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              
              {/* Publish Widget (Similar to Post) */}
              <div className="card bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border)] flex justify-between items-center">
                      <h3 className="font-semibold text-[var(--fg-primary)] text-sm">Publikasi</h3>
                  </div>
                  <div className="p-4 space-y-4">
                      {/* Status Badge */}
                      <div className={`p-3 rounded-lg flex items-center justify-between ${STATUS_COLORS[status] || "bg-gray-100"}`}>
                        <span className="font-semibold text-sm">Status Saat Ini</span>
                        <span className="font-bold text-sm uppercase tracking-wider">{STATUS_LABELS[status] || status}</span>
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Ubah Status</label>
                        <div className="relative">
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 text-base border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none"
                          >
                            <option value="DRAFT">Draf</option>
                            <option value="PUBLISHED">Terbit</option>
                            <option value="ARCHIVED">Diarsipkan</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-3 text-[var(--fg-muted)] pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-[var(--border)]">
                          <button
                              type="submit"
                              onClick={handleSubmit}
                              disabled={loading}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                          >
                              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                              Simpan Perubahan
                          </button>
                      </div>
                  </div>
              </div>

              {/* Featured Image Widget */}
              <div className="card bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border)]">
                      <h3 className="font-semibold text-[var(--fg-primary)] text-sm">Gambar Unggulan</h3>
                  </div>
                  <div className="p-4">
                      {featuredImage ? (
                          <div className="relative group rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] aspect-video mb-3">
                              <Image 
                                  src={featuredImage} 
                                  alt="Featured" 
                                  fill 
                                  className="object-cover" 
                              />
                              <button
                                  type="button"
                                  onClick={() => setFeaturedImage(null)}
                                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <X size={14} />
                              </button>
                          </div>
                      ) : (
                          <button
                              type="button"
                              onClick={() => {
                                  setMediaMode('featured');
                                  setShowMediaModal(true);
                              }}
                              className="w-full aspect-video flex flex-col items-center justify-center bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border)] rounded-lg hover:bg-[var(--bg-base)] transition-colors group mb-3"
                          >
                              <div className="p-3 bg-[var(--bg-elevated)] rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                  <ImageIcon size={20} className="text-[var(--fg-muted)]" />
                              </div>
                              <span className="text-xs font-medium text-[var(--fg-secondary)]">Pilih Gambar</span>
                          </button>
                      )}
                  </div>
              </div>

              {/* Page Attributes Widget */}
              <div className="card bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                  <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border)]">
                      <h3 className="font-semibold text-[var(--fg-primary)] text-sm">Atribut Halaman</h3>
                  </div>
                  <div className="p-4 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-1 flex items-center gap-1">
                              <Layout size={14} /> Template
                          </label>
                          <div className="relative">
                              <select 
                                  value={template}
                                  onChange={(e) => setTemplate(e.target.value)}
                                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--fg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                              >
                                  <option value="default">Default Template</option>
                                  <option value="full-width">Full Width (No Sidebar)</option>
                                  <option value="landing">Landing Page (Clean)</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-3 text-[var(--fg-muted)] pointer-events-none" />
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* Media Modal */}
      {showMediaModal && (
        <MediaLibraryModal
            onClose={() => setShowMediaModal(false)}
            onSelect={(media) => {
                if (mediaMode === 'featured') {
                    setFeaturedImage(media.fileUrl);
                } else {
                    setMediaToInsert({ id: media.id, fileUrl: media.fileUrl });
                }
                setShowMediaModal(false);
            }}
        />
      )}
    </div>
  );
}
