import { NextResponse } from "next/server";
import { getEnabledToolsForRequest, getToolsRequestHost } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import {
  ALL_MANAGED_TOOL_IDS,
  expandManagedToolVisibility,
  getManagedToolVisibility,
  MANAGED_TOOL_DESCRIPTIONS,
  MANAGED_TOOL_LABELS,
  normalizeManagedToolVisibility,
  type ToolId,
} from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { toolVisibility: true },
  });
  const toolVisibility = getManagedToolVisibility(settings?.toolVisibility);
  const enabledTools = await getEnabledToolsForRequest(request);
  const host = getToolsRequestHost(request);
  const enabledToolGroups = ALL_MANAGED_TOOL_IDS.filter((id) => toolVisibility[id]).map((id) => ({
    id,
    label: MANAGED_TOOL_LABELS[id],
  }));

  return NextResponse.json({
    source: settings?.toolVisibility ? "super_admin" : "default",
    host,
    enabledTools,
    enabledToolGroups,
    toolVisibility,
    canManage: user.role === "SUPER_ADMIN",
    allTools: ALL_MANAGED_TOOL_IDS.map((id) => ({
      id,
      label: MANAGED_TOOL_LABELS[id],
      description: MANAGED_TOOL_DESCRIPTIONS[id],
    })),
  });
}

export async function PUT(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const managedVisibility = normalizeManagedToolVisibility(body?.toolVisibility);
  const toolVisibility = expandManagedToolVisibility(managedVisibility);

  await prisma.setting.upsert({
    where: { id: "default" },
    update: { toolVisibility },
    create: { id: "default", toolVisibility },
  });

  return NextResponse.json({
    ok: true,
    toolVisibility: managedVisibility,
    enabledTools: (Object.keys(toolVisibility) as ToolId[]).filter((id) => toolVisibility[id]),
    enabledToolGroups: ALL_MANAGED_TOOL_IDS.filter((id) => managedVisibility[id]).map((id) => ({
      id,
      label: MANAGED_TOOL_LABELS[id],
    })),
  });
}
