
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { writeFile, unlink } from "fs/promises";

export interface StorageProvider {
  upload(file: File | Buffer, key: string, mimeType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

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

  async upload(file: File | Buffer, key: string, _mimeType: string): Promise<string> {
    const filePath = path.join(this.uploadDir, key);
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
    const filePath = path.join(this.uploadDir, key);
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
    this.region = process.env.S3_REGION || "us-east-1";
    this.bucket = process.env.S3_BUCKET || "news-portal";
    this.endpoint = process.env.S3_ENDPOINT; // Optional for MinIO/R2
    this.publicUrlBase = process.env.S3_PUBLIC_URL; // e.g., https://pub-xxx.r2.dev

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "dummy",
        secretAccessKey: process.env.S3_SECRET_KEY || "dummy",
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

// Singleton Instance Factory
// If S3_ACCESS_KEY is present, assume S3 is configured. Otherwise use LocalStorage.
const isS3Configured = !!process.env.S3_ACCESS_KEY;
console.log(`[Storage] Initializing storage provider: ${isS3Configured ? "S3" : "Local Filesystem"}`);

export const storage = isS3Configured ? new S3Storage() : new LocalStorage();
