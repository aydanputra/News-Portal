import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) return NextResponse.json({ data: [] });

    // @ts-ignore
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ data: [] });
  }
}
