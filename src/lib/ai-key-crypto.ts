import crypto from "crypto";

// Enkripsi/deskripsi AI key (OpenAI) dengan salt acak per record.
// Format baru: "v2:" + base64(salt(16) + iv(12) + tag(16) + ciphertext).
// Format lama (legacy) tetap didukung untuk dekripsi data yang sudah tersimpan.

const LEGACY_SALT = "news-portal-ai-openai";
const V2_PREFIX = "v2:";

function deriveKey(masterKey: string, salt: string | Buffer): Buffer {
  return crypto.scryptSync(masterKey, salt, 32);
}

export function encryptAiKey(plaintext: string, masterKey: string): string {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(masterKey, salt);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([salt, iv, tag, ciphertext]);
  return V2_PREFIX + payload.toString("base64");
}

export function decryptAiKey(ciphertextB64: string, masterKey: string): string {
  const raw = String(ciphertextB64 || "");

  if (raw.startsWith(V2_PREFIX)) {
    const payload = Buffer.from(raw.slice(V2_PREFIX.length), "base64");
    const salt = payload.subarray(0, 16);
    const iv = payload.subarray(16, 28);
    const tag = payload.subarray(28, 44);
    const ciphertext = payload.subarray(44);
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(masterKey, salt), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  }

  // Legacy fallback: salt konstanta.
  const payload = Buffer.from(raw, "base64");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(masterKey, LEGACY_SALT), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
