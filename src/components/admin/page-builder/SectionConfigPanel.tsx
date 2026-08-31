import React, { useState } from "react";
import Image from "next/image";
import { Layout, Palette } from "lucide-react";
import { ColorPickerWithOpacity } from "./ColorPickerWithOpacity";
import { Block } from "./types";
import { ConfigValue, createConfigReadersByKey } from "@/lib/page-builder-config";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";
import { getSidebarColumnIndex, getSidebarSourceOptions, SidebarSourceLocation } from "@/lib/sidebar-reference";

interface SectionConfigPanelProps {
    builderLocation?: SidebarSourceLocation;
    uiContext?: "home" | "archive" | "header" | "footer" | "post";
    section: Block;
    activeSectionTab: 'layout' | 'style';
    setActiveSectionTab: (tab: 'layout' | 'style') => void;
    activeSectionDeviceTab: 'desktop' | 'tablet' | 'mobile';
    setActiveSectionDeviceTab?: (tab: 'desktop' | 'tablet' | 'mobile') => void;
    updateSectionConfig: (key: string, value: ConfigValue) => void;
    updateSectionResponsiveConfig: (key: string, value: ConfigValue) => void;
    getSectionConfigValue: (key: string) => unknown;
}

const getSectionNumericDisplayDefault = (key: string): string | undefined => {
    if (/^(margin|padding)(Top|Right|Bottom|Left)$/.test(key)) return "0";
    if (/^border(Top|Right|Bottom|Left)Width$/.test(key)) return "0";
    return undefined;
};

export default function SectionConfigPanel({
    builderLocation,
    uiContext: _uiContext,
    section: _section,
    activeSectionTab,
    setActiveSectionTab,
    activeSectionDeviceTab,
    updateSectionConfig,
    updateSectionResponsiveConfig,
    getSectionConfigValue
}: SectionConfigPanelProps) {
    const [showMediaModal, setShowMediaModal] = useState(false);
    const { getConfigString: getBaseConfigString, getConfigNumber, getConfigBool } = createConfigReadersByKey(getSectionConfigValue);
    const getConfigString = (key: string, fallback = ""): string => {
        const resolved = getBaseConfigString(key, fallback);
        if (resolved !== "" || fallback !== "") return resolved;
        return getSectionNumericDisplayDefault(key) ?? resolved;
    };
    const sectionDeviceLabel = activeSectionDeviceTab.toUpperCase();
    const SECTION_CONTROL_CLASS = "w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none";
    const currentLayout = getConfigString("layout", "100");
    const supportsSidebarSync = getSidebarColumnIndex(currentLayout) !== null;
    const sidebarSourceOptions = getSidebarSourceOptions(builderLocation);
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
    const renderSectionVisibilitySettings = () => (
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                    Responsivitas
                </h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {["Desktop", "Tablet", "Mobile"].map((device) => (
                    <label
                        key={device}
                        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                            checked={getConfigBool(`hideOn${device}`, false)}
                            onChange={(e) => updateSectionConfig(`hideOn${device}`, e.target.checked)}
                        />
                        <span className="text-[11px] font-medium text-[var(--fg-primary)]">{device}</span>
                    </label>
                ))}
            </div>
        </div>
    );
    const SECTION_SPACING_SIDES = [
        { key: "Top", label: "Atas", short: "A" },
        { key: "Right", label: "Kanan", short: "Kn" },
        { key: "Bottom", label: "Bawah", short: "B" },
        { key: "Left", label: "Kiri", short: "Kr" },
    ] as const;
    const renderSectionSpacingSettings = () => (
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                    Spacing Section
                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                        {sectionDeviceLabel}
                    </span>
                </h4>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Margin Wadah Section</label>
                    <div className="grid grid-cols-4 gap-2">
                        {SECTION_SPACING_SIDES.map((side) => {
                            const value = getConfigString(`margin${side.key}`);
                            const displayValue = value === "0" ? "" : value;
                            return (
                            <div key={`section-margin-${side.key}`} className="space-y-1">
                                <div className={`relative ${SECTION_CONTROL_CLASS}`}>
                                    <span className={`pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-center text-[10px] font-medium text-[var(--fg-secondary)] transition-opacity ${displayValue !== "" ? "opacity-0" : "opacity-40"}`}>
                                        {side.label}
                                    </span>
                                    <input
                                        type="number"
                                        className="relative z-[1] h-full w-full bg-transparent px-2 text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                                        value={displayValue}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            updateSectionResponsiveConfig(`margin${side.key}`, isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Wadah Section</label>
                    <div className="grid grid-cols-4 gap-2">
                        {SECTION_SPACING_SIDES.map((side) => {
                            const value = getConfigString(`padding${side.key}`);
                            const displayValue = value === "0" ? "" : value;
                            return (
                            <div key={`section-padding-${side.key}`} className="space-y-1">
                                <div className={`relative ${SECTION_CONTROL_CLASS}`}>
                                    <span className={`pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-center text-[10px] font-medium text-[var(--fg-secondary)] transition-opacity ${displayValue !== "" ? "opacity-0" : "opacity-40"}`}>
                                        {side.label}
                                    </span>
                                    <input
                                        type="number"
                                        className="relative z-[1] h-full w-full bg-transparent px-2 text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                                        value={displayValue}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            updateSectionResponsiveConfig(`padding${side.key}`, isNaN(val) ? undefined : val);
                                        }}
                                    />
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
        </div>
    );
    const renderSectionBackgroundSettings = () => (
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                    Background
                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                        {sectionDeviceLabel}
                    </span>
                </h4>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-secondary)]">Aktifkan</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={getConfigBool("useBox", false)}
                        onChange={(e) => updateSectionResponsiveConfig("useBox", e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
            </div>
            {getConfigBool("useBox", false) && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                        <ColorPickerWithOpacity
                            value={getConfigString("backgroundColor", "#ffffff")}
                            onChange={(c) => updateSectionResponsiveConfig("backgroundColor", c)}
                            label="Warna"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius Box Latar</label>
                        <select
                            className={SECTION_CONTROL_CLASS}
                            value={getConfigString("borderRadius", "none")}
                            onChange={(e) => updateSectionResponsiveConfig("borderRadius", e.target.value)}
                        >
                            <option value="none">Kotak</option>
                            <option value="sm">Kecil</option>
                            <option value="md">Sedang</option>
                            <option value="lg">Besar</option>
                            <option value="xl">XL</option>
                            <option value="2xl">2XL</option>
                            <option value="full">Pill</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gambar Latar</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="https://..."
                                className={`${SECTION_CONTROL_CLASS} flex-1`}
                                value={getConfigString("backgroundImage")}
                                onChange={(e) => updateSectionResponsiveConfig("backgroundImage", e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowMediaModal(true)}
                                className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90"
                            >
                                Pilih
                            </button>
                        </div>
                    </div>
                    {getConfigString("backgroundImage") && (
                        <div className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-20 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                                    <Image
                                        src={getConfigString("backgroundImage")}
                                        alt="Preview background"
                                        width={80}
                                        height={56}
                                        unoptimized
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-medium text-[var(--fg-primary)] mb-1">Preview</div>
                                    <div className="text-[10px] text-[var(--fg-secondary)] truncate">
                                        {getConfigString("backgroundImage")}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateSectionResponsiveConfig("backgroundImage", "")}
                                    className="shrink-0 text-[10px] text-[var(--danger,#dc2626)] hover:opacity-80"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}
                    {getConfigString("backgroundImage") && (
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Size</label>
                                <select
                                    className={SECTION_CONTROL_CLASS}
                                    value={getConfigString("backgroundSize", "cover")}
                                    onChange={(e) => updateSectionResponsiveConfig("backgroundSize", e.target.value)}
                                >
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Position</label>
                                <select
                                    className={SECTION_CONTROL_CLASS}
                                    value={getConfigString("backgroundPosition", "center")}
                                    onChange={(e) => updateSectionResponsiveConfig("backgroundPosition", e.target.value)}
                                >
                                    <option value="center">Center</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="top left">Top Left</option>
                                    <option value="top right">Top Right</option>
                                    <option value="bottom left">Bottom Left</option>
                                    <option value="bottom right">Bottom Right</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Repeat</label>
                                <select
                                    className={SECTION_CONTROL_CLASS}
                                    value={getConfigString("backgroundRepeat", "no-repeat")}
                                    onChange={(e) => updateSectionResponsiveConfig("backgroundRepeat", e.target.value)}
                                >
                                    <option value="no-repeat">No Repeat</option>
                                    <option value="repeat">Repeat</option>
                                    <option value="repeat-x">Repeat X</option>
                                    <option value="repeat-y">Repeat Y</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Attachment</label>
                                <select
                                    className={SECTION_CONTROL_CLASS}
                                    value={getConfigString("backgroundAttachment", "scroll")}
                                    onChange={(e) => updateSectionResponsiveConfig("backgroundAttachment", e.target.value)}
                                >
                                    <option value="scroll">Scroll</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="local">Local</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <ColorPickerWithOpacity
                                    value={getConfigString("overlayColor", "rgba(0,0,0,0.5)")}
                                    onChange={(c) => updateSectionResponsiveConfig("overlayColor", c)}
                                    label="Overlay"
                                />
                            </div>
                        </div>
                    )}
                    <div className="col-span-2">
                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Box Latar</label>
                        <div className="grid grid-cols-4 gap-2">
                            {["Top", "Right", "Bottom", "Left"].map((side) => (
                                <input
                                    key={`section-box-padding-${side}`}
                                    type="number"
                                    placeholder={side}
                                    className={`${SECTION_CONTROL_CLASS} px-0 text-center`}
                                    value={getConfigString(`boxPadding${side}`)}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        updateSectionResponsiveConfig(`boxPadding${side}`, isNaN(val) ? undefined : val);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

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
                    Gaya
                </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {activeSectionTab === "layout" ? (
                    <div className="space-y-6">
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

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                    Arah dan Ukuran Elemen
                                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                        {sectionDeviceLabel}
                                    </span>
                                </h4>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Arah Elemen Dalam Kolom</label>
                                <select
                                    value={getConfigString("childrenDirection", "vertical")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenDirection", e.target.value)}
                                    className={SECTION_CONTROL_CLASS}
                                >
                                    <option value="vertical">Vertikal (Atas ke Bawah)</option>
                                    <option value="horizontal">Horizontal (Kiri ke Kanan)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Elemen</label>
                                <select
                                    value={getConfigString("childrenSizing", "auto")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenSizing", e.target.value)}
                                    className={SECTION_CONTROL_CLASS}
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

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                    Tata letak Konten
                                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                        {sectionDeviceLabel}
                                    </span>
                                </h4>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Perataan Elemen</label>
                                <select
                                    value={getConfigString("childrenAlign", "left")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenAlign", e.target.value)}
                                    className={SECTION_CONTROL_CLASS}
                                >
                                    <option value="left">Kiri</option>
                                    <option value="center">Tengah</option>
                                    <option value="right">Kanan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Posisi Vertikal Elemen</label>
                                <select
                                    value={getConfigString("childrenVerticalAlign", "top")}
                                    onChange={(e) => updateSectionResponsiveConfig("childrenVerticalAlign", e.target.value)}
                                    className={SECTION_CONTROL_CLASS}
                                >
                                    <option value="top">Atas</option>
                                    <option value="center">Tengah</option>
                                    <option value="bottom">Bawah</option>
                                </select>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="space-y-6">
                        {renderSectionVisibilitySettings()}

                        {renderSectionBackgroundSettings()}
                        {renderSectionSpacingSettings()}

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                    Border
                                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                        {sectionDeviceLabel}
                                    </span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
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

                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-3">
                             <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                    Bayangan
                                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                        {sectionDeviceLabel}
                                    </span>
                                </h4>
                            </div>
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

                    </div>
                )}
            </div>
        </>
    );
}
 
