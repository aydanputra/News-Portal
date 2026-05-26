export type ConfigValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

type ConfigGetter<TBlock> = (block: TBlock, key: string) => unknown;
type KeyGetter = (key: string) => unknown;

export function createConfigReaders<TBlock>(block: TBlock, getConfigValue: ConfigGetter<TBlock>) {
  const getConfigRaw = (key: string): unknown => getConfigValue(block, key);

  const getConfigString = (key: string, fallback = ""): string => {
    const value = getConfigRaw(key);
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return fallback;
  };

  const getConfigNumber = (key: string): number | undefined => {
    const value = getConfigRaw(key);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const getConfigBool = (key: string, fallback = false): boolean => {
    const value = getConfigRaw(key);
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    if (typeof value === "number") return value === 1;
    return fallback;
  };

  const getConfigForApply = (key: string): ConfigValue | undefined => {
    const value = getConfigRaw(key);
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return value as Record<string, unknown>;
    return undefined;
  };

  return {
    getConfigRaw,
    getConfigString,
    getConfigNumber,
    getConfigBool,
    getConfigForApply,
  };
}

export function createConfigReadersByKey(getValue: KeyGetter) {
  const getConfigRaw = (key: string): unknown => getValue(key);

  const getConfigString = (key: string, fallback = ""): string => {
    const value = getConfigRaw(key);
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return fallback;
  };

  const getConfigNumber = (key: string): number | undefined => {
    const value = getConfigRaw(key);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const getConfigBool = (key: string, fallback = false): boolean => {
    const value = getConfigRaw(key);
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    if (typeof value === "number") return value === 1;
    return fallback;
  };

  const getConfigForApply = (key: string): ConfigValue | undefined => {
    const value = getConfigRaw(key);
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return value as Record<string, unknown>;
    return undefined;
  };

  return {
    getConfigRaw,
    getConfigString,
    getConfigNumber,
    getConfigBool,
    getConfigForApply,
  };
}
