import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { PostStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Secret Validation
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 2. Find Scheduled Posts Ready to Publish
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        publishedAt: {
          lte: now
        }
      },
      select: {
        id: true,
        slug: true,
        title: true
      }
    });

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0, message: "No posts to publish" });
    }

    // 3. Process Updates Transactionally
    // Note: We use a loop for revalidation logic, but batch update for DB if possible.
    // However, we need slug for granular revalidation, so loop is safer.
    
    let updatedCount = 0;

    for (const post of scheduledPosts) {
        await prisma.post.update({
            where: { id: post.id },
            data: {
                status: PostStatus.PUBLISHED,
                published: true, // Ensure visibility flag is true
            }
        });

        // 4. Trigger Granular Revalidation
        revalidateTag(`article-${post.slug}`);
        
        console.log(`[CRON] Published scheduled post: ${post.title} (${post.id})`);
        updatedCount++;
    }

    // 5. Trigger Global Revalidation (Once per batch)
    if (updatedCount > 0) {
        revalidateTag("homepage");
        revalidateTag("posts");
        console.log(`[CRON] ${updatedCount} posts published at ${new Date().toISOString()}`);
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount,
      posts: scheduledPosts.map(p => p.slug)
    });

  } catch (error: any) {
    console.error("[CRON] Publish Scheduled Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}