import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // @ts-ignore
    const allComments = await prisma.comment.findMany({
        where: { postId: id, isApproved: true },
        orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("Comment fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        const body = await request.json();
        const { name, email, website, content, parentId } = body;

        // Simple validation
        if (!name || !email || !content) {
            return NextResponse.json({ error: "Name, email, and content are required" }, { status: 400 });
        }

        // IP & User Agent (Optional for spam check)
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Validate postId (ensure post exists)
        const post: any = await (prisma.post as any).findUnique({
            where: { id },
            select: { id: true, title: true, authorId: true, approvedById: true, status: true },
        });
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // @ts-ignore
        const newComment = await prisma.comment.create({
            data: {
                postId: id,
                name,
                email,
                website,
                content,
                parentId: parentId || null,
                ipAddress: ip,
                userAgent: userAgent,
                isApproved: true, // Auto-approve for now (can be changed to false via settings)
            }
        });

        try {
            const recipients = new Set<string>();
            if (typeof post?.authorId === "string" && post.authorId.trim() !== "") recipients.add(post.authorId);
            if (typeof post?.approvedById === "string" && post.approvedById.trim() !== "") recipients.add(post.approvedById);

            const admins = await prisma.user.findMany({
                where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
                select: { id: true },
            });
            for (const a of admins) {
                if (typeof a?.id === "string" && a.id.trim() !== "") recipients.add(a.id);
            }

            const contentText = String(content || "").replace(/\s+/g, " ").trim();
            const snippet = contentText.length > 140 ? contentText.slice(0, 140).trim() + "…" : contentText;
            const commenter = String(name || "").trim() || "Anonim";
            const postTitle = String(post?.title || "").trim() || "Artikel";

            if (recipients.size > 0 && String(post?.status || "") === "PUBLISHED") {
                await prisma.notification.createMany({
                    data: Array.from(recipients).map((userId) => ({
                        userId,
                        title: "Komentar Baru",
                        message: `Di "${postTitle}" oleh ${commenter}: ${snippet}`,
                        link: `/admin/posts/${id}/edit`,
                    })),
                });
            }
        } catch (error) {
            console.error("[Notification] Failed to create comment bell notifications:", error);
        }

        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Comment submission error:", error);
        return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
    }
}
