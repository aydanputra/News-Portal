import { NextResponse } from "next/server";
import { isToolEnabledForRequest, requireAdmin, type ToolId } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

const ALL_TOOLS: ToolId[] = ["wp_import", "media_migration", "print_tools", "backfill_excerpts"];

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowlistRaw = process.env.TENANT_TOOLS_ALLOWLIST;
  const allowlistActive = typeof allowlistRaw === "string" && allowlistRaw.trim() !== "";

  const enabledTools = ALL_TOOLS.filter((t) => isToolEnabledForRequest(request, t));

  return NextResponse.json({
    allowlistActive,
    enabledTools,
  });
}

