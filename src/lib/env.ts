import { z } from "zod";

// Validasi terpusat environment variables (server-side) saat startup.
// Dipakai lewat src/instrumentation.ts agar fail-fast bila konfigurasi
// penting hilang, tanpa memakai `as string` / fallback "dummy".

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET wajib diisi"),
  MASTER_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  STORAGE_PROVIDER: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`[env] Konfigurasi environment tidak valid — ${details}`);
}

export const env = parsed.data;
