
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { assertRateLimit, requireAdmin } from "@/lib/api-guards";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, "revalidate", { windowMs: 60_000, max: 10 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const { tag, path } = body;

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, type: 'tag', tag });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, type: 'path', path });
    }

    // Default: Purge Everything
    revalidateTag("homepage");
    revalidateTag("posts");
    revalidatePath("/", "layout");

    return NextResponse.json({ revalidated: true, type: 'all' });
  } catch (error) {
    console.error("POST /api/revalidate error:", error);
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
