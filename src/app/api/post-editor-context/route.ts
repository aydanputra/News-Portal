import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function pickWatermarkSettings(setting: any) {
  return {
    postImageWatermarkUrl: setting?.postImageWatermarkUrl || "",
    postImageWatermarkOpacity: setting?.postImageWatermarkOpacity ?? 35,
    postImageWatermarkSize: setting?.postImageWatermarkSize ?? 24,
    postImageWatermarkPosition: setting?.postImageWatermarkPosition || "center",
    postImageWatermarkPaddingTop: setting?.postImageWatermarkPaddingTop ?? 24,
    postImageWatermarkPaddingRight: setting?.postImageWatermarkPaddingRight ?? 24,
    postImageWatermarkPaddingBottom: setting?.postImageWatermarkPaddingBottom ?? 24,
    postImageWatermarkPaddingLeft: setting?.postImageWatermarkPaddingLeft ?? 24,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [setting, users] = await Promise.all([
      getSettings(),
      (prisma.user as any).findMany({
        where:
          user.role === "WRITER"
            ? {
                deletedAt: null,
                OR: [
                  { id: user.id },
                  { status: "ACTIVE", role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] } },
                ],
              }
            : {
                deletedAt: null,
                status: "ACTIVE",
              },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        take: 100,
      }),
    ]);

    return NextResponse.json({
      watermarkSettings: pickWatermarkSettings(setting),
      users,
      currentUser: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GET /api/post-editor-context error:", error);
    return NextResponse.json({ error: "Failed to fetch editor context" }, { status: 500 });
  }
}
