import * as Sentry from "@sentry/nextjs";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = process.env.LOG_LEVEL?.trim().toLowerCase() as LogLevel | undefined;
const minLevel: LogLevel =
  configuredLevel && configuredLevel in LEVEL_ORDER
    ? configuredLevel
    : process.env.NODE_ENV === "production"
      ? "info"
      : "debug";

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

  const entry: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    message,
  };
  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      if (value !== undefined) entry[key] = value;
    }
  }

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    write("debug", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write("error", message, meta);
  },
};

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Log error terstruktur + kirim ke Sentry. Aman dipanggil dari catch block;
 * tidak melempar ulang. `context` dipakai sebagai metadata log & Sentry scope.
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  logger.error("Unhandled error", {
    ...(context ?? {}),
    error: toMessage(error),
  });

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("api", context);
    }
    Sentry.captureException(error);
  });
}
