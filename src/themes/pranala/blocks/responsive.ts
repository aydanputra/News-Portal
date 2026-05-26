export type ResponsiveDevice = "desktop" | "tablet" | "mobile";
export type ResponsiveValues<T> = {
  desktop: T;
  tablet: T;
  mobile: T;
};

export const toResponsiveKey = (baseKey: string, device: ResponsiveDevice) => {
  if (device === "desktop") return baseKey;
  return `${device}${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`;
};

export const getResponsiveValue = <T = unknown>(
  config: Record<string, unknown>,
  baseKey: string,
  device: ResponsiveDevice
): T | undefined => {
  const baseValue = config[baseKey] as T | undefined;
  if (device === "desktop") return baseValue;
  const override = config[toResponsiveKey(baseKey, device)] as T | undefined;
  return override !== undefined ? override : baseValue;
};

export const getResponsiveBool = (
  config: Record<string, unknown>,
  baseKey: string,
  device: ResponsiveDevice,
  fallback: boolean
) => {
  const value = getResponsiveValue<unknown>(config, baseKey, device);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
};

export const getResponsiveValues = <T = unknown>(
  config: Record<string, unknown>,
  baseKey: string
): ResponsiveValues<T | undefined> => {
  const desktop = getResponsiveValue<T>(config, baseKey, "desktop");
  const tablet = getResponsiveValue<T>(config, baseKey, "tablet");
  const mobile = getResponsiveValue<T>(config, baseKey, "mobile");
  return { desktop, tablet, mobile };
};

export const getResponsiveBoolValues = (
  config: Record<string, unknown>,
  baseKey: string,
  fallback: boolean
): ResponsiveValues<boolean> => {
  const desktop = getResponsiveBool(config, baseKey, "desktop", fallback);
  const tablet = getResponsiveBool(config, baseKey, "tablet", desktop);
  const mobile = getResponsiveBool(config, baseKey, "mobile", desktop);
  return { desktop, tablet, mobile };
};

export const pickResponsiveValue = <T>(
  values: ResponsiveValues<T>,
  device: ResponsiveDevice
): T => {
  if (device === "mobile") return values.mobile;
  if (device === "tablet") return values.tablet;
  return values.desktop;
};
