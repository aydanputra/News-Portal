import { X, Layout, Palette as PaletteIcon, DownloadCloud, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ColorPickerWithOpacity } from "./ColorPickerWithOpacity";

const AVAILABLE_FONTS = [
  { name: 'Inter', type: 'sans-serif' },
  { name: 'Roboto', type: 'sans-serif' },
  { name: 'Open Sans', type: 'sans-serif' },
  { name: 'Lato', type: 'sans-serif' },
  { name: 'Montserrat', type: 'sans-serif' },
  { name: 'Poppins', type: 'sans-serif' },
  { name: 'Nunito', type: 'sans-serif' },
  { name: 'Raleway', type: 'sans-serif' },
  { name: 'Oswald', type: 'sans-serif' },
  { name: 'Rubik', type: 'sans-serif' },
  { name: 'Work Sans', type: 'sans-serif' },
  { name: 'Quicksand', type: 'sans-serif' },
  { name: 'Merriweather', type: 'serif' },
  { name: 'Playfair Display', type: 'serif' },
  { name: 'Lora', type: 'serif' },
  { name: 'PT Serif', type: 'serif' },
  { name: 'Spectral', type: 'serif' },
  { name: 'Crimson Text', type: 'serif' },
  { name: 'Libre Baskerville', type: 'serif' }
];

interface FontSelectProps {
    label: React.ReactNode;
    value: string;
    onChange: (font: string) => void;
}

function FontSelect({ label, value, onChange }: FontSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="block mb-1.5">
                {label}
            </div>
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm flex justify-between items-center text-left focus:ring-2 focus:ring-blue-500 outline-none hover:bg-white hover:border-blue-300 transition-all"
            >
                <span style={{ fontFamily: value }}>{value}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in-up">
                    <div className="sticky top-0 bg-gray-50 p-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                        Sans Serif
                    </div>
                    {AVAILABLE_FONTS.filter(f => f.type === 'sans-serif').map(font => (
                        <div 
                            key={font.name}
                            onClick={() => { onChange(font.name); setIsOpen(false); }}
                            className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center ${value === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                            <span style={{ fontFamily: font.name, fontSize: '15px' }}>{font.name}</span>
                            {value === font.name && <Check size={14} />}
                        </div>
                    ))}
                    
                    <div className="sticky top-0 bg-gray-50 p-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100 border-t">
                        Serif
                    </div>
                    {AVAILABLE_FONTS.filter(f => f.type === 'serif').map(font => (
                        <div 
                            key={font.name}
                            onClick={() => { onChange(font.name); setIsOpen(false); }}
                            className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center ${value === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                            <span style={{ fontFamily: font.name, fontSize: '15px' }}>{font.name}</span>
                            {value === font.name && <Check size={14} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface GlobalStylePanelProps {
  showStyleModal: boolean;
  setShowStyleModal: (show: boolean) => void;
  handleSave: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  headingColor: string;
  setHeadingColor: (color: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  excerptColor: string;
  setExcerptColor: (color: string) => void;
  metaColor: string;
  setMetaColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  headingFont: string;
  setHeadingFont: (font: string) => void;
  bodyFont: string;
  setBodyFont: (font: string) => void;
  // Generic container props (used by both Homepage and Post Builder)
  containerWidth: string;
  setContainerWidth: (width: string) => void;
  customContainerWidth: string;
  setCustomContainerWidth: (width: string) => void;
  // Legacy props aliases (to avoid breaking existing usage immediately if not all updated)
  homeContainerWidth?: string;
  setHomeContainerWidth?: (width: string) => void;
  homeCustomContainerWidth?: string;
  setHomeCustomContainerWidth?: (width: string) => void;
  
  globalBorderRadius: string;
  setGlobalBorderRadius: (radius: string) => void;

  // Margin & Padding
  globalMarginTop?: string;
  setGlobalMarginTop?: (val: string) => void;
  globalMarginBottom?: string;
  setGlobalMarginBottom?: (val: string) => void;
  globalPaddingTop?: string;
  setGlobalPaddingTop?: (val: string) => void;
  globalPaddingBottom?: string;
  setGlobalPaddingBottom?: (val: string) => void;
  globalPaddingLeft?: string;
  setGlobalPaddingLeft?: (val: string) => void;
  globalPaddingRight?: string;
  setGlobalPaddingRight?: (val: string) => void;
}

export function GlobalStylePanel({
  showStyleModal,
  setShowStyleModal,
  handleSave,
  primaryColor,
  setPrimaryColor,
  headingColor,
  setHeadingColor,
  accentColor,
  setAccentColor,
  excerptColor,
  setExcerptColor,
  metaColor,
  setMetaColor,
  backgroundColor,
  setBackgroundColor,
  headingFont,
  setHeadingFont,
  bodyFont,
  setBodyFont,
  containerWidth,
  setContainerWidth,
  customContainerWidth,
  setCustomContainerWidth,
  homeContainerWidth,
  setHomeContainerWidth,
  homeCustomContainerWidth,
  setHomeCustomContainerWidth,
  globalBorderRadius,
  setGlobalBorderRadius,
  globalMarginTop,
  setGlobalMarginTop,
  globalMarginBottom,
  setGlobalMarginBottom,
  globalPaddingTop,
  setGlobalPaddingTop,
  globalPaddingBottom,
  setGlobalPaddingBottom,
  globalPaddingLeft,
  setGlobalPaddingLeft,
  globalPaddingRight,
  setGlobalPaddingRight
}: GlobalStylePanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'layout'>('style');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Helper untuk download font
  const downloadFont = async (fontName: string) => {
    if (!fontName || fontName === 'Inter') return;
    
    setDownloading(fontName);
    try {
        const res = await fetch('/api/admin/download-font', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fontName })
        });
        
        if (res.ok) {
            // Kita bisa menggunakan alert standar atau custom toast jika tersedia
            // Untuk sekarang alert cukup untuk konfirmasi admin
            alert(`✅ Font ${fontName} berhasil didownload dan disimpan di server. Website akan memuat font ini secara lokal (lebih cepat & stabil).`);
        } else {
            const err = await res.json();
            alert(`❌ Gagal download font: ${err.error}`);
        }
    } catch {
        alert("❌ Terjadi kesalahan jaringan saat download font.");
    } finally {
        setDownloading(null);
    }
  };

  // Logic untuk handle legacy props
  const effectiveContainerWidth = containerWidth || homeContainerWidth || "boxed";
  const effectiveSetContainerWidth = setContainerWidth || setHomeContainerWidth || (() => {});
  
  const effectiveCustomWidth = customContainerWidth || homeCustomContainerWidth || "1200";
  const effectiveSetCustomWidth = setCustomContainerWidth || setHomeCustomContainerWidth || (() => {});

  if (!showStyleModal) return null;

  // Generate Preview URL for all fonts
  const previewFontsUrl = `https://fonts.googleapis.com/css2?family=${AVAILABLE_FONTS.map(f => f.name.replace(/ /g, '+')).join('&family=')}&display=swap`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
        {/* Load Fonts for Preview */}
        <link rel="stylesheet" href={previewFontsUrl} />
        
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">Global Settings</h3>
                <button onClick={() => setShowStyleModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
                <button 
                    onClick={() => setActiveTab('style')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'style' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <PaletteIcon size={16} />
                    Style
                </button>
                <button 
                    onClick={() => setActiveTab('layout')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'layout' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Layout size={16} />
                    Layout
                </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {activeTab === 'style' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <ColorPickerWithOpacity 
                                label="1. Primary Color (Global)" 
                                value={primaryColor} 
                                onChange={(val) => setPrimaryColor(val || "")} 
                                description="Mengatur warna Global."
                            />

                            <ColorPickerWithOpacity 
                                label="2. Judul (Heading)" 
                                value={headingColor} 
                                onChange={(val) => setHeadingColor(val || "")} 
                                description="Mengatur warna Judul."
                            />

                            <ColorPickerWithOpacity 
                                label="3. Hover (Highlight)" 
                                value={accentColor} 
                                onChange={(val) => setAccentColor(val || "")} 
                                description="Mengatur Highlight Text Judul."
                            />

                            <ColorPickerWithOpacity 
                                label="4. Excerpts" 
                                value={excerptColor} 
                                onChange={(val) => setExcerptColor(val || "")} 
                                description="Mengatur Warna Excerpts."
                            />

                            <ColorPickerWithOpacity 
                                label="5. Meta Tag" 
                                value={metaColor} 
                                onChange={(val) => setMetaColor(val || "")} 
                                description="Mengatur Meta Tag."
                            />
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Fonts */}
                        <div className="grid grid-cols-2 gap-6 opacity-100 transition-opacity">
                            <div>
                                <FontSelect 
                                    label={
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center w-full">
                                            Heading Font
                                            {headingFont !== 'Inter' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); downloadFont(headingFont); }}
                                                    disabled={downloading === headingFont}
                                                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                                                    title="Download font ke server untuk performa & kestabilan maksimal"
                                                >
                                                    {downloading === headingFont ? '...' : <><DownloadCloud size={10} /> Cache Local</>}
                                                </button>
                                            )}
                                        </label>
                                    }
                                    value={headingFont}
                                    onChange={setHeadingFont}
                                />
                            </div>
                            <div>
                                <FontSelect 
                                    label={
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center w-full">
                                            Body Font
                                            {bodyFont !== 'Inter' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); downloadFont(bodyFont); }}
                                                    disabled={downloading === bodyFont}
                                                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                                                    title="Download font ke server untuk performa & kestabilan maksimal"
                                                >
                                                    {downloading === bodyFont ? '...' : <><DownloadCloud size={10} /> Cache Local</>}
                                                </button>
                                            )}
                                        </label>
                                    }
                                    value={bodyFont}
                                    onChange={setBodyFont}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'layout' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                             <p className="text-sm text-blue-800">
                                 Pengaturan ini mengontrol Canvas Utama yang membungkus seluruh konten.
                             </p>
                        </div>

                        {/* Container Width Tabs */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Lebar Canvas (Container)</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                {['boxed', 'narrow', 'full', 'custom'].map((layout) => (
                                    <button
                                        key={layout}
                                        onClick={() => effectiveSetContainerWidth(layout)}
                                        className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                                            effectiveContainerWidth === layout 
                                            ? 'bg-white text-blue-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {layout}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Pilih mode lebar konten utama.</p>
                        </div>

                        {/* Custom Width Input (Conditional) */}
                        {effectiveContainerWidth === 'custom' && (
                            <div className="animate-fade-in-up">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Custom Width (px)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={effectiveCustomWidth} 
                                        onChange={(e) => effectiveSetCustomWidth(e.target.value)} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 1400"
                                    />
                                    <span className="text-sm text-gray-500 font-bold">px</span>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 my-2"></div>

                        {/* Margin & Padding Settings */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-700">Margin & Padding (Global)</h4>
                            
                            {/* Margin Y */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Margin Top</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalMarginTop ?? ""} 
                                            onChange={(e) => setGlobalMarginTop?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="32"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Margin Bottom</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalMarginBottom ?? ""} 
                                            onChange={(e) => setGlobalMarginBottom?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="32"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                            </div>

                            {/* Padding */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Padding Top</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalPaddingTop ?? ""} 
                                            onChange={(e) => setGlobalPaddingTop?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Padding Bottom</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalPaddingBottom ?? ""} 
                                            onChange={(e) => setGlobalPaddingBottom?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Padding Left</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalPaddingLeft ?? ""} 
                                            onChange={(e) => setGlobalPaddingLeft?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Padding Right</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={globalPaddingRight ?? ""} 
                                            onChange={(e) => setGlobalPaddingRight?.(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                                            placeholder="0"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Background Color (Canvas) */}
                             <ColorPickerWithOpacity 
                                label="Background Canvas" 
                                value={backgroundColor} 
                                onChange={(val) => setBackgroundColor(val || "")} 
                                description="Warna background area konten utama."
                            />

                            {/* Global Radius */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Rounded (Radius)</label>
                                <select 
                                    value={globalBorderRadius} 
                                    onChange={(e) => setGlobalBorderRadius(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-10"
                                >
                                    <option value="none">None (0px)</option>
                                    <option value="sm">Small (2px)</option>
                                    <option value="0.5rem">Default (8px)</option>
                                    <option value="lg">Large (12px)</option>
                                    <option value="xl">Extra Large (16px)</option>
                                    <option value="2xl">2XL (24px)</option>
                                    <option value="3xl">3XL (32px)</option>
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Mengatur kelengkungan sudut element.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setShowStyleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Tutup</button>
                    <button 
                    onClick={() => { setShowStyleModal(false); handleSave(); }} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                    Simpan Perubahan
                    </button>
            </div>
        </div>
    </div>
  );
}
