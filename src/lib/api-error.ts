import { NextResponse } from "next/server";
import { captureError } from "@/lib/logger";

/**
 * Balas error internal tanpa membocorkan detail (error.message) ke client.
 * Detail dikirim ke Sentry/log. Dipakai seragam di API route.
 */
export function internalError(
  error: unknown,
  context?: Record<string, unknown>,
): NextResponse {
  captureError(error, context);
  return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
}
