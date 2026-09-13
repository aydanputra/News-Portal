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

// Fail-fast di production: fitur 2FA, enkripsi kunci AI, dan endpoint cron
// bergantung pada dua variabel ini. Tanpa keduanya, aplikasi akan gagal saat
// runtime (membingungkan) alih-alih gagal saat startup (jelas).
if (process.env.NODE_ENV === "production") {
  const requiredInProduction = ["MASTER_KEY", "CRON_SECRET"] as const;
  const missing = requiredInProduction.filter((key) => !parsed.data[key]);
  if (missing.length > 0) {
    throw new Error(`[env] Variabel wajib di production tidak diset: ${missing.join(", ")}`);
  }
}

export const env = parsed.data;
