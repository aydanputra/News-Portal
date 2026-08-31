
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";
import { assertRateLimit } from "@/lib/api-guards";
import { requireUser } from "@/lib/server-auth";
import { detectImageType, IMAGE_EXTENSION_BY_TYPE } from "@/lib/upload-validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rl = assertRateLimit(request, `upload:${user.id}`, { windowMs: 60_000, max: 30 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });

    // Validasi MIME Type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validasi ukuran file (maks 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Validasi magic bytes (cek isi file, bukan hanya MIME dari client)
    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImageType(buffer);
    if (!detected) {
        return NextResponse.json({ error: "Invalid file content" }, { status: 400 });
    }

    // Ekstensi dari hasil deteksi magic bytes, bukan nama file
    const ext = IMAGE_EXTENSION_BY_TYPE[detected];
    const key = `uploads/${uuidv4()}${ext}`;

    // Upload ke S3
    const url = await storage.upload(buffer, key, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
