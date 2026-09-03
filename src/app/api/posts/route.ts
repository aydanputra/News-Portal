import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getYouTubeThumbnailUrl, slugify } from "@/lib/utils";
import { PostType, PostStatus, Prisma } from "@prisma/client";
import { logActivity } from "@/lib/audit";
import { resolvePostTransition } from "@/lib/post-workflow";
import { sanitizeContent } from "@/lib/sanitizer";
import { validatePost, type PostInput } from "@/lib/validators/postValidator";
import { normalizePostTypeMedia } from "@/lib/post-type-media";
import { requireUser } from "@/lib/server-auth";
import { revalidateTag } from "next/cache";
import { internalError } from "@/lib/api-error";

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

    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter berdasarkan Role
    const baseWhere: Prisma.PostWhereInput = {};
    if (user.role === "WRITER") {
      baseWhere.authorId = user.id;
    }

    const where: Prisma.PostWhereInput = { ...baseWhere };
    const typeKey = typeParam.toUpperCase();
    const typeEnum =
      typeKey && typeKey !== "ALL" && typeKey in PostType
        ? PostType[typeKey as keyof typeof PostType]
        : null;
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
        slug: { equals: categoryParam, mode: "insensitive" },
      };
    }

    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }

    const baseCountWhere: Prisma.PostWhereInput = { ...baseWhere };
    if (typeEnum) {
      baseCountWhere.type = typeEnum;
    }

    const [posts, total, statusGroups] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          published: true,
          updatedAt: true,
          publishedAt: true,
          status: true,
          image: true,
          views: true,
          viewsBase: true,
          featuredImage: {
            select: { fileUrl: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          author: {
            select: { name: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.post.count({ where }),
      prisma.post.groupBy({
        by: ["status"],
        where: baseCountWhere,
        _count: { _all: true },
      }),
    ]);

    const statusCounts = new Map(
      statusGroups.map((entry) => [String(entry.status), entry._count._all || 0])
    );
    const allCount = (statusCounts.get(String(PostStatus.PUBLISHED)) || 0) + (statusCounts.get(String(PostStatus.DRAFT)) || 0) + (statusCounts.get(String(PostStatus.IN_REVIEW)) || 0) + (statusCounts.get(String(PostStatus.SCHEDULED)) || 0) + (statusCounts.get(String(PostStatus.REJECTED)) || 0);
    const publishedCount = statusCounts.get(String(PostStatus.PUBLISHED)) || 0;
    const draftCount = statusCounts.get(String(PostStatus.DRAFT)) || 0;
    const reviewCount = statusCounts.get(String(PostStatus.IN_REVIEW)) || 0;
    const trashCount = statusCounts.get(String(PostStatus.ARCHIVED)) || 0;

    return NextResponse.json({
      data: posts,
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
  } catch (error) {
    return internalError(error, { route: "GET /api/posts" });
  }
}

// POST: Buat berita baru
export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Zod Validation
    const validation = await validatePost(body);
    if (!validation.success) {
      const details = Array.isArray(validation.errors) ? validation.errors : [];
      const summary = details.length > 0
        ? `: ${details.slice(0, 3).map((d) => d?.message).filter(Boolean).join(" | ")}${details.length > 3 ? ` (+${details.length - 3} lainnya)` : ""}`
        : "";
      return NextResponse.json(
        { error: `Validasi Gagal${summary}`, details: validation.errors },
        { status: 400 }
      );
    }
    
    // Use validated data with proper typing
    const validData: PostInput = validation.data;
    
    const {
      title,
      slug: requestedSlug,
      subtitle,
      content,
      categoryId,
      categoryIds,
      image,
      featuredImageId,
      featuredImageAlt,
      postImageWatermarkEnabled,
      imageCaption,
      publishedAt,
      tags,
      type,
      videoUrl,
      gallery,
      focusKeyword,
      canonicalUrl,
      metaTitle,
      metaDesc,
      viewsBase,
      reviewEditorIds,
      authorId,
      approvedById,
    } = validData;
    const normalizedMedia = normalizePostTypeMedia({ type, videoUrl, gallery });

    const normalizedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    const effectiveCategoryIds = Array.from(new Set([categoryId, ...normalizedCategoryIds].filter((v) => typeof v === "string" && v.trim() !== "")));
    const primaryCategoryId = typeof categoryId === "string" && categoryId.trim() !== "" ? categoryId : effectiveCategoryIds[0];

    if (!primaryCategoryId) {
      return NextResponse.json({ error: "Kategori wajib dipilih" }, { status: 400 });
    }

    // Generate slug unik, prioritaskan slug manual bila diisi user.
    let slug = slugify(typeof requestedSlug === "string" ? requestedSlug : "") || slugify(title);
    if (!slug) {
      return NextResponse.json({ error: "Slug URL tidak valid" }, { status: 400 });
    }
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Status transisi tidak valid";
      return NextResponse.json({ error: message }, { status: 400 });
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

    if ((!finalImage || finalImage === "") && type === PostType.VIDEO && typeof normalizedMedia.videoUrl === "string" && normalizedMedia.videoUrl.trim() !== "") {
      const thumbnail = getYouTubeThumbnailUrl(normalizedMedia.videoUrl, "hqdefault");
      if (thumbnail) finalImage = thumbnail;
    }

    // Prepare Tags
    // Use proper Prisma format for connectOrCreate
    let tagConnect: Prisma.PostCreateInput["tags"];
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
    const canManageAttribution = user.role === "ADMIN" || user.role === "EDITOR" || user.role === "SUPER_ADMIN";
    const selectedAuthorId =
      canManageAttribution && typeof authorId === "string" && authorId.trim() !== ""
        ? authorId.trim()
        : user.id;
    const selectedApprovedById =
      canManageAttribution && typeof approvedById === "string" && approvedById.trim() !== ""
        ? approvedById.trim()
        : "";
    const postData: Prisma.PostCreateInput = {
        title,
        subtitle,
        slug,
        content: sanitizedContent,
        excerpt,
        image: finalImage,
        featuredImageAlt,
        postImageWatermarkEnabled: postImageWatermarkEnabled === true,
        imageCaption,
        published: isPublished,
        status: newStatus,
        submittedForReviewAt: newStatus === "IN_REVIEW" ? new Date() : null,
        publishedAt: finalPublishedAt,
        views: 0,
        author: { connect: { id: selectedAuthorId } },
        category: { connect: { id: primaryCategoryId } },
        type,
        videoUrl: normalizedMedia.videoUrl,
        gallery: normalizedMedia.gallery ?? Prisma.DbNull,
        focusKeyword,
        canonicalUrl: canonicalUrl || null,
        metaTitle,
        metaDesc
    };

    if (selectedApprovedById) {
      postData.approvedBy = { connect: { id: selectedApprovedById } };
    } else if (newStatus === "PUBLISHED" && user.role !== "WRITER") {
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
      Array.isArray(reviewEditorIds) ? reviewEditorIds.map((v) => String(v || "").trim()).filter(Boolean) : [];
    if (newStatus === "IN_REVIEW" && normalizedReviewEditorIds.length > 0) {
      try {
        await prisma.postReviewTarget.createMany({
          data: normalizedReviewEditorIds.map((editorId: string) => ({ postId: post.id, editorId })),
          skipDuplicates: true,
        });
      } catch (err) {
        console.error("[ReviewTargets] Failed to store targets:", err);
      }
    }

    // Notifikasi (external + bell + scheduled) dan sinkronisasi viewsBase dijalankan
    // di background supaya response tidak menunggu operasi non-kritis setelah create.
    void (async () => {
      try {
        // External Notification (Telegram/Email)
        // Ambil daftar editor aktif sekali, dipakai ulang untuk bell notification di bawah.
        let activeEditorIds: string[] = [];
        if (newStatus === "IN_REVIEW" || newStatus === "PUBLISHED") {
          const editors = await prisma.user.findMany({
            where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
            select: { id: true },
          });
          activeEditorIds = editors.map((e) => e.id);

          const editorIdsForNotif = normalizedReviewEditorIds.length > 0 ? normalizedReviewEditorIds : activeEditorIds;

          const { notifyWorkflowUpdate } = await import("@/lib/external-notifications");
          notifyWorkflowUpdate({
            title: post.title,
            authorName: user.name,
            newStatus: post.status,
            postId: post.id,
            authorId: user.id,
            editorIds: editorIdsForNotif,
          }).catch((err) => console.error("[Notification] Delayed notify error:", err));
        }

        // Internal Notification (Bell): editor/admin targets
        if (newStatus === "IN_REVIEW") {
          try {
            const recipients =
              normalizedReviewEditorIds.length > 0
                ? activeEditorIds.filter((id) => normalizedReviewEditorIds.includes(id))
                : activeEditorIds;

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
          } catch (error) {
            console.error("POST /api/posts update viewsBase error:", error);
          }
        }
      } catch (err) {
        console.error("[Notification] Background notification error:", err);
      }
    })();

    // Log Activity (background, tidak memblokir response)
    logActivity(
      user.id,
      "CREATE_POST",
      "Membuat berita baru",
      post.id,
      { title: post.title, status: newStatus }
    ).catch((err) => console.error("[Audit] Failed to write activity:", err));

    // Revalidate Cache
    if (isPublished) {
        revalidateTag("homepage");
        revalidateTag("posts");
        revalidateTag(`article-${post.slug}`);
        revalidateTag(`post-${post.slug}`);
        // Also revalidate specific category if needed, but homepage is critical
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    return internalError(error, { route: "POST /api/posts" });
  }
}
