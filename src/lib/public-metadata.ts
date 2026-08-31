import type { Metadata } from "next";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicSiteUrl() {
  const raw =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : "http://localhost:3000";

  return stripTrailingSlash(raw);
}

export function getMetadataBase(parentMetadataBase?: URL | null) {
  return parentMetadataBase || new URL(getPublicSiteUrl());
}

export function buildCanonicalPath(
  pathname: string,
  query?: Record<string, string | number | null | undefined>,
) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname.replace(/^\/+/, "")}`;
  const search = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      const text = String(value).trim();
      if (!text) continue;
      search.set(key, text);
    }
  }

  const queryString = search.toString();
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
}

export function buildCanonicalUrl(canonicalPath: string, parentMetadataBase?: URL | null) {
  return new URL(canonicalPath, getMetadataBase(parentMetadataBase)).toString();
}

export function buildPublicPageMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
  parentMetadataBase?: URL | null;
}) {
  const canonicalUrl = buildCanonicalUrl(input.canonicalPath, input.parentMetadataBase);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  } satisfies Metadata;
}
