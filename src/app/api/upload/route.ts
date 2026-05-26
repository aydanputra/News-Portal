
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { storage } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });

    // Validasi MIME Type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Rename dengan UUID untuk keamanan
    const ext = file.name.split('.').pop() || 'bin';
    const key = `uploads/${uuidv4()}.${ext}`;

    // Upload ke S3
    const url = await storage.upload(file, key, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
