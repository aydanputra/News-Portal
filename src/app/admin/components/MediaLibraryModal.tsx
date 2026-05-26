"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Upload, Check, ImageIcon, FileText, File, Search } from "lucide-react";

export interface Media {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
}

interface MediaLibraryModalProps {
  onSelect: (media: Media) => void;
  onClose: () => void;
  selectedId?: string;
  selectedUrl?: string;
  allowedTypes?: "image" | "file" | "all"; // New prop
}

export default function MediaLibraryModal({ 
    onSelect, 
    onClose, 
    selectedId, 
    selectedUrl,
    allowedTypes = "all" 
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const apiType = allowedTypes === "image" ? "image" : allowedTypes === "file" ? "document" : "all";

  const fetchMedia = useCallback(async (nextPage: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const limit = 30;
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("limit", String(limit));
      params.set("type", apiType);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/media?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      const next = Array.isArray(data?.data) ? data.data : [];
      const nextTotalPages = Number(data?.pagination?.totalPages) || 1;
      const nextTotal = Number(data?.pagination?.total) || 0;
      setTotalPages(nextTotalPages);
      setTotal(nextTotal);
      setMediaList((prev) => (append ? [...prev, ...next] : next));
    } catch (e) {
      console.error("Failed to fetch media", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiType, searchQuery]);

  useEffect(() => {
    if (activeTab !== "library") return;
    const t = window.setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(t);
  }, [activeTab, searchInput]);

  useEffect(() => {
    if (activeTab !== "library") return;
    setPage(1);
    fetchMedia(1, false);
  }, [activeTab, fetchMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onSelect(data); 
        onClose();
      } else {
        alert("Gagal upload: " + data.error);
      }
    } catch {
      alert("Error upload");
    } finally {
      setUploading(false);
    }
  }

  const getAcceptAttribute = () => {
      if (allowedTypes === "image") return "image/*";
      if (allowedTypes === "file") return ".pdf,.doc,.docx,.xls,.xlsx,.zip";
      return "*/*";
  };

  const isImage = (fileType: string) => fileType.startsWith("image/");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
              Media Library {allowedTypes !== "all" ? `(${allowedTypes})` : ""}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "library" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Galeri Saya
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "upload" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Upload Baru
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeTab === "library" ? (
            loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                Memuat galeri...
              </div>
            ) : (
              <div>
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Cari media..."
                      className="input input-search w-full pr-10"
                    />
                    {searchInput.trim() !== "" && (
                      <button
                        type="button"
                        onClick={() => setSearchInput("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition"
                        aria-label="Hapus pencarian"
                        title="Hapus"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-[var(--fg-muted)]">
                    Menampilkan {mediaList.length}{total > 0 ? ` dari ${total}` : ""}{searchQuery ? ` • "${searchQuery}"` : ""}
                  </div>
                </div>

                {mediaList.length > 0 ? (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {mediaList.map((media) => {
                        const isSelected = selectedId === media.id || (selectedUrl && media.fileUrl === selectedUrl);
                        const isImg = isImage(media.fileType);

                        return (
                          <div 
                            key={media.id} 
                            onClick={() => { onSelect(media); onClose(); }}
                            className={`aspect-square bg-white rounded-lg overflow-hidden cursor-pointer relative group border-2 transition-all shadow-sm hover:shadow-md ${
                              isSelected ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent hover:border-blue-400"
                            }`}
                          >
                            {isImg ? (
                                <Image 
                                  src={media.fileUrl} 
                                  alt={media.fileName} 
                                  fill 
                                  sizes="(max-width: 768px) 33vw, 20vw"
                                  className="object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-2">
                                    {media.fileType.includes("pdf") ? <FileText size={32} className="text-red-500 mb-2" /> : <File size={32} className="mb-2" />}
                                    <span className="text-[10px] text-center w-full truncate px-1">{media.fileType.split("/")[1]?.toUpperCase() || "FILE"}</span>
                                </div>
                            )}
                            
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm z-10">
                                <Check size={12} />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {media.fileName}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {page < totalPages && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          disabled={loadingMore}
                          onClick={() => {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            fetchMedia(nextPage, true);
                          }}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow disabled:opacity-60"
                        >
                          {loadingMore ? "Memuat..." : "Load More"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center h-64 text-gray-400">
                    {allowedTypes === "image" ? <ImageIcon size={48} className="mb-2 opacity-50" /> : <FileText size={48} className="mb-2 opacity-50" />}
                    <p>{searchQuery ? "Media tidak ditemukan." : `Belum ada ${allowedTypes === "all" ? "media" : allowedTypes} di library.`}</p>
                    <button 
                        onClick={() => setActiveTab("upload")}
                        className="mt-4 text-blue-600 hover:underline text-sm"
                    >
                        Upload baru
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            // Upload Tab
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl bg-white m-4 hover:bg-blue-50/50 transition-colors">
              {uploading ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Sedang mengupload...</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Upload size={32} className="text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Klik atau seret file ke sini</p>
                  <p className="text-xs text-gray-400 mb-6">
                      {allowedTypes === "image" ? "Mendukung JPG, PNG, WEBP" : "Mendukung Gambar & Dokumen (PDF, DOC)"}
                  </p>
                  <label className="px-6 py-2.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/30">
                    Pilih File
                    <input
                      type="file"
                      accept={getAcceptAttribute()}
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
