import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { generateTwoFactorSetup, encryptTotpSecret, decryptTotpSecret, buildTwoFactorSetup } from "@/lib/two-factor";

export const dynamic = "force-dynamic";

// Ambil (atau buat) secret 2FA + URL otpauth + QR untuk pengaturan.
export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const settings = await prisma.setting.findUnique({
      where: { id: "default" },
      select: { siteName: true },
    });
    const issuer = settings?.siteName || "News Portal";

    let secret: string;
    if (dbUser.twoFactorSecret) {
      secret = decryptTotpSecret(dbUser.twoFactorSecret);
    } else {
      const setup = await generateTwoFactorSetup(user.email, issuer);
      secret = setup.secret;
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: encryptTotpSecret(secret) },
      });
    }

    // Bangun ulang otpauth + QR dari secret yang tersimpan agar stabil antar refresh.
    const setup = await buildTwoFactorSetup(secret, user.email, issuer);

    return NextResponse.json(setup);
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
