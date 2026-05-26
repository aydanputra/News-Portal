"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Palette, Type, Layout } from "lucide-react";
import GeneralSettingsForm from "./components/GeneralSettingsForm";
import SinglePostSettingsForm from "./components/SinglePostSettingsForm";
import { AVAILABLE_FONTS } from "./components/FontSelect";

export default function GlobalStylesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "homepage" | "single_post">("general");
  const [activeSubTab, setActiveSubTab] = useState<"colors" | "typography" | "layout">("colors");

  // Settings State
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        alert("Pengaturan berhasil disimpan!");
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch {
      console.error("Gagal menyimpan pengaturan");
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-6 md:p-8 text-[var(--fg-muted)]">Memuat pengaturan...</div>;

  // Generate Preview URL for all fonts
  const previewFontsUrl = `https://fonts.googleapis.com/css2?family=${AVAILABLE_FONTS.map(f => f.name.replace(/ /g, '+')).join('&family=')}&display=swap`;

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto">
      {/* Load Fonts for Preview */}
      <link rel="stylesheet" href={previewFontsUrl} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
                <Layout className="w-6 h-6 text-[var(--fg-secondary)]" />
                Pengaturan Global
            </h1>
            <p className="text-[var(--fg-secondary)] mt-1">Pusat pengaturan tampilan dan fitur website Anda.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary disabled:opacity-70"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Simpan Perubahan</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Menu */}
        <div className="col-span-12 md:col-span-2 space-y-2">
            <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${
                    activeTab === "general" ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--fg-primary)]" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] border-transparent"
                }`}
            >
                <Palette size={18} />
                <span>General (Umum)</span>
            </button>
            <button
                onClick={() => setActiveTab("homepage")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${
                    activeTab === "homepage" ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--fg-primary)]" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] border-transparent"
                }`}
            >
                <Layout size={18} />
                <span>Homepage</span>
            </button>
            <button
                onClick={() => setActiveTab("single_post")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors border ${
                    activeTab === "single_post" ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--fg-primary)]" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] border-transparent"
                }`}
            >
                <Type size={18} />
                <span>Single Post (Berita)</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="col-span-12 md:col-span-10">
            <div className="card p-6 md:p-8 min-h-[500px] admin-form">
                
                {/* GENERAL TAB */}
                {activeTab === "general" && (
                    <div>
                        <div className="flex border-b border-[var(--border)] mb-6 space-x-6">
                            <button 
                                onClick={() => setActiveSubTab("colors")}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeSubTab === "colors" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                            >
                                Warna
                            </button>
                            <button 
                                onClick={() => setActiveSubTab("typography")}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeSubTab === "typography" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                            >
                                Tipografi
                            </button>
                            <button 
                                onClick={() => setActiveSubTab("layout")}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeSubTab === "layout" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                            >
                                Layout
                            </button>
                        </div>
                        <GeneralSettingsForm settings={settings} handleChange={handleChange} activeTab={activeSubTab} />
                    </div>
                )}

                {/* HOMEPAGE TAB */}
                {activeTab === "homepage" && (
                    <div className="text-center py-12 text-[var(--fg-muted)]">
                        <Layout size={48} className="mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium text-[var(--fg-primary)]">Homepage Settings</h3>
                        <p className="mt-2">Pengaturan khusus Homepage (Meta, Sidebar) akan hadir di sini.</p>
                        <p className="text-sm mt-4 text-[var(--accent)]">Saat ini gunakan menu "Homepage Builder" untuk mengatur konten.</p>
                    </div>
                )}

                {/* SINGLE POST TAB */}
                {activeTab === "single_post" && (
                    <SinglePostSettingsForm settings={settings} handleChange={handleChange} />
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
