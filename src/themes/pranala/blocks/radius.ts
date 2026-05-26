export function resolveWidgetRadius(
  value: unknown,
  fallback = "var(--home-main-box-radius, 0.75rem)"
): string {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) return fallback;
    if (value === 0) return "0";
    return `${value}px`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const lower = trimmed.toLowerCase();

    if (lower === "default" || lower === "global" || lower === "-1") return fallback;
    if (lower === "none") return "0";
    if (lower === "sm") return "0.125rem";
    if (lower === "md") return "0.375rem";
    if (lower === "lg") return "0.5rem";
    if (lower === "xl") return "0.75rem";
    if (lower === "2xl") return "1rem";
    if (lower === "full") return "9999px";

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) return fallback;
      if (parsed === 0) return "0";
      return `${parsed}px`;
    }

    return trimmed;
  }

  return fallback;
}
