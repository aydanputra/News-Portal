
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import https from "https";
import { storage } from "@/lib/storage";

// Helper untuk fetch buffer
const fetchBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: any[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
};

// Helper untuk fetch text
const fetchText = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fontName } = await request.json();
    if (!fontName) {
        return NextResponse.json({ error: "Nama font diperlukan" }, { status: 400 });
    }

    const cleanName = fontName.toLowerCase().replace(/ /g, '-');
    
    // 1. Fetch CSS dari Google Fonts (display=block)
    const googleApiUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=block`;
    const cssContent = await fetchText(googleApiUrl);

    // 2. Parse URL WOFF2 dan Upload ke S3
    const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
    let match;
    const uploads = [];
    let fileCounter = 0;
    let localCssContent = cssContent;

    // Loop semua font file
    while ((match = urlRegex.exec(cssContent)) !== null) {
        const remoteUrl = match[1];
        const ext = '.woff2'; // Google Fonts usually returns woff2
        const filename = `font-${fileCounter}${ext}`;
        const key = `fonts/${cleanName}/${filename}`;

        // Replace URL di CSS dengan Public URL S3
        // Kita butuh tahu Public URL sebelum upload? 
        // storage.getPublicUrl() bersifat deterministik (synchronous generation)
        const publicUrl = storage.getPublicUrl(key);
        localCssContent = localCssContent.replace(remoteUrl, publicUrl);

        // Fetch & Upload Async
        uploads.push((async () => {
            const buffer = await fetchBuffer(remoteUrl);
            await storage.upload(buffer, key, "font/woff2");
        })());
        
        fileCounter++;
    }

    await Promise.all(uploads);

    // 3. Upload CSS File ke S3
    const cssKey = `fonts/${cleanName}/style.css`;
    await storage.upload(Buffer.from(localCssContent), cssKey, "text/css");
    const cssPublicUrl = storage.getPublicUrl(cssKey);

    return NextResponse.json({ 
        success: true, 
        message: `Font ${fontName} berhasil di-cache ke Object Storage.`,
        localPath: cssPublicUrl // Frontend harus menggunakan URL ini
    });

  } catch (error: any) {
    console.error("Download Font Error:", error);
    return NextResponse.json({ error: "Gagal download font: " + error.message }, { status: 500 });
  }
}
