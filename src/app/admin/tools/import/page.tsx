"use client";

import { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2, Image as ImageIcon, Download, Wrench, RefreshCw } from "lucide-react";

export default function ImportPage() {
    const [activeTab, setActiveTab] = useState<'xml' | 'media' | 'tools'>('xml');
    
    // XML State
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'importing' | 'completed' | 'error'>('idle');
    const [analysis, setAnalysis] = useState<{ posts: number; pages: number; categories: number; tags: number; authors: number } | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Media State
    const [mediaStatus, setMediaStatus] = useState<'idle' | 'scanning' | 'scanned' | 'migrating' | 'completed' | 'error'>('idle');
    const [mediaStats, setMediaStats] = useState<{ total: number; postsWithImages: number; externalDomains: string[] } | null>(null);
    const [mediaLogs, setMediaLogs] = useState<string[]>([]);
    const [, setMediaProgress] = useState(0);

    // Tools State
    const [backfillStatus, setBackfillStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [backfillResult, setBackfillResult] = useState<{ scanned: number; updated: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setAnalysis(null);
            setError(null);
            setLogs([]);
        }
    };

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };
    
    const addMediaLog = (message: string) => {
        setMediaLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setStatus('analyzing');
        addLog("Menganalisis file XML...");
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", "analyze");

        try {
            const res = await fetch("/api/admin/import/wordpress", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menganalisis file");

            setAnalysis(data.analysis);
            setStatus('ready');
            addLog(`Analisis selesai: Ditemukan ${data.analysis.posts} artikel.`);
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
            addLog(`Error: ${err.message}`);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setStatus('importing');
        setProgress(0);
        addLog("Memulai proses import...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", "import");

        try {
            const res = await fetch("/api/admin/import/wordpress", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal melakukan import");
            }

            const data = await res.json();
            
            addLog(`Import Berhasil! ${data.importedCount} artikel telah ditambahkan.`);
            setStatus('completed');
            setProgress(100);
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
            addLog(`Error Import: ${err.message}`);
        }
    };
    
    // --- MEDIA MIGRATION FUNCTIONS ---
    
    const handleScanMedia = async () => {
        setMediaStatus('scanning');
        setMediaLogs([]);
        addMediaLog("Memindai artikel untuk gambar eksternal...");
        
        try {
            const res = await fetch("/api/admin/import/media?action=scan");
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Gagal memindai media");
            
            setMediaStats(data.stats);
            setMediaStatus('scanned');
            addMediaLog(`Selesai! Ditemukan ${data.stats.total} gambar eksternal di ${data.stats.postsWithImages} artikel.`);
            addMediaLog(`Domain ditemukan: ${data.stats.externalDomains.join(', ')}`);
        } catch (err: any) {
            setMediaStatus('error');
            addMediaLog(`Error Scan: ${err.message}`);
        }
    };
    
    const handleMigrateMedia = async () => {
        setMediaStatus('migrating');
        setMediaProgress(0);
        addMediaLog("Memulai migrasi gambar (Proses ini mungkin memakan waktu)...");
        
        try {
            // We'll do this in batches of 5 images at a time client-side ideally, 
            // but for MVP we'll trigger the server process
            const res = await fetch("/api/admin/import/media?action=migrate", {
                method: "POST"
            });
            
            // For a better UX with 50k images, we should implement SSE or polling.
            // For now (MVP), we wait.
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal migrasi media");
            }
            
            const data = await res.json();
            setMediaStatus('completed');
            setMediaProgress(100);
            addMediaLog(`Sukses! ${data.processed} gambar berhasil didownload dan diganti.`);
            
        } catch (err: any) {
            setMediaStatus('error');
            addMediaLog(`Error Migrasi: ${err.message}`);
        }
    };

    const handleBackfillExcerpts = async () => {
        setBackfillStatus('processing');
        setError(null);
        
        try {
            const res = await fetch("/api/admin/tools/backfill-excerpts", {
                method: "POST"
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Gagal backfill excerpts");
            }
            
            setBackfillResult(data);
            setBackfillStatus('completed');
            
        } catch (err: any) {
            setBackfillStatus('error');
            setError(err.message);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[var(--accent)] rounded-lg text-white">
                    <Upload size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Import WordPress</h1>
                    <p className="text-[var(--fg-muted)]">Migrasikan artikel dan media dari WordPress.</p>
                </div>
            </div>
            
            {/* TABS */}
            <div className="flex gap-2 mb-6 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border)] w-fit">
                <button 
                    onClick={() => setActiveTab('xml')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center gap-2 ${activeTab === 'xml' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]'}`}
                >
                    <FileText size={16} />
                    Artikel
                </button>
                <button 
                    onClick={() => setActiveTab('media')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center gap-2 ${activeTab === 'media' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]'}`}
                >
                    <ImageIcon size={16} />
                    Media
                </button>
                <button 
                    onClick={() => setActiveTab('tools')}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center gap-2 ${activeTab === 'tools' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]'}`}
                >
                    <Wrench size={16} />
                    Tools
                </button>
            </div>

            {/* --- TAB 1: XML IMPORT --- */}
            {activeTab === 'xml' && (
                <>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 mb-6">
                    <h2 className="font-bold text-lg text-[var(--fg-primary)] mb-4">1. Upload File XML</h2>
                    
                    <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            accept=".xml"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-[var(--fg-muted)]
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[var(--accent-subtle)] file:text-[var(--accent)]
                                hover:file:bg-[var(--accent)] hover:file:text-white
                                cursor-pointer border border-[var(--border)] rounded-lg p-2
                            "
                        />
                        {file && status === 'idle' && (
                            <button 
                                onClick={handleAnalyze}
                                className="btn btn-primary whitespace-nowrap"
                            >
                                Analisis File
                            </button>
                        )}
                    </div>
                </div>

                {status === 'analyzing' && (
                    <div className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto text-[var(--accent)] mb-2" size={32} />
                        <p className="text-[var(--fg-muted)]">Sedang membaca struktur XML...</p>
                    </div>
                )}

                {analysis && (status === 'ready' || status === 'importing' || status === 'completed') && (
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="font-bold text-lg text-[var(--fg-primary)] mb-4">2. Ringkasan Import</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <StatCard label="Artikel" value={analysis.posts} icon={<FileText size={16} />} />
                            <StatCard label="Halaman" value={analysis.pages} icon={<FileText size={16} />} />
                            <StatCard label="Kategori" value={analysis.categories} icon={<FileText size={16} />} />
                            <StatCard label="Tag" value={analysis.tags} icon={<FileText size={16} />} />
                            <StatCard label="Penulis" value={analysis.authors} icon={<FileText size={16} />} />
                        </div>

                        <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)] mb-6">
                            <h3 className="font-bold text-sm text-[var(--fg-primary)] mb-2">Catatan Penting:</h3>
                            <ul className="list-disc list-inside text-sm text-[var(--fg-muted)] space-y-1">
                                <li>Artikel akan diimport dengan status sesuai di XML (Published/Draft).</li>
                                <li>Kategori dan Tag baru akan dibuat otomatis.</li>
                                <li>Penulis yang tidak ditemukan akan dibuatkan akun baru dengan email dummy.</li>
                                <li>Gambar dalam konten akan tetap mengarah ke website lama (Hotlink). Gunakan tab <b>"Migrasi Gambar"</b> setelah ini.</li>
                            </ul>
                        </div>

                        {status === 'ready' && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleImport}
                                    className="btn btn-primary px-6"
                                >
                                    Mulai Import {analysis.posts} Artikel
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {(status === 'importing' || status === 'completed' || status === 'error') && (
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-[var(--fg-primary)]">3. Status Proses</h2>
                            {status === 'importing' && <span className="text-[var(--accent)] text-sm animate-pulse">Sedang Memproses...</span>}
                            {status === 'completed' && <span className="text-green-500 text-sm font-bold flex items-center gap-1"><Check size={16} /> Selesai</span>}
                            {status === 'error' && <span className="text-red-500 text-sm font-bold flex items-center gap-1"><AlertCircle size={16} /> Gagal</span>}
                        </div>

                        {status === 'importing' && (
                            <div className="w-full bg-[var(--bg-surface)] rounded-full h-2.5 mb-4">
                                <div className="bg-[var(--accent)] h-2.5 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                            </div>
                        )}

                        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-[var(--fg-muted)]">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))}
                            {error && <div className="text-red-500 mt-2 font-bold">{error}</div>}
                        </div>
                    </div>
                )}
                </>
            )}
            
            {/* --- TAB 2: MEDIA MIGRATION --- */}
            {activeTab === 'media' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-bold text-lg text-[var(--fg-primary)] mb-2">Scan Gambar Eksternal</h2>
                                <p className="text-sm text-[var(--fg-muted)]">
                                    Fitur ini akan mencari semua gambar di artikel yang masih menggunakan URL website lama,<br/>
                                    lalu mendownloadnya ke server ini secara otomatis.
                                </p>
                            </div>
                            <button 
                                onClick={handleScanMedia}
                                disabled={mediaStatus === 'scanning' || mediaStatus === 'migrating'}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                {mediaStatus === 'scanning' ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                                Scan Artikel
                            </button>
                        </div>
                        
                        {mediaStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                    <div className="text-xs text-[var(--fg-muted)] uppercase font-bold mb-1">Total Gambar Eksternal</div>
                                    <div className="text-2xl font-bold text-[var(--accent)]">{mediaStats.total}</div>
                                </div>
                                <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                    <div className="text-xs text-[var(--fg-muted)] uppercase font-bold mb-1">Artikel Terdampak</div>
                                    <div className="text-2xl font-bold text-[var(--fg-primary)]">{mediaStats.postsWithImages}</div>
                                </div>
                                <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                                    <div className="text-xs text-[var(--fg-muted)] uppercase font-bold mb-1">Domain Asal</div>
                                    <div className="text-xs font-mono text-[var(--fg-primary)] truncate" title={mediaStats.externalDomains.join(', ')}>
                                        {mediaStats.externalDomains.length > 0 ? mediaStats.externalDomains[0] : '-'}
                                        {mediaStats.externalDomains.length > 1 && ` +${mediaStats.externalDomains.length - 1} lainnya`}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {mediaStatus === 'scanned' && mediaStats && mediaStats.total > 0 && (
                            <div className="bg-[var(--accent-subtle)] border border-[var(--accent)] rounded-lg p-4 flex justify-between items-center">
                                <div className="text-sm text-[var(--fg-primary)]">
                                    <span className="font-bold">Siap Migrasi!</span> Sistem akan mendownload {mediaStats.total} gambar. Proses ini bisa memakan waktu.
                                </div>
                                <button 
                                    onClick={handleMigrateMedia}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <Download size={16} />
                                    Mulai Download & Replace
                                </button>
                            </div>
                        )}
                        
                        {mediaStatus === 'scanned' && mediaStats && mediaStats.total === 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-700 font-bold">
                                <Check size={24} className="mx-auto mb-2" />
                                Semua gambar sudah lokal! Tidak ada yang perlu dimigrasi.
                            </div>
                        )}
                    </div>
                    
                    {(mediaStatus === 'migrating' || mediaStatus === 'completed' || mediaStatus === 'error') && (
                        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[var(--fg-primary)]">Log Migrasi</h3>
                                {mediaStatus === 'migrating' && <span className="text-[var(--accent)] text-sm animate-pulse">Sedang Mendownload...</span>}
                                {mediaStatus === 'completed' && <span className="text-green-500 text-sm font-bold flex items-center gap-1"><Check size={16} /> Selesai</span>}
                            </div>
                            
                            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-[var(--fg-muted)]">
                                {mediaLogs.map((log, i) => (
                                    <div key={i} className="mb-1 border-b border-[var(--border)] pb-1 last:border-0">{log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* --- TAB 3: TOOLS --- */}
            {activeTab === 'tools' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-6 mb-6">
                        <h2 className="font-bold text-lg text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                            <Wrench size={20} className="text-[var(--accent)]" />
                            Alat Pemeliharaan
                        </h2>
                        
                        {/* Tool: Backfill Excerpts */}
                        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
                            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                                <div>
                                    <h3 className="font-bold text-[var(--fg-primary)] text-base mb-1">Generate Excerpts (Ringkasan)</h3>
                                    <p className="text-sm text-[var(--fg-muted)] max-w-xl">
                                        Scan semua artikel yang tidak memiliki ringkasan (excerpt), lalu buat otomatis dari 180 karakter pertama konten.
                                        Berguna jika hasil import XML sebelumnya tidak membawa excerpt.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleBackfillExcerpts}
                                    disabled={backfillStatus === 'processing'}
                                    className="btn btn-secondary flex items-center gap-2 whitespace-nowrap"
                                >
                                    {backfillStatus === 'processing' ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                    Jalankan Backfill
                                </button>
                            </div>

                            {/* Status Result */}
                            {backfillStatus === 'completed' && backfillResult && (
                                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 text-green-700 text-sm">
                                    <Check size={18} />
                                    <span>
                                        <b>Selesai!</b> {backfillResult.scanned} artikel diperiksa. {backfillResult.updated} artikel diperbarui dengan excerpt baru.
                                    </span>
                                </div>
                            )}

                            {backfillStatus === 'error' && error && (
                                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-red-700 text-sm">
                                    <AlertCircle size={18} />
                                    <span><b>Gagal:</b> {error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: any }) {
    return (
        <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border)] text-center">
            <div className="text-[var(--fg-muted)] flex justify-center mb-1">{icon}</div>
            <div className="font-bold text-xl text-[var(--fg-primary)]">{value}</div>
            <div className="text-xs text-[var(--fg-muted)]">{label}</div>
        </div>
    );
}
