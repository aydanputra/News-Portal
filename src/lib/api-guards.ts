import { prisma } from "@/lib/prisma";
import { ALL_TOOL_IDS, resolveToolVisibility, type ToolId, type ToolVisibilityMap } from "@/lib/tools";

type RateState = {
  count: number;
  resetAt: number;
};

const globalForRate = global as unknown as {
  __rateLimit?: Map<string, RateState>;
};

const rateStore = globalForRate.__rateLimit || new Map<string, RateState>();
globalForRate.__rateLimit = rateStore;

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function assertRateLimit(
  request: Request,
  key: string,
  opts: { windowMs: number; max: number },
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  const bucketKey = `${ip}:${key}`;
  const prev = rateStore.get(bucketKey);

  if (!prev || prev.resetAt <= now) {
    rateStore.set(bucketKey, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (prev.count >= opts.max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((prev.resetAt - now) / 1000));
    return { ok: false, retryAfterSeconds };
  }

  prev.count += 1;
  rateStore.set(bucketKey, prev);
  return { ok: true };
}

function normalizeHost(raw: string): string {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "";
  if (value.includes(",")) return normalizeHost(value.split(",")[0] || "");
  return value.replace(/^https?:\/\//, "").split("/")[0]!.split(":")[0]!;
}

function getRequestHost(request: Request): string {
  const xfh = request.headers.get("x-forwarded-host");
  if (xfh) return normalizeHost(xfh);
  const host = request.headers.get("host");
  if (host) return normalizeHost(host);
  return "";
}

async function getStoredToolVisibility(): Promise<ToolVisibilityMap> {
  const settings = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { toolVisibility: true },
  });
  return resolveToolVisibility(settings?.toolVisibility);
}

export async function getEnabledToolsForRequest(_request: Request): Promise<ToolId[]> {
  const visibility = await getStoredToolVisibility();
  return ALL_TOOL_IDS.filter((toolId) => visibility[toolId]);
}

export async function isToolEnabledForRequest(request: Request, toolId: ToolId): Promise<boolean> {
  const enabledTools = await getEnabledToolsForRequest(request);
  return enabledTools.includes(toolId);
}

export function getToolsRequestHost(request: Request): string {
  return getRequestHost(request);
}
