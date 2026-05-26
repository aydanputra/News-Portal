import { NextResponse } from "next/server";
import path from "path";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { storage } from "@/lib/storage";
import { assertRateLimit } from "@/lib/api-guards";

export async function POST(request: Request) {
  try {
    // 1. Cek Auth
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, `media:upload:${user.id}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    // Verify user exists in DB
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
        return NextResponse.json({ error: "Sesi kadaluarsa (User tidak ditemukan). Silakan login ulang." }, { status: 401 });
    }

    // 2. Ambil File
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // 3. Validasi Tipe File
    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const docTypes = [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
        "application/x-zip-compressed"
    ];
    
    const isImage = imageTypes.includes(file.type);
    const isDoc = docTypes.includes(file.type);

    if (!isImage && !isDoc) {
      return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
    }

    // Max size: Image 5MB, Doc 10MB
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) { 
      return NextResponse.json({ error: `Ukuran file maksimal ${isImage ? '5MB' : '10MB'}` }, { status: 400 });
    }

    // 4. Siapkan Path Penyimpanan (YYYY/MM)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const keyDir = `uploads/${year}/${month}`;

    // 5. Processing
    const buffer = Buffer.from(await file.arrayBuffer());
    let finalBuffer: Buffer;
    let finalFileName: string;
    let finalMimeType: string;
    let width: number | null = null;
    let height: number | null = null;

    if (isImage) {
        try {
            // Sharp Processing for Images
            const pipeline = sharp(buffer);
            const metadata = await pipeline.metadata();
            
            finalBuffer = await pipeline
                .resize({ 
                    width: 1600, 
                    withoutEnlargement: true 
                })
                .webp({ quality: 80 }) 
                .toBuffer();
            
            finalFileName = `${uuidv4()}.webp`;
            finalMimeType = 'image/webp';
            width = metadata.width || null;
            height = metadata.height || null;

            // Recalculate dimensions after resize if needed (simplified: just keep original ratio or new width)
            if (width && width > 1600) {
                 const ratio = (metadata.height || 1) / width;
                 width = 1600;
                 height = Math.round(1600 * ratio);
            }

        } catch (sharpError) {
            console.error("Sharp processing failed, falling back to original file", sharpError);
            finalBuffer = buffer;
            const ext = path.extname(file.name);
            finalFileName = `${uuidv4()}${ext}`;
            finalMimeType = file.type;
        }
    } else {
        // Document Processing (Direct Save)
        finalBuffer = buffer;
        const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : "");
        finalFileName = `${uuidv4()}${ext}`;
        finalMimeType = file.type;
    }

    const key = `${keyDir}/${finalFileName}`;
    const fileUrl = await storage.upload(finalBuffer, key, finalMimeType);

    // 6. Simpan Metadata ke Database
    try {
      const media = await prisma.media.create({
        data: {
          fileName: file.name, // Original name for display
          fileUrl: fileUrl,
          fileType: finalMimeType,
          size: finalBuffer.length,
          width: width,   // Optional
          height: height, // Optional
          uploadedById: user.id // FIX: Use uploadedById instead of uploadedBy
        },
      });

      return NextResponse.json(media);
    } catch (dbError: any) {
        console.error("Database save failed:", dbError);
        try {
          await storage.delete(key);
        } catch (error) {
          console.error("Cleanup uploaded file failed:", error);
        }
        return NextResponse.json({ error: "Gagal menyimpan data ke database: " + dbError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
