import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { isToolEnabledForRequest } from "@/lib/api-guards";
import {
  buildBuktiTayangPeriodLabel,
  formatBuktiTayangDate,
  type BuktiTayangFilterType,
  type BuktiTayangFormState,
  type BuktiTayangStatus,
} from "@/lib/bukti-tayang";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getPublicSiteUrl(request: Request, mediaUrl?: string): string {
  const envSiteUrl = typeof process.env.NEXT_PUBLIC_SITE_URL === "string" ? process.env.NEXT_PUBLIC_SITE_URL.trim() : "";
  if (envSiteUrl) {
    return stripTrailingSlash(envSiteUrl);
  }

  const mediaSiteUrl = String(mediaUrl || "").trim();
  if (mediaSiteUrl) {
    try {
      const parsed = new URL(mediaSiteUrl);
      return stripTrailingSlash(parsed.origin);
    } catch {
      // abaikan URL media yang tidak valid
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${stripTrailingSlash(forwardedHost)}`;
  }

  return stripTrailingSlash(new URL(request.url).origin);
}

function parseDateRange(startDate?: string, endDate?: string) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && !Number.isNaN(start.getTime())) {
    start.setHours(0, 0, 0, 0);
  }
  if (end && !Number.isNaN(end.getTime())) {
    end.setHours(23, 59, 59, 999);
  }

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : null,
    end: end && !Number.isNaN(end.getTime()) ? end : null,
  };
}

function normalizePayload(body: any): BuktiTayangFormState {
  return {
    outputFormat: body?.outputFormat === "pdf" ? "pdf" : "xls",
    fontSize: Number.isFinite(Number(body?.fontSize)) ? Math.max(10, Math.min(24, Number(body.fontSize))) : 12,
    paperSize: ["a4_landscape", "a4_portrait", "f4_landscape", "f4_portrait", "letter_landscape", "letter_portrait"].includes(String(body?.paperSize || ""))
      ? String(body.paperSize) as BuktiTayangFormState["paperSize"]
      : "a4_landscape",
    title: String(body?.title || "REKAPITULASI BERITA"),
    companyName: String(body?.companyName || ""),
    mediaName: String(body?.mediaName || ""),
    mediaUrl: String(body?.mediaUrl || ""),
    periodLabel: String(body?.periodLabel || ""),
    logoUrl: String(body?.logoUrl || ""),
    filterType: (["all", "category", "tag"] as BuktiTayangFilterType[]).includes(body?.filterType) ? body.filterType : "category",
    status: (["all", "published", "draft", "review", "scheduled", "rejected", "archived"] as BuktiTayangStatus[]).includes(body?.status)
      ? body.status
      : "published",
    startDate: String(body?.startDate || ""),
    endDate: String(body?.endDate || ""),
    categoryId: String(body?.categoryId || ""),
    tagId: String(body?.tagId || ""),
  };
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "bukti_tayang"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const form = normalizePayload(body);
  const { start, end } = parseDateRange(form.startDate, form.endDate);
  const andClauses: any[] = [{ deletedAt: null }];

  if (form.status === "published") {
    andClauses.push({ status: "PUBLISHED" });
  } else if (form.status === "draft") {
    andClauses.push({ status: "DRAFT" });
  } else if (form.status === "review") {
    andClauses.push({ status: "IN_REVIEW" });
  } else if (form.status === "scheduled") {
    andClauses.push({ status: "SCHEDULED" });
  } else if (form.status === "rejected") {
    andClauses.push({ status: "REJECTED" });
  } else if (form.status === "archived") {
    andClauses.push({ status: "ARCHIVED" });
  }

  if (form.filterType === "category" && form.categoryId) {
    andClauses.push({
      OR: [
        { categoryId: form.categoryId },
        { postCategories: { some: { categoryId: form.categoryId } } },
      ],
    });
  }

  if (form.filterType === "tag" && form.tagId) {
    andClauses.push({
      tags: { some: { id: form.tagId } },
    });
  }

  if (start || end) {
    const publishedAtRange: Record<string, Date> = {};
    const createdAtRange: Record<string, Date> = {};
    if (start) {
      publishedAtRange.gte = start;
      createdAtRange.gte = start;
    }
    if (end) {
      publishedAtRange.lte = end;
      createdAtRange.lte = end;
    }
    andClauses.push({
      OR: [
        { publishedAt: publishedAtRange },
        {
          AND: [{ publishedAt: null }, { createdAt: createdAtRange }],
        },
      ],
    });
  }

  const siteUrl = getPublicSiteUrl(request, form.mediaUrl);
  const posts = await prisma.post.findMany({
    where: { AND: andClauses },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
      category: {
        select: { slug: true },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 5000,
  });

  const rows = posts.map((post, index) => {
    const dateValue = post.publishedAt || post.createdAt;
    const categorySlug = post.category?.slug || "berita";
    return {
      no: index + 1,
      postId: post.id,
      dateLabel: formatBuktiTayangDate(dateValue),
      title: post.title,
      url: `${siteUrl}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(post.slug)}`,
      linkLabel: `LINK BERITA ${index + 1}`,
    };
  });

  return NextResponse.json({
    ok: true,
    total: rows.length,
    periodLabel: buildBuktiTayangPeriodLabel(form.startDate, form.endDate, form.periodLabel),
    rows,
  });
}
