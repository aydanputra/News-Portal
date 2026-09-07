import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { decryptTotpSecret, verifyTotpToken, generateRecoveryCodes } from "@/lib/two-factor";

// Aktifkan 2FA setelah user berhasil memasukkan kode TOTP yang valid.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json({ error: "Kode 2FA wajib diisi" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA sudah aktif" }, { status: 400 });
    }

    if (!dbUser.twoFactorSecret) {
      return NextResponse.json({ error: "Mulai pengaturan 2FA terlebih dahulu" }, { status: 400 });
    }

    let secret: string;
    try {
      secret = decryptTotpSecret(dbUser.twoFactorSecret);
    } catch {
      return NextResponse.json({ error: "Konfigurasi 2FA tidak valid. Ulangi pengaturan." }, { status: 500 });
    }

    if (!(await verifyTotpToken(secret, code))) {
      return NextResponse.json({ error: "Kode 2FA salah" }, { status: 400 });
    }

    const recovery = generateRecoveryCodes();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorEnabledAt: new Date(),
        twoFactorRecovery: recovery.encrypted,
      },
    });

    return NextResponse.json({ success: true, recoveryCodes: recovery.plain });
  } catch (error) {
    console.error("2FA Enable Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
