
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathParts } = await params;
    
    // Security: Prevent directory traversal
    if (pathParts.some(part => part.includes('..') || part.includes('/') || part.includes('\\'))) {
        return new NextResponse('Invalid path', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathParts);

    if (!fs.existsSync(filePath)) {
        const publicBase = process.env.S3_PUBLIC_URL;
        if (publicBase) {
            const baseUrl = publicBase.endsWith('/') ? publicBase.slice(0, -1) : publicBase;
            const key = `uploads/${pathParts.join('/')}`;
            return NextResponse.redirect(`${baseUrl}/${key}`, 307);
        }
        console.error(`[UploadServe] File not found: ${filePath}`);
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        
        // Simple MIME type detection based on extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error("[UploadServe] Error serving file:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
