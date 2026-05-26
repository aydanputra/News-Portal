import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();

    if (id === "all") {
        // @ts-ignore
        await prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true }
        });
    } else {
        // @ts-ignore
        await prisma.notification.update({
            where: { id, userId: user.id },
            data: { read: true }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/notifications/mark-read error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
