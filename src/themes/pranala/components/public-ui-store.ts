"use client";

import { useSyncExternalStore } from "react";

export type PublicTheme = "light" | "dark";
export type PublicViewportDevice = "desktop" | "tablet" | "mobile";

let currentPublicTheme: PublicTheme = "light";
let currentViewportDevice: PublicViewportDevice = "desktop";
let themeObserver: MutationObserver | null = null;
let themeListening = false;
let viewportListener: (() => void) | null = null;
let viewportListening = false;
const themeSubscribers = new Set<() => void>();
const viewportSubscribers = new Set<() => void>();

function emit(subscribers: Set<() => void>) {
  subscribers.forEach((callback) => callback());
}

function resolvePublicTheme(): PublicTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("public-dark") ? "dark" : "light";
}

function resolveViewportDevice(): PublicViewportDevice {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth <= 1024) return "tablet";
  return "desktop";
}

function ensureThemeStore() {
  if (typeof document === "undefined" || themeListening) return;

  currentPublicTheme = resolvePublicTheme();
  themeObserver = new MutationObserver(() => {
    const nextValue = resolvePublicTheme();
    if (nextValue === currentPublicTheme) return;
    currentPublicTheme = nextValue;
    emit(themeSubscribers);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  themeListening = true;
}

function ensureViewportStore() {
  if (typeof window === "undefined" || viewportListening) return;

  currentViewportDevice = resolveViewportDevice();
  viewportListener = () => {
    const nextValue = resolveViewportDevice();
    if (nextValue === currentViewportDevice) return;
    currentViewportDevice = nextValue;
    emit(viewportSubscribers);
  };
  window.addEventListener("resize", viewportListener);
  viewportListening = true;
}

function subscribeTheme(callback: () => void) {
  if (typeof document === "undefined") return () => {};

  ensureThemeStore();
  themeSubscribers.add(callback);
  return () => {
    themeSubscribers.delete(callback);
    if (themeSubscribers.size === 0 && themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
      themeListening = false;
    }
  };
}

function subscribeViewport(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  ensureViewportStore();
  viewportSubscribers.add(callback);
  return () => {
    viewportSubscribers.delete(callback);
    if (viewportSubscribers.size === 0 && viewportListener) {
      window.removeEventListener("resize", viewportListener);
      viewportListener = null;
      viewportListening = false;
    }
  };
}

function getThemeSnapshot(): PublicTheme {
  if (typeof document === "undefined") return "light";
  ensureThemeStore();
  return currentPublicTheme;
}

function getViewportSnapshot(): PublicViewportDevice {
  if (typeof window === "undefined") return "desktop";
  ensureViewportStore();
  return currentViewportDevice;
}

export function usePublicThemeStore(): PublicTheme {
  return useSyncExternalStore<PublicTheme>(subscribeTheme, getThemeSnapshot, () => "light");
}

export function usePublicViewportStore(): PublicViewportDevice {
  return useSyncExternalStore<PublicViewportDevice>(subscribeViewport, getViewportSnapshot, () => "desktop");
}

export function applyPublicTheme(nextTheme: PublicTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("public-dark", nextTheme === "dark");
  currentPublicTheme = nextTheme;
  emit(themeSubscribers);

  try {
    localStorage.setItem("public-theme", nextTheme);
  } catch (error) {
    void error;
  }

  try {
    document.cookie = `public-theme=${encodeURIComponent(nextTheme)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  } catch (error) {
    void error;
  }
}
