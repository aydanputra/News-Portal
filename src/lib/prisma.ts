import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: DATABASE_URL environment variable is not set in production!");
}

// Tambahkan batas pool eksplisit agar tidak kehabisan koneksi saat trafik tinggi.
// Diabaikan bila URL sudah memuat parameter (mis. PgBouncer / managed Postgres).
// Saat `next build`, tiap worker membuat PrismaClient sendiri; batas pool lebih
// kecil mencegah "too many clients" saat prerender banyak halaman statis paralel.
function withPoolParams(url: string | undefined, limit: number): string | undefined {
  if (!url) return url;
  const parts: string[] = [];
  if (!url.includes("connection_limit=")) parts.push(`connection_limit=${limit}`);
  if (!url.includes("pool_timeout=")) parts.push("pool_timeout=10");
  if (parts.length === 0) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${parts.join("&")}`;
}

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const poolLimit = isBuildPhase ? 2 : 10;

const databaseUrl = withPoolParams(rawDatabaseUrl, poolLimit);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
