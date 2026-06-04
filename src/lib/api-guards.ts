import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "WRITER";
export type ToolId = "wp_import" | "media_migration" | "print_tools" | "backfill_excerpts";

const ALL_TOOL_IDS: ToolId[] = ["wp_import", "media_migration", "print_tools", "backfill_excerpts"];

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

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = verifyToken(token || "");
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, status: true, name: true },
  });

  if (!user || user.status !== "ACTIVE") return null;
  return user as { id: string; email: string; role: Role; status: "ACTIVE" | "SUSPENDED"; name: string };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;
  return user;
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

function isLocalHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function parseToolAllowlistEnv(): Record<string, ToolId[]> | null {
  const raw = process.env.TENANT_TOOLS_ALLOWLIST;
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const json = JSON.parse(raw);
    if (!json || typeof json !== "object") return null;
    const out: Record<string, ToolId[]> = {};
    for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
      const host = normalizeHost(k);
      if (!host) continue;
      const arr = Array.isArray(v) ? v : [];
      const tools = arr
        .map((x) => String(x))
        .filter((x): x is ToolId => (ALL_TOOL_IDS as string[]).includes(x));
      out[host] = tools;
    }
    return out;
  } catch {
    return null;
  }
}

const TOOL_ALLOWLIST_BY_HOST = parseToolAllowlistEnv();

type InstanceToolsMode = { mode: "all" } | { mode: "list"; tools: ToolId[] };

function parseInstanceToolsEnv(): InstanceToolsMode | null {
  const raw = process.env.TOOLS_ENABLED;
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = raw.trim().toLowerCase();
  if (value === "*" || value === "all") return { mode: "all" };
  const parts = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const tools = parts.filter((x): x is ToolId => (ALL_TOOL_IDS as string[]).includes(x));
  return { mode: "list", tools };
}

const INSTANCE_TOOLS = parseInstanceToolsEnv();

export function isToolEnabledForRequest(request: Request, toolId: ToolId): boolean {
  const host = getRequestHost(request);
  if (isLocalHost(host)) return true;
  if (INSTANCE_TOOLS) {
    if (INSTANCE_TOOLS.mode === "all") return true;
    return INSTANCE_TOOLS.tools.includes(toolId);
  }
  if (!TOOL_ALLOWLIST_BY_HOST) return true;

  const direct = TOOL_ALLOWLIST_BY_HOST[host];
  if (Array.isArray(direct)) return direct.includes(toolId);
  const wildcard = TOOL_ALLOWLIST_BY_HOST["*"];
  if (Array.isArray(wildcard)) return wildcard.includes(toolId);
  return false;
}

export function isToolsAllowlistActive(): boolean {
  const instanceRaw = process.env.TOOLS_ENABLED;
  if (typeof instanceRaw === "string" && instanceRaw.trim() !== "") return true;
  const hostRaw = process.env.TENANT_TOOLS_ALLOWLIST;
  return typeof hostRaw === "string" && hostRaw.trim() !== "";
}
