import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Logic: Only owner of lock OR Editor/Admin can unlock
    // @ts-ignore
    if (post.lockedBy && post.lockedBy !== user.id) {
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
             return NextResponse.json({ error: "You cannot unlock this post" }, { status: 403 });
        }
    }

    // Unlock
    await prisma.post.update({
        where: { id },
        // @ts-ignore
        data: { lockedBy: null, lockedAt: null }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Unlock Error:", error);
    return NextResponse.json({ error: "Unlock failed" }, { status: 500 });
  }
}