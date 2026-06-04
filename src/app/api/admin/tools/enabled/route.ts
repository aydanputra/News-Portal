import { NextResponse } from "next/server";
import { getToolsAllowlistSource, getToolsRequestHost, isToolEnabledForRequest, isToolsAllowlistActive, requireAdmin } from "@/lib/api-guards";
import { ALL_TOOL_IDS, type ToolId } from "@/lib/tools";

export const dynamic = "force-dynamic";

const ALL_TOOLS: ToolId[] = ALL_TOOL_IDS;

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowlistActive = isToolsAllowlistActive();
  const source = getToolsAllowlistSource();
  const host = getToolsRequestHost(request);

  const enabledTools = ALL_TOOLS.filter((t) => isToolEnabledForRequest(request, t));

  return NextResponse.json({
    allowlistActive,
    source,
    host,
    enabledTools,
  });
}
