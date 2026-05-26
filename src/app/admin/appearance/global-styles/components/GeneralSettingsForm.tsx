import { ColorInput } from "./ColorInput";
import FontSelectCustom from "./FontSelectCustom";
import { useState } from "react";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";

interface GeneralSettingsFormProps {
    settings: any;
    handleChange: (key: string, value: any) => void;
    activeTab: "colors" | "typography" | "layout";
}

// --- Font Options ---
const FONT_OPTIONS = [
    { value: "Inter", label: "Inter (Default)" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
    { value: "Merriweather", label: "Merriweather (Serif)" },
    { value: "Playfair Display", label: "Playfair Display (Serif)" },
    { value: "Nunito", label: "Nunito" },
    { value: "Raleway", label: "Raleway" },
    { value: "PT Sans", label: "PT Sans" },
    { value: "Lora", label: "Lora (Serif)" },
    { value: "Rubik", label: "Rubik" },
    { value: "Work Sans", label: "Work Sans" },
    { value: "Fira Sans", label: "Fira Sans" },
    { value: "Quicksand", label: "Quicksand" },
    { value: "Barlow", label: "Barlow" },
    { value: "Mulish", label: "Mulish" },
    { value: "Titillium Web", label: "Titillium Web" },
    { value: "Ubuntu", label: "Ubuntu" },
];

// --- Helper Components ---
const FontPreviewLoader = () => {
    // Load all fonts for preview in dropdown
    const fonts = FONT_OPTIONS.filter(f => f.value !== "Inter").map(f => f.value);
    
    // Chunk fonts to avoid URL length limits
    const chunks = [];
    const chunkSize = 10;
    for (let i = 0; i < fonts.length; i += chunkSize) {
        chunks.push(fonts.slice(i, i + chunkSize));
    }

    return (
        <>
            {chunks.map((chunk, index) => {
                const query = chunk.map(f => `family=${f.replace(/ /g, "+")}:wght@400`).join("&");
                const url = `https://fonts.googleapis.com/css2?${query}&display=swap`;
                return <link key={index} rel="stylesheet" href={url} />;
            })}
        </>
    );
};

const FontSizeSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--fg-secondary)]">{label}</label>
        <select 
            className="input w-full text-sm h-12 px-3 leading-normal bg-[var(--bg-base)] border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--ring)]"
            value={value || "16px"}
            onChange={(e) => onChange(e.target.value)}
        >
            {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 60, 72].map(size => (
                <option key={size} value={`${size}px`}>{size}px</option>
            ))}
        </select>
    </div>
);

const FontWeightSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--fg-secondary)]">{label}</label>
        <select 
            className="input w-full text-sm h-12 px-3 leading-normal bg-[var(--bg-base)] border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--ring)]"
            value={value || "400"}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
        </select>
    </div>
);

const TypographyCard = ({ title, sizeValue, weightValue, fontValue, onSizeChange, onWeightChange, onFontChange }: any) => (
    <div className="p-4 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors shadow-sm">
        <h4 className="text-sm font-semibold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)]">{title}</h4>
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--fg-secondary)]">Tipe Font</label>
                <FontSelectCustom 
                    value={fontValue || "Inter"}
                    onChange={onFontChange}
                    options={FONT_OPTIONS}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <FontSizeSelect label="Ukuran" value={sizeValue} onChange={onSizeChange} />
                <FontWeightSelect label="Ketebalan" value={weightValue} onChange={onWeightChange} />
            </div>
        </div>
    </div>
);

export default function GeneralSettingsForm({ settings, handleChange, activeTab }: GeneralSettingsFormProps) {
    const [showMediaModal, setShowMediaModal] = useState(false);

    return (
        <>
            {showMediaModal && (
                <MediaLibraryModal 
                    onClose={() => setShowMediaModal(false)}
                    onSelect={(media) => {
                        handleChange("globalBackgroundImage", media.fileUrl);
                        setShowMediaModal(false);
                    }}
                    allowedTypes="image"
                />
            )}

            {/* COLORS TAB */}
            {activeTab === "colors" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    
                    {/* 1. Warna Homepage */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                            Warna Homepage
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)]">
                            <ColorInput 
                                label="Judul Widget" 
                                desc="Warna untuk judul setiap widget/section."
                                value={settings.homeWidgetTitleColor || "#1e293b"} 
                                onChange={(v) => handleChange("homeWidgetTitleColor", v)} 
                            />
                            <ColorInput 
                                label="Judul Berita" 
                                desc="Warna teks judul artikel dalam list."
                                value={settings.homeNewsTitleColor || "#111827"} 
                                onChange={(v) => handleChange("homeNewsTitleColor", v)} 
                            />
                            <ColorInput 
                                label="Hover Judul" 
                                desc="Warna judul saat kursor diarahkan (hover)."
                                value={settings.homeHoverColor || "#2563eb"} 
                                onChange={(v) => handleChange("homeHoverColor", v)} 
                            />
                            <ColorInput 
                                label="Warna Aksen" 
                                desc="Warna aksen homepage untuk highlight elemen dan aksen judul widget."
                                value={settings.globalAccentColor}
                                globalDefault="#f59e0b"
                                onChange={(v) => handleChange("globalAccentColor", v)} 
                            />
                            <ColorInput 
                                label="Meta Data" 
                                desc="Warna tanggal, kategori, dan penulis."
                                value={settings.homeMetaColor || "#9ca3af"} 
                                onChange={(v) => handleChange("homeMetaColor", v)} 
                            />
                            <ColorInput 
                                label="Ringkasan (Excerpt)" 
                                desc="Warna teks ringkasan artikel."
                                value={settings.homeExcerptColor || "#4b5563"} 
                                onChange={(v) => handleChange("homeExcerptColor", v)} 
                            />
                        </div>
                    </div>

                    {/* 2. Warna Single Post */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-sm"></span>
                            Warna Single Post
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)]">
                            <ColorInput 
                                label="Judul Widget Sidebar" 
                                desc="Warna judul widget di sidebar halaman artikel."
                                value={settings.postWidgetTitleColor || "#1e293b"} 
                                onChange={(v) => handleChange("postWidgetTitleColor", v)} 
                            />
                            <ColorInput 
                                label="Konten Artikel" 
                                desc="Warna teks isi artikel."
                                value={settings.postContentColor || "#374151"} 
                                onChange={(v) => handleChange("postContentColor", v)} 
                            />
                            <ColorInput 
                                label="Meta Data" 
                                desc="Warna tanggal dan penulis di artikel."
                                value={settings.postMetaColor || settings.metaColor || "#94a3b8"} 
                                onChange={(v) => handleChange("postMetaColor", v)} 
                            />
                            <ColorInput 
                                label="Link Artikel" 
                                desc="Warna tautan di dalam konten artikel."
                                value={settings.postLinkColor || settings.postHoverColor || settings.homeHoverColor || "#2563eb"} 
                                onChange={(v) => handleChange("postLinkColor", v)} 
                            />
                            <ColorInput 
                                label="Hover Link Artikel" 
                                desc="Warna tautan saat di-hover."
                                value={settings.postLinkHoverColor || settings.postLinkColor || settings.postHoverColor || settings.homeHoverColor || "#1d4ed8"} 
                                onChange={(v) => handleChange("postLinkHoverColor", v)} 
                            />
                            <ColorInput 
                                label="Badge Tag/Kategori (Teks)" 
                                desc="Warna teks badge tag/kategori pada widget post."
                                value={settings.postBadgeTextColor || settings.postMetaColor || settings.metaColor || "#374151"} 
                                onChange={(v) => handleChange("postBadgeTextColor", v)} 
                            />
                            <ColorInput 
                                label="Badge Tag/Kategori (Latar)" 
                                desc="Warna latar badge tag/kategori pada widget post."
                                value={settings.postBadgeBgColor || "#f3f4f6"} 
                                onChange={(v) => handleChange("postBadgeBgColor", v)} 
                            />
                        </div>
                    </div>

                    {/* 3. Warna Global */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-purple-500 rounded-sm"></span>
                            Warna Global
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)]">
                            <ColorInput 
                                label="Primary (Utama)" 
                                desc="Warna identitas utama brand Anda."
                                value={settings.globalPrimaryColor || settings.postPrimaryColor || "#2563eb"} 
                                onChange={(v) => handleChange("globalPrimaryColor", v)} 
                            />
                            <ColorInput 
                                label="Secondary (Sekunder)" 
                                desc="Warna pendukung."
                                value={settings.globalSecondaryColor || settings.postSecondaryColor || "#64748b"} 
                                onChange={(v) => handleChange("globalSecondaryColor", v)} 
                            />
                            <ColorInput 
                                label="Accent (Aksen)" 
                                desc="Warna untuk highlight dan tombol aksi."
                                value={settings.globalAccentColor || settings.postAccentColor || "#f59e0b"} 
                                onChange={(v) => handleChange("globalAccentColor", v)} 
                            />
                            <ColorInput 
                                label="Background Latar" 
                                desc="Warna latar belakang utama website."
                                value={settings.globalBackgroundColor || settings.backgroundColor || "#ffffff"} 
                                onChange={(v) => handleChange("globalBackgroundColor", v)} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TYPOGRAPHY TAB */}
            {activeTab === "typography" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <FontPreviewLoader />
                    
                    {/* 1. Homepage Typography */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                            Tipografi Homepage
                        </h3>
                        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TypographyCard 
                                title="Judul Widget" 
                                sizeValue={settings.homeWidgetTitleFontSize} weightValue={settings.homeWidgetTitleFontWeight} fontValue={settings.homeWidgetTitleFont}
                                onSizeChange={(v: string) => handleChange("homeWidgetTitleFontSize", v)} onWeightChange={(v: string) => handleChange("homeWidgetTitleFontWeight", v)} onFontChange={(v: string) => handleChange("homeWidgetTitleFont", v)}
                            />
                            <TypographyCard 
                                title="Judul Berita" 
                                sizeValue={settings.homeNewsTitleFontSize} weightValue={settings.homeNewsTitleFontWeight} fontValue={settings.homeNewsTitleFont}
                                onSizeChange={(v: string) => handleChange("homeNewsTitleFontSize", v)} onWeightChange={(v: string) => handleChange("homeNewsTitleFontWeight", v)} onFontChange={(v: string) => handleChange("homeNewsTitleFont", v)}
                            />
                            <TypographyCard 
                                title="Ringkasan" 
                                sizeValue={settings.homeExcerptFontSize} weightValue={settings.homeExcerptFontWeight} fontValue={settings.homeExcerptFont}
                                onSizeChange={(v: string) => handleChange("homeExcerptFontSize", v)} onWeightChange={(v: string) => handleChange("homeExcerptFontWeight", v)} onFontChange={(v: string) => handleChange("homeExcerptFont", v)}
                            />
                            <TypographyCard 
                                title="Meta Data" 
                                sizeValue={settings.homeMetaFontSize} weightValue={settings.homeMetaFontWeight} fontValue={settings.homeMetaFont}
                                onSizeChange={(v: string) => handleChange("homeMetaFontSize", v)} onWeightChange={(v: string) => handleChange("homeMetaFontWeight", v)} onFontChange={(v: string) => handleChange("homeMetaFont", v)}
                            />
                        </div>
                    </div>

                    {/* 2. Single Post Typography */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-sm"></span>
                            Tipografi Single Post
                        </h3>
                        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TypographyCard 
                                title="Judul Berita" 
                                sizeValue={settings.postTitleFontSize} weightValue={settings.postTitleFontWeight} fontValue={settings.postTitleFont}
                                onSizeChange={(v: string) => handleChange("postTitleFontSize", v)} onWeightChange={(v: string) => handleChange("postTitleFontWeight", v)} onFontChange={(v: string) => handleChange("postTitleFont", v)}
                            />
                            <TypographyCard 
                                title="Subjudul" 
                                sizeValue={settings.postSubtitleFontSize} weightValue={settings.postSubtitleFontWeight} fontValue={settings.postSubtitleFont}
                                onSizeChange={(v: string) => handleChange("postSubtitleFontSize", v)} onWeightChange={(v: string) => handleChange("postSubtitleFontWeight", v)} onFontChange={(v: string) => handleChange("postSubtitleFont", v)}
                            />
                            <TypographyCard 
                                title="Konten Artikel" 
                                sizeValue={settings.postContentFontSize} weightValue={settings.postContentFontWeight} fontValue={settings.postContentFont}
                                onSizeChange={(v: string) => handleChange("postContentFontSize", v)} onWeightChange={(v: string) => handleChange("postContentFontWeight", v)} onFontChange={(v: string) => handleChange("postContentFont", v)}
                            />
                            <TypographyCard 
                                title="Judul Widget" 
                                sizeValue={settings.postWidgetTitleFontSize} weightValue={settings.postWidgetTitleFontWeight} fontValue={settings.postWidgetTitleFont}
                                onSizeChange={(v: string) => handleChange("postWidgetTitleFontSize", v)} onWeightChange={(v: string) => handleChange("postWidgetTitleFontWeight", v)} onFontChange={(v: string) => handleChange("postWidgetTitleFont", v)}
                            />
                        </div>
                    </div>

                    {/* 3. Global / Fallback Typography */}
                    <div>
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                            <span className="w-2 h-6 bg-purple-500 rounded-sm"></span>
                            Tipografi Global (Fallback)
                        </h3>
                        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TypographyCard 
                                title="Judul Widget Global" 
                                sizeValue={settings.globalWidgetTitleFontSize} weightValue={settings.globalWidgetTitleFontWeight} fontValue={settings.globalWidgetTitleFont}
                                onSizeChange={(v: string) => handleChange("globalWidgetTitleFontSize", v)} onWeightChange={(v: string) => handleChange("globalWidgetTitleFontWeight", v)} onFontChange={(v: string) => handleChange("globalWidgetTitleFont", v)}
                            />
                            <TypographyCard 
                                title="Judul Berita Global" 
                                sizeValue={settings.globalNewsTitleFontSize} weightValue={settings.globalNewsTitleFontWeight} fontValue={settings.globalNewsTitleFont}
                                onSizeChange={(v: string) => handleChange("globalNewsTitleFontSize", v)} onWeightChange={(v: string) => handleChange("globalNewsTitleFontWeight", v)} onFontChange={(v: string) => handleChange("globalNewsTitleFont", v)}
                            />
                            <TypographyCard 
                                title="Konten Global" 
                                sizeValue={settings.globalContentFontSize} weightValue={settings.globalContentFontWeight} fontValue={settings.globalContentFont}
                                onSizeChange={(v: string) => handleChange("globalContentFontSize", v)} onWeightChange={(v: string) => handleChange("globalContentFontWeight", v)} onFontChange={(v: string) => handleChange("globalContentFont", v)}
                            />
                             <TypographyCard 
                                title="Meta Data Global" 
                                sizeValue={settings.globalMetaFontSize} weightValue={settings.globalMetaFontWeight} fontValue={settings.globalMetaFont}
                                onSizeChange={(v: string) => handleChange("globalMetaFontSize", v)} onWeightChange={(v: string) => handleChange("globalMetaFontWeight", v)} onFontChange={(v: string) => handleChange("globalMetaFont", v)}
                            />
                        </div>
                    </div>
                    


                </div>
            )}

            {/* LAYOUT TAB */}
            {activeTab === "layout" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium text-[var(--fg-primary)] mb-2">Radius Sudut Global</label>
                            <select 
                                className="input w-full"
                                value={settings.globalBorderRadius}
                                onChange={(e) => handleChange("globalBorderRadius", e.target.value)}
                            >
                                <option value="0rem">Kotak (0px)</option>
                                <option value="0.25rem">Kecil (4px)</option>
                                <option value="0.5rem">Sedang (8px)</option>
                                <option value="0.75rem">Besar (12px)</option>
                                <option value="1rem">Sangat Besar (16px)</option>
                                <option value="1.5rem">2XL (24px)</option>
                                <option value="2rem">3XL (32px)</option>
                                <option value="2.5rem">4XL (40px)</option>
                                <option value="3rem">5XL (48px)</option>
                                <option value="9999px">Bulat Penuh (Pill)</option>
                            </select>
                            <p className="text-xs text-[var(--fg-muted)] mt-1">Kelengkungan sudut untuk kartu, tombol, dan gambar.</p>
                        </div>
                        
                        <div>
                             <ColorInput 
                                label="Background Utama" 
                                desc="Warna latar belakang paling dasar website."
                                value={settings.globalBackgroundColor || settings.backgroundColor || "#ffffff"} 
                                onChange={(v) => handleChange("globalBackgroundColor", v)} 
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-8 mt-8">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2">Background Image</h3>
                        <div className="bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border)]">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-shrink-0">
                                    {settings.globalBackgroundImage ? (
                                        <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-[var(--border)] group">
                                            <Image 
                                                src={settings.globalBackgroundImage} 
                                                alt="Background" 
                                                fill
                                                unoptimized
                                                className="w-full h-full object-cover"
                                            />
                                            <button 
                                                onClick={() => handleChange("globalBackgroundImage", "")}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-40 h-24 rounded-lg bg-[var(--bg-base)] border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--fg-muted)]">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block font-medium text-[var(--fg-primary)] mb-1">Gambar Latar Belakang</label>
                                        <p className="text-sm text-[var(--fg-muted)] mb-3">
                                            Upload gambar untuk digunakan sebagai background global.
                                        </p>
                                        <button 
                                            onClick={() => setShowMediaModal(true)}
                                            className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded hover:bg-[var(--bg-hover)] text-sm font-medium transition-colors"
                                        >
                                            {settings.globalBackgroundImage ? "Ganti Gambar" : "Pilih Gambar"}
                                        </button>
                                    </div>

                                    {settings.globalBackgroundImage && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)] animate-in fade-in">
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--fg-secondary)] mb-1">Perulangan (Repeat)</label>
                                                <select 
                                                    className="input w-full text-sm"
                                                    value={settings.globalBackgroundRepeat || 'no-repeat'}
                                                    onChange={(e) => handleChange("globalBackgroundRepeat", e.target.value)}
                                                >
                                                    <option value="no-repeat">Tidak Berulang (No Repeat)</option>
                                                    <option value="repeat">Berulang (Repeat)</option>
                                                    <option value="repeat-x">Berulang Horizontal</option>
                                                    <option value="repeat-y">Berulang Vertikal</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--fg-secondary)] mb-1">Ukuran (Size)</label>
                                                <select 
                                                    className="input w-full text-sm"
                                                    value={settings.globalBackgroundSize || 'cover'}
                                                    onChange={(e) => handleChange("globalBackgroundSize", e.target.value)}
                                                >
                                                    <option value="auto">Auto (Asli)</option>
                                                    <option value="cover">Cover (Penuh)</option>
                                                    <option value="contain">Contain (Pas)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--fg-secondary)] mb-1">Posisi</label>
                                                <select 
                                                    className="input w-full text-sm"
                                                    value={settings.globalBackgroundPosition || 'center'}
                                                    onChange={(e) => handleChange("globalBackgroundPosition", e.target.value)}
                                                >
                                                    <option value="center">Tengah</option>
                                                    <option value="top">Atas</option>
                                                    <option value="bottom">Bawah</option>
                                                    <option value="left">Kiri</option>
                                                    <option value="right">Kanan</option>
                                                    <option value="top left">Kiri Atas</option>
                                                    <option value="top right">Kanan Atas</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--fg-secondary)] mb-1">Attachment (Scroll)</label>
                                                <select 
                                                    className="input w-full text-sm"
                                                    value={settings.globalBackgroundAttachment || 'scroll'}
                                                    onChange={(e) => handleChange("globalBackgroundAttachment", e.target.value)}
                                                >
                                                    <option value="scroll">Scroll (Ikut Bergerak)</option>
                                                    <option value="fixed">Fixed (Tetap)</option>
                                                    <option value="local">Local</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-8 mt-8">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] mb-4 pb-2">Tata Letak Kontainer</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Global Container */}
                             <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                <h4 className="font-semibold text-[var(--fg-primary)] mb-3">Kontainer Global (Default)</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Mode Lebar</label>
                                        <select 
                                            className="input w-full text-sm"
                                            value={settings.globalContainerWidth || 'boxed'}
                                            onChange={(e) => handleChange("globalContainerWidth", e.target.value)}
                                        >
                                            <option value="boxed">Kotak (Bawaan 1250px)</option>
                                            <option value="full">Lebar Penuh (100%)</option>
                                            <option value="custom">Lebar Kustom</option>
                                        </select>
                                    </div>
                                    
                                    {settings.globalContainerWidth === 'custom' && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Lebar Kustom (px)</label>
                                            <input 
                                                type="text"
                                                className="input w-full text-sm"
                                                value={settings.globalCustomContainerWidth || '1200'}
                                                onChange={(e) => handleChange("globalCustomContainerWidth", e.target.value)}
                                                placeholder="mis. 1200"
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-[var(--fg-muted)]">Digunakan untuk halaman Arsip, Kategori, dan Halaman Statis.</p>
                                </div>
                             </div>

                             {/* Homepage Container */}
                             <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                <h4 className="font-semibold text-[var(--fg-primary)] mb-3">Kontainer Beranda</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Mode Lebar</label>
                                        <select 
                                            className="input w-full text-sm"
                                            value={settings.homeContainerWidth || 'boxed'}
                                            onChange={(e) => handleChange("homeContainerWidth", e.target.value)}
                                        >
                                            <option value="boxed">Kotak (Bawaan 1250px)</option>
                                            <option value="full">Lebar Penuh (100%)</option>
                                            <option value="custom">Lebar Kustom</option>
                                        </select>
                                    </div>
                                    
                                    {settings.homeContainerWidth === 'custom' && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Lebar Kustom (px)</label>
                                            <input 
                                                type="text"
                                                className="input w-full text-sm"
                                                value={settings.homeCustomContainerWidth || '1200'}
                                                onChange={(e) => handleChange("homeCustomContainerWidth", e.target.value)}
                                                placeholder="mis. 1400"
                                            />
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Single Post Container */}
                             <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                <h4 className="font-semibold text-[var(--fg-primary)] mb-3">Kontainer Postingan</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Mode Lebar</label>
                                        <select 
                                            className="input w-full text-sm"
                                            value={settings.postContainerWidth || 'boxed'}
                                            onChange={(e) => handleChange("postContainerWidth", e.target.value)}
                                        >
                                            <option value="boxed">Kotak (Bawaan 1250px)</option>
                                            <option value="full">Lebar Penuh (100%)</option>
                                            <option value="custom">Lebar Kustom</option>
                                        </select>
                                    </div>
                                    
                                    {settings.postContainerWidth === 'custom' && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">Lebar Kustom (px)</label>
                                            <input 
                                                type="text"
                                                className="input w-full text-sm"
                                                value={settings.postCustomContainerWidth || '1200'}
                                                onChange={(e) => handleChange("postCustomContainerWidth", e.target.value)}
                                                placeholder="mis. 1000"
                                            />
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
