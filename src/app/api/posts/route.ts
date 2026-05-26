import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getYouTubeThumbnailUrl, slugify } from "@/lib/utils";
import { cookies } from "next/headers";
import { PostType, PostStatus, Prisma } from "@prisma/client";
import { logActivity } from "@/lib/audit";
import { resolvePostTransition } from "@/lib/post-workflow";
import { sanitizeContent } from "@/lib/sanitizer";
import { validatePost } from "@/lib/validators/postValidator";
import { revalidateTag } from "next/cache";

function toPlain(html: string): string {
  if (!html) return "";
  let text = html.replace(/\[[^\]]+\]/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function makeExcerpt(text: string, limit = 180): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + "…";
}

// GET: Ambil daftar berita
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limitRaw = parseInt(searchParams.get("limit") || "25");
    const limit = Number.isFinite(limitRaw) ? Math.min(200, Math.max(1, limitRaw)) : 25;
    const skip = (page - 1) * limit;
    const statusParam = (searchParams.get("status") || "all").toLowerCase();
    const categoryParam = (searchParams.get("category") || "all").toLowerCase();
    const q = (searchParams.get("q") || "").trim();
    const typeParam = (searchParams.get("type") || "all").trim();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter berdasarkan Role
    const baseWhere: any = {};
    if (user.role === "WRITER") {
      baseWhere.authorId = user.id;
    }

    const where: any = { ...baseWhere };
    const typeKey = typeParam.toUpperCase();
    const typeEnum =
      typeKey && typeKey !== "ALL" && (PostType as any)[typeKey] ? (PostType as any)[typeKey] : null;
    if (typeEnum) {
      where.type = typeEnum;
    }

    if (statusParam === "trash") {
      where.status = PostStatus.ARCHIVED;
    } else if (statusParam === "published") {
      where.status = PostStatus.PUBLISHED;
    } else if (statusParam === "draft") {
      where.status = PostStatus.DRAFT;
    } else if (statusParam === "review") {
      where.status = PostStatus.IN_REVIEW;
    } else {
      where.status = { not: PostStatus.ARCHIVED };
    }

    if (categoryParam !== "all" && categoryParam !== "") {
      where.category = {
        ...(where.category || {}),
        slug: { equals: categoryParam, mode: "insensitive" },
      };
    }

    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }

    const baseCountWhere: any = { ...baseWhere };
    if (typeEnum) {
      baseCountWhere.type = typeEnum;
    }

    const [posts, total, allCount, publishedCount, draftCount, reviewCount, trashCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: true,
          author: {
            select: { name: true, email: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.post.count({ where }),
      prisma.post.count({ where: { ...baseCountWhere, status: { not: PostStatus.ARCHIVED } } }),
      prisma.post.count({ where: { ...baseCountWhere, status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { ...baseCountWhere, status: PostStatus.DRAFT } }),
      prisma.post.count({ where: { ...baseCountWhere, status: PostStatus.IN_REVIEW } }),
      prisma.post.count({ where: { ...baseCountWhere, status: PostStatus.ARCHIVED } }),
    ]);

    let postsWithViewsBase: any[] = posts as any[];
    try {
      const ids = (posts as any[]).map((p) => p?.id).filter((v) => typeof v === "string" && v.trim() !== "");
      if (ids.length > 0) {
        const rows = await prisma.$queryRaw<{ id: string; viewsBase: number }[]>`
          SELECT "id", "viewsBase" FROM "Post" WHERE "id" IN (${Prisma.join(ids)})
        `;
        const map = new Map(rows.map((r) => [r.id, r.viewsBase]));
        postsWithViewsBase = (posts as any[]).map((p) => ({
          ...(p as any),
          viewsBase: typeof map.get(p.id) === "number" && Number.isFinite(map.get(p.id) as number) ? (map.get(p.id) as number) : 0,
        }));
      }
    } catch {
    }

    return NextResponse.json({
      data: postsWithViewsBase,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
        review: reviewCount,
        trash: trashCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Buat berita baru
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Zod Validation
    const validation = await validatePost(body);
    if (!validation.success) {
      const details = Array.isArray(validation.errors) ? validation.errors : [];
      const summary = details.length > 0
        ? `: ${details.slice(0, 3).map((d: any) => d?.message).filter(Boolean).join(" | ")}${details.length > 3 ? ` (+${details.length - 3} lainnya)` : ""}`
        : "";
      return NextResponse.json(
        { error: `Validasi Gagal${summary}`, details: validation.errors },
        { status: 400 }
      );
    }
    
    // Use validated data with proper typing
    // Force cast to any to bypass complex TS inference issues with Zod unions for now, or refine types later
    // The Zod validation guarantees the structure, so this is safe at runtime
    const validData = validation.data as any;
    
    const { title, subtitle, content, categoryId, categoryIds, image, featuredImageId, imageCaption, publishedAt, tags, type, videoUrl, gallery, metaTitle, metaDesc, viewsBase, reviewEditorIds } = validData as any;

    const normalizedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    const effectiveCategoryIds = Array.from(new Set([categoryId, ...normalizedCategoryIds].filter((v) => typeof v === "string" && v.trim() !== "")));
    const primaryCategoryId = typeof categoryId === "string" && categoryId.trim() !== "" ? categoryId : effectiveCategoryIds[0];

    if (!primaryCategoryId) {
      return NextResponse.json({ error: "Kategori wajib dipilih" }, { status: 400 });
    }

    // Generate Slug Unik
    let slug = slugify(title);
    // Cek apakah slug sudah ada
    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`; // Tambahkan angka unik jika kembar
    }

    // Aturan Publikasi & Transisi Status
    // Gunakan helper resolvePostTransition untuk logic terpusat
    let transition;
    try {
      transition = resolvePostTransition({
        currentStatus: PostStatus.DRAFT, // Default untuk post baru
        requestedStatus: body.status || PostStatus.DRAFT,
        userRole: user.role,
        publishedAt: publishedAt
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { status: newStatus, published: isPublished, publishedAt: finalPublishedAt } = transition;
    
    // Sync Image Legacy jika featuredImageId ada
    let finalImage = image;
    
    // Modification for INFOGRAPHIC & General (New Post): 
    // We want `image` field to represent the Thumbnail.
    // If featuredImageId is provided, we fetch the media.
    // If `image` (Thumbnail) was NOT provided in payload, we fallback to using the featuredImage URL.
    // BUT if `image` WAS provided (e.g. body image), we KEEP IT and do NOT overwrite with featuredImage URL.
    if (featuredImageId) {
      const media = await prisma.media.findUnique({ where: { id: featuredImageId } });
      if (media) {
        if (!finalImage || finalImage === "") {
             finalImage = media.fileUrl;
        }
      }
    }

    if ((!finalImage || finalImage === "") && (type as PostType) === PostType.VIDEO && typeof videoUrl === "string" && videoUrl.trim() !== "") {
      const thumbnail = getYouTubeThumbnailUrl(videoUrl, "hqdefault");
      if (thumbnail) finalImage = thumbnail;
    }

    // Prepare Tags
    // Use proper Prisma format for connectOrCreate
    // The previous implementation was pushing to an array and then assigning it to connectOrCreate.
    // However, Prisma connectOrCreate expects a list of objects in `connectOrCreate` field.
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tagConnect = undefined;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      tagConnect = {
         connectOrCreate: tags.map(tagName => ({
             where: { slug: slugify(tagName) },
             create: { name: tagName, slug: slugify(tagName) }
         }))
      };
    }

    // Prepare Post Data
    const sanitizedContent = sanitizeContent(content || "");
    const excerpt = makeExcerpt(toPlain(sanitizedContent), 180);
    const normalizedViewsBase =
      typeof viewsBase === "number" && Number.isFinite(viewsBase) ? Math.max(0, Math.floor(viewsBase)) : 0;
    const postData: any = {
        title,
        subtitle,
        slug,
        content: sanitizedContent,
        excerpt,
        image: finalImage,
        imageCaption,
        published: isPublished,
        status: newStatus,
        submittedForReviewAt: newStatus === "IN_REVIEW" ? new Date() : null,
        publishedAt: finalPublishedAt,
        views: 0,
        author: { connect: { id: user.id } },
        category: { connect: { id: primaryCategoryId } },
        type: (type as PostType) || PostType.ARTICLE,
        videoUrl,
        gallery,
        metaTitle,
        metaDesc
    };

    if (newStatus === "PUBLISHED" && user.role !== "WRITER") {
      postData.approvedBy = { connect: { id: user.id } };
    }

    if (featuredImageId && featuredImageId !== "remove") {
      postData.featuredImage = { connect: { id: featuredImageId } };
    }

    if (tagConnect) {
        postData.tags = tagConnect;
    }

    const post = await prisma.post.create({
      data: {
        ...postData,
        postCategories: {
          create: effectiveCategoryIds.map((id: string) => ({ categoryId: id })),
        },
      },
    });

    const normalizedReviewEditorIds =
      Array.isArray(reviewEditorIds) ? reviewEditorIds.map((v: any) => String(v || "").trim()).filter(Boolean) : [];
    if (newStatus === "IN_REVIEW" && normalizedReviewEditorIds.length > 0) {
      try {
        await (prisma as any).postReviewTarget.createMany({
          data: normalizedReviewEditorIds.map((editorId: string) => ({ postId: post.id, editorId })),
          skipDuplicates: true,
        });
      } catch (err) {
        console.error("[ReviewTargets] Failed to store targets:", err);
      }
    }

    // External Notification (Telegram/Email)
    if (newStatus === "IN_REVIEW" || newStatus === "PUBLISHED") {
      const { notifyWorkflowUpdate } = await import("@/lib/external-notifications");
      
      // Get all editors for notification
      const editors = await prisma.user.findMany({
        where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
        select: { id: true }
      });
      const editorIds = editors.map(e => e.id);
      const editorIdsForNotif = normalizedReviewEditorIds.length > 0 ? normalizedReviewEditorIds : editorIds;

      notifyWorkflowUpdate({
        title: post.title,
        authorName: user.name,
        newStatus: post.status,
        postId: post.id,
        authorId: user.id,
        editorIds: editorIdsForNotif
      }).catch(err => console.error("[Notification] Delayed notify error:", err));
    }

    // Internal Notification (Bell): editor/admin targets
    if (newStatus === "IN_REVIEW") {
      try {
        const recipients =
          normalizedReviewEditorIds.length > 0
            ? (
                await prisma.user.findMany({
                  where: {
                    id: { in: normalizedReviewEditorIds },
                    role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] },
                    status: "ACTIVE",
                  },
                  select: { id: true },
                })
              ).map((e) => e.id)
            : (
                await prisma.user.findMany({
                  where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
                  select: { id: true },
                })
              ).map((e) => e.id);

        if (recipients.length > 0) {
          const titleNotif = "Artikel Baru Menunggu Review";
          const messageNotif = `Artikel "${post.title}" dikirim oleh ${user.name}.`;
          await prisma.notification.createMany({
            data: recipients.map((uid) => ({
              userId: uid,
              title: titleNotif,
              message: messageNotif,
              link: `/admin/posts/${post.id}/edit`,
            })),
          });
        }
      } catch (err) {
        console.error("[Notification] Failed to create editor bell notifications:", err);
      }
    }

    // Internal Notification (Bell): scheduled soon (<= 1 hour)
    if (newStatus === "SCHEDULED" && finalPublishedAt) {
      try {
        const now = Date.now();
        const due = new Date(finalPublishedAt).getTime();
        const diffMs = due - now;
        if (Number.isFinite(diffMs) && diffMs > 0 && diffMs <= 60 * 60 * 1000) {
          const editors = await prisma.user.findMany({
            where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
            select: { id: true },
          });
          const recipients = editors.map((e) => e.id);
          if (recipients.length > 0) {
            await prisma.notification.createMany({
              data: recipients.map((uid) => ({
                userId: uid,
                title: "Artikel Dijadwalkan Dalam Waktu Dekat",
                message: `Artikel "${post.title}" dijadwalkan terbit pada ${new Date(finalPublishedAt).toLocaleString("id-ID")}.`,
                link: `/admin/posts/${post.id}/edit`,
              })),
            });
          }
        }
      } catch (err) {
        console.error("[Notification] Failed to create scheduled bell notifications:", err);
      }
    }

    if (normalizedViewsBase > 0) {
      try {
        await prisma.$executeRaw`UPDATE "Post" SET "viewsBase" = ${normalizedViewsBase} WHERE "id" = ${post.id}`;
      } catch {
      }
    }

    // Log Activity
    await logActivity(
      user.id,
      "CREATE_POST",
      "Membuat berita baru",
      post.id, // resourceId
      { title: post.title, status: newStatus } // details
    );

    // Revalidate Cache
    if (isPublished) {
        revalidateTag("homepage");
        revalidateTag("posts");
        // Also revalidate specific category if needed, but homepage is critical
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("CREATE POST ERROR:", error);
    return NextResponse.json({ error: error?.message || "Gagal membuat berita" }, { status: 500 });
  }
}
