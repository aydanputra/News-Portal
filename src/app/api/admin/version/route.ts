import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

type LatestInfo = {
  version: string;
  url?: string;
  publishedAt?: string;
};

function normalizeVersion(raw: unknown): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  return v;
}

function parseSemver(input: string): { major: number; minor: number; patch: number } | null {
  const v = input.trim().replace(/^v/i, "");
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const patch = Number(m[3]);
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return null;
  return { major, minor, patch };
}

function isNewer(latest: string, current: string): boolean {
  const a = parseSemver(latest);
  const b = parseSemver(current);
  if (a && b) {
    if (a.major !== b.major) return a.major > b.major;
    if (a.minor !== b.minor) return a.minor > b.minor;
    return a.patch > b.patch;
  }
  if (!latest || !current) return false;
  return latest !== current;
}

async function fetchLatestFromFeed(url: string): Promise<LatestInfo | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json || typeof json !== "object") return null;
  const latest = normalizeVersion((json as any).latest || (json as any).version);
  if (!latest) return null;
  const info: LatestInfo = { version: latest };
  if (typeof (json as any).changelogUrl === "string") info.url = (json as any).changelogUrl;
  if (typeof (json as any).releasedAt === "string") info.publishedAt = (json as any).releasedAt;
  return info;
}

async function fetchLatestFromGitHub(repo: string, token?: string): Promise<LatestInfo | null> {
  const url = `https://api.github.com/repos/${encodeURIComponent(repo)}/releases/latest`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token && token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json || typeof json !== "object") return null;
  const tag = normalizeVersion((json as any).tag_name);
  const htmlUrl = typeof (json as any).html_url === "string" ? (json as any).html_url : undefined;
  const publishedAt = typeof (json as any).published_at === "string" ? (json as any).published_at : undefined;
  if (!tag) return null;
  return { version: tag, url: htmlUrl, publishedAt };
}

export async function GET(_request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentVersion =
      normalizeVersion(process.env.APP_VERSION) ||
      normalizeVersion(process.env.NEXT_PUBLIC_APP_VERSION) ||
      normalizeVersion(process.env.VERCEL_GIT_COMMIT_SHA) ||
      "unknown";

    const feedUrl = normalizeVersion(process.env.UPDATE_FEED_URL);
    const repo = normalizeVersion(process.env.GITHUB_REPO);
    const ghToken = normalizeVersion(process.env.GITHUB_TOKEN);

    let latest: LatestInfo | null = null;
    if (feedUrl) {
      latest = await fetchLatestFromFeed(feedUrl);
    } else if (repo) {
      latest = await fetchLatestFromGitHub(repo, ghToken || undefined);
    }

    const latestVersion = latest?.version || null;
    const updateAvailable = latestVersion ? isNewer(latestVersion, currentVersion) : false;

    return NextResponse.json({
      currentVersion,
      latestVersion,
      updateAvailable,
      changelogUrl: latest?.url || null,
      releasedAt: latest?.publishedAt || null,
      user: { id: user.id, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Failed to check version" }, { status: 500 });
  }
}
