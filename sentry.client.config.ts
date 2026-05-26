import * as Sentry from "@sentry/nextjs";

const dsn =
  typeof process.env.NEXT_PUBLIC_SENTRY_DSN === "string" && process.env.NEXT_PUBLIC_SENTRY_DSN.trim() !== ""
    ? process.env.NEXT_PUBLIC_SENTRY_DSN.trim()
    : typeof process.env.SENTRY_DSN === "string" && process.env.SENTRY_DSN.trim() !== ""
      ? process.env.SENTRY_DSN.trim()
      : undefined;

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && process.env.NODE_ENV === "production",
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
});
