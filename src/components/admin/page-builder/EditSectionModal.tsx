import React from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import SectionConfigPanel from "./SectionConfigPanel";
import { Block } from "./types";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceLocation } from "@/lib/sidebar-reference";

interface EditSectionModalProps {
  builderLocation?: "home" | "archive" | "header" | "footer" | "post";
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
  const activeDeviceLabel = activeSectionDeviceTab.toUpperCase();
  const sectionLabel = "Section";

  // Cast or handle builderLocation for SectionConfigPanel
  const sidebarSourceLocation = (builderLocation === "home" || builderLocation === "post" || builderLocation === "archive")
    ? builderLocation as SidebarSourceLocation
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-[var(--bg-elevated)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden h-[90vh] max-h-[90vh] flex flex-col border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
                <h3 className="font-bold text-lg text-[var(--fg-primary)] flex items-center gap-2">
                    <span>Edit Section</span>
                    <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">{sectionLabel}</span>
                </h3>
                <button onClick={onClose} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"><X size={20} /></button>
            </div>

            <SectionConfigPanel 
                builderLocation={sidebarSourceLocation}
                section={section}
                activeSectionTab={activeSectionTab}
                setActiveSectionTab={setActiveSectionTab}
                activeSectionDeviceTab={activeSectionDeviceTab}
                setActiveSectionDeviceTab={setActiveSectionDeviceTab}
                updateSectionConfig={updateSectionConfig}
                updateSectionResponsiveConfig={updateSectionResponsiveConfig}
                getSectionConfigValue={getSectionConfigValue}
            />
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between">
                <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
                    {([
                        { id: "desktop", icon: Monitor },
                        { id: "tablet", icon: Tablet },
                        { id: "mobile", icon: Smartphone },
                    ] as const).map((device) => {
                        const Icon = device.icon;
                        const isActive = activeSectionDeviceTab === device.id;
                        return (
                            <button
                                key={device.id}
                                onClick={() => setActiveSectionDeviceTab(device.id)}
                                className={`p-2 rounded-md transition-all ${
                                    isActive
                                        ? "bg-[var(--bg-base)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                                        : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                                }`}
                                title={device.id.toUpperCase()}
                            >
                                <Icon size={14} />
                            </button>
                        );
                    })}
                </div>
                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--border)]">
                    Mode: {activeDeviceLabel}
                </div>
            </div>
        </div>
    </div>
  );
}
