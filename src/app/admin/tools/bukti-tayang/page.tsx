"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download, Eye, FileSpreadsheet, FileText, Wrench } from "lucide-react";
import MediaLibraryModal, { type Media } from "@/app/admin/components/MediaLibraryModal";
import { ALL_TOOL_IDS } from "@/lib/tools";
import {
  BUKTI_TAYANG_PAPER_SIZE_OPTIONS,
  BUKTI_TAYANG_STATUS_OPTIONS,
  buildBuktiTayangHtmlDocument,
  buildBuktiTayangPeriodLabel,
  DEFAULT_BUKTI_TAYANG_FORM,
  getBuktiTayangReportName,
  sanitizeBuktiTayangFilename,
  type BuktiTayangFormState,
  type BuktiTayangRow,
} from "@/lib/bukti-tayang";

type CategoryOption = { id: string; name: string };
type TagOption = { id: string; name: string };

function flattenCategories(items: any[]): CategoryOption[] {
  const out: CategoryOption[] = [];
  for (const item of items || []) {
    if (item?.id && item?.name) {
      out.push({ id: String(item.id), name: String(item.name) });
    }
    if (Array.isArray(item?.children)) {
      out.push(...flattenCategories(item.children));
    }
  }
  return out;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-semibold text-[var(--fg-primary)]">{title}</div>
      <div className="space-y-3 px-4 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
      <div className="space-y-0.5">
        <div className="text-sm font-medium leading-5 text-[var(--fg-primary)]">{label}</div>
        {hint ? <div className="text-xs text-[var(--fg-muted)]">{hint}</div> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

async function convertUrlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Gagal mengambil file logo.");
  }
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file logo."));
    reader.readAsDataURL(blob);
  });
}

async function waitForDocumentImages(doc?: Document | null): Promise<void> {
  const images = Array.from(doc?.images || []);
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

export default function BuktiTayangPage() {
  const [form, setForm] = useState<BuktiTayangFormState>(DEFAULT_BUKTI_TAYANG_FORM);
  const [toolsFlags, setToolsFlags] = useState<{ enabledTools: string[] } | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [rows, setRows] = useState<BuktiTayangRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [openLogoPicker, setOpenLogoPicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const enabledSet = useMemo(() => new Set(toolsFlags?.enabledTools || []), [toolsFlags]);
  const toolEnabled = toolsFlags == null || enabledSet.has("bukti_tayang");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/tools/enabled", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/categories", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/tags", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([toolsData, categoryData, tagData]) => {
        if (!active) return;
        const enabledTools = Array.isArray(toolsData?.enabledTools) ? toolsData.enabledTools.map((x: any) => String(x)) : ALL_TOOL_IDS;
        setToolsFlags({ enabledTools });
        setCategories(flattenCategories(Array.isArray(categoryData) ? categoryData : []));
        setTags(
          Array.isArray(tagData)
            ? tagData.map((item: any) => ({ id: String(item?.id || ""), name: String(item?.name || "") })).filter((item) => item.id && item.name)
            : [],
        );
      })
      .catch(() => {
        if (!active) return;
        setToolsFlags({ enabledTools: ALL_TOOL_IDS });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const effectivePeriodLabel = useMemo(
    () => buildBuktiTayangPeriodLabel(form.startDate, form.endDate, form.periodLabel),
    [form.startDate, form.endDate, form.periodLabel],
  );
  const reportName = useMemo(() => getBuktiTayangReportName(form), [form]);

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [categories, categorySearch]);

  const filteredTags = useMemo(() => {
    const keyword = tagSearch.trim().toLowerCase();
    if (!keyword) return tags;
    return tags.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [tags, tagSearch]);

  const requestRows = async (): Promise<BuktiTayangRow[]> => {
    const res = await fetch("/api/admin/tools/bukti-tayang/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.error || "Gagal mengambil data bukti tayang");
    }
    const nextRows = Array.isArray(json?.rows) ? json.rows : [];
    setRows(nextRows);
    setTotalRows(Number(json?.total || nextRows.length || 0));
    return nextRows;
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      await requestRows();
    } catch (error: any) {
      setPreviewError(error?.message || "Gagal memuat preview");
      setRows([]);
      setTotalRows(0);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    const reportName = getBuktiTayangReportName(form);
    const shouldPrintPdf = form.outputFormat === "pdf";

    try {
      const nextRows = rows.length > 0 ? rows : await requestRows();
      let exportForm = { ...form };
      if (shouldPrintPdf && form.logoUrl) {
        try {
          exportForm = {
            ...exportForm,
            logoUrl: await convertUrlToDataUrl(form.logoUrl),
          };
        } catch {
          // Fallback ke URL asli bila browser menolak fetch lintas origin.
        }
      }

      const html = buildBuktiTayangHtmlDocument(exportForm, nextRows);
      const fileBase = sanitizeBuktiTayangFilename(reportName);

      if (form.outputFormat === "xls") {
        const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileBase}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

      const originalTitle = document.title;
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");

      const cleanup = () => {
        document.title = originalTitle;
        setTimeout(() => {
          iframe.remove();
        }, 500);
      };

      document.title = reportName;
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      const iframeWindow = iframe.contentWindow;

      if (!iframeDoc || !iframeWindow) {
        cleanup();
        throw new Error("Gagal menyiapkan dokumen PDF untuk dicetak.");
      }

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      iframeDoc.title = reportName;

      iframeWindow.onafterprint = cleanup;
      await waitForDocumentImages(iframeDoc);

      setTimeout(() => {
        try {
          iframeWindow.focus();
          iframeWindow.print();
          window.setTimeout(cleanup, 4000);
        } catch {
          cleanup();
          setPreviewError("Gagal membuka dialog print PDF di browser.");
        }
      }, 300);
    } catch (error: any) {
      setPreviewError(error?.message || "Gagal melakukan export");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="text-[var(--fg-muted)]">Memuat...</div>
      </div>
    );
  }

  if (!toolEnabled) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="card p-6">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Bukti Tayang
          </div>
          <div className="mt-3 text-sm text-[var(--fg-muted)]">Fitur ini belum diaktifkan untuk website ini.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-base)] min-h-screen p-4 pb-24 md:p-5 md:pb-8 lg:p-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--accent)]" />
          Bukti Tayang
        </h1>
        <p className="mt-1 text-sm text-[var(--fg-secondary)]">
          Rekap data berita ke format PDF atau XLS dengan header laporan, filter konten, preview, dan export.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Format & Tampilan">
            <FieldRow label="Format Output">
              <select
                className="input min-h-[40px] w-full py-2 text-sm sm:max-w-[220px]"
                value={form.outputFormat}
                onChange={(e) => setForm((prev) => ({ ...prev, outputFormat: e.target.value === "pdf" ? "pdf" : "xls" }))}
              >
                <option value="xls">Excel (.xls)</option>
                <option value="pdf">PDF</option>
              </select>
            </FieldRow>
            <FieldRow label="Ukuran Kertas" hint="Pilih ukuran kertas untuk mode print PDF.">
              <select
                className="input min-h-[40px] w-full py-2 text-sm sm:max-w-[280px]"
                value={form.paperSize}
                onChange={(e) => setForm((prev) => ({ ...prev, paperSize: e.target.value as BuktiTayangFormState["paperSize"] }))}
              >
                {BUKTI_TAYANG_PAPER_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldRow>
            <FieldRow label="Ukuran Font" hint="Atur ukuran font untuk output.">
              <input
                type="number"
                min={10}
                max={24}
                className="input min-h-[40px] w-full py-2 text-sm sm:max-w-[120px]"
                value={form.fontSize}
                onChange={(e) => setForm((prev) => ({ ...prev, fontSize: Number(e.target.value || 12) }))}
              />
            </FieldRow>
          </SectionCard>

          <SectionCard title="Header Laporan">
            <FieldRow label="Judul">
              <input
                className="input min-h-[40px] py-2 text-sm"
                placeholder="REKAPITULASI BERITA ..."
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </FieldRow>
            <FieldRow label="Nama Perusahaan">
              <input className="input min-h-[40px] py-2 text-sm" value={form.companyName} onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))} />
            </FieldRow>
            <FieldRow label="Nama Media Online">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
                <input className="input min-h-[40px] py-2 text-sm" value={form.mediaName} onChange={(e) => setForm((prev) => ({ ...prev, mediaName: e.target.value }))} />
                <div className="flex min-h-[40px] items-center text-sm font-medium text-[var(--fg-primary)]">URL Media</div>
                <input className="input min-h-[40px] py-2 text-sm" placeholder="https://example.com" value={form.mediaUrl} onChange={(e) => setForm((prev) => ({ ...prev, mediaUrl: e.target.value }))} />
              </div>
            </FieldRow>
            <FieldRow label="Periode Terbit">
              <input
                className="input min-h-[40px] py-2 text-sm"
                placeholder="April 2024 - Februari 2025"
                value={form.periodLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, periodLabel: e.target.value }))}
              />
            </FieldRow>
            <FieldRow label="Logo">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="input min-h-[40px] py-2 text-sm"
                  value={form.logoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="URL gambar/logo"
                />
                <button type="button" className="btn btn-ghost min-h-[40px] px-3 md:min-w-[110px]" onClick={() => setOpenLogoPicker(true)}>
                  Pilih Logo
                </button>
              </div>
            </FieldRow>
            {form.logoUrl ? (
              <div className="md:pl-[160px]">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                  <Image src={form.logoUrl} alt="Logo laporan" width={180} height={60} className="h-auto max-h-[60px] w-auto object-contain" unoptimized />
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <SectionCard title="Filter Konten">
          <div className="grid gap-3 lg:grid-cols-2">
            <FieldRow label="Tipe Filter">
              <select
                className="input min-h-[40px] w-full py-2 text-sm sm:max-w-[220px]"
                value={form.filterType}
                onChange={(e) => setForm((prev) => ({ ...prev, filterType: (e.target.value as BuktiTayangFormState["filterType"]) || "all" }))}
              >
                <option value="all">Semua Konten</option>
                <option value="category">Kategori</option>
                <option value="tag">Tag</option>
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <select
                className="input min-h-[40px] w-full py-2 text-sm sm:max-w-[220px]"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as BuktiTayangFormState["status"] }))}
              >
                {BUKTI_TAYANG_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldRow>
          </div>

          <FieldRow label="Rentang Tanggal Terbit">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] md:items-center md:max-w-[340px]">
              <input type="date" className="input min-h-[40px] py-2 text-sm" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
              <div className="text-center text-[var(--fg-muted)]">-</div>
              <input type="date" className="input min-h-[40px] py-2 text-sm" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
            </div>
          </FieldRow>

          {form.filterType === "category" ? (
            <FieldRow label="Kategori">
              <div className="space-y-2 md:max-w-[340px]">
                <div className="text-xs font-medium text-[var(--fg-secondary)]">Cari kategori</div>
                <input
                  className="input min-h-[40px] py-2 text-sm"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Cari kategori..."
                />
                <select className="input min-h-[40px] w-full py-2 text-sm" value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}>
                  <option value="">-- Semua Kategori --</option>
                  {filteredCategories.length ? (
                    filteredCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Kategori tidak ditemukan
                    </option>
                  )}
                </select>
              </div>
            </FieldRow>
          ) : null}

          {form.filterType === "tag" ? (
            <FieldRow label="Tag">
              <div className="space-y-2 md:max-w-[340px]">
                <div className="text-xs font-medium text-[var(--fg-secondary)]">Cari tag</div>
                <input
                  className="input min-h-[40px] py-2 text-sm"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Cari tag..."
                />
                <select className="input min-h-[40px] w-full py-2 text-sm" value={form.tagId} onChange={(e) => setForm((prev) => ({ ...prev, tagId: e.target.value }))}>
                  <option value="">-- Semua Tag --</option>
                  {filteredTags.length ? (
                    filteredTags.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Tag tidak ditemukan
                    </option>
                  )}
                </select>
              </div>
            </FieldRow>
          ) : null}
        </SectionCard>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDownload} disabled={previewLoading} className="btn btn-primary min-h-[40px] min-w-[110px] px-4">
            <Download className="w-4 h-4" />
            {previewLoading ? "Memuat..." : "Download"}
          </button>
          <button type="button" onClick={handlePreview} disabled={previewLoading} className="btn btn-ghost min-h-[40px] min-w-[110px] px-4">
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {previewError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{previewError}</div>
        ) : null}

        <SectionCard title="Preview Laporan">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-[var(--fg-muted)]">{totalRows > 0 ? `${totalRows} berita ditemukan.` : "Klik Preview untuk melihat hasil laporan."}</div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--fg-secondary)]">
              {form.outputFormat === "xls" ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span>{form.outputFormat === "xls" ? "Mode Excel (.xls)" : "Mode PDF"}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white p-4 text-black md:p-6">
            <div className="min-w-[820px]">
              <div>
                <h2 className="mx-auto mb-5 max-w-[78%] text-center text-[28px] font-bold leading-[1.15] text-black break-words">{reportName}</h2>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
                  <div className="min-w-0 space-y-1 pt-0.5" style={{ fontSize: `${form.fontSize}px` }}>
                    {form.companyName ? (
                      <div>
                        <strong>Nama Perusahaan:</strong> {form.companyName}
                      </div>
                    ) : null}
                    {form.mediaName ? (
                      <div>
                        <strong>Nama Media Online:</strong> {form.mediaName}
                      </div>
                    ) : null}
                    {form.mediaUrl ? (
                      <div>
                        <strong>URL Media Online:</strong> {form.mediaUrl}
                      </div>
                    ) : null}
                    <div>
                      <strong>Periode Terbit:</strong> {effectivePeriodLabel}
                    </div>
                  </div>
                  {form.logoUrl ? (
                    <div className="min-w-[150px] max-w-[220px] self-start -mt-0.5">
                      <Image src={form.logoUrl} alt="Logo laporan" width={220} height={72} className="ml-auto block h-auto max-h-[72px] w-auto object-contain" unoptimized />
                    </div>
                  ) : null}
                </div>
              </div>

              <table className="mt-4 w-full border-collapse" style={{ fontSize: `${form.fontSize}px`, tableLayout: "fixed" }}>
                <thead>
                  <tr className="bg-[#efefef]">
                    <th className="border border-[#6b7280] px-2 py-2 text-center" style={{ width: "44px" }}>NO</th>
                    <th className="border border-[#6b7280] px-2 py-2 text-center" style={{ width: "96px" }}>TANGGAL</th>
                    <th className="border border-[#6b7280] px-2 py-2 text-center">JUDUL BERITA</th>
                    <th className="border border-[#6b7280] px-2 py-2 text-center" style={{ width: "112px" }}>LINK BERITA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => (
                      <tr key={`${row.no}-${row.url}`}>
                        <td className="border border-[#6b7280] px-2 py-2 text-center align-top">{row.no}</td>
                        <td className="border border-[#6b7280] px-2 py-2 text-center align-top whitespace-nowrap">{row.dateLabel}</td>
                        <td className="border border-[#6b7280] px-2 py-2 align-top leading-[1.35]">{row.title}</td>
                        <td className="border border-[#6b7280] px-2 py-2 text-center align-top whitespace-nowrap">
                          <a href={row.url} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline">
                            {row.linkLabel}
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-[#6b7280] px-4 py-10 text-center text-gray-500">
                        Belum ada data untuk ditampilkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>

      {openLogoPicker ? (
        <MediaLibraryModal
          allowedTypes="image"
          onClose={() => setOpenLogoPicker(false)}
          onSelect={(media: Media) => {
            setForm((prev) => ({ ...prev, logoUrl: media.fileUrl }));
            setOpenLogoPicker(false);
          }}
          selectedUrl={form.logoUrl || undefined}
        />
      ) : null}
    </div>
  );
}
