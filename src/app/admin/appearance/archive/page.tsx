"use client";

import { Monitor, Redo2, RotateCcw, Save, Smartphone, Tablet, Undo2 } from "lucide-react";
import EditChildModal from "@/app/admin/homepage/components/EditChildModal";
import EditSectionModal from "@/app/admin/homepage/components/EditSectionModal";
import PreviewPanel from "@/app/admin/homepage/components/PreviewPanel";
import SectionPicker from "@/app/admin/homepage/components/SectionPicker";
import { useArchiveBuilder } from "./useArchiveBuilder";
import { useSidebarSourceBlocks } from "@/hooks/useSidebarSourceBlocks";

export default function ArchiveAppearancePage() {
  const { state, actions } = useArchiveBuilder();
  const archiveBuilderEnabled = state.activeTheme === "pranala";
  const sourceBlocksByLocation = useSidebarSourceBlocks(state.activeTheme);

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] max-w-[1600px] mx-auto relative min-h-screen pb-32 page-builder">
      {state.toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${state.toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {state.toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--fg-primary)]">Archive Builder</h1>
          <p className="text-[var(--fg-secondary)]">Builder layout archive khusus tema Pranala</p>
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
            disabled={state.loading || !archiveBuilderEnabled}
          >
            <RotateCcw size={18} className="mr-2" />
            Reset
          </button>

          <SectionPicker
            showSectionPicker={state.showSectionPicker}
            setShowSectionPicker={actions.setShowSectionPicker}
            addSectionBlock={actions.addSectionBlock}
          />
        </div>
      </div>


      <PreviewPanel
        builderLocation="archive"
        activeTheme={state.activeTheme}
        activeDeviceTab={state.activeDeviceTab}
        blocks={state.blocks}
        updateBlockConfig={actions.updateBlockConfig}
        deleteBlock={actions.deleteBlock}
        setEditingSectionId={actions.setEditingSectionId}
        setActiveSectionTab={actions.setActiveSectionTab}
        moveChildBlock={actions.moveChildBlock}
        setEditingChild={actions.setEditingChild}
        setActiveEditTab={actions.setActiveEditTab}
        deleteChildBlock={actions.deleteChildBlock}
        addChildBlock={actions.addChildBlock}
        tags={state.tags}
        accentColor={state.accentColor}
        moveBlock={actions.moveBlock}
        duplicateBlock={actions.duplicateBlock}
        setShowSectionPicker={actions.setShowSectionPicker}
        homeContainerWidth={state.homeContainerWidth}
        homeCustomContainerWidth={state.homeCustomContainerWidth}
        backgroundColor={state.backgroundColor}
        deleteBlockById={actions.deleteBlockById}
        updateBlockConfigById={actions.updateBlockConfigById}
        addChildBlockById={actions.addChildBlockById}
        moveChildBlockById={actions.moveChildBlockById}
        deleteChildBlockById={actions.deleteChildBlockById}
        duplicateChildBlockById={actions.duplicateChildBlockById}
        moveChildBlockColumnById={actions.moveChildBlockColumnById}
        sourceBlocksByLocation={sourceBlocksByLocation}
      />

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-end">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/revalidate", { method: "POST" });
              if (res.ok) alert("Cache archive berhasil dihapus.");
              else alert("Gagal menghapus cache.");
            } catch {
              alert("Terjadi kesalahan saat menghapus cache.");
            }
          }}
          className="bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center justify-center border border-gray-200"
          title="Hapus Cache"
        >
          <RotateCcw size={20} className="text-orange-500" />
        </button>

        <button
          onClick={actions.handleSave}
          disabled={state.loading || !archiveBuilderEnabled}
          className="btn btn-primary px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-all font-bold flex items-center space-x-2 disabled:opacity-70 disabled:scale-100"
        >
          {state.loading ? <span>Menyimpan...</span> : <><Save size={20} /><span>Simpan</span></>}
        </button>
      </div>

      <EditChildModal
        builderLocation="archive"
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
          primaryColor: state.primaryColor,
          headingColor: state.headingColor,
          metaColor: state.metaColor,
          excerptColor: state.excerptColor,
          homeWidgetTitleColor: state.homeWidgetTitleColor,
          homeNewsTitleColor: state.homeNewsTitleColor,
          homeHoverColor: state.homeHoverColor,
          homeExcerptColor: state.homeExcerptColor,
          homeMetaColor: state.homeMetaColor
        }}
      />

      <EditSectionModal
        builderLocation="archive"
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
    </div>
  );
}
