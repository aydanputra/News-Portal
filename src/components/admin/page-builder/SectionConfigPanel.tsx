import React, { useState } from "react";
import Image from "next/image";
import { Layout, Palette, X, Image as ImageIcon } from "lucide-react";
import { ColorPickerWithOpacity } from "./ColorPickerWithOpacity";
import { Block } from "./types";
import { ConfigValue, createConfigReadersByKey } from "@/lib/page-builder-config";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";
import { getSidebarColumnIndex, getSidebarSourceOptions, SidebarSourceLocation } from "@/lib/sidebar-reference";

interface SectionConfigPanelProps {
    context?: SidebarSourceLocation;
    section: Block;
    activeSectionTab: 'layout' | 'style';
    setActiveSectionTab: (tab: 'layout' | 'style') => void;
    activeSectionDeviceTab: 'desktop' | 'tablet' | 'mobile';
    updateSectionConfig: (key: string, value: ConfigValue) => void;
    updateSectionResponsiveConfig: (key: string, value: ConfigValue) => void;
    getSectionConfigValue: (key: string) => unknown;
}

export default function SectionConfigPanel({
    context,
    section: _section,
    activeSectionTab,
    setActiveSectionTab,
    activeSectionDeviceTab,
    updateSectionConfig,
    updateSectionResponsiveConfig,
    getSectionConfigValue
}: SectionConfigPanelProps) {
    const [showMediaModal, setShowMediaModal] = useState(false);
    const { getConfigString, getConfigNumber, getConfigBool } = createConfigReadersByKey(getSectionConfigValue);
    const sectionDeviceLabel = activeSectionDeviceTab.toUpperCase();
    const currentLayout = getConfigString("layout", "100");
    const supportsSidebarSync = getSidebarColumnIndex(currentLayout) !== null;
    const sidebarSourceOptions = getSidebarSourceOptions(context);
    const getColumnStructure = (layout: string) => {
        switch(layout) {
            case '100': return ['w-full'];
            case '50-50': return ['w-1/2', 'w-1/2'];
            case '33-66': return ['w-1/3', 'w-2/3'];
            case '66-33': return ['w-2/3', 'w-1/3'];
            case '33-33-33': return ['w-1/3', 'w-1/3', 'w-1/3'];
            case '25-25-25-25': return ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'];
            default: return ['w-full'];
        }
    };

    return (
        <>
            {showMediaModal && (
                <MediaLibraryModal
                    onClose={() => setShowMediaModal(false)}
                    onSelect={(media) => {
                        updateSectionResponsiveConfig("backgroundImage", media.fileUrl);
                        setShowMediaModal(false);
                    }}
                    allowedTypes="image"
                    selectedUrl={getConfigString("backgroundImage")}
                />
            )}
            <div className="flex border-b border-[var(--border)]">
                <button 
                    onClick={() => setActiveSectionTab("layout")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSectionTab === "layout" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                >
                    <Layout size={16} className="inline mr-2" />
                    Layout
                </button>
                <button 
                    onClick={() => setActiveSectionTab("style")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSectionTab === "style" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                >
                    <Palette size={16} className="inline mr-2" />
                    Visual
                </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {activeSectionTab === "layout" ? (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-[color:var(--accent)/0.2] bg-[color:var(--accent)/0.06] px-3 py-2 text-[11px] text-[var(--fg-secondary)]">
                            Anda sedang mengedit `Inner Section` untuk device ` {sectionDeviceLabel} `. Semua pengaturan layout, gap, box, dan background di bagian ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-3">Struktur Kolom - {sectionDeviceLabel}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['100', '50-50', '33-66', '66-33', '33-33-33', '25-25-25-25'].map(layout => (
                                    <button 
                                        key={layout}
                                        onClick={() => updateSectionResponsiveConfig("layout", layout)}
                                        className={`border rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-[var(--bg-surface)] transition-all ${getConfigString("layout", "100") === layout ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-subtle)] border-[var(--accent)]' : 'border-[var(--border)]'}`}
                                    >
                                        <div className="flex w-full h-6 gap-1">
                                            {getColumnStructure(layout).map((widthClass, i) => (
                                                <div key={i} className={`${widthClass} bg-[var(--fg-muted)] opacity-20 rounded-sm`}></div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-medium text-[var(--fg-secondary)]">{layout.replace(/-/g, '/')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
                            <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Arah Elemen Dalam Kolom</label>
                            <select
                                value={getConfigString("childrenDirection", "vertical")}
                                onChange={(e) => updateSectionResponsiveConfig("childrenDirection", e.target.value)}
                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                            >
                                <option value="vertical">Vertikal (Atas ke Bawah)</option>
                                <option value="horizontal">Horizontal (Kiri ke Kanan)</option>
                            </select>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Perataan Elemen</label>
                                <select
                                    value={getConfigString("childrenAlign", "left")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenAlign", e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                >
                                    <option value="left">Kiri</option>
                                    <option value="center">Tengah</option>
                                    <option value="right">Kanan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Posisi Vertikal Elemen</label>
                                <select
                                    value={getConfigString("childrenVerticalAlign", "top")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenVerticalAlign", e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                >
                                    <option value="top">Atas</option>
                                    <option value="center">Tengah</option>
                                    <option value="bottom">Bawah</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Ukuran Elemen</label>
                                <select
                                    value={getConfigString("childrenSizing", "auto")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenSizing", e.target.value)}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                >
                                    <option value="auto">Otomatis</option>
                                    <option value="grow">Grow (Penuhi Lebar)</option>
                                </select>
                            </div>
                        </div>

                        {supportsSidebarSync && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block">Ikuti Sidebar Halaman Lain</label>
                                        <p className="text-[10px] text-[var(--fg-muted)] mt-1">Sidebar section ini akan memakai sidebar pertama dari halaman sumber yang dipilih.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={getConfigBool("followSharedSidebar", false)}
                                            onChange={(e) => {
                                                updateSectionConfig("followSharedSidebar", e.target.checked);
                                                if (e.target.checked && !getConfigString("sidebarSourceLocation") && sidebarSourceOptions[0]?.value) {
                                                    updateSectionConfig("sidebarSourceLocation", sidebarSourceOptions[0].value);
                                                }
                                            }}
                                        />
                                        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>

                                {getConfigBool("followSharedSidebar", false) && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-[var(--fg-primary)] block mb-1">Sumber Sidebar</label>
                                            <select
                                                value={getConfigString("sidebarSourceLocation", sidebarSourceOptions[0]?.value || "")}
                                                onChange={(e) => updateSectionConfig("sidebarSourceLocation", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                            >
                                                {sidebarSourceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-[var(--fg-muted)]">Kolom sidebar target tetap milik section ini, tetapi isi widgetnya akan diwarisi dari halaman sumber.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-3">Lebar Konten - {sectionDeviceLabel}</label>
                            <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
                                <button
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("containerWidth", "boxed") === "full" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                    onClick={() => updateSectionResponsiveConfig("containerWidth", "full")}
                                >
                                    Full Width
                                </button>
                                <button
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("containerWidth", "boxed") === "boxed" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                    onClick={() => updateSectionResponsiveConfig("containerWidth", "boxed")}
                                >
                                    Boxed
                                </button>
                                <button
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("containerWidth", "boxed") === "custom" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                    onClick={() => updateSectionResponsiveConfig("containerWidth", "custom")}
                                >
                                    Custom
                                </button>
                            </div>

                            {getConfigString("containerWidth", "boxed") === "custom" && (
                                <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] uppercase font-bold text-[var(--fg-primary)] block mb-1">Custom Width (px/%/rem)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 1400px or 90%"
                                        value={getConfigString("customContainerWidth")}
                                        onChange={(e) => updateSectionResponsiveConfig("customContainerWidth", e.target.value)}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-3">Gap (Jarak) - {sectionDeviceLabel}</label>
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-[10px] font-bold text-[var(--fg-primary)]">Antar Blok (Vertikal)</label>
                                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded">
                                        {getConfigNumber("blockGap") ?? 6}
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="12" 
                                    step="1"
                                    value={getConfigString("blockGap", "6")}
                                    onChange={(e) => updateSectionResponsiveConfig("blockGap", parseInt(e.target.value))}
                                    className="w-full h-2 bg-[var(--bg-base)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-[10px] font-bold text-[var(--fg-primary)]">Antar Kolom (Horizontal / Sidebar)</label>
                                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded">
                                        {getConfigNumber("columnGap") ?? 6}
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="12" 
                                    step="1"
                                    value={getConfigString("columnGap", "6")}
                                    onChange={(e) => updateSectionResponsiveConfig("columnGap", parseInt(e.target.value))}
                                    className="w-full h-2 bg-[var(--bg-base)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                                />
                                <p className="text-[9px] text-[var(--fg-muted)] mt-1">Mengatur jarak antara Sidebar dan Area Utama.</p>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
                            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Background & Padding - {sectionDeviceLabel}</label>
                            <div className="border-t border-[var(--border)] pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--fg-primary)] block">Mode Box / Frame</label>
                                        <p className="text-[10px] text-[var(--fg-muted)]">Bungkus konten section dalam kotak dengan background.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={getConfigBool("useBox", false)} onChange={(e) => updateSectionResponsiveConfig("useBox", e.target.checked)} />
                                        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>

                                <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="mb-3">
                                        <ColorPickerWithOpacity value={getConfigString("backgroundColor", "#ffffff")} onChange={(c) => updateSectionResponsiveConfig("backgroundColor", c)} label={getConfigBool("useBox", false) ? `Warna Background Box - ${sectionDeviceLabel}` : `Warna Background Section - ${sectionDeviceLabel}`} />
                                    </div>
                                </div>

                                {getConfigBool("useBox", false) && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] mb-4">
                                        <div className="mb-3">
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Border Radius - {sectionDeviceLabel}</label>
                                            <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-xs outline-none focus:border-[var(--accent)]" value={getConfigString("borderRadius", "none")} onChange={(e) => updateSectionResponsiveConfig("borderRadius", e.target.value)}>
                                                <option value="none">None</option>
                                                <option value="sm">Small</option>
                                                <option value="md">Medium</option>
                                                <option value="lg">Large</option>
                                                <option value="xl">Extra Large</option>
                                                <option value="2xl">2XL</option>
                                                <option value="full">Full</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding Dalam Box - {sectionDeviceLabel}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Vertical (py-)" value={getConfigString("boxPaddingY")} onChange={(e) => updateSectionResponsiveConfig("boxPaddingY", e.target.value)} className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-xs outline-none focus:border-[var(--accent)]" />
                                                <input type="text" placeholder="Horizontal (px-)" value={getConfigString("boxPaddingX")} onChange={(e) => updateSectionResponsiveConfig("boxPaddingX", e.target.value)} className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-xs outline-none focus:border-[var(--accent)]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>


                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
                            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Background Image Section - {sectionDeviceLabel}</label>
                            <div className="flex items-center gap-4">
                                {getConfigString("backgroundImage") ? (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] group">
                                        <Image src={getConfigString("backgroundImage")} alt="Background" fill unoptimized className="w-full h-full object-cover" />
                                        <button onClick={() => updateSectionResponsiveConfig("backgroundImage", "")} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--bg-base)] text-[var(--fg-muted)]">
                                        <ImageIcon size={20} />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaModal(true)}
                                        className="btn btn-sm btn-outline w-full flex justify-center"
                                    >
                                        {getConfigString("backgroundImage") ? "Ganti dari Galeri" : "Pilih dari Galeri"}
                                    </button>
                                    <p className="text-[10px] text-[var(--fg-muted)] mt-2">Pilih gambar dari Image Gallery (bisa upload dari modal gallery).</p>
                                </div>
                            </div>

                            {getConfigString("backgroundImage") && (
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Overlay Color - {sectionDeviceLabel}</label>
                                        <ColorPickerWithOpacity value={getConfigString("overlayColor", "rgba(0,0,0,0.5)")} onChange={(c) => updateSectionResponsiveConfig("overlayColor", c)} label={`Overlay Color - ${sectionDeviceLabel}`} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Background Size - {sectionDeviceLabel}</label>
                                        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-xs outline-none focus:border-[var(--accent)]" value={getConfigString("backgroundSize", "cover")} onChange={(e) => updateSectionResponsiveConfig("backgroundSize", e.target.value)}>
                                            <option value="cover">Cover (Full)</option>
                                            <option value="contain">Contain (Fit)</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
                            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Jarak Luar (Margin) - {sectionDeviceLabel}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Atas (Top)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('marginTop')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("marginTop", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Bawah (Bottom)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('marginBottom')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("marginBottom", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Kiri (Left)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('marginLeft')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("marginLeft", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Kanan (Right)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('marginRight')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("marginRight", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
                            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Jarak Dalam (Padding) - {sectionDeviceLabel}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Atas (Top)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('paddingTop')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("paddingTop", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Bawah (Bottom)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('paddingBottom')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("paddingBottom", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Kiri (Left)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('paddingLeft')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("paddingLeft", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Kanan (Right)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none"
                                        value={getConfigString('paddingRight')}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateSectionResponsiveConfig("paddingRight", isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
                            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Border (Garis Batas) - {sectionDeviceLabel}</label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                     <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Style</label>
                                     <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('borderStyle', 'none')} onChange={(e) => updateSectionResponsiveConfig("borderStyle", e.target.value)}>
                                        <option value="none">None</option>
                                        <option value="solid">Solid</option>
                                        <option value="dashed">Dashed</option>
                                        <option value="dotted">Dotted</option>
                                     </select>
                                </div>
                                <div>
                                     <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Warna</label>
                                     <div className="flex items-center gap-1">
                                        <input type="color" value={getConfigString('borderColor', "#e5e7eb")} onChange={(e) => updateSectionResponsiveConfig("borderColor", e.target.value)} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-8 h-9 p-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg cursor-pointer" />
                                        <input type="text" value={getConfigString('borderColor')} onChange={(e) => updateSectionResponsiveConfig("borderColor", e.target.value)} className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)]" placeholder="#e5e7eb" />
                                     </div>
                                </div>
                            </div>

                            <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2">Ketebalan (px)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Atas</label>
                                    <input type="number" placeholder="0" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('borderTopWidth')} onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateSectionResponsiveConfig("borderTopWidth", isNaN(val) ? undefined : val);
                                    }} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Bawah</label>
                                    <input type="number" placeholder="0" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('borderBottomWidth')} onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateSectionResponsiveConfig("borderBottomWidth", isNaN(val) ? undefined : val);
                                    }} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Kiri</label>
                                    <input type="number" placeholder="0" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('borderLeftWidth')} onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateSectionResponsiveConfig("borderLeftWidth", isNaN(val) ? undefined : val);
                                    }} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Kanan</label>
                                    <input type="number" placeholder="0" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('borderRightWidth')} onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateSectionResponsiveConfig("borderRightWidth", isNaN(val) ? undefined : val);
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                             <label className="text-xs font-bold text-[var(--fg-primary)] block mb-3">Bayangan (Shadow) - {sectionDeviceLabel}</label>
                             <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none" value={getConfigString('boxShadow', 'none')} onChange={(e) => updateSectionResponsiveConfig("boxShadow", e.target.value)}>
                                <option value="none">Tidak Ada</option>
                                <option value="sm">Tipis (Small)</option>
                                <option value="md">Sedang (Medium)</option>
                                <option value="lg">Tebal (Large)</option>
                                <option value="xl">Sangat Tebal (XL)</option>
                                <option value="2xl">Ekstra Tebal (2XL)</option>
                                <option value="inner">Inner Shadow</option>
                             </select>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)]">
                            <h4 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-4">Tampilan Lanjutan</h4>

                            <div className="mb-5">
                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Responsivitas (Sembunyikan di:)</label>
                                <div className="flex flex-col gap-2">
                                    {["Desktop", "Tablet", "Mobile"].map((device) => (
                                        <label key={device} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool(`hideOn${device}`, false)}
                                                onChange={(e) => updateSectionConfig(`hideOn${device}`, e.target.checked)}
                                            />
                                            <span className="text-sm text-[var(--fg-primary)]">{device}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
