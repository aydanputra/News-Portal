import crypto from "crypto";

function getKey(masterKey: string, namespace: string) {
  return crypto.scryptSync(masterKey, namespace, 32);
}

export function encryptSecret(plaintext: string, masterKey: string, namespace = "news-portal-secret") {
  const key = getKey(masterKey, namespace);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(ciphertextB64: string, masterKey: string, namespace = "news-portal-secret") {
  const key = getKey(masterKey, namespace);
  const payload = Buffer.from(ciphertextB64, "base64");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
