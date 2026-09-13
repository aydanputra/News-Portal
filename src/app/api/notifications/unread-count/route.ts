import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) return NextResponse.json({ count: 0 });

    // @ts-ignore
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/notifications/unread-count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
