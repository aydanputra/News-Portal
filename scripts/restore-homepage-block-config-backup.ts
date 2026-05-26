import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

type BackupItem = {
  id: string;
  config: Record<string, unknown>;
  type?: string;
  title?: string | null;
  order?: number;
};

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const fileArg = args.find((a) => a.startsWith("--file="));
const limitArg = args.find((a) => a.startsWith("--limit="));

if (!fileArg) {
  console.error("Parameter wajib: --file=/path/to/backup.json");
  process.exit(1);
}

const filePath = resolve(fileArg.split("=")[1]);
const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

const parseBackup = (raw: string): BackupItem[] => {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Format backup tidak valid: root JSON harus array.");
  }
  const items: BackupItem[] = [];
  for (const row of parsed) {
    if (!row || typeof row !== "object") continue;
    const id = (row as any).id;
    const config = (row as any).config;
    if (typeof id !== "string" || !id) continue;
    if (!config || typeof config !== "object" || Array.isArray(config)) continue;
    items.push({
      id,
      config: config as Record<string, unknown>,
      type: typeof (row as any).type === "string" ? (row as any).type : undefined,
      title: typeof (row as any).title === "string" ? (row as any).title : null,
      order: typeof (row as any).order === "number" ? (row as any).order : undefined,
    });
  }
  return items;
};

async function main() {
  const raw = readFileSync(filePath, "utf8");
  const allItems = parseBackup(raw);
  const items = typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? allItems.slice(0, limit) : allItems;

  if (items.length === 0) {
    console.log("Tidak ada item valid di file backup.");
    return;
  }

  const existing = await prisma.homepageBlock.findMany({
    where: { id: { in: items.map((x) => x.id) } },
    select: { id: true, type: true, title: true, order: true },
  });
  const existingIds = new Set(existing.map((x) => x.id));
  const validItems = items.filter((x) => existingIds.has(x.id));
  const missingIds = items.filter((x) => !existingIds.has(x.id)).map((x) => x.id);

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        filePath,
        totalParsed: allItems.length,
        totalTargeted: items.length,
        totalMatched: validItems.length,
        totalMissing: missingIds.length,
      },
      null,
      2
    )
  );

  if (missingIds.length > 0) {
    console.log("ID tidak ditemukan (skip):");
    for (const id of missingIds.slice(0, 50)) console.log(id);
  }

  console.log("Preview restore:");
  for (const item of validItems.slice(0, 20)) {
    const meta = existing.find((x) => x.id === item.id);
    console.log(
      JSON.stringify(
        {
          id: item.id,
          type: meta?.type ?? item.type ?? null,
          title: meta?.title ?? item.title ?? null,
          order: meta?.order ?? item.order ?? null,
        },
        null,
        2
      )
    );
  }

  if (!apply) {
    console.log("Dry-run selesai. Tambahkan --apply untuk menjalankan restore.");
    return;
  }

  for (const item of validItems) {
    await prisma.homepageBlock.update({
      where: { id: item.id },
      data: { config: item.config as Prisma.InputJsonValue },
    });
  }

  console.log(`Restore selesai. Total updated: ${validItems.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
