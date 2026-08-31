import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
const VERSION_CACHE_TTL_MS = 1000 * 60 * 30;

type LatestInfo = {
  version: string;
  url?: string;
  publishedAt?: string;
};

type UpdateChannel = "stable" | "beta";

type VersionCacheEntry = {
  expiresAt: number;
  data: {
    channel: UpdateChannel;
    source: "override" | "feed" | "github" | "none";
    feedUrlUsed: string | null;
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    changelogUrl: string | null;
    releasedAt: string | null;
  };
};

const globalForVersionCache = globalThis as typeof globalThis & {
  __adminVersionCache?: Map<string, VersionCacheEntry>;
};

const versionCache = globalForVersionCache.__adminVersionCache || new Map<string, VersionCacheEntry>();
globalForVersionCache.__adminVersionCache = versionCache;

function normalizeVersion(raw: unknown): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  return v;
}

function normalizeChannel(raw: unknown): UpdateChannel {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return v === "beta" ? "beta" : "stable";
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

function pickFromGitHubReleases(releases: any[], channel: UpdateChannel): LatestInfo | null {
  for (const r of releases) {
    if (!r || typeof r !== "object") continue;
    if ((r as any).draft) continue;
    const isPrerelease = Boolean((r as any).prerelease);
    if (channel === "stable" && isPrerelease) continue;
    if (channel === "beta" && !isPrerelease) continue;
    const tag = normalizeVersion((r as any).tag_name);
    if (!tag) continue;
    const htmlUrl = typeof (r as any).html_url === "string" ? (r as any).html_url : undefined;
    const publishedAt = typeof (r as any).published_at === "string" ? (r as any).published_at : undefined;
    return { version: tag, url: htmlUrl, publishedAt };
  }
  return null;
}

async function fetchLatestFromGitHub(repo: string, channel: UpdateChannel, token?: string): Promise<LatestInfo | null> {
  const url = `https://api.github.com/repos/${encodeURIComponent(repo)}/releases?per_page=20`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token && token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!Array.isArray(json)) return null;
  const picked = pickFromGitHubReleases(json, channel);
  if (picked) return picked;
  if (channel !== "stable") return null;
  return pickFromGitHubReleases(json, "beta");
}

async function resolveVersionPayload() {
  const channel = normalizeChannel(process.env.UPDATE_CHANNEL);
  const feedUrlRaw = normalizeVersion(process.env.UPDATE_FEED_URL);
  const repo = normalizeVersion(process.env.GITHUB_REPO);
  const ghToken = normalizeVersion(process.env.GITHUB_TOKEN);
  const overrideLatest = normalizeVersion(process.env.LATEST_VERSION_OVERRIDE);
  const overrideChangelogUrl = normalizeVersion(process.env.LATEST_CHANGELOG_URL_OVERRIDE);
  const overrideReleasedAt = normalizeVersion(process.env.LATEST_RELEASED_AT_OVERRIDE);
  const currentVersion =
    normalizeVersion(process.env.APP_VERSION) ||
    normalizeVersion(process.env.NEXT_PUBLIC_APP_VERSION) ||
    normalizeVersion(process.env.VERCEL_GIT_COMMIT_SHA) ||
    "unknown";

  const cacheKey = [
    channel,
    currentVersion,
    feedUrlRaw,
    repo,
    overrideLatest,
    overrideChangelogUrl,
    overrideReleasedAt,
  ].join("|");
  const cached = versionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let latest: LatestInfo | null = null;
  let source: "override" | "feed" | "github" | "none" = "none";
  let feedUrlUsed: string | null = null;
  if (overrideLatest) {
    source = "override";
    latest = {
      version: overrideLatest,
      url: overrideChangelogUrl || undefined,
      publishedAt: overrideReleasedAt || undefined,
    };
  } else if (feedUrlRaw) {
    const resolved = feedUrlRaw.includes("{channel}") ? feedUrlRaw.replaceAll("{channel}", channel) : feedUrlRaw;
    feedUrlUsed = resolved;
    source = "feed";
    const res = await fetch(resolved, { next: { revalidate: 1800 } });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && typeof json === "object") {
        const direct = normalizeVersion((json as any).latest || (json as any).version);
        if (direct) {
          latest = {
            version: direct,
            url: typeof (json as any).changelogUrl === "string" ? (json as any).changelogUrl : undefined,
            publishedAt: typeof (json as any).releasedAt === "string" ? (json as any).releasedAt : undefined,
          };
        } else {
          const channelsObj =
            (json as any).channels && typeof (json as any).channels === "object" ? (json as any).channels : null;
          const channelEntry = channelsObj ? (channelsObj as any)[channel] : null;
          if (channelEntry && typeof channelEntry === "object") {
            const v = normalizeVersion((channelEntry as any).latest || (channelEntry as any).version);
            if (v) {
              latest = {
                version: v,
                url: typeof (channelEntry as any).changelogUrl === "string" ? (channelEntry as any).changelogUrl : undefined,
                publishedAt: typeof (channelEntry as any).releasedAt === "string" ? (channelEntry as any).releasedAt : undefined,
              };
            }
          }
        }
      }
    }
  } else if (repo) {
    source = "github";
    latest = await fetchLatestFromGitHub(repo, channel, ghToken || undefined);
  }

  const latestVersion = latest?.version || null;
  const payload = {
    channel,
    source,
    feedUrlUsed,
    currentVersion,
    latestVersion,
    updateAvailable: latestVersion ? isNewer(latestVersion, currentVersion) : false,
    changelogUrl: latest?.url || null,
    releasedAt: latest?.publishedAt || null,
  };
  versionCache.set(cacheKey, {
    expiresAt: Date.now() + VERSION_CACHE_TTL_MS,
    data: payload,
  });
  return payload;
}

export async function GET(_request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await resolveVersionPayload();

    return NextResponse.json({
      ...payload,
      user: { id: user.id, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Failed to check version" }, { status: 500 });
  }
}
