import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

// Utility to download image
async function downloadImage(url: string, uploadDir: string): Promise<{ url: string; filename: string; size: number; mime: string } | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        
        const buffer = await res.arrayBuffer();
        const size = buffer.byteLength;
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        
        // Try to get extension from URL or content-type
        let ext = path.extname(new URL(url).pathname);
        if (!ext || ext.length > 5) {
            if (contentType === 'image/jpeg') ext = '.jpg';
            else if (contentType === 'image/png') ext = '.png';
            else if (contentType === 'image/webp') ext = '.webp';
            else ext = '.jpg';
        }
        
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filepath, Buffer.from(buffer));
        
        return {
            url: `/uploads/imported/${filename}`,
            filename: filename,
            size: size,
            mime: contentType
        };
    } catch (error) {
        console.error(`Failed to download image: ${url}`, error);
        return null;
    }
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'scan') {
        try {
            // Fetch posts that might have images in content OR in 'image' field
            const posts = await prisma.post.findMany({
                where: {
                    OR: [
                        { content: { contains: '<img' } },
                        { image: { startsWith: 'http' } } // Only external images
                    ]
                },
                select: { id: true, content: true, image: true }
            });

            let totalImages = 0;
            let postsWithImages = 0;
            const externalDomains = new Set<string>();
            const myDomain = req.headers.get('host') || 'localhost';

            for (const post of posts) {
                let hasExternal = false;

                // 1. Check Content Images
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let match;
                while ((match = imgRegex.exec(post.content)) !== null) {
                    const src = match[1];
                    if (src.startsWith('http') && !src.includes(myDomain)) {
                        totalImages++;
                        hasExternal = true;
                        try {
                            const domain = new URL(src).hostname;
                            externalDomains.add(domain);
                        } catch {}
                    }
                }

                // 2. Check Featured Image (post.image)
                if (post.image && post.image.startsWith('http') && !post.image.includes(myDomain)) {
                    totalImages++;
                    hasExternal = true;
                    try {
                        const domain = new URL(post.image).hostname;
                        externalDomains.add(domain);
                    } catch {}
                }

                if (hasExternal) postsWithImages++;
            }

            return NextResponse.json({
                stats: {
                    total: totalImages,
                    postsWithImages,
                    externalDomains: Array.from(externalDomains)
                }
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'migrate') {
        try {
            const uploadDir = path.join(process.cwd(), 'public/uploads/imported');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const posts = await prisma.post.findMany({
                where: {
                    OR: [
                        { content: { contains: '<img' } },
                        { image: { startsWith: 'http' } }
                    ]
                },
                select: { id: true, content: true, image: true, title: true }
            });

            let processedCount = 0;
            const myDomain = req.headers.get('host') || 'localhost';

            // Find an admin user to assign as uploader
            const admin = await prisma.user.findFirst({
                where: { role: "ADMIN" }
            });
            const uploaderId = admin?.id || "system"; 

            for (const post of posts) {
                let newContent = post.content;
                let modified = false;

                // 1. Process Content Images
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let match;
                const imagesToDownload = [];

                // Collect all external images first
                while ((match = imgRegex.exec(post.content)) !== null) {
                    const src = match[1];
                    if (src.startsWith('http') && !src.includes(myDomain)) {
                        imagesToDownload.push(src);
                    }
                }

                // Process content images
                for (const src of imagesToDownload) {
                    const result = await downloadImage(src, uploadDir);
                    if (result) {
                        newContent = newContent.split(src).join(result.url);
                        modified = true;
                        processedCount++;
                        
                        try {
                            await prisma.media.create({
                                data: {
                                    fileName: result.filename,
                                    fileUrl: result.url,
                                    fileType: result.mime,
                                    size: result.size,
                                    uploadedById: uploaderId
                                }
                            });
                        } catch {}
                    }
                }

                // 2. Process Featured Image (post.image)
                if (post.image && post.image.startsWith('http') && !post.image.includes(myDomain)) {
                    const result = await downloadImage(post.image, uploadDir);
                    if (result) {
                        // Update post image
                        await prisma.post.update({
                            where: { id: post.id },
                            data: { image: result.url }
                        });
                        processedCount++;

                        // Create Media Record for Featured Image
                        try {
                            await prisma.media.create({
                                data: {
                                    fileName: result.filename,
                                    fileUrl: result.url,
                                    fileType: result.mime,
                                    size: result.size,
                                    uploadedById: uploaderId
                                }
                            });
                            
                            // Optional: Link media to post via featuredImageId if using that relation
                            // await prisma.post.update({ where: { id: post.id }, data: { featuredImageId: media.id } });
                            
                        } catch {}
                    }
                }

                if (modified) {
                    await prisma.post.update({
                        where: { id: post.id },
                        data: { content: newContent }
                    });
                }
            }

            return NextResponse.json({ processed: processedCount });

        } catch (error: any) {
            console.error("Migration error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
