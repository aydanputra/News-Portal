import { prisma } from "@/lib/prisma";

// Batches the hot `Post.views` counter so a single page view does not write to
// the shared `Post` row on every request. Instead, increments are buffered in
// memory and flushed periodically (plus once a size threshold is reached).
//
// Dedup (postViewVisitorWindow) and daily analytics (postViewDaily) are still
// written per request: they are needed for correct unique-visitor counting and
// for the dashboard. Only the aggregate `Post.views` counter is deferred, which
// is safe because it is eventually-consistent by design.

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BUFFER_SIZE = 2_000;

const pending = new Map<string, number>();
let timer: ReturnType<typeof setInterval> | null = null;

function ensureTimer() {
  if (timer) return;
  timer = setInterval(() => {
    void flushPostViewBatch().catch((error) => {
      console.error("view-batcher periodic flush failed:", error);
    });
  }, FLUSH_INTERVAL_MS);
  // Do not keep the Node process alive solely for the flush timer.
  timer.unref?.();
}

export function enqueuePostView(postId: string) {
  pending.set(postId, (pending.get(postId) ?? 0) + 1);
  ensureTimer();

  if (pending.size >= MAX_BUFFER_SIZE) {
    void flushPostViewBatch().catch((error) => {
      console.error("view-batcher threshold flush failed:", error);
    });
  }
}

export async function flushPostViewBatch() {
  if (pending.size === 0) return;

  const entries = Array.from(pending.entries());
  pending.clear();

  await Promise.all(
    entries.map(([postId, count]) =>
      prisma.post.update({
        where: { id: postId },
        data: { views: { increment: count } },
      }),
    ),
  );
}
