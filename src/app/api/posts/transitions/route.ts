
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PostStatus, Role } from "@prisma/client";
import { getAllowedTransitions } from "@/lib/post-workflow";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentStatus = searchParams.get("currentStatus") as PostStatus;

    if (!currentStatus || !Object.values(PostStatus).includes(currentStatus)) {
      // Allow empty status (e.g. for new post)
      // Default to DRAFT
      if (!currentStatus) {
         const allowed = getAllowedTransitions(PostStatus.DRAFT, user.role as Role);
         return NextResponse.json({
             currentStatus: PostStatus.DRAFT,
             allowedTransitions: allowed
         });
      }
      return NextResponse.json({ error: "Invalid Status" }, { status: 400 });
    }

    const allowed = getAllowedTransitions(currentStatus, user.role as Role);

    return NextResponse.json({ 
        currentStatus,
        allowedTransitions: allowed 
    });

  } catch (error) {
    console.error("GET /api/posts/transitions error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
