import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import CustomColorPicker from "../../../homepage/components/ColorPicker";

interface SinglePostSettingsFormProps {
    settings: any;
    handleChange: (key: string, value: any) => void;
}

export default function SinglePostSettingsForm({ settings, handleChange }: SinglePostSettingsFormProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>("inline_related");
    
    // Custom Switch Component (Simple implementation if @headlessui/react is not available or we prefer custom)
    const Toggle = ({ checked, onChange, label, desc, disabled = false }: { checked: boolean, onChange: (val: boolean) => void, label: string, desc?: string, disabled?: boolean }) => (
        <div className={`flex items-start justify-between py-4 border-b border-[var(--border)] last:border-0 ${disabled ? "opacity-60" : ""}`}>
            <div>
                <label className="font-medium text-[var(--fg-primary)] block">{label}</label>
                {desc && <p className="text-xs text-[var(--fg-muted)] mt-1 max-w-md">{desc}</p>}
            </div>
            <label className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <input type="checkbox" className="sr-only peer" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            </label>
        </div>
    );

    // Reset Handler
    const handleResetInlineRelated = () => {
        if (!confirm("Apakah Anda yakin ingin mereset pengaturan Inline Related Post ke default?")) return;
        
        handleChange("postInlineRelated", false);
        handleChange("postRelatedPositions", "2");
        handleChange("postRelatedCount", 2);
        handleChange("postInlineRelatedFilterType", "category");
        handleChange("postInlineRelatedDateRange", "all");
        handleChange("postInlineRelatedLayout", "list");
        handleChange("postInlineRelatedGridColumns", 2);
        handleChange("postInlineRelatedCardColumns", 1);
        handleChange("postInlineRelatedTitleFontSize", 16);
        handleChange("postInlineRelatedTitleFontWeight", "700");
        handleChange("postInlineRelatedTitleLineHeight", "1.35");
        handleChange("postInlineRelatedFontSize", 14);
        handleChange("postInlineRelatedBgColor", "#f9fafb");
        handleChange("postInlineRelatedHeaderBgColor", "#f9fafb");
        handleChange("postInlineRelatedTitleColor", "#1e293b");
        handleChange("postInlineRelatedTextColor", "#1f2937");
        handleChange("postInlineRelatedHoverColor", settings.postPrimaryColor || "#2563eb");
    };
    const handleResetInlineAds = () => {
        if (!confirm("Apakah Anda yakin ingin mereset pengaturan banner iklan dalam artikel ke default?")) return;

        handleChange("postInlineAds", false);
        handleChange("postInlineAdPositions", "3");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* 1. Inline Related Post */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-visible">
                <div 
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-[color:var(--fg-muted)/0.05] transition-colors"
                    onClick={() => setExpandedSection(prev => prev === 'inline_related' ? null : 'inline_related')}
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)]">Inline Related Post (Baca Juga)</h3>
                        <span className="text-xs font-semibold bg-[color:var(--accent)/0.1] text-[var(--accent)] border border-[color:var(--accent)/0.2] px-2.5 py-0.5 rounded-full">
                            Dalam Artikel
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {expandedSection === 'inline_related' && (
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); handleResetInlineRelated(); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)] border border-[var(--border)] hover:text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/10 mr-3 px-3 py-1.5 rounded-lg transition-all group"
                                title="Kembalikan pengaturan ke default"
                            >
                                <RotateCcw size={13} className="group-hover:-rotate-180 transition-transform duration-500" />
                                Reset Default
                            </button>
                        )}
                        <button type="button" className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]">
                            {expandedSection === 'inline_related' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>
                
                {expandedSection === 'inline_related' && (
                    <div className="px-6 pb-6 pt-0 border-t border-[var(--border)]">
                        <div className="mt-4">
                            <Toggle 
                                label="Aktifkan Inline Related Post"
                                desc="Menyisipkan link 'Baca Juga' secara otomatis di antara paragraf konten berita."
                                checked={settings.postInlineRelated ?? false}
                                onChange={(v) => handleChange("postInlineRelated", v)}
                            />
                        </div>

                        {settings.postInlineRelated && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pl-4 border-l-2 border-[color:var(--accent)/0.3]">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Posisi (Setelah Paragraf ke-, Bisa Beberapa)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: 2, 6, 10"
                                        className="input w-full"
                                        value={settings.postRelatedPositions || "2"}
                                        onChange={(e) => handleChange("postRelatedPositions", e.target.value)}
                                    />
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Masukkan nomor paragraf yang dipisahkan koma. Contoh `2, 6, 10` akan menampilkan Inline Related setelah paragraf 2, 6, dan 10.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Jumlah Link per Posisi</label>
                                    <input 
                                        type="number" 
                                        min="1" max="5"
                                        className="input w-full"
                                        value={settings.postRelatedCount ?? 2}
                                        onChange={(e) => handleChange("postRelatedCount", parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Query Berdasarkan</label>
                                    <select
                                        className="input w-full"
                                        value={settings.postInlineRelatedFilterType || "category"}
                                        onChange={(e) => handleChange("postInlineRelatedFilterType", e.target.value)}
                                    >
                                        <option value="category">Kategori (Sama)</option>
                                        <option value="tag">Tag (Sama)</option>
                                    </select>
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Metode untuk mencari berita terkait.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Filter Waktu (Rentang Tanggal)</label>
                                    <select
                                        className="input w-full"
                                        value={settings.postInlineRelatedDateRange || "all"}
                                        onChange={(e) => handleChange("postInlineRelatedDateRange", e.target.value)}
                                    >
                                        <option value="all">Semua Waktu (All Time)</option>
                                        <option value="week">1 Minggu Terakhir</option>
                                        <option value="month">1 Bulan Terakhir</option>
                                        <option value="year">1 Tahun Terakhir</option>
                                    </select>
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Batasi berita terkait berdasarkan tanggal publikasi.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Tampilan (Layout)</label>
                                    <select
                                        className="input w-full"
                                        value={settings.postInlineRelatedLayout || "list"}
                                        onChange={(e) => handleChange("postInlineRelatedLayout", e.target.value)}
                                    >
                                        <option value="list">List (Daftar)</option>
                                        <option value="grid">Grid (Kotak)</option>
                                        <option value="card">Classic List</option>
                                        <option value="bullet">Bullet (Klasik)</option>
                                    </select>
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Pilih gaya tampilan berita terkait.</p>
                                </div>
                                {settings.postInlineRelatedLayout === "grid" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Jumlah Kolom Grid</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="4"
                                            className="input w-full"
                                            value={settings.postInlineRelatedGridColumns ?? 2}
                                            onChange={(e) => handleChange("postInlineRelatedGridColumns", parseInt(e.target.value))}
                                        />
                                        <p className="text-xs text-[var(--fg-muted)] mt-1">Tentukan berapa kolom kartu artikel terkait pada layout Grid.</p>
                                    </div>
                                )}
                                {settings.postInlineRelatedLayout === "card" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Jumlah Kolom Classic List</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="2"
                                            className="input w-full"
                                            value={settings.postInlineRelatedCardColumns ?? 1}
                                            onChange={(e) => handleChange("postInlineRelatedCardColumns", parseInt(e.target.value))}
                                        />
                                        <p className="text-xs text-[var(--fg-muted)] mt-1">Atur jumlah kolom untuk mode Classic List. Jika 4 berita dan pilih 2 kolom, tampilannya menjadi 2 kiri dan 2 kanan.</p>
                                    </div>
                                )}
                                
                                {/* New Style Settings */}
                                <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-[color:var(--accent)/0.2]">
                                    <h4 className="font-bold text-[var(--fg-primary)] mb-3 text-sm uppercase tracking-wide">Tampilan & Warna</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Ukuran Font Judul Berita</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    className="input w-full"
                                                    value={settings.postInlineRelatedTitleFontSize || 16}
                                                    onChange={(e) => handleChange("postInlineRelatedTitleFontSize", parseInt(e.target.value))}
                                                />
                                                <span className="text-sm text-[var(--fg-muted)]">px</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Font Weight Judul Berita</label>
                                            <select
                                                className="input w-full"
                                                value={settings.postInlineRelatedTitleFontWeight || "700"}
                                                onChange={(e) => handleChange("postInlineRelatedTitleFontWeight", e.target.value)}
                                            >
                                                <option value="500">500 Medium</option>
                                                <option value="600">600 Semi Bold</option>
                                                <option value="700">700 Bold</option>
                                                <option value="800">800 Extra Bold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Line Height Judul Berita</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="2"
                                                    step="0.05"
                                                    className="input w-full"
                                                    value={settings.postInlineRelatedTitleLineHeight || "1.35"}
                                                    onChange={(e) => handleChange("postInlineRelatedTitleLineHeight", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Ukuran Font Heading Baca Juga</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    className="input w-full"
                                                    value={settings.postInlineRelatedFontSize || 14}
                                                    onChange={(e) => handleChange("postInlineRelatedFontSize", parseInt(e.target.value))}
                                                />
                                                <span className="text-sm text-[var(--fg-muted)]">px</span>
                                            </div>
                                            <p className="text-xs text-[var(--fg-muted)] mt-1">Mengatur ukuran teks heading `Baca Juga` pada blok Inline Related.</p>
                                        </div>
                                        
                                        <div>
                                            <CustomColorPicker 
                                                label="Warna Background" 
                                                value={settings.postInlineRelatedBgColor}
                                                onChange={(val) => handleChange("postInlineRelatedBgColor", val)}
                                                globalDefault={undefined} // Allow null/empty to show "Auto"
                                            />
                                        </div>

                                        <div>
                                            <CustomColorPicker 
                                                label="Warna Background Heading" 
                                                value={settings.postInlineRelatedHeaderBgColor}
                                                onChange={(val) => handleChange("postInlineRelatedHeaderBgColor", val)}
                                                globalDefault={undefined} // Allow null/empty to show "Auto"
                                            />
                                        </div>

                                        <div>
                                            <CustomColorPicker 
                                                label="Warna Judul (Baca Juga)" 
                                                value={settings.postInlineRelatedTitleColor}
                                                onChange={(val) => handleChange("postInlineRelatedTitleColor", val)}
                                                globalDefault="#1f2937"
                                            />
                                        </div>

                                        <div>
                                            <CustomColorPicker 
                                                label="Warna Teks Judul Berita" 
                                                value={settings.postInlineRelatedTextColor}
                                                onChange={(val) => handleChange("postInlineRelatedTextColor", val)}
                                                globalDefault="#1f2937"
                                            />
                                        </div>

                                        <div>
                                            <CustomColorPicker 
                                                label="Warna Hover Judul Berita" 
                                                value={settings.postInlineRelatedHoverColor}
                                                onChange={(val) => handleChange("postInlineRelatedHoverColor", val)}
                                                globalDefault={undefined} // Allow null/empty to show "Auto"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Gallery Settings */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                <div 
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-[color:var(--fg-muted)/0.05] transition-colors"
                    onClick={() => setExpandedSection(prev => prev === 'gallery' ? null : 'gallery')}
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)]">Gallery Post Settings</h3>
                        <span className="text-xs font-semibold bg-[color:var(--accent)/0.1] text-[var(--accent)] border border-[color:var(--accent)/0.2] px-2.5 py-0.5 rounded-full">
                            Tampilan Galeri
                        </span>
                    </div>
                    <button type="button" className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]">
                        {expandedSection === 'gallery' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
                
                {expandedSection === 'gallery' && (
                    <div className="px-6 pb-6 pt-0 border-t border-[var(--border)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Gaya Tampilan Galeri (Default)</label>
                                <select
                                    className="input w-full"
                                    value={settings.galleryLayout || "slider"}
                                    onChange={(e) => handleChange("galleryLayout", e.target.value)}
                                >
                                    <option value="slider">Slider / Carousel (Recommended)</option>
                                    <option value="grid">Masonry Grid</option>
                                    <option value="feed">Vertical Feed (Instagram Style)</option>
                                </select>
                                <p className="text-xs text-[var(--fg-muted)] mt-1">Pilih tata letak default untuk artikel bertipe Galeri Foto.</p>
                            </div>
                            
                            <div>
                                <Toggle 
                                    label="Aktifkan Lightbox"
                                    desc="Mengizinkan pembaca mengklik foto untuk melihat ukuran penuh (Fullscreen)."
                                    checked={settings.galleryEnableLightbox ?? true}
                                    onChange={(v) => handleChange("galleryEnableLightbox", v)}
                                />
                            </div>
                            
                            <div>
                                <Toggle 
                                    label="Tampilkan Info EXIF"
                                    desc="Metadata EXIF belum tersedia di model media saat ini, jadi opsi ini belum bisa diaktifkan di frontend publik."
                                    checked={false}
                                    disabled
                                    onChange={() => {}}
                                />
                                <p className="mt-2 text-xs text-amber-600">
                                    Dukungan EXIF akan aktif setelah metadata kamera/foto disimpan pada media upload.
                                </p>
                            </div>

                             <div>
                                <Toggle 
                                    label="Auto-Play Slideshow"
                                    desc="Memutar foto secara otomatis dalam mode Slider atau Lightbox."
                                    checked={settings.galleryAutoPlay ?? false}
                                    onChange={(v) => handleChange("galleryAutoPlay", v)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Inline Ads */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-visible">
                <div
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-[color:var(--fg-muted)/0.05] transition-colors"
                    onClick={() => setExpandedSection(prev => prev === 'inline_ads' ? null : 'inline_ads')}
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)]">Banner Iklan Dalam Artikel</h3>
                        <span className="text-xs font-semibold bg-[color:var(--accent)/0.1] text-[var(--accent)] border border-[color:var(--accent)/0.2] px-2.5 py-0.5 rounded-full">
                            Inline Ads
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {expandedSection === 'inline_ads' && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleResetInlineAds(); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)] border border-[var(--border)] hover:text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/10 mr-3 px-3 py-1.5 rounded-lg transition-all group"
                                title="Kembalikan pengaturan ke default"
                            >
                                <RotateCcw size={13} className="group-hover:-rotate-180 transition-transform duration-500" />
                                Reset Default
                            </button>
                        )}
                        <button type="button" className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]">
                            {expandedSection === 'inline_ads' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {expandedSection === 'inline_ads' && (
                    <div className="px-6 pb-6 pt-0 border-t border-[var(--border)]">
                        <div className="mt-4">
                            <Toggle
                                label="Aktifkan Banner Iklan Dalam Artikel"
                                desc="Menyisipkan banner iklan di antara paragraf konten berita."
                                checked={settings.postInlineAds ?? false}
                                onChange={(v) => handleChange("postInlineAds", v)}
                            />
                        </div>

                        {settings.postInlineAds && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pl-4 border-l-2 border-[color:var(--accent)/0.3]">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Posisi Banner (Setelah Paragraf ke-, Bisa Beberapa)</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: 3, 7, 11"
                                        className="input w-full"
                                        value={settings.postInlineAdPositions || "3"}
                                        onChange={(e) => handleChange("postInlineAdPositions", e.target.value)}
                                    />
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Masukkan nomor paragraf yang dipisahkan koma. Contoh `3, 7, 11` akan menampilkan banner setelah paragraf 3, 7, dan 11.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Kode Slot Iklan</label>
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 text-sm text-[var(--fg-primary)] space-y-1">
                                        <div>`ARTICLE_INLINE_1` untuk posisi pertama</div>
                                        <div>`ARTICLE_INLINE_2` untuk posisi kedua</div>
                                        <div>`ARTICLE_INLINE_3` untuk posisi ketiga</div>
                                    </div>
                                    <p className="text-xs text-[var(--fg-muted)] mt-1">Buat iklan di menu Ads dengan posisi custom tersebut dan target halaman `Detail Berita`.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
