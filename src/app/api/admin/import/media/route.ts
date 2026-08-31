import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";

type DownloadedImage = { url: string; filename: string; size: number; mime: string };

function normalizeHostname(value: string): string {
    return value.trim().toLowerCase().replace(/:\d+$/, '');
}

function isLoopbackHost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
}

function addEquivalentHosts(target: Set<string>, rawHost: string | null | undefined) {
    if (!rawHost) return;
    const normalized = normalizeHostname(rawHost);
    if (!normalized) return;

    target.add(normalized);
    if (normalized.startsWith('www.')) {
        target.add(normalized.slice(4));
    } else if (!isLoopbackHost(normalized)) {
        target.add(`www.${normalized}`);
    }
}

function extractHostnameFromAbsoluteUrl(value: string): string | null {
    const raw = value.trim();
    if (!raw) return null;

    const normalizedUrl = raw.startsWith('//') ? `https:${raw}` : raw;
    if (!/^https?:\/\//i.test(normalizedUrl)) return null;

    try {
        return normalizeHostname(new URL(normalizedUrl).hostname);
    } catch {
        return null;
    }
}

function getLocalHostnames(req: NextRequest): Set<string> {
    const localHosts = new Set<string>();
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const configuredHost = configuredUrl ? extractHostnameFromAbsoluteUrl(configuredUrl) : null;

    addEquivalentHosts(localHosts, configuredHost);

    const hostHeader = req.headers.get('host');
    const requestHost = hostHeader ? normalizeHostname(hostHeader) : "";
    if (requestHost && (isLoopbackHost(requestHost) || localHosts.has(requestHost))) {
        addEquivalentHosts(localHosts, requestHost);
    }

    addEquivalentHosts(localHosts, 'localhost');
    addEquivalentHosts(localHosts, '127.0.0.1');

    return localHosts;
}

function isExternalImageUrl(value: string, localHosts: Set<string>): boolean {
    const raw = value.trim();
    if (!raw || raw.startsWith('/') || raw.startsWith('data:') || raw.startsWith('blob:')) {
        return false;
    }

    const hostname = extractHostnameFromAbsoluteUrl(raw);
    if (!hostname) return false;

    return !localHosts.has(hostname);
}

function extractExternalImageUrlsFromContent(content: string, localHosts: Set<string>): string[] {
    if (!content) return [];

    const urls = new Set<string>();
    const tagRegex = /<(img|source)\b[^>]*>/gi;
    let tagMatch: RegExpExecArray | null;

    while ((tagMatch = tagRegex.exec(content)) !== null) {
        const tag = tagMatch[0];

        const attributeRegex = /\b(?:src|data-src|data-lazy-src|data-original)\s*=\s*(['"])(.*?)\1/gi;
        let attributeMatch: RegExpExecArray | null;
        while ((attributeMatch = attributeRegex.exec(tag)) !== null) {
            const candidate = attributeMatch[2]?.trim();
            if (candidate && isExternalImageUrl(candidate, localHosts)) {
                urls.add(candidate);
            }
        }

        const srcsetRegex = /\bsrcset\s*=\s*(['"])(.*?)\1/gi;
        let srcsetMatch: RegExpExecArray | null;
        while ((srcsetMatch = srcsetRegex.exec(tag)) !== null) {
            const entries = srcsetMatch[2]
                .split(',')
                .map((entry) => entry.trim().split(/\s+/)[0])
                .filter(Boolean);

            for (const entry of entries) {
                if (isExternalImageUrl(entry, localHosts)) {
                    urls.add(entry);
                }
            }
        }
    }

    return Array.from(urls);
}

function collectExternalImageSources(post: { content: string; image: string | null }, localHosts: Set<string>) {
    const contentImages = extractExternalImageUrlsFromContent(post.content, localHosts);
    const featuredImage = post.image && isExternalImageUrl(post.image, localHosts) ? post.image : null;

    return {
        contentImages,
        featuredImage,
    };
}

async function resolveUploaderId() {
    const privilegedUser = await prisma.user.findFirst({
        where: {
            role: { in: ["SUPER_ADMIN", "ADMIN"] },
            deletedAt: null,
        },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
    });

    if (privilegedUser?.id) return privilegedUser.id;

    const fallbackUser = await prisma.user.findFirst({
        where: { deletedAt: null },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
    });

    if (!fallbackUser?.id) {
        throw new Error("Tidak ada user aktif untuk dicatat sebagai uploader media.");
    }

    return fallbackUser.id;
}

// Utility to download image
async function downloadImage(url: string, uploadDir: string): Promise<DownloadedImage | null> {
    try {
        const normalizedUrl = url.startsWith('//') ? `https:${url}` : url;
        const res = await fetch(normalizedUrl);
        if (!res.ok) return null;
        
        const buffer = await res.arrayBuffer();
        const size = buffer.byteLength;
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        
        // Try to get extension from URL or content-type
        let ext = path.extname(new URL(normalizedUrl).pathname);
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
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isToolEnabledForRequest(req, "media_migration"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const rl = assertRateLimit(req, "tools:media_scan", { windowMs: 60_000, max: 30 });
    if (!rl.ok) {
        return NextResponse.json(
            { error: "Too Many Requests" },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
        );
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'scan') {
        try {
            // Fetch posts that might have images in content OR in 'image' field
            const posts = await prisma.post.findMany({
                where: {
                    OR: [
                        { content: { contains: '<img' } },
                        { content: { contains: '<source' } },
                        { content: { contains: 'srcset=' } },
                        { content: { contains: 'data-src=' } },
                        { image: { startsWith: 'http' } },
                        { image: { startsWith: '//' } }
                    ]
                },
                select: { id: true, content: true, image: true }
            });

            let totalImages = 0;
            let postsWithImages = 0;
            const externalDomains = new Set<string>();
            const localHosts = getLocalHostnames(req);

            for (const post of posts) {
                const sources = collectExternalImageSources(post, localHosts);
                const allExternalImages = [
                    ...sources.contentImages,
                    ...(sources.featuredImage ? [sources.featuredImage] : []),
                ];

                const hasExternal = allExternalImages.length > 0;
                totalImages += allExternalImages.length;

                for (const imageUrl of allExternalImages) {
                    const domain = extractHostnameFromAbsoluteUrl(imageUrl);
                    if (domain) {
                        externalDomains.add(domain);
                    }
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
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isToolEnabledForRequest(req, "media_migration"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const rl = assertRateLimit(req, "tools:media_migrate", { windowMs: 60_000, max: 5 });
    if (!rl.ok) {
        return NextResponse.json(
            { error: "Too Many Requests" },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
        );
    }

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
                        { content: { contains: '<source' } },
                        { content: { contains: 'srcset=' } },
                        { content: { contains: 'data-src=' } },
                        { image: { startsWith: 'http' } },
                        { image: { startsWith: '//' } }
                    ]
                },
                select: { id: true, content: true, image: true, title: true }
            });

            let processedCount = 0;
            const localHosts = getLocalHostnames(req);

            // Find an admin user to assign as uploader
            const uploaderId = await resolveUploaderId();

            for (const post of posts) {
                let newContent = post.content;
                let modified = false;

                const sources = collectExternalImageSources(post, localHosts);

                // Process content images
                for (const src of sources.contentImages) {
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
                        } catch (error) {
                            console.error("[import/media] Failed to save media record:", error);
                        }
                    }
                }

                // 2. Process Featured Image (post.image)
                if (sources.featuredImage) {
                    const result = await downloadImage(sources.featuredImage, uploadDir);
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
                            
                        } catch (error) {
                            console.error("[import/media] Failed to save featured media record:", error);
                        }
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
