import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "WRITER";

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

