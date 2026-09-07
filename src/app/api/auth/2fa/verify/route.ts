import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, createToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/audit";
import { assertRateLimit } from "@/lib/api-guards";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, TWO_FACTOR_COOKIE_NAME } from "@/lib/auth-cookie";
import { decryptTotpSecret, verifyTotpToken, verifyRecoveryCode } from "@/lib/two-factor";

// Langkah kedua login: verifikasi kode TOTP / recovery, lalu terbitkan tiket penuh.
export async function POST(request: Request) {
  try {
    const rl = assertRateLimit(request, "auth:2fa:verify", { windowMs: 60_000, max: 10 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const cookieStore = await cookies();
    const pendingToken = cookieStore.get(TWO_FACTOR_COOKIE_NAME)?.value;
    const payload = verifyToken(pendingToken || "");
    if (!payload?.id) {
      return NextResponse.json({ error: "Sesi verifikasi 2FA kedaluwarsa. Silakan login ulang." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json({ error: "Kode 2FA wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        status: true,
        deletedAt: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorRecovery: true,
      },
    });

    if (!user || user.status !== "ACTIVE" || user.deletedAt || !user.twoFactorEnabled) {
      return NextResponse.json({ error: "Akun tidak valid. Silakan login ulang." }, { status: 401 });
    }

    let valid = false;
    if (user.twoFactorSecret) {
      try {
        const secret = decryptTotpSecret(user.twoFactorSecret);
        valid = await verifyTotpToken(secret, code);
      } catch {
        valid = false;
      }
    }

    if (!valid && user.twoFactorRecovery) {
      valid = verifyRecoveryCode(user.twoFactorRecovery, code);
    }

    if (!valid) {
      return NextResponse.json({ error: "Kode 2FA salah" }, { status: 401 });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24,
    });

    // Hapus token pending
    cookieStore.set(TWO_FACTOR_COOKIE_NAME, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

    await logActivity(user.id, "LOGIN", "Auth", user.id, { email: user.email, twoFactor: true }, request);

    return NextResponse.json({ success: true, user: { name: user.name, role: user.role } });
  } catch (error) {
    console.error("2FA Verify Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
