
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getYouTubeThumbnailUrl, slugify } from "@/lib/utils";
import { PostType, PostStatus, Prisma } from "@prisma/client";
import { logActivity } from "@/lib/audit";
import { resolvePostTransition } from "@/lib/post-workflow";
import { revalidateTag } from "next/cache";
import { sanitizeContent } from "@/lib/sanitizer";
import { validatePost } from "@/lib/validators/postValidator";

export const dynamic = "force-dynamic";

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

// Helper: Cek Izin Akses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAccess(postId: string, user: any) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Berita tidak ditemukan", status: 404 };

  // Admin & Editor boleh apa saja
  if (user.role === "ADMIN" || user.role === "EDITOR") return { post };

  // Writer hanya boleh punya sendiri
  if (post.authorId !== user.id) {
    return { error: "Anda tidak memiliki akses", status: 403 };
  }

  return { post };
}

// GET: Ambil 1 Berita
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
        return NextResponse.json({ error: "ID not provided" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { 
        category: true,
        postCategories: { include: { category: true } },
        tags: true,
        featuredImage: true
      },
    });

    if (!post) {
        console.error(`Post with ID ${id} not found`);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
      const rows = await prisma.$queryRaw<{ viewsBase: number }[]>`SELECT "viewsBase" FROM "Post" WHERE "id" = ${id} LIMIT 1`;
      const viewsBase = typeof rows?.[0]?.viewsBase === "number" && Number.isFinite(rows[0].viewsBase) ? rows[0].viewsBase : 0;
      let reviewEditorIds: string[] = [];
      try {
        const targetRows = await prisma.$queryRaw<{ editorId: string }[]>`SELECT "editorId" FROM "PostReviewTarget" WHERE "postId" = ${id}`;
        reviewEditorIds = Array.isArray(targetRows)
          ? targetRows.map((r) => String((r as any)?.editorId || "").trim()).filter(Boolean)
          : [];
      } catch (error) {
        console.error("GET /api/posts/[id] reviewTargets query error:", error);
        reviewEditorIds = [];
      }
      return NextResponse.json({ ...(post as any), viewsBase, reviewEditorIds });
    } catch (error) {
      console.error("GET /api/posts/[id] viewsBase query error:", error);
      let reviewEditorIds: string[] = [];
      try {
        const targetRows = await prisma.$queryRaw<{ editorId: string }[]>`SELECT "editorId" FROM "PostReviewTarget" WHERE "postId" = ${id}`;
        reviewEditorIds = Array.isArray(targetRows)
          ? targetRows.map((r) => String((r as any)?.editorId || "").trim()).filter(Boolean)
          : [];
      } catch (error) {
        console.error("GET /api/posts/[id] reviewTargets fallback query error:", error);
        reviewEditorIds = [];
      }
      return NextResponse.json({ ...(post as any), reviewEditorIds });
    }
  } catch (error) {
    console.error("GET Post Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT: Update Berita
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");
    const { id } = await params;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Cek Hak Akses
    const access = await checkAccess(id, user);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status || 500 });

    const body = await request.json();

    // 2. Zod Validation
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

    const validData = validation.data as any;
    const {
      title,
      subtitle,
      content,
      categoryId,
      categoryIds,
      image,
      featuredImageId,
      imageCaption,
      publishedAt,
      tags,
      type,
      videoUrl,
      gallery,
      status: requestedStatus,
      authorId,
      approvedById,
      metaTitle,
      metaDesc,
      viewsBase,
      reviewEditorIds,
    } = validData;
    // Note: rejectionReason is not in validator yet, grab it from body for now as it's admin specific
    const rejectionReason = (body as any).rejectionReason;

    console.log("UPDATE POST DEBUG:", { id, featuredImageId, galleryLength: Array.isArray(gallery) ? gallery?.length : 'Not Array', type: typeof gallery });

    const hasReviewEditorIdsKey = Object.prototype.hasOwnProperty.call(validData, "reviewEditorIds");
    const normalizedReviewEditorIds =
      Array.isArray(reviewEditorIds) ? reviewEditorIds.map((v: any) => String(v || "").trim()).filter(Boolean) : [];

    const normalizedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
    const effectiveCategoryIds = Array.from(new Set([categoryId, ...normalizedCategoryIds].filter((v) => typeof v === "string" && v.trim() !== "")));
    const primaryCategoryId = typeof categoryId === "string" && categoryId.trim() !== "" ? categoryId : effectiveCategoryIds[0];

    if (!primaryCategoryId) {
      return NextResponse.json({ error: "Kategori wajib dipilih" }, { status: 400 });
    }

    // 3. Transisi Status & Validasi Workflow
    let transition;
    try {
      transition = resolvePostTransition({
        currentStatus: access.post?.status || PostStatus.DRAFT,
        requestedStatus: requestedStatus || access.post?.status,
        userRole: user.role,
        publishedAt: publishedAt || access.post?.publishedAt
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { status: newStatus, published: isPublished, publishedAt: finalPublishedAt } = transition;

    // 3. Sync Image Legacy jika featuredImageId ada
    let finalImage = image;
    
    // Modification for INFOGRAPHIC & General: 
    // We want `image` field to represent the Thumbnail. 
    // We want `featuredImage` relation to represent the Header Image.
    // If featuredImageId is provided, we fetch the media.
    // If `image` (Thumbnail) was NOT provided in payload, we fallback to using the featuredImage URL.
    // BUT if `image` WAS provided (e.g. body image), we KEEP IT and do NOT overwrite with featuredImage URL.
    
    if (featuredImageId && featuredImageId !== "remove") {
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

    // 4. Update Data (Dengan Transaction untuk Revision History & Notification)
    // @ts-ignore: Transaction type complexity
    const updatedPost = await prisma.$transaction(async (tx) => {
        // Prepare slug inside transaction scope
        let slug = access.post?.slug;
        if (title && title !== access.post?.title) {
            slug = slugify(title);
            const existingSlug = await tx.post.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // a. Create Revision Snapshot
        // @ts-ignore
        await tx.postRevision.create({
            data: {
                postId: id,
                title: access.post?.title || "",
                content: access.post?.content || "",
                status: access.post?.status || PostStatus.DRAFT,
                authorId: user.id
            }
        });

        // b. Create Notification Logic
        if (newStatus !== access.post?.status) {
            let notifMessage = "";
            let notifTitle = "";
            let notifUserId = ""; // Target user

            // Skenario 1: Editor reject/approve tulisan Writer
            if (user.role === "EDITOR" || user.role === "ADMIN") {
                if (access.post?.authorId !== user.id) { // Jangan notif diri sendiri
                    notifUserId = access.post?.authorId || "";
                    if (newStatus === "REJECTED") {
                        notifTitle = "Berita Ditolak/Revisi";
                        notifMessage = `Berita "${title}" perlu revisi. Alasan: ${rejectionReason}`;
                    } else if (newStatus === "PUBLISHED") {
                        notifTitle = "Berita Terbit";
                        notifMessage = `Berita "${title}" telah diterbitkan.`;
                    }
                }
            }
            
            // Skenario 2: Writer mengajukan Review (DRAFT -> IN_REVIEW)
            // TODO: Kirim ke semua Editor (Future Improvement)

            if (notifUserId && notifTitle) {
                // @ts-ignore
                await tx.notification.create({
                    data: {
                        userId: notifUserId,
                        title: notifTitle,
                        message: notifMessage,
                        link: `/admin/posts/${id}/edit`
                    }
                });
            }
        }

        // c. Update Post
        const updateData: any = {
                title,
                slug, // Explicitly update slug
                subtitle,
                content: sanitizeContent(content || ""),
                rejectionReason: newStatus === "REJECTED" ? rejectionReason : null,
                excerpt: makeExcerpt(toPlain(sanitizeContent(content || "")), 180),
                status: newStatus,
                published: isPublished,
                publishedAt: finalPublishedAt,
                image: finalImage,
                imageCaption,
                type: type as PostType,
                videoUrl,
                gallery: gallery ? gallery : undefined,
                metaTitle,
                metaDesc
        };

        if (newStatus === "IN_REVIEW" && access.post?.status !== "IN_REVIEW") {
          updateData.submittedForReviewAt = new Date();
        }

        updateData.category = { connect: { id: primaryCategoryId } };

        // Handle Slug Change & History
        if (access.post?.slug && slug && access.post.slug !== slug) {
            // Check if old slug already exists in history for THIS post to avoid duplicates
            // Or just create, assuming unique constraint handles collision (oldSlug is unique)
            // But oldSlug unique constraint is global? Yes.
            // If another post used this slug before, it might fail.
            // But access.post.slug is UNIQUE to this post (currently).
            
            // Try catch to ignore if already exists or collision
            try {
                // @ts-ignore
                await tx.postSlugHistory.create({
                    data: {
                        postId: id,
                        oldSlug: access.post.slug
                    }
                });
            } catch (e) {
                // Ignore unique constraint error if oldSlug already saved
                console.log("Slug history exists or collision", e);
            }
        }

        // Handle Featured Image Relation
        if (featuredImageId === "remove") {
             updateData.featuredImage = { disconnect: true };
        } else if (featuredImageId) {
             updateData.featuredImage = { connect: { id: featuredImageId } };
        }

        // Handle Author & Editor (Only ADMIN/EDITOR can change)
        if (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "SUPER_ADMIN") {
             if (authorId) {
                 updateData.author = { connect: { id: authorId } };
             }
             
             if (approvedById) {
                 updateData.approvedBy = { connect: { id: approvedById } };
             } else if (approvedById === "" || approvedById === null) {
                 updateData.approvedBy = { disconnect: true };
             }

             if (newStatus === "PUBLISHED" && !approvedById && !access.post?.approvedById) {
                 updateData.approvedBy = { connect: { id: user.id } };
             }
        }

        const baseUpdatedPost = await tx.post.update({
            where: { id },
            data: {
                ...updateData,
                tags: {
                    set: [], 
                    connectOrCreate: (tags || []).map((tag: string) => ({
                        where: { slug: slugify(tag) },
                        create: { name: tag, slug: slugify(tag) }
                    }))
                }
            },
            include: { category: true, tags: true }
        });

        if (viewsBase !== undefined) {
          const normalizedViewsBase =
            typeof viewsBase === "number" && Number.isFinite(viewsBase) ? Math.max(0, Math.floor(viewsBase)) : 0;

          try {
            await tx.$executeRaw`UPDATE "Post" SET "viewsBase" = ${normalizedViewsBase} WHERE "id" = ${baseUpdatedPost.id}`;
          } catch (error) {
            console.error("PUT /api/posts/[id] update viewsBase error:", error);
            try {
              await tx.$executeRaw`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "viewsBase" INTEGER NOT NULL DEFAULT 0`;
              await tx.$executeRaw`UPDATE "Post" SET "viewsBase" = ${normalizedViewsBase} WHERE "id" = ${baseUpdatedPost.id}`;
            } catch (error) {
              console.error("PUT /api/posts/[id] viewsBase repair error:", error);
            }
          }
        }

        await tx.$executeRaw`DELETE FROM "PostCategory" WHERE "postId" = ${baseUpdatedPost.id}`;

        if (effectiveCategoryIds.length > 0) {
          const values = effectiveCategoryIds.map((cid: string) => Prisma.sql`(${baseUpdatedPost.id}, ${cid})`);
          await tx.$executeRaw(
            Prisma.sql`INSERT INTO "PostCategory" ("postId","categoryId") VALUES ${Prisma.join(values)} ON CONFLICT DO NOTHING`
          );
        }

        const postWithCategories = await tx.post.findUnique({
          where: { id: baseUpdatedPost.id },
          include: {
            category: true,
            postCategories: { include: { category: true } },
            tags: true,
            featuredImage: true,
          },
        });

        if (newStatus === "IN_REVIEW" && hasReviewEditorIdsKey) {
          try {
            await (tx as any).postReviewTarget.deleteMany({ where: { postId: id } });
            if (normalizedReviewEditorIds.length > 0) {
              await (tx as any).postReviewTarget.createMany({
                data: normalizedReviewEditorIds.map((editorId: string) => ({ postId: id, editorId })),
                skipDuplicates: true,
              });
            }
          } catch (err) {
            console.error("[ReviewTargets] Failed to update targets:", err);
          }
        }

        return postWithCategories || baseUpdatedPost;
    });

    // External Notification (Telegram/Email)
    // Notify if status changed to critical states
    if (newStatus !== access.post?.status && (newStatus === "IN_REVIEW" || newStatus === "PUBLISHED" || newStatus === "REJECTED")) {
      const { notifyWorkflowUpdate } = await import("@/lib/external-notifications");

      // Get all editors for notification
      const editors = await prisma.user.findMany({
        where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
        select: { id: true }
      });
      const editorIds = editors.map(e => e.id);
      let editorIdsForNotif = editorIds;

      if (normalizedReviewEditorIds.length > 0) {
        editorIdsForNotif = normalizedReviewEditorIds;
      } else {
        try {
          const targets = await (prisma as any).postReviewTarget.findMany({
            where: { postId: updatedPost.id },
            select: { editorId: true },
          });
          const targetIds = Array.isArray(targets)
            ? Array.from(
                new Set(targets.map((t: any) => String(t?.editorId || "").trim()).filter(Boolean)),
              )
            : [];
          if (targetIds.length > 0) editorIdsForNotif = targetIds;
        } catch (error) {
          console.error("PUT /api/posts/[id] read reviewTargets error:", error);
        }
      }

      notifyWorkflowUpdate({
        title: updatedPost.title,
        authorName: (updatedPost as any).author?.name || user.name,
        oldStatus: access.post?.status,
        newStatus: updatedPost.status,
        rejectionReason: (body as any).rejectionReason,
        postId: updatedPost.id,
        authorId: updatedPost.authorId,
        editorIds: editorIdsForNotif
      }).catch(err => console.error("[Notification] Delayed notify error:", err));

      // Internal Notification (Bell): editor/admin inbox
      if (newStatus === "IN_REVIEW") {
        try {
          const recipients = await prisma.user.findMany({
            where: {
              id: { in: editorIdsForNotif },
              role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] },
              status: "ACTIVE",
            },
            select: { id: true },
          });

          let authorName = user.name;
          if (updatedPost.authorId && updatedPost.authorId !== user.id) {
            const author = await prisma.user.findUnique({
              where: { id: updatedPost.authorId },
              select: { name: true },
            });
            if (author?.name) authorName = author.name;
          }

          const titleNotif =
            access.post?.status === "REJECTED" ? "Revisi Masuk untuk Review" : "Artikel Baru Menunggu Review";
          const messageNotif =
            access.post?.status === "REJECTED"
              ? `Artikel "${updatedPost.title}" sudah direvisi oleh ${authorName}.`
              : `Artikel "${updatedPost.title}" dikirim oleh ${authorName}.`;

          if (recipients.length > 0) {
            await prisma.notification.createMany({
              data: recipients.map((r) => ({
                userId: r.id,
                title: titleNotif,
                message: messageNotif,
                link: `/admin/posts/${updatedPost.id}/edit`,
              })),
            });
          }
        } catch (err) {
          console.error("[Notification] Failed to create editor bell notifications:", err);
        }
      }
    }

    // Internal Notification (Bell): scheduled soon (<= 1 hour)
    if (newStatus !== access.post?.status && newStatus === "SCHEDULED" && finalPublishedAt) {
      try {
        const now = Date.now();
        const due = new Date(finalPublishedAt).getTime();
        const diffMs = due - now;
        if (Number.isFinite(diffMs) && diffMs > 0 && diffMs <= 60 * 60 * 1000) {
          const recipients = await prisma.user.findMany({
            where: { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
            select: { id: true },
          });
          if (recipients.length > 0) {
            await prisma.notification.createMany({
              data: recipients.map((r) => ({
                userId: r.id,
                title: "Artikel Dijadwalkan Dalam Waktu Dekat",
                message: `Artikel "${updatedPost.title}" dijadwalkan terbit pada ${new Date(finalPublishedAt).toLocaleString("id-ID")}.`,
                link: `/admin/posts/${updatedPost.id}/edit`,
              })),
            });
          }
        }
      } catch (err) {
        console.error("[Notification] Failed to create scheduled bell notifications:", err);
      }
    }

    // Log Activity
    await logActivity(
      user.id,
      "UPDATE_POST",
      "Mengupdate berita",
      updatedPost.id,
      { title: updatedPost.title, status: newStatus }
    );

    // Revalidate Cache
    revalidateTag("homepage");
    revalidateTag("posts");
    revalidateTag(`post-${updatedPost.slug}`);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json({ error: (error as any)?.message || "Gagal update berita" }, { status: 500 });
  }
}

// DELETE: Hapus Berita
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");
    const { id } = await params;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const access = await checkAccess(id, user);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status || 500 });

    const url = new URL(request.url);
    const hardDelete = url.searchParams.get("hard") === "true";

    if (hardDelete) {
      // Hard Delete
      await prisma.post.delete({ 
        where: { id }
      });
    } else {
      // Soft Delete (Pindahkan ke Sampah)
      await prisma.post.update({
        where: { id },
        data: {
          status: "ARCHIVED", // Menggunakan ARCHIVED sebagai status Sampah
          deletedAt: new Date()
        }
      });
    }

    await logActivity(
      user.id,
      hardDelete ? "DELETE_POST" : "TRASH_POST",
      hardDelete ? "Menghapus berita permanen" : "Memindahkan berita ke sampah",
      id,
      { status: access.post?.status }
    );

    // Trigger Revalidation
    revalidateTag("homepage");
    revalidateTag("posts");
    if (access.post?.slug) {
        revalidateTag(`article-${access.post.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}

// PATCH: Restore Berita
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");
    const { id } = await params;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const access = await checkAccess(id, user);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status || 500 });

    const body = await request.json();
    
    if (body.action === "restore") {
      await prisma.post.update({
        where: { id },
        data: {
          status: "DRAFT", // Kembalikan ke draft saat di-restore
          deletedAt: null
        }
      });

      await logActivity(
        user.id,
        "RESTORE_POST",
        "Mengembalikan berita dari sampah",
        id,
        { status: "DRAFT" }
      );
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("RESTORE Error:", error);
    return NextResponse.json({ error: "Gagal restore" }, { status: 500 });
  }
}
