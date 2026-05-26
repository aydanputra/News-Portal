import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    // @ts-ignore
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({
        where: { id },
        // @ts-ignore
        include: { lockedUser: { select: { id: true, name: true, role: true } } }
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const now = new Date();
    // @ts-ignore
    const lockedAt = post.lockedAt ? new Date(post.lockedAt) : null;
    const isExpired = lockedAt ? (now.getTime() - lockedAt.getTime() > LOCK_TIMEOUT_MS) : true;

    // 1. If not locked OR expired -> Lock it
    // @ts-ignore
    if (!post.lockedBy || isExpired) {
        await prisma.post.update({
            where: { id },
            data: { lockedBy: user.id, lockedAt: now }
        });
        return NextResponse.json({ locked: true, self: true });
    }

    // 2. If locked by current user -> Refresh lock
    // @ts-ignore
    if (post.lockedBy === user.id) {
        await prisma.post.update({
            where: { id },
            data: { lockedAt: now }
        });
        return NextResponse.json({ locked: true, self: true });
    }

    // 3. If locked by others and active -> Return warning details
    // Check if user is EDITOR/ADMIN (Override capability logic is in frontend, but here we just return info)
    
    // Override logic check (Optional: if we want to allow forced takeover via separate flag, but requirement says "Editor/Admin boleh override lock")
    // The requirement says: "Jika currentUser.role === EDITOR atau ADMIN → tombol override aktif → memanggil endpoint lock lagi untuk mengambil alih."
    // So we need a flag or logic here to accept override.
    
    // Check for override flag in body
    let body: any = {};
    try { body = await request.json(); } catch {}
    const { force } = body;

    // Hardened Override Logic
    // Only Admin/Editor can force override
    // Writer CANNOT override even if they send force=true
    // @ts-ignore
    if (force === true) {
        if (user.role === 'ADMIN' || user.role === 'EDITOR') {
             await prisma.post.update({
                where: { id },
                data: { lockedBy: user.id, lockedAt: now }
            });
            return NextResponse.json({ locked: true, self: true, overridden: true });
        } else {
             // Writer tried to force override -> Forbidden
             return NextResponse.json({ 
                 error: "Writer cannot override lock", 
                 locked: true, 
                 self: false,
                 // @ts-ignore
                 lockedBy: post.lockedUser,
                 // @ts-ignore
                 lockedAt: post.lockedAt
             }, { status: 403 });
        }
    }

    return NextResponse.json({
        locked: true,
        self: false,
        // @ts-ignore
        lockedBy: post.lockedUser,
        // @ts-ignore
        lockedAt: post.lockedAt
    });

  } catch (error) {
    console.error("Lock Error:", error);
    return NextResponse.json({ error: "Lock failed" }, { status: 500 });
  }
}