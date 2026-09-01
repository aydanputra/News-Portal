
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import { env } from "@/lib/env";

export interface StorageProvider {
  upload(file: File | Buffer, key: string, mimeType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

export type StorageProviderName = "local" | "s3";

export class LocalStorage implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public");
  }

  private ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    if (!key || typeof key !== "string") {
      throw new Error("Invalid storage key");
    }
    // Reject path traversal, absolute paths, backslashes and null bytes.
    if (
      key.includes("..") ||
      key.includes("\\") ||
      key.includes("\0") ||
      path.isAbsolute(key)
    ) {
      throw new Error("Invalid storage key");
    }
    const root = path.resolve(this.uploadDir);
    const filePath = path.resolve(root, key);
    if (!filePath.startsWith(root + path.sep)) {
      throw new Error("Invalid storage key");
    }
    return filePath;
  }

  async upload(file: File | Buffer, key: string, _mimeType: string): Promise<string> {
    const filePath = this.resolveSafePath(key);
    this.ensureDir(filePath);

    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      buffer = Buffer.from(await file.arrayBuffer());
    }

    await writeFile(filePath, buffer);
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveSafePath(key);
    try {
      await unlink(filePath);
    } catch {
      console.warn("Failed to delete local file:", filePath);
    }
  }

  getPublicUrl(key: string): string {
    const cleanKey = key.startsWith('/') ? key : `/${key}`;
    return cleanKey;
  }
}

export class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private region: string;
  private endpoint?: string;
  private publicUrlBase?: string;

  constructor() {
    this.region = env.S3_REGION || "us-east-1";
    this.bucket = env.S3_BUCKET || "news-portal";
    this.endpoint = env.S3_ENDPOINT; // Optional for MinIO/R2
    this.publicUrlBase = env.S3_PUBLIC_URL; // e.g., https://pub-xxx.r2.dev

    const accessKeyId = env.S3_ACCESS_KEY;
    const secretAccessKey = env.S3_SECRET_KEY;
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "[Storage] S3 dipilih tetapi S3_ACCESS_KEY / S3_SECRET_KEY belum dikonfigurasi",
      );
    }

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: !!this.endpoint, // Needed for MinIO
    });
  }

  async upload(file: File | Buffer, key: string, mimeType: string): Promise<string> {
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      buffer = Buffer.from(await file.arrayBuffer());
    }
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // ACL: "public-read", // R2/S3 often disable ACLs by default, rely on bucket policy
    }));

    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  getPublicUrl(key: string): string {
    // If PUBLIC_URL is set (e.g. CloudFront/R2 domain), use it
    if (this.publicUrlBase) {
        const baseUrl = this.publicUrlBase.endsWith('/') ? this.publicUrlBase.slice(0, -1) : this.publicUrlBase;
        const cleanKey = key.startsWith('/') ? key.slice(1) : key;
        return `${baseUrl}/${cleanKey}`;
    }
    
    // Fallback to S3 standard URL
    if (this.endpoint) {
        // MinIO / Custom Endpoint
        return `${this.endpoint}/${this.bucket}/${key}`;
    }
    
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

function resolveStorageProviderName(): StorageProviderName {
  const explicitProvider = String(env.STORAGE_PROVIDER || "").trim().toLowerCase();
  if (explicitProvider === "local") return "local";
  if (explicitProvider === "s3") return "s3";

  // Backward-compatible fallback: if old S3 envs are still present, keep honoring them.
  return env.S3_ACCESS_KEY ? "s3" : "local";
}

export function getStorageKeyFromUrl(fileUrl: string): string | null {
  const raw = String(fileUrl || "").trim();
  if (!raw) return null;

  if (raw.startsWith("/uploads/")) {
    return raw.replace(/^\/+/, "");
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname.replace(/^\/+/, "");
    }

    const publicBase = String(env.S3_PUBLIC_URL || "").trim();
    if (publicBase) {
      const normalizedBase = publicBase.endsWith("/") ? publicBase.slice(0, -1) : publicBase;
      if (raw.startsWith(normalizedBase + "/")) {
        return raw.slice(normalizedBase.length + 1);
      }
    }
  } catch {
    return null;
  }

  return null;
}

const storageProviderName = resolveStorageProviderName();
console.log(
  `[Storage] Initializing storage provider: ${
    storageProviderName === "s3" ? "S3-compatible" : "Local Filesystem"
  }`,
);

export const storage = storageProviderName === "s3" ? new S3Storage() : new LocalStorage();
