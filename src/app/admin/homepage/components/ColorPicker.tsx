import React, { useState, useEffect, useRef } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { RotateCcw } from "lucide-react";

interface ColorPickerProps {
    label?: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    globalDefault?: string;
    containerClassName?: string;
    labelClassName?: string;
    triggerClassName?: string;
    swatchClassName?: string;
    inputClassName?: string;
}

export default function CustomColorPicker({
    label,
    value,
    onChange,
    globalDefault,
    containerClassName,
    labelClassName,
    triggerClassName,
    swatchClassName,
    inputClassName,
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    // Ensure value is valid hex string. If undefined, use default or black.
    const effectiveValue = value || globalDefault || "#000000";
    const isUnset = !value;
    
    useEffect(() => {
        const handler = (event: PointerEvent) => {
            const c = containerRef.current;
            const p = popoverRef.current;
            if (!c) return;
            const path = typeof event.composedPath === "function" ? event.composedPath() : undefined;
            const insideContainer = path ? path.includes(c) : c.contains(event.target as Node);
            const insidePopover = p ? (path ? path.includes(p) : p.contains(event.target as Node)) : false;
            if (!insideContainer && !insidePopover) setIsOpen(false);
        };
        if (isOpen) document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [isOpen]);

    // FIX: Removed the EyeDropper function completely as it was causing TypeScript errors
    // and wasn't critical. Replaced with empty function if needed or just removed button.
    const stop = (
        e: React.PointerEvent | React.MouseEvent | React.TouchEvent
    ) => {
        e.stopPropagation();
    };

    return (
        <div ref={containerRef} className={`relative ${containerClassName || ""}`.trim()}>
            {/* Label if provided */}
            {label && (
                <label className={`text-[10px] text-[var(--fg-primary)] font-bold block mb-1.5 text-left uppercase tracking-wider ${labelClassName || ""}`.trim()}>
                    {label}
                </label>
            )}

            {/* Compact Trigger */}
             <div className={`flex items-center gap-2 ${triggerClassName || ""}`.trim()}>
                <div 
                    className={`w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer shadow-sm relative overflow-hidden group hover:border-[var(--accent)] transition-all ring-0 focus:ring-2 ring-[var(--accent)]/20 ${swatchClassName || ""}`.trim()}
                    onClick={() => setIsOpen(!isOpen)}
                    title={label || "Pilih Warna"}
                >
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-30"></div>
                    <div 
                        className={`absolute inset-0 transition-opacity duration-200 ${isUnset ? 'opacity-30' : 'opacity-100'}`} 
                        style={{ backgroundColor: effectiveValue }}
                    ></div>
                    {isUnset && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[120%] h-[1px] bg-red-400 rotate-45 transform origin-center shadow-sm"></div>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={value || ""}
                        placeholder={globalDefault ? `Auto (${globalDefault})` : "Auto"}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md py-1.5 px-2 text-xs outline-none focus:border-[var(--accent)] font-mono text-[var(--fg-primary)] uppercase ${inputClassName || ""}`.trim()}
                    />
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div 
                    ref={popoverRef}
                    className="absolute z-50 top-full left-0 mt-2 bg-[var(--bg-elevated)] rounded-lg shadow-xl border border-[var(--border)] w-[200px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--border)] bg-[var(--bg-surface)] rounded-t-lg">
                        <span className="font-bold text-[var(--fg-primary)] text-[10px]">Pemilih Warna</span>
                        <div className="flex items-center gap-1">
                             <button 
                                onClick={() => onChange("")} 
                                className="p-1 text-[var(--fg-primary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)] rounded shadow-sm border border-transparent hover:border-[var(--border)] transition-all"
                                title="Reset to Default (Auto)"
                            >
                                <RotateCcw size={10} />
                            </button>
                        </div>
                    </div>

                    {/* Picker */}
                    <div className="p-2 compact-picker-wrapper" onPointerDown={stop} onMouseDown={stop} onTouchStart={stop}>
                        <HexAlphaColorPicker color={effectiveValue} onChange={onChange} />
                    </div>

                    {/* Footer / Input */}
                    <div className="px-2 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-md border border-gray-200 shadow-sm relative overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-30"></div>
                                <div className="absolute inset-0" style={{ backgroundColor: effectiveValue }}></div>
                            </div>
                            <input 
                                type="text" 
                                value={effectiveValue} 
                                onChange={(e) => onChange(e.target.value)}
                                onPointerDown={stop}
                                onMouseDown={stop}
                                onTouchStart={stop}
                                className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md py-1 px-2 text-[10px] outline-none focus:border-[var(--accent)] font-mono uppercase text-[var(--fg-primary)] shadow-sm"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-medium text-[var(--fg-primary)] select-none border-t border-[var(--border)] pt-2 mt-2">
                            <span className="text-[10px]">HEX</span>
                            <div className="flex gap-2">
                                <span className="hover:text-black cursor-pointer">RGBA</span>
                                <span className="hover:text-black cursor-pointer">HSLA</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                .compact-picker-wrapper .react-colorful {
                    width: 100% !important;
                    height: 120px !important;
                    touch-action: none !important;
                }
                .compact-picker-wrapper .react-colorful__saturation {
                    border-radius: 6px !important;
                    margin-bottom: 8px !important;
                    touch-action: none !important;
                }
                .compact-picker-wrapper .react-colorful__hue {
                    height: 8px !important;
                    border-radius: 4px !important;
                    margin-bottom: 6px !important;
                    touch-action: none !important;
                }
                .compact-picker-wrapper .react-colorful__alpha {
                    height: 8px !important;
                    border-radius: 4px !important;
                    touch-action: none !important;
                }
                .compact-picker-wrapper .react-colorful__saturation-pointer {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 50% !important;
                    border: 2px solid white !important;
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.1) !important;
                }
                .compact-picker-wrapper .react-colorful__hue-pointer, 
                .compact-picker-wrapper .react-colorful__alpha-pointer {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 50% !important;
                    border: 2px solid white !important;
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </div>
    );
}
