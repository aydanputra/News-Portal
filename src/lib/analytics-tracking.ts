import { createHash, randomUUID } from "crypto";

const TRACKING_COOKIE_NAME = "np_vid";
const TRACKING_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const TRACKING_WINDOW_MS = 12 * 60 * 60 * 1000;

function normalizeVisitorId(value: unknown) {
  const visitorId = typeof value === "string" ? value.trim() : "";
  if (!visitorId) return "";
  return /^[a-z0-9_-]{8,80}$/i.test(visitorId) ? visitorId : "";
}

export function getTrackingCookieName() {
  return TRACKING_COOKIE_NAME;
}

export function getTrackingCookieMaxAge() {
  return TRACKING_COOKIE_MAX_AGE;
}

export function normalizeTrackingVisitorId(value: unknown) {
  return normalizeVisitorId(value);
}

export function resolveTrackingWindowStart(value = new Date()) {
  const current = value.getTime();
  return new Date(Math.floor(current / TRACKING_WINDOW_MS) * TRACKING_WINDOW_MS);
}

export function resolveTrackingDay(value = new Date()) {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function resolveVisitorIdentity(cookieValue: unknown, bodyValue: unknown) {
  const cookieVisitorId = normalizeVisitorId(cookieValue);
  const bodyVisitorId = normalizeVisitorId(bodyValue);
  const visitorId = cookieVisitorId || bodyVisitorId || randomUUID().replace(/-/g, "");

  return {
    visitorId,
    cookieValue: cookieVisitorId,
    shouldSetCookie: cookieVisitorId !== visitorId,
  };
}

export function hashTrackingVisitorId(visitorId: string) {
  return createHash("sha256").update(visitorId).digest("hex");
}
