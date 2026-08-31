import { slugify } from "@/lib/utils";

export type SeoAuditSeverity = "good" | "warning" | "error";

export type SeoAuditIssue = {
  id: string;
  severity: SeoAuditSeverity;
  label: string;
  message: string;
};

export type SeoAuditInput = {
  title?: string;
  slug?: string;
  subtitle?: string;
  content?: string;
  metaTitle?: string;
  metaDesc?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  categoryIds?: string[];
  tags?: string[];
};

export type SeoAuditResult = {
  score: number;
  statusLabel: string;
  issues: SeoAuditIssue[];
  errorCount: number;
  warningCount: number;
  checks: {
    wordCount: number;
    slug: string;
    internalLinkCount: number;
    canonicalUrl: string;
    focusKeyword: string;
  };
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(value: string): number {
  if (!value.trim()) return 0;
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function countInternalLinks(content: string): number {
  const matches = content.match(/<a\b[^>]*href=(["'])(\/(?!\/)|https?:\/\/[^"']+)\1/gi) || [];
  return matches.length;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getReadableFileName(value: string): string {
  return value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function runSeoAudit(input: SeoAuditInput): SeoAuditResult {
  const title = String(input.title || "").trim();
  const subtitle = String(input.subtitle || "").trim();
  const content = String(input.content || "");
  const plainContent = stripHtml(content);
  const wordCount = countWords(plainContent);
  const slug = slugify(String(input.slug || "").trim()) || slugify(title);
  const metaTitle = String(input.metaTitle || "").trim();
  const metaDesc = String(input.metaDesc || "").trim();
  const focusKeyword = String(input.focusKeyword || "").trim().toLowerCase();
  const canonicalUrl = String(input.canonicalUrl || "").trim();
  const featuredImageUrl = String(input.featuredImageUrl || "").trim();
  const featuredImageAlt = String(input.featuredImageAlt || "").trim();
  const categoryIds = Array.isArray(input.categoryIds) ? input.categoryIds.filter(Boolean) : [];
  const tags = Array.isArray(input.tags) ? input.tags.filter((item) => String(item || "").trim() !== "") : [];
  const internalLinkCount = countInternalLinks(content);

  const issues: SeoAuditIssue[] = [];
  let score = 100;

  const pushIssue = (issue: SeoAuditIssue, penalty: number) => {
    issues.push(issue);
    score -= penalty;
  };

  if (title.length < 30) {
    pushIssue(
      {
        id: "title_short",
        severity: "warning",
        label: "Judul terlalu pendek",
        message: "Usahakan judul 30-70 karakter agar lebih kuat di hasil pencarian.",
      },
      8,
    );
  } else if (title.length > 70) {
    pushIssue(
      {
        id: "title_long",
        severity: "warning",
        label: "Judul terlalu panjang",
        message: "Judul lebih dari 70 karakter berisiko terpotong di hasil pencarian.",
      },
      6,
    );
  } else {
    issues.push({
      id: "title_good",
      severity: "good",
      label: "Judul rapi",
      message: "Panjang judul sudah cukup ideal untuk SEO.",
    });
  }

  if (!metaTitle) {
    pushIssue(
      {
        id: "meta_title_missing",
        severity: "error",
        label: "Meta title belum diisi",
        message: "Isi meta title agar judul pencarian lebih terkontrol.",
      },
      12,
    );
  } else if (metaTitle.length < 40 || metaTitle.length > 65) {
    pushIssue(
      {
        id: "meta_title_length",
        severity: "warning",
        label: "Panjang meta title belum ideal",
        message: "Usahakan meta title di kisaran 40-65 karakter.",
      },
      7,
    );
  } else {
    issues.push({
      id: "meta_title_good",
      severity: "good",
      label: "Meta title siap",
      message: "Meta title sudah berada di rentang yang aman.",
    });
  }

  if (!metaDesc) {
    pushIssue(
      {
        id: "meta_desc_missing",
        severity: "error",
        label: "Meta description belum diisi",
        message: "Isi meta description agar snippet Google lebih rapi.",
      },
      12,
    );
  } else if (metaDesc.length < 120 || metaDesc.length > 160) {
    pushIssue(
      {
        id: "meta_desc_length",
        severity: "warning",
        label: "Meta description belum ideal",
        message: "Usahakan meta description 120-160 karakter.",
      },
      7,
    );
  } else {
    issues.push({
      id: "meta_desc_good",
      severity: "good",
      label: "Meta description siap",
      message: "Deskripsi meta sudah cukup kuat untuk hasil pencarian.",
    });
  }

  if (!focusKeyword) {
    pushIssue(
      {
        id: "focus_keyword_missing",
        severity: "warning",
        label: "Focus keyword belum diisi",
        message: "Isi focus keyword agar audit SEO bisa mengecek relevansi keyword utama artikel.",
      },
      8,
    );
  } else {
    const keywordInTitle = title.toLowerCase().includes(focusKeyword);
    const keywordInMetaTitle = metaTitle.toLowerCase().includes(focusKeyword);
    const keywordInMetaDesc = metaDesc.toLowerCase().includes(focusKeyword);
    const keywordInSlug = slug.includes(slugify(focusKeyword));
    const keywordInContent = plainContent.toLowerCase().includes(focusKeyword);
    const keywordHits = [
      keywordInTitle,
      keywordInMetaTitle,
      keywordInMetaDesc,
      keywordInSlug,
      keywordInContent,
    ].filter(Boolean).length;

    if (keywordHits <= 1) {
      pushIssue(
        {
          id: "focus_keyword_weak",
          severity: "warning",
          label: "Focus keyword masih lemah",
          message: "Usahakan focus keyword muncul di judul, slug, meta, dan isi artikel secara natural.",
        },
        8,
      );
    } else {
      issues.push({
        id: "focus_keyword_good",
        severity: "good",
        label: "Focus keyword terbaca",
        message: `Keyword utama sudah muncul di ${keywordHits} area penting artikel.`,
      });
    }
  }

  if (wordCount < 300) {
    pushIssue(
      {
        id: "content_short",
        severity: wordCount < 150 ? "error" : "warning",
        label: "Konten masih tipis",
        message: "Usahakan konten minimal 300 kata agar lebih kuat untuk SEO.",
      },
      wordCount < 150 ? 14 : 8,
    );
  } else {
    issues.push({
      id: "content_good",
      severity: "good",
      label: "Konten memadai",
      message: `Konten sudah berisi sekitar ${wordCount} kata.`,
    });
  }

  if (!slug) {
    pushIssue(
      {
        id: "slug_missing",
        severity: "error",
        label: "Slug belum siap",
        message: "Judul belum cukup untuk membentuk slug yang valid.",
      },
      12,
    );
  } else if (slug.length > 75) {
    pushIssue(
      {
        id: "slug_long",
        severity: "warning",
        label: "Slug terlalu panjang",
        message: "Slug yang terlalu panjang kurang rapi untuk SEO.",
      },
      5,
    );
  } else {
    issues.push({
      id: "slug_good",
      severity: "good",
      label: "Slug siap",
      message: "Slug hasil judul sudah cukup rapi.",
    });
  }

  if (!canonicalUrl) {
    pushIssue(
      {
        id: "canonical_missing",
        severity: "warning",
        label: "Canonical masih otomatis",
        message: "Canonical belum diisi manual. Ini aman untuk artikel normal, tetapi penting dicek bila ada URL alternatif atau re-publish.",
      },
      3,
    );
  } else {
    issues.push({
      id: "canonical_good",
      severity: "good",
      label: "Canonical tersedia",
      message: "Canonical URL sudah ditentukan.",
    });
  }

  if (!featuredImageUrl) {
    pushIssue(
      {
        id: "image_missing",
        severity: "error",
        label: "Featured image belum ada",
        message: "Gambar utama membantu CTR dan tampilan social share.",
      },
      12,
    );
  } else if (!featuredImageAlt) {
    pushIssue(
      {
        id: "image_alt_missing",
        severity: "warning",
        label: "Alt gambar utama belum diisi",
        message: "Isi alt agar gambar lebih ramah SEO dan aksesibilitas.",
      },
      8,
    );
  } else {
    issues.push({
      id: "image_good",
      severity: "good",
      label: "Gambar utama siap",
      message: "Featured image dan alt text sudah tersedia.",
    });
  }

  if (categoryIds.length === 0) {
    pushIssue(
      {
        id: "category_missing",
        severity: "error",
        label: "Kategori belum dipilih",
        message: "Kategori membantu struktur konten dan distribusi berita.",
      },
      12,
    );
  } else {
    issues.push({
      id: "category_good",
      severity: "good",
      label: "Kategori terisi",
      message: `${categoryIds.length} kategori sudah dipilih.`,
    });
  }

  if (tags.length === 0) {
    pushIssue(
      {
        id: "tags_missing",
        severity: "warning",
        label: "Tag belum diisi",
        message: "Tag membantu relasi topik dan internal discovery.",
      },
      5,
    );
  } else {
    issues.push({
      id: "tags_good",
      severity: "good",
      label: "Tag terisi",
      message: `${tags.length} tag/topik sudah dipilih.`,
    });
  }

  if (internalLinkCount === 0) {
    pushIssue(
      {
        id: "internal_links_missing",
        severity: "warning",
        label: "Belum ada internal link",
        message: "Tambahkan minimal 1 tautan internal ke artikel lain bila relevan.",
      },
      4,
    );
  } else {
    issues.push({
      id: "internal_links_good",
      severity: "good",
      label: "Internal link ada",
      message: `${internalLinkCount} tautan internal terdeteksi di konten.`,
    });
  }

  if (!subtitle) {
    pushIssue(
      {
        id: "subtitle_missing",
        severity: "warning",
        label: "Ringkasan belum diisi",
        message: "Lead/ringkasan membantu editor, preview, dan fallback snippet.",
      },
      4,
    );
  }

  const finalScore = clampScore(score);
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  let statusLabel = "Perlu Perbaikan";
  if (finalScore >= 85 && errorCount === 0) statusLabel = "Siap Publish";
  else if (finalScore >= 70 && errorCount <= 1) statusLabel = "Cukup Bagus";

  return {
    score: finalScore,
    statusLabel,
    issues,
    errorCount,
    warningCount,
    checks: {
      wordCount,
      slug,
      internalLinkCount,
      canonicalUrl,
      focusKeyword,
    },
  };
}

export function buildSeoPublishWarning(result: SeoAuditResult): string {
  const topIssues = result.issues
    .filter((issue) => issue.severity !== "good")
    .slice(0, 5)
    .map((issue) => `- ${issue.label}: ${issue.message}`)
    .join("\n");

  return [
    `Skor SEO artikel ini masih ${result.score}/100 (${result.statusLabel}).`,
    "",
    "Catatan utama:",
    topIssues || "- Belum ada catatan besar.",
    "",
    "Tetap lanjut publish?",
  ].join("\n");
}
