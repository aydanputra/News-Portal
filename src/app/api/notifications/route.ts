import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

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
