"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="p-6">
        <div className="max-w-xl">
          <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
          <p className="mt-2 text-sm text-gray-600">Silakan refresh atau coba lagi.</p>
          <button
            className="mt-4 rounded bg-black px-4 py-2 text-white"
            onClick={() => reset()}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
