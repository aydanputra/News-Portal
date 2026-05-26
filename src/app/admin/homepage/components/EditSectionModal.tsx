import React from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import SectionConfigPanel from "./SectionConfigPanel";
import { Block } from "../types";
import { ConfigValue } from "@/lib/page-builder-config";

interface EditSectionModalProps {
  builderLocation?: "home" | "archive" | "header" | "footer";
  section: Block | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  activeSectionTab: 'layout' | 'style';
  setActiveSectionTab: (tab: 'layout' | 'style') => void;
  activeSectionDeviceTab: 'desktop' | 'tablet' | 'mobile';
  setActiveSectionDeviceTab: (tab: 'desktop' | 'tablet' | 'mobile') => void;
  updateSectionConfig: (key: string, value: ConfigValue) => void;
  updateSectionResponsiveConfig: (key: string, value: ConfigValue) => void;
  getSectionConfigValue: (key: string) => unknown;
}

export default function EditSectionModal({
  builderLocation = "home",
  section,
  isOpen,
  onClose,
  activeSectionTab,
  setActiveSectionTab,
  activeSectionDeviceTab,
  setActiveSectionDeviceTab,
  updateSectionConfig,
  updateSectionResponsiveConfig,
  getSectionConfigValue
}: EditSectionModalProps) {
  if (!isOpen || !section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-[var(--bg-elevated)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
                <h3 className="font-bold text-lg text-[var(--fg-primary)]">Edit Section</h3>
                <button onClick={onClose} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"><X size={20} /></button>
            </div>

            <SectionConfigPanel 
                builderLocation={builderLocation === "header" || builderLocation === "footer" ? undefined : builderLocation}
                uiContext={builderLocation}
                section={section}
                activeSectionTab={activeSectionTab}
                setActiveSectionTab={setActiveSectionTab}
                activeSectionDeviceTab={activeSectionDeviceTab}
                setActiveSectionDeviceTab={setActiveSectionDeviceTab}
                updateSectionConfig={updateSectionConfig}
                updateSectionResponsiveConfig={updateSectionResponsiveConfig}
                getSectionConfigValue={getSectionConfigValue}
            />
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-surface)] flex justify-between items-center">
                {activeSectionTab === 'style' ? (
                    <div className="flex items-center gap-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-1">
                        {(["desktop", "tablet", "mobile"] as const).map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setActiveSectionDeviceTab(d)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${
                                    activeSectionDeviceTab === d ? "bg-[var(--bg-elevated)] text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                                }`}
                            >
                                {d === "desktop" && <Monitor size={12} />}
                                {d === "tablet" && <Tablet size={12} />}
                                {d === "mobile" && <Smartphone size={12} />}
                                {d}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div />
                )}
                <button onClick={onClose} className="btn btn-primary text-sm">Selesai</button>
            </div>
        </div>
    </div>
  );
}
