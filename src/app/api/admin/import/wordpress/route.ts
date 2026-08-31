import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";
import { Role, PostStatus, PostType } from "@prisma/client";
import fs from "fs";
import path from "path";
import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";
import { normalizeRedirectPath } from "@/lib/redirects";

// Simple slugify fallback if utils doesn't have it
function simpleSlugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

function getXmlScalarValue(input: any): string {
    if (typeof input === "string") return input.trim();
    if (input && typeof input === "object" && typeof input._ === "string") return input._.trim();
    return "";
}

function getLegacyPostPath(item: any): string {
    const link = getXmlScalarValue(item?.link?.[0]);
    if (link) return normalizeRedirectPath(link);

    const guid = getXmlScalarValue(item?.guid?.[0]);
    if (guid) return normalizeRedirectPath(guid);

    return "";
}

function isValidDate(value: Date) {
    return !Number.isNaN(value.getTime());
}

// #region debug-point A:wp-import-formdata-logger
async function reportWpImportDebug(
    hypothesisId: string,
    location: string,
    msg: string,
    data: Record<string, unknown>,
    traceId: string,
) {
    try {
        const envPath = path.join(process.cwd(), ".dbg", "wp-import-formdata.env");
        let url = "http://127.0.0.1:7777/event";
        let sessionId = "wp-import-formdata";
        if (fs.existsSync(envPath)) {
            const envText = fs.readFileSync(envPath, "utf8");
            url = envText.match(/DEBUG_SERVER_URL=(.+)/)?.[1]?.trim() || url;
            sessionId = envText.match(/DEBUG_SESSION_ID=(.+)/)?.[1]?.trim() || sessionId;
        }
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId,
                runId: "pre-fix",
                hypothesisId,
                location,
                msg: `[DEBUG] ${msg}`,
                data,
                traceId,
                ts: Date.now(),
            }),
        }).catch(() => {});
    } catch {}
}
// #endregion

// Advanced WP Auto Paragraph function
function wpAutoP(content: string) {
    if (!content) return '';
    
    // 1. Normalize line endings
    const text = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Handle Gutenberg Blocks (if any)
    // If text contains Gutenberg comments <!-- wp:paragraph -->, we might want to strip them or trust them
    // For now, let's treat them as standard text but ensure newlines are respected.

    // 3. Pre-process Block Tags to avoid wrapping them in <p>
    // List of block tags that should NOT be wrapped in <p>
    const blockTags = '(table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary)';
    
    // We add a temporary placeholder for block tags to protect them from splitting
    // This is a simplified approach. A full parser would be better but heavier.
    
    // Split by double newlines to find "paragraphs"
    const chunks = text.split(/\n\s*\n/);
    let output = '';
    const blockRegex = new RegExp(`^<${blockTags}[^>]*>`, 'i');

    for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        // Check if this chunk starts with a block tag
        const isBlock = blockRegex.test(chunk.trim());
        
        if (isBlock) {
            output += chunk + '\n\n';
        } else {
            // It's a text paragraph.
            // Replace single newlines with <br> within this paragraph
            const withBr = chunk.replace(/\n/g, '<br />\n');
            output += `<p>${withBr}</p>\n`;
        }
    }
    
    return output.trim();
}

export async function POST(req: NextRequest) {
    const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
        const admin = await requireAdmin();
        if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!(await isToolEnabledForRequest(req, "wp_import"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const rl = assertRateLimit(req, "tools:wp_import", { windowMs: 60_000, max: 5 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: "Too Many Requests" },
                { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
            );
        }

        // #region debug-point B:before-formdata
        await reportWpImportDebug(
            "B",
            "src/app/api/admin/import/wordpress/route.ts:before-formdata",
            "about to parse multipart body",
            {
                method: req.method,
                pathname: req.nextUrl.pathname,
                contentType: req.headers.get("content-type"),
                contentLength: req.headers.get("content-length"),
            },
            traceId,
        );
        // #endregion
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const mode = formData.get("mode") as string; // 'analyze' | 'import'

        // #region debug-point C:after-formdata
        await reportWpImportDebug(
            "C",
            "src/app/api/admin/import/wordpress/route.ts:after-formdata",
            "multipart body parsed successfully",
            {
                mode,
                hasFile: Boolean(file),
                fileName: file?.name || null,
                fileType: file?.type || null,
                fileSize: typeof file?.size === "number" ? file.size : null,
            },
            traceId,
        );
        // #endregion

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const xmlText = await file.text();
        // #region debug-point D:after-file-text
        await reportWpImportDebug(
            "D",
            "src/app/api/admin/import/wordpress/route.ts:after-file-text",
            "xml text loaded",
            {
                mode,
                fileName: file.name,
                xmlLength: xmlText.length,
            },
            traceId,
        );
        // #endregion
        const result = await parseStringPromise(xmlText);

        if (!result.rss || !result.rss.channel || !result.rss.channel[0]) {
            return NextResponse.json({ error: "Invalid WordPress XML format" }, { status: 400 });
        }

        const channel = result.rss.channel[0];
        const items = channel.item || [];

        // --- PRE-PROCESSING FOR ATTACHMENTS (FEATURED IMAGES) ---
        // Map: Attachment Post ID -> URL
        const attachmentMap = new Map<string, string>();
        
        for (const item of items) {
            const postType = item['wp:post_type']?.[0];
            const postId = item['wp:post_id']?.[0];
            const attachmentUrl = item['wp:attachment_url']?.[0];
            
            if (postType === 'attachment' && postId && attachmentUrl) {
                attachmentMap.set(postId, attachmentUrl);
            }
        }

        // Statistics
        const stats = {
            posts: 0,
            pages: 0,
            categories: 0,
            tags: 0,
            authors: 0
        };

        const postsToImport: any[] = [];
        const authorsToImport = new Set<string>();
        const categoriesToImport = new Set<string>();
        const tagsToImport = new Set<string>();

        // Pre-process items for posts
        for (const item of items) {
            const postType = item['wp:post_type']?.[0];
            if (postType === 'post') {
                stats.posts++;
                postsToImport.push(item);
            } else if (postType === 'page') {
                stats.pages++;
            }

            // Collect Authors
            const creator = item['dc:creator']?.[0];
            if (creator) authorsToImport.add(creator);

            // Collect Categories & Tags
            if (item.category) {
                for (const cat of item.category) {
                    const domain = cat.$.domain;
                    const name = cat._;
                    if (domain === 'category') {
                        categoriesToImport.add(name);
                        stats.categories++;
                    } else if (domain === 'post_tag') {
                        tagsToImport.add(name);
                        stats.tags++;
                    }
                }
            }
        }
        stats.authors = authorsToImport.size;

        // MODE: ANALYZE
        if (mode === 'analyze') {
            return NextResponse.json({ 
                success: true, 
                analysis: stats 
            });
        }

        // MODE: IMPORT
        if (mode === 'import') {
            let importedCount = 0;
            let redirectCreatedCount = 0;
            let redirectSkippedCount = 0;
            let skippedDuplicateCount = 0;
            const skippedDuplicates: string[] = [];

            // Ensure upload directory exists
            const uploadDir = path.join(process.cwd(), 'public/uploads/imported');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // 1. Process Authors
            const authorMap = new Map<string, string>(); // username -> userId
            for (const authorName of Array.from(authorsToImport)) {
                // Check if user exists
                let user = await prisma.user.findFirst({
                    where: { 
                        OR: [
                            { name: authorName },
                            { email: `${simpleSlugify(authorName)}@imported.temp` }
                        ]
                    }
                });

                if (!user) {
                    // Create dummy user
                    user = await prisma.user.create({
                        data: {
                            name: authorName,
                            email: `${simpleSlugify(authorName)}@imported.temp`,
                            password: "temp-password-change-me", // Todo: Hash this properly if using real auth
                            role: Role.WRITER,
                        }
                    });
                }
                authorMap.set(authorName, user.id);
            }

            // 2. Process Categories
            const categoryMap = new Map<string, { id: string; slug: string }>(); // name -> category info
            // Ensure "Uncategorized" exists
            let defaultCategory = await prisma.category.findFirst({ where: { slug: 'uncategorized' } });
            if (!defaultCategory) {
                defaultCategory = await prisma.category.create({
                    data: { name: "Uncategorized", slug: "uncategorized" }
                });
            }
            categoryMap.set("Uncategorized", { id: defaultCategory.id, slug: defaultCategory.slug });

            for (const catName of Array.from(categoriesToImport)) {
                const slug = simpleSlugify(catName);
                let category = await prisma.category.findUnique({ where: { slug } });
                
                if (!category) {
                    category = await prisma.category.create({
                        data: { name: catName, slug }
                    });
                }
                categoryMap.set(catName, { id: category.id, slug: category.slug });
            }

            // 4. Process Posts
            for (const item of postsToImport) {
                try {
                    const title = item.title?.[0] || "Untitled";
                    const wpSlug = item['wp:post_name']?.[0] || simpleSlugify(title);
                    const date = item['wp:post_date']?.[0] ? new Date(item['wp:post_date']?.[0]) : new Date();
                    const status = item['wp:status']?.[0] === 'publish' ? PostStatus.PUBLISHED : PostStatus.DRAFT;
                    const legacyPath = getLegacyPostPath(item);
                    
                    const authorName = item['dc:creator']?.[0];
                    let authorId = authorMap.get(authorName);
                    
                    if (!authorId) {
                        // Fallback: Use the first author in the map, or create a default 'Admin' if map is empty
                        if (authorMap.size > 0) {
                            authorId = authorMap.values().next().value;
                        } else {
                            // Emergency fallback: Create a default admin user
                            const defaultAdmin = await prisma.user.upsert({
                                where: { email: 'admin@imported.temp' },
                                update: {},
                                create: {
                                    name: 'Admin Import',
                                    email: 'admin@imported.temp',
                                    password: 'admin-password',
                                    role: Role.ADMIN
                                }
                            });
                            authorId = defaultAdmin.id;
                        }
                    }

                    if (!authorId) {
                        console.error("Skipping post due to missing author:", title);
                        continue;
                    }

                    // Find Categories
                    let categoryId = defaultCategory?.id;
                    let categorySlug = defaultCategory?.slug || "uncategorized";
                    const itemCats = item.category || [];
                    for (const cat of itemCats) {
                        if (cat.$ && cat.$.domain === 'category' && categoryMap.has(cat._)) {
                            const mappedCategory = categoryMap.get(cat._)!;
                            categoryId = mappedCategory.id;
                            categorySlug = mappedCategory.slug;
                            break; 
                        }
                    }

                    if (!categoryId) {
                         // Fallback to Uncategorized if not found in map
                         categoryId = defaultCategory!.id;
                         categorySlug = defaultCategory!.slug;
                    }

                    let finalSlug = wpSlug;
                    if (!finalSlug || finalSlug.length === 0) {
                        finalSlug = `post-${Math.random().toString(36).substring(7)}`;
                    }

                    const duplicateReasons: string[] = [];

                    const existingSlugPost = await prisma.post.findUnique({
                        where: { slug: finalSlug },
                        select: { id: true },
                    });
                    if (existingSlugPost) {
                        duplicateReasons.push(`slug ${finalSlug}`);
                    }

                    if (title && isValidDate(date)) {
                        const existingSameTitleAndDate = await prisma.post.findFirst({
                            where: status === PostStatus.PUBLISHED
                                ? {
                                    title,
                                    publishedAt: date,
                                }
                                : {
                                    title,
                                    createdAt: date,
                                },
                            select: { id: true },
                        });
                        if (existingSameTitleAndDate) {
                            duplicateReasons.push(
                                status === PostStatus.PUBLISHED
                                    ? "judul + tanggal publish"
                                    : "judul + tanggal buat"
                            );
                        }
                    }

                    if (duplicateReasons.length > 0) {
                        skippedDuplicateCount++;
                        if (skippedDuplicates.length < 10) {
                            skippedDuplicates.push(`${title} [${duplicateReasons.join(", ")}]`);
                        }
                        console.warn(`Skipping duplicate import: ${title}`, duplicateReasons);
                        continue;
                    }

                    // Prepare Tags
                    const tagsToConnect = itemCats
                        .filter((c: any) => c.$ && c.$.domain === 'post_tag')
                        .map((t: any) => ({
                            where: { slug: simpleSlugify(t._) },
                            create: { name: t._, slug: simpleSlugify(t._) }
                        }));

                    // --- FIND FEATURED IMAGE ---
                    // Look for meta key _thumbnail_id
                    let featuredImageUrl = null;
                    if (item['wp:postmeta']) {
                        for (const meta of item['wp:postmeta']) {
                            if (meta['wp:meta_key']?.[0] === '_thumbnail_id') {
                                const thumbId = meta['wp:meta_value']?.[0];
                                if (thumbId && attachmentMap.has(thumbId)) {
                                    featuredImageUrl = attachmentMap.get(thumbId);
                                }
                                break;
                            }
                        }
                    }

                    // Create Post
                    const contentRaw = item['content:encoded']?.[0] || "";
                    const content = wpAutoP(contentRaw);

                    const excerptRaw = item['excerpt:encoded']?.[0] || "";
                    // Generate robust plain-text excerpt:
                    // 1) Prefer WordPress excerpt if provided
                    // 2) Otherwise, derive from content (raw) by stripping HTML and truncating
                    const toPlain = (html: string) => {
                        if (!html) return "";
                        // Remove shortcodes like [gallery], [caption], etc.
                        let text = html.replace(/\[[^\]]+\]/g, " ");
                        // Strip HTML tags
                        text = text.replace(/<[^>]+>/g, " ");
                        // Decode a few common entities
                        text = text.replace(/&nbsp;/g, " ")
                                   .replace(/&amp;/g, "&")
                                   .replace(/&lt;/g, "<")
                                   .replace(/&gt;/g, ">")
                                   .replace(/&quot;/g, "\"")
                                   .replace(/&#39;/g, "'");
                        // Collapse whitespace
                        text = text.replace(/\s+/g, " ").trim();
                        return text;
                    };
                    const makeExcerpt = (text: string, limit = 160) => {
                        if (!text) return "";
                        if (text.length <= limit) return text;
                        return text.slice(0, limit).trim() + "…";
                    };
                    const baseExcerptSource = excerptRaw && excerptRaw.trim().length > 0 ? excerptRaw : contentRaw;
                    const excerpt = makeExcerpt(toPlain(baseExcerptSource), 180);

                    // We will store the remote URL for now. 
                    // The "Media Migrator" tool will later download it and update this field.
                    
                    const createdPost = await prisma.post.create({
                        data: {
                            title,
                            slug: finalSlug,
                            content, 
                            excerpt,
                            status,
                            published: status === PostStatus.PUBLISHED,
                            publishedAt: status === PostStatus.PUBLISHED ? date : null,
                            createdAt: date,
                            authorId: authorId,
                            categoryId: categoryId,
                            type: PostType.ARTICLE,
                            // If we found a featured image URL, store it in the 'image' field (assuming it's a string)
                            // Or create a Media relation if your schema supports it.
                            // For now, putting it in 'image' is the safest bet for existing architecture.
                            image: featuredImageUrl || undefined, 
                            tags: tagsToConnect.length > 0 ? {
                                connectOrCreate: tagsToConnect
                            } : undefined
                        }
                    });

                    const newPath = normalizeRedirectPath(`/${categorySlug}/${finalSlug}`);
                    if (status === PostStatus.PUBLISHED && legacyPath && legacyPath !== newPath) {
                        const existingRedirect = await prisma.redirectRule.findUnique({
                            where: { oldPath: legacyPath },
                            select: { id: true, note: true, newPath: true, statusCode: true, isActive: true },
                        });

                        if (existingRedirect) {
                            const isAutoImportRedirect = typeof existingRedirect.note === "string" && existingRedirect.note.startsWith("Auto import WordPress:");
                            if (isAutoImportRedirect) {
                                await prisma.redirectRule.update({
                                    where: { id: existingRedirect.id },
                                    data: {
                                        newPath,
                                        statusCode: 301,
                                        isActive: true,
                                        note: `Auto import WordPress: ${createdPost.title}`,
                                    },
                                });
                                redirectCreatedCount++;
                            } else {
                                redirectSkippedCount++;
                            }
                        } else {
                            await prisma.redirectRule.create({
                                data: {
                                    oldPath: legacyPath,
                                    newPath,
                                    statusCode: 301,
                                    isActive: true,
                                    note: `Auto import WordPress: ${createdPost.title}`,
                                },
                            });
                            redirectCreatedCount++;
                        }
                    }

                    importedCount++;
                } catch (err) {
                    console.error("Failed to import post:", item.title?.[0], err);
                }
            }

            return NextResponse.json({ 
                success: true, 
                importedCount,
                skippedDuplicateCount,
                skippedDuplicates,
                redirectCreatedCount,
                redirectSkippedCount,
            });
        }

        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });

    } catch (error: any) {
        // #region debug-point E:catch
        await reportWpImportDebug(
            "E",
            "src/app/api/admin/import/wordpress/route.ts:catch",
            "import route failed",
            {
                errorName: error instanceof Error ? error.name : typeof error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : null,
            },
            traceId,
        );
        // #endregion
        console.error("Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
