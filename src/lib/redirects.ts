export type RedirectStatusCode = 301 | 302 | 307 | 308;

const ALLOWED_STATUS_CODES: RedirectStatusCode[] = [301, 302, 307, 308];

export function normalizeRedirectPath(input: unknown): string {
  const raw = String(input || "").trim();
  if (!raw) return "";

  let pathOnly = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      pathOnly = `${url.pathname}${url.search}`;
    }
  } catch {
    pathOnly = raw;
  }

  if (!pathOnly.startsWith("/")) {
    pathOnly = `/${pathOnly}`;
  }

  pathOnly = pathOnly.replace(/\/{2,}/g, "/");
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    pathOnly = pathOnly.replace(/\/+$/, "");
  }
  return pathOnly || "/";
}

export function normalizeRedirectTarget(input: unknown): string {
  const raw = String(input || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).toString();
    } catch {
      return "";
    }
  }

  return normalizeRedirectPath(raw);
}

export function normalizeRedirectStatusCode(input: unknown): RedirectStatusCode {
  const parsed = Number.parseInt(String(input ?? ""), 10);
  if (ALLOWED_STATUS_CODES.includes(parsed as RedirectStatusCode)) {
    return parsed as RedirectStatusCode;
  }
  return 301;
}

export function isBypassedRedirectPath(pathname: string): boolean {
  const value = normalizeRedirectPath(pathname);
  if (
    value.startsWith("/admin") ||
    value.startsWith("/api") ||
    value.startsWith("/_next") ||
    value === "/favicon.ico" ||
    value === "/robots.txt" ||
    value === "/sitemap.xml"
  ) {
    return true;
  }

  return /\.[a-z0-9]{2,8}$/i.test(value);
}
