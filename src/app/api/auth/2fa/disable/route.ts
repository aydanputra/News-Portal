import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { verifyPassword } from "@/lib/auth";

// Nonaktifkan 2FA (wajib konfirmasi password).
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true, twoFactorEnabled: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (!dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA belum aktif" }, { status: 400 });
    }

    const valid = await verifyPassword(password, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecovery: null,
        twoFactorEnabledAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA Disable Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
