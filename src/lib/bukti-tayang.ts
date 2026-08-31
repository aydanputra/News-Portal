export type BuktiTayangFormat = "pdf" | "xls";
export type BuktiTayangFilterType = "all" | "category" | "tag";
export type BuktiTayangPaperSize =
  | "a4_landscape"
  | "a4_portrait"
  | "f4_landscape"
  | "f4_portrait"
  | "letter_landscape"
  | "letter_portrait";
export type BuktiTayangStatus =
  | "all"
  | "published"
  | "draft"
  | "review"
  | "scheduled"
  | "rejected"
  | "archived";

export type BuktiTayangFormState = {
  outputFormat: BuktiTayangFormat;
  fontSize: number;
  paperSize: BuktiTayangPaperSize;
  title: string;
  companyName: string;
  mediaName: string;
  mediaUrl: string;
  periodLabel: string;
  logoUrl: string;
  filterType: BuktiTayangFilterType;
  status: BuktiTayangStatus;
  startDate: string;
  endDate: string;
  categoryId: string;
  tagId: string;
};

export type BuktiTayangRow = {
  no: number;
  dateLabel: string;
  title: string;
  url: string;
  linkLabel: string;
};

export const BUKTI_TAYANG_STATUS_OPTIONS: Array<{ value: BuktiTayangStatus; label: string }> = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "In Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "Semua Status" },
];

export const BUKTI_TAYANG_PAPER_SIZE_OPTIONS: Array<{ value: BuktiTayangPaperSize; label: string }> = [
  { value: "a4_landscape", label: "A4 Landscape" },
  { value: "a4_portrait", label: "A4 Portrait" },
  { value: "f4_landscape", label: "F4 Landscape" },
  { value: "f4_portrait", label: "F4 Portrait" },
  { value: "letter_landscape", label: "Letter Landscape" },
  { value: "letter_portrait", label: "Letter Portrait" },
];

export const DEFAULT_BUKTI_TAYANG_FORM: BuktiTayangFormState = {
  outputFormat: "xls",
  fontSize: 12,
  paperSize: "a4_landscape",
  title: "REKAPITULASI BERITA",
  companyName: "",
  mediaName: "",
  mediaUrl: "",
  periodLabel: "",
  logoUrl: "",
  filterType: "category",
  status: "published",
  startDate: "",
  endDate: "",
  categoryId: "",
  tagId: "",
};

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatBuktiTayangDate(value?: string | Date | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function buildBuktiTayangPeriodLabel(startDate?: string, endDate?: string, fallback?: string): string {
  if (fallback && fallback.trim()) return fallback.trim();
  if (!startDate && !endDate) return "-";

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const isValidStart = start && !Number.isNaN(start.getTime());
  const isValidEnd = end && !Number.isNaN(end.getTime());

  if (isValidStart && isValidEnd) {
    return `${new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(start!)} - ${new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(end!)}`;
  }
  if (isValidStart) {
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(start!);
  }
  if (isValidEnd) {
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(end!);
  }
  return "-";
}

export function sanitizeBuktiTayangFilename(input: string): string {
  const base = String(input || "bukti-tayang")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "bukti-tayang";
}

export function getBuktiTayangReportName(input: Pick<BuktiTayangFormState, "title" | "mediaName" | "companyName">): string {
  const title = input.title?.trim();
  if (title) return title;
  const mediaName = input.mediaName?.trim();
  if (mediaName) return mediaName;
  const companyName = input.companyName?.trim();
  if (companyName) return companyName;
  return "Bukti Tayang";
}

function getBuktiTayangPaperSizeCss(paperSize: BuktiTayangPaperSize): string {
  switch (paperSize) {
    case "a4_portrait":
      return "210mm 297mm";
    case "f4_landscape":
      return "330mm 210mm";
    case "f4_portrait":
      return "210mm 330mm";
    case "letter_landscape":
      return "279mm 216mm";
    case "letter_portrait":
      return "216mm 279mm";
    case "a4_landscape":
    default:
      return "297mm 210mm";
  }
}

export function buildBuktiTayangHtmlDocument(form: BuktiTayangFormState, rows: BuktiTayangRow[]): string {
  const fontSize = Math.max(10, Math.min(24, Number(form.fontSize) || 12));
  const paperSizeCss = getBuktiTayangPaperSizeCss(form.paperSize || "a4_landscape");
  const periodLabel = buildBuktiTayangPeriodLabel(form.startDate, form.endDate, form.periodLabel);
  const reportName = getBuktiTayangReportName(form);
  const logoMarkup = form.logoUrl
    ? `<img src="${escapeHtml(form.logoUrl)}" alt="Logo" style="max-height:72px; max-width:220px; object-fit:contain;" />`
    : "";
  const mediaUrlMarkup = form.mediaUrl?.trim()
    ? `<div><strong>URL Media Online:</strong> <a href="${escapeHtml(form.mediaUrl.trim())}" target="_blank" rel="noreferrer">${escapeHtml(form.mediaUrl.trim())}</a></div>`
    : "";

  const rowsMarkup = rows.length
    ? rows
        .map(
          (row) => `
            <tr>
              <td>${row.no}</td>
              <td>${escapeHtml(row.dateLabel)}</td>
              <td>${escapeHtml(row.title)}</td>
              <td><a href="${escapeHtml(row.url)}" target="_blank" rel="noreferrer">${escapeHtml(row.linkLabel)}</a></td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td colspan="4" style="text-align:center; padding:16px;">Tidak ada data berita yang cocok.</td></tr>`;

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(reportName)}</title>
    <style>
      @page { size: ${paperSizeCss}; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #111827;
        background: #ffffff;
        font-size: ${fontSize}px;
      }
      .sheet {
        padding: 8px 10px;
      }
      .header {
        margin-bottom: 12px;
      }
      .title {
        text-align: center;
        font-size: ${Math.max(22, fontSize + 10)}px;
        font-weight: 700;
        color: #000000;
        line-height: 1.15;
        max-width: 78%;
        margin: 0 auto 18px;
        overflow-wrap: anywhere;
        text-wrap: balance;
      }
      .header-bottom {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 20px;
      }
      .meta {
        display: grid;
        gap: 1px;
        line-height: 1.3;
        font-size: ${Math.max(11, fontSize)}px;
        min-width: 0;
        padding-top: 2px;
      }
      .logo {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        max-width: 220px;
        min-width: 150px;
      }
      .logo img {
        display: block;
        margin-left: auto;
        transform: translateY(-2px);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #6b7280;
        padding: 6px 7px;
        vertical-align: top;
        word-break: break-word;
      }
      th {
        background: #efefef;
        text-align: center;
        font-weight: 700;
      }
      td:nth-child(1), td:nth-child(2) {
        text-align: center;
        white-space: nowrap;
      }
      td:nth-child(3) {
        line-height: 1.35;
      }
      td:nth-child(4) {
        text-align: center;
        white-space: nowrap;
      }
      td:nth-child(4) a {
        color: #1d4ed8;
        text-decoration: underline;
        font-weight: 700;
      }
      .report-table {
        margin-top: 12px;
      }
      @media print {
        .sheet {
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div class="title">${escapeHtml(reportName)}</div>
        <div class="header-bottom">
          <div class="meta">
            ${form.companyName?.trim() ? `<div><strong>Nama Perusahaan:</strong> ${escapeHtml(form.companyName.trim())}</div>` : ""}
            ${form.mediaName?.trim() ? `<div><strong>Nama Media Online:</strong> ${escapeHtml(form.mediaName.trim())}</div>` : ""}
            ${mediaUrlMarkup}
            <div><strong>Periode Terbit:</strong> ${escapeHtml(periodLabel)}</div>
          </div>
          ${logoMarkup ? `<div class="logo">${logoMarkup}</div>` : ""}
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width:44px;">NO</th>
            <th style="width:96px;">TANGGAL</th>
            <th>JUDUL BERITA</th>
            <th style="width:112px;">LINK BERITA</th>
          </tr>
        </thead>
        <tbody>
          ${rowsMarkup}
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}
