import { Prisma, PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

type JsonRecord = Record<string, unknown>;

const prisma = new PrismaClient();

const LEGACY_TO_CANONICAL: Record<string, string> = {
  showMeta: "showMetaInfo",
  tabletShowMeta: "tabletShowMetaInfo",
  mobileShowMeta: "mobileShowMetaInfo",
  categoryTextColor: "categoryLabelColor",
  tabletCategoryTextColor: "tabletCategoryLabelColor",
  mobileCategoryTextColor: "mobileCategoryLabelColor",
  categoryBgColor: "categoryLabelBgColor",
  tabletCategoryBgColor: "tabletCategoryLabelBgColor",
  mobileCategoryBgColor: "mobileCategoryLabelBgColor",
  categoryFontSize: "categoryLabelFontSize",
  tabletCategoryFontSize: "tabletCategoryLabelFontSize",
  mobileCategoryFontSize: "mobileCategoryLabelFontSize",
  categoryBorderRadius: "categoryLabelBorderRadius",
  tabletCategoryBorderRadius: "tabletCategoryLabelBorderRadius",
  mobileCategoryBorderRadius: "mobileCategoryLabelBorderRadius",
};

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const keepLegacy = args.has("--keep-legacy");
const themeArg = process.argv.find((a) => a.startsWith("--theme="));
const locationArg = process.argv.find((a) => a.startsWith("--location="));
const theme = themeArg ? themeArg.split("=")[1] : "pranala";
const location = locationArg ? locationArg.split("=")[1] : "home";

const normalizeConfig = (source: JsonRecord) => {
  const next: JsonRecord = { ...source };
  const changes: Array<{ from: string; to: string; value: unknown; action: "copied" | "moved" }> = [];

  for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_TO_CANONICAL)) {
    if (!(legacyKey in source)) continue;
    if (next[canonicalKey] === undefined) {
      next[canonicalKey] = source[legacyKey];
      changes.push({
        from: legacyKey,
        to: canonicalKey,
        value: source[legacyKey],
        action: keepLegacy ? "copied" : "moved",
      });
    }
    if (!keepLegacy) {
      delete next[legacyKey];
    }
  }

  return { next, changes };
};

async function main() {
  const blocks = await prisma.homepageBlock.findMany({
    where: { themeId: theme, location },
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      title: true,
      order: true,
      config: true,
      themeId: true,
      location: true,
    },
  });

  const affected: Array<{
    id: string;
    type: string;
    title: string | null;
    order: number;
    changes: Array<{ from: string; to: string; value: unknown; action: "copied" | "moved" }>;
    before: JsonRecord;
    after: JsonRecord;
  }> = [];

  for (const block of blocks) {
    if (!block.config || typeof block.config !== "object" || Array.isArray(block.config)) continue;
    const before = block.config as JsonRecord;
    const { next, changes } = normalizeConfig(before);
    if (changes.length === 0) continue;
    affected.push({
      id: block.id,
      type: block.type,
      title: block.title ?? null,
      order: block.order,
      changes,
      before,
      after: next,
    });
  }

  const summary = {
    mode: apply ? "apply" : "dry-run",
    keepLegacy,
    totalBlocksScanned: blocks.length,
    totalBlocksAffected: affected.length,
    totalKeyChanges: affected.reduce((acc, b) => acc + b.changes.length, 0),
    theme,
    location,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (affected.length > 0) {
    console.log("Affected blocks preview:");
    for (const block of affected.slice(0, 20)) {
      console.log(
        JSON.stringify(
          {
            id: block.id,
            order: block.order,
            type: block.type,
            title: block.title,
            changes: block.changes.map((c) => ({ from: c.from, to: c.to, action: c.action })),
          },
          null,
          2
        )
      );
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(process.cwd(), "scripts", "backups");
  mkdirSync(backupDir, { recursive: true });

  const reportPath = join(backupDir, `homepage-block-config-normalize-report-${timestamp}.json`);
  writeFileSync(reportPath, JSON.stringify({ summary, affected }, null, 2));
  console.log(`Report saved: ${reportPath}`);

  if (!apply) {
    console.log("Dry-run selesai. Jalankan dengan --apply untuk menyimpan perubahan.");
    return;
  }

  const backupPath = join(backupDir, `homepage-block-config-backup-${timestamp}.json`);
  writeFileSync(
    backupPath,
    JSON.stringify(
      affected.map((b) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        order: b.order,
        config: b.before,
      })),
      null,
      2
    )
  );
  console.log(`Backup saved: ${backupPath}`);

  for (const block of affected) {
    await prisma.homepageBlock.update({
      where: { id: block.id },
      data: { config: block.after as Prisma.InputJsonValue },
    });
  }

  console.log("Apply selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
