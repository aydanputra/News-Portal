import { Prisma, PrismaClient } from "@prisma/client";
import { DEFAULT_PRANALA_POST_BLOCKS } from "../src/lib/post-builder-defaults";

const prisma = new PrismaClient();
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const reset = args.has("--reset");

async function main() {
  const themeId = "pranala";
  const location = "post";
  const existing = await prisma.homepageBlock.findMany({
    where: { themeId, location },
    orderBy: { order: "asc" },
    select: { id: true, order: true, title: true, type: true },
  });

  const summary = {
    mode: apply ? "apply" : "dry-run",
    reset,
    themeId,
    location,
    existingBlocks: existing.length,
    seedBlocks: DEFAULT_PRANALA_POST_BLOCKS.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log("Dry-run selesai. Gunakan --apply untuk menyimpan.");
    return;
  }

  if (existing.length > 0 && !reset) {
    console.log("Seed dibatalkan karena data post builder pranala sudah ada. Gunakan --reset --apply untuk overwrite.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (reset || existing.length > 0) {
      await tx.homepageBlock.deleteMany({ where: { themeId, location } });
    }

    for (const [index, block] of DEFAULT_PRANALA_POST_BLOCKS.entries()) {
      await tx.homepageBlock.create({
        data: {
          type: block.type,
          title: block.title,
          order: index + 1,
          isActive: block.isVisible ?? true,
          config: (block.config || {}) as Prisma.InputJsonValue,
          placement: block.placement || "main",
          location,
          themeId,
        },
      });
    }
  });

  const afterCount = await prisma.homepageBlock.count({ where: { themeId, location } });
  console.log(`Seed selesai. Total blocks tersimpan: ${afterCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
