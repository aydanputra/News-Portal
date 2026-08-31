"use client";

const VISITOR_KEY = "news-portal:visitor-id";
const TRACKING_PREFIX = "news-portal:tracking:";
const TRACKING_TTL_MS = 12 * 60 * 60 * 1000;

function getStorage(storage: "local" | "session") {
  if (typeof window === "undefined") return null;
  try {
    return storage === "local" ? window.localStorage : window.sessionStorage;
  } catch (error) {
    void error;
    return null;
  }
}

function readExpiry(key: string) {
  const storages = [getStorage("local"), getStorage("session")].filter(Boolean);
  const now = Date.now();

  for (const storage of storages) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) continue;
      const expiry = Number(raw);
      if (Number.isFinite(expiry) && expiry > now) {
        return expiry;
      }
      storage?.removeItem(key);
    } catch (error) {
      void error;
    }
  }

  return null;
}

function writeExpiry(key: string, expiry: number) {
  for (const storage of [getStorage("local"), getStorage("session")]) {
    try {
      storage?.setItem(key, String(expiry));
    } catch (error) {
      void error;
    }
  }
}

export function getOrCreateVisitorId() {
  const storage = getStorage("local");
  if (!storage) return "";

  try {
    const existing = storage.getItem(VISITOR_KEY);
    if (existing && /^[a-z0-9_-]{8,80}$/i.test(existing)) {
      return existing;
    }

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    storage.setItem(VISITOR_KEY, generated);
    return generated;
  } catch (error) {
    void error;
    return "";
  }
}

export function reserveTrackingKey(key: string, ttlMs = TRACKING_TTL_MS) {
  const storageKey = `${TRACKING_PREFIX}${key}`;
  if (readExpiry(storageKey)) return false;
  writeExpiry(storageKey, Date.now() + ttlMs);
  return true;
}

export function sendViewTracking(options: {
  url: string;
  dedupeKey: string;
  payload: Record<string, unknown>;
  ttlMs?: number;
}) {
  const reserved = reserveTrackingKey(options.dedupeKey, options.ttlMs);
  if (!reserved) return false;

  const visitorId = getOrCreateVisitorId();
  const body = JSON.stringify({
    ...options.payload,
    visitorId: visitorId || undefined,
  });

  const sendWithFetch = () =>
    fetch(options.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch((error) => void error);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(options.url, new Blob([body], { type: "application/json" }));
      if (sent) return true;
    }
  } catch (error) {
    void error;
  }

  void sendWithFetch();
  return true;
}
