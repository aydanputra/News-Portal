import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server-auth";
import { getDashboardDataForUser } from "@/lib/admin/dashboard-data";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await getDashboardDataForUser(user);
    return NextResponse.json(data);

  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
