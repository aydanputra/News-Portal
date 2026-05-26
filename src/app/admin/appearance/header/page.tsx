"use client";

import { Monitor, Redo2, RotateCcw, Save, Smartphone, Tablet, Undo2 } from "lucide-react";
import EditChildModal from "../../homepage/components/EditChildModal";
import EditSectionModal from "../../homepage/components/EditSectionModal";
import PreviewPanel from "../../homepage/components/PreviewPanel";
import SectionPicker from "../../homepage/components/SectionPicker";
import { useHeaderBuilder } from "./useHeaderBuilder";

export default function HeaderAppearancePage() {
  const { state, actions } = useHeaderBuilder();

  if (state.loading) {
    return <div className="p-8 bg-[var(--bg-base)] min-h-screen">Memuat...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] max-w-[1600px] mx-auto relative min-h-screen pb-32 page-builder">
      {state.toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${state.toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {state.toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">Header Builder</h1>
          <p className="text-[var(--fg-secondary)] mt-1">Atur section dan kolom header seperti builder lainnya.</p>
        </div>

        <div className="flex space-x-3">
          <div className="flex bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)] shadow-sm mr-2">
            <button onClick={actions.undo} disabled={!actions.canUndo} className="px-3 py-2 text-[var(--fg-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] disabled:opacity-30 border-r border-[var(--border)] transition-colors" title="Undo"><Undo2 size={18} /></button>
            <button onClick={actions.redo} disabled={!actions.canRedo} className="px-3 py-2 text-[var(--fg-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] disabled:opacity-30 transition-colors" title="Redo"><Redo2 size={18} /></button>
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1 shadow-sm">
            {([
              { id: "desktop", label: "Desktop", icon: Monitor },
              { id: "tablet", label: "Tablet", icon: Tablet },
              { id: "mobile", label: "Mobile", icon: Smartphone },
            ] as const).map((device) => {
              const Icon = device.icon;
              const isActive = state.activeDeviceTab === device.id;
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => actions.setActiveDeviceTab(device.id)}
                  className={`px-2.5 py-2 rounded-md text-[11px] font-bold uppercase flex items-center gap-1.5 transition-colors ${isActive ? "bg-[var(--bg-base)] text-[var(--accent)] border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{device.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={actions.resetAllSettings}
            className="px-4 py-2 text-sm font-medium flex items-center border border-red-200 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            disabled={state.loading}
          >
            <RotateCcw size={18} className="mr-2" />
            Reset
          </button>

          <SectionPicker showSectionPicker={state.showSectionPicker} setShowSectionPicker={actions.setShowSectionPicker} addSectionBlock={actions.addSectionBlock} />
        </div>
      </div>

      <PreviewPanel
        builderLocation="header"
        activeTheme={state.activeTheme}
        activeDeviceTab={state.activeDeviceTab}
        blocks={state.blocks}
        tags={state.tags}
        updateBlockConfig={actions.updateBlockConfig}
        deleteBlock={actions.deleteBlock}
        setActiveEditTab={actions.setActiveEditTab}
        setEditingChild={actions.setEditingChild}
        setEditingSectionId={actions.setEditingSectionId}
        setActiveSectionTab={actions.setActiveSectionTab}
        accentColor={state.accentColor}
        setShowSectionPicker={actions.setShowSectionPicker}
        backgroundColor={state.backgroundColor}
        moveBlock={actions.moveBlock}
        duplicateBlock={actions.duplicateBlock}
        moveChildBlock={actions.moveChildBlock}
        deleteChildBlock={actions.deleteChildBlock}
        addChildBlock={actions.addChildBlock}
        updateBlockConfigById={actions.updateBlockConfigById}
        duplicateChildBlockById={actions.duplicateChildBlockById}
      />

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-end">
        <button
          onClick={actions.handleSave}
          disabled={state.loading}
          className="btn btn-primary px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-all font-bold flex items-center space-x-2 disabled:opacity-70 disabled:scale-100"
        >
          {state.loading ? <span>Menyimpan...</span> : <><Save size={20} /><span>Simpan</span></>}
        </button>
      </div>

      <EditSectionModal
        builderLocation="header"
        section={actions.getEditingSectionBlock() || undefined}
        isOpen={!!state.editingSectionId}
        onClose={() => actions.setEditingSectionId(null)}
        activeSectionTab={state.activeSectionTab}
        setActiveSectionTab={actions.setActiveSectionTab}
        activeSectionDeviceTab={state.activeSectionDeviceTab}
        setActiveSectionDeviceTab={actions.setActiveSectionDeviceTab}
        updateSectionConfig={actions.updateSectionConfig}
        updateSectionResponsiveConfig={actions.updateSectionResponsiveConfig}
        getSectionConfigValue={actions.getSectionConfigValue}
      />

      <EditChildModal
        builderLocation="header"
        child={actions.getEditingChildBlock()}
        isOpen={!!state.editingChild}
        onClose={() => actions.setEditingChild(null)}
        categories={state.categories}
        tags={state.tags}
        activeEditTab={state.activeEditTab}
        setActiveEditTab={actions.setActiveEditTab}
        activeDeviceTab={state.activeDeviceTab}
        setActiveDeviceTab={actions.setActiveDeviceTab}
        updateChildConfig={actions.updateChildConfig}
        updateChildResponsiveConfig={actions.updateChildResponsiveConfig}
        getConfigValue={actions.getConfigValue}
        onUpdateTitle={actions.onUpdateTitle}
        globalSettings={{
          primaryColor: "#2563eb",
          headingColor: "#1e293b",
          metaColor: "#94a3b8",
          excerptColor: "#64748b",
        }}
      />

    </div>
  );
}
