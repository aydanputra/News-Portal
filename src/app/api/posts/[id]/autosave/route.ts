import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { slugify } from "@/lib/utils";
import { sanitizeContent } from "@/lib/sanitizer";

// Helper: Cek Izin Akses
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Cek Hak Akses
    const access = await checkAccess(id, user);
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status || 500 });

    // 1.5 LOCK VALIDATION (HARDENED)
    // Autosave must respect locking to prevent silent overwrites
    // @ts-ignore
    if (access.post?.lockedBy && access.post.lockedBy !== user.id) {
        // Check if lock is expired
        // @ts-ignore
        const lockedAt = access.post.lockedAt ? new Date(access.post.lockedAt) : null;
        const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
        const now = new Date();
        const isExpired = lockedAt ? (now.getTime() - lockedAt.getTime() > LOCK_TIMEOUT_MS) : true;
        
        if (!isExpired) {
            // Locked by someone else and active -> Block autosave
            return NextResponse.json({ error: "Post is locked by another user" }, { status: 423 }); // 423 Locked
        }
    }

    const body = await request.json();
    const { title, subtitle, content, categoryId, tags, image, featuredImageId, imageCaption } = body;

    // 2. Prepare Data Update (Hanya field konten, tanpa status/publish date)
    // Slug diupdate jika title berubah, tapi tanpa history (autosave anggap draft sementara)
    // Sebaiknya slug JANGAN diupdate di autosave untuk mencegah broken link prematur?
    // Namun jika post masih DRAFT, update slug tidak masalah.
    // Untuk amannya: Autosave TIDAK update slug agar tidak konflik dengan logic history yang kompleks.
    // User harus klik "Save Draft" manual atau "Publish" untuk update slug permanen.
    
    // Modification: Allow slug update ONLY if status is DRAFT.
    let slug = undefined;
    if (access.post?.status === 'DRAFT' && title && title !== access.post?.title) {
         slug = slugify(title);
         const existingSlug = await prisma.post.findUnique({ where: { slug } });
         if (existingSlug && existingSlug.id !== id) {
             slug = `${slug}-${Date.now()}`;
         }
    }

    // Sync Image Logic
    let finalImage = image;
    if (featuredImageId && featuredImageId !== "remove") {
      const media = await prisma.media.findUnique({ where: { id: featuredImageId } });
      if (media) {
        if (!finalImage || finalImage === "") {
            finalImage = media.fileUrl;
        }
      }
    }

    const updateData: any = {
      title,
      subtitle,
      content: sanitizeContent(content || ""),
      image: finalImage,
      imageCaption,
      updatedAt: new Date() // Force update timestamp
    };

    if (categoryId) {
        // Fix: Use relation connect instead of scalar update to avoid Prisma validation error
        updateData.category = { connect: { id: categoryId } };
    }

    if (slug) {
        updateData.slug = slug;
    }

    // Handle Featured Image Relation
    if (featuredImageId === "remove") {
         updateData.featuredImage = { disconnect: true };
    } else if (featuredImageId) {
         updateData.featuredImage = { connect: { id: featuredImageId } };
    }

    // 3. Execute Update (Tanpa Transaction Revision & Tanpa Revalidate)
    await prisma.post.update({
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
        }
    });

    return NextResponse.json({ 
        success: true, 
        updatedAt: new Date().toISOString() 
    });

  } catch (error) {
    console.error("Autosave Error:", error);
    return NextResponse.json({ error: "Gagal autosave" }, { status: 500 });
  }
}