
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
  } catch {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
