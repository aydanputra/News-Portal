import { Plus } from "lucide-react";

interface SectionPickerProps {
  showSectionPicker: boolean;
  setShowSectionPicker: (show: boolean) => void;
  addSectionBlock: (layout: string) => void;
}

export default function SectionPicker({ showSectionPicker, setShowSectionPicker, addSectionBlock }: SectionPickerProps) {
  return (
    <div className="relative">
        <button 
            onClick={() => setShowSectionPicker(!showSectionPicker)}
            className="btn btn-primary text-sm flex items-center shadow-md hover:shadow-lg transition-all"
        >
            <Plus size={18} className="mr-2" />
            Tambah Section
        </button>

        {/* Section Layout Picker */}
        {showSectionPicker && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSectionPicker(false)}></div>
                <div className="absolute right-0 mt-3 w-80 bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-[var(--border)] z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-5 ring-1 ring-black/5">
                    <h4 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border)]">Pilih Struktur Kolom</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { addSectionBlock('100'); setShowSectionPicker(false); }} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-200">
                            <div className="w-full h-8 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                            <span className="text-[10px] font-medium text-[var(--fg-secondary)] group-hover:text-[var(--fg-primary)]">1 Kolom</span>
                        </button>
                        <button onClick={() => { addSectionBlock('50-50'); setShowSectionPicker(false); }} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-200">
                            <div className="flex w-full h-8 gap-1">
                                <div className="w-1/2 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                                <div className="w-1/2 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--fg-secondary)] group-hover:text-[var(--fg-primary)]">2 Kolom (50/50)</span>
                        </button>
                        <button onClick={() => { addSectionBlock('33-66'); setShowSectionPicker(false); }} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-200">
                            <div className="flex w-full h-8 gap-1">
                                <div className="w-1/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                                <div className="w-2/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--fg-secondary)] group-hover:text-[var(--fg-primary)]">Kiri Kecil (33/66)</span>
                        </button>
                        <button onClick={() => { addSectionBlock('66-33'); setShowSectionPicker(false); }} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-200">
                            <div className="flex w-full h-8 gap-1">
                                <div className="w-2/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                                <div className="w-1/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--fg-secondary)] group-hover:text-[var(--fg-primary)]">Kanan Kecil (66/33)</span>
                        </button>
                        <button onClick={() => { addSectionBlock('33-33-33'); setShowSectionPicker(false); }} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-200">
                            <div className="flex w-full h-8 gap-1">
                                <div className="w-1/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                                <div className="w-1/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                                <div className="w-1/3 bg-[var(--bg-surface)] rounded-sm border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors"></div>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--fg-secondary)] group-hover:text-[var(--fg-primary)]">3 Kolom</span>
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
}
