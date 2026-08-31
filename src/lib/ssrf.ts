import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const PRIVATE_IP_PATTERNS: RegExp[] = [
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^::ffff:127\./i,
  /^::ffff:10\./i,
  /^::ffff:169\.254\./i,
  /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i,
  /^::ffff:192\.168\./i,
];

export function isPrivateOrReservedIp(ip: string): boolean {
  const normalized = ip.trim().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 0) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(normalized));
}

export async function hostIsBlocked(hostname: string): Promise<boolean> {
  const trimmed = hostname.trim().replace(/^\[|\]$/g, "");
  if (isIP(trimmed) !== 0) {
    return isPrivateOrReservedIp(trimmed);
  }
  try {
    const addresses = await lookup(trimmed, { all: true });
    if (!addresses || addresses.length === 0) return true;
    return addresses.some((entry) => isPrivateOrReservedIp(entry.address));
  } catch {
    return true;
  }
}
