import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json({ error: "Gagal mengambil tags" }, { status: 500 });
  }
}
