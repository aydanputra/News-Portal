import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/audit";
import { assertRateLimit } from "@/lib/api-guards";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const rlGeneric = assertRateLimit(request, "auth:login", { windowMs: 60_000, max: 15 });
    if (!rlGeneric.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rlGeneric.retryAfterSeconds) } },
      );
    }

    const emailKey = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (emailKey) {
      const rlEmail = assertRateLimit(request, `auth:login:${emailKey}`, { windowMs: 60_000, max: 8 });
      if (!rlEmail.ok) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan login untuk email ini. Coba lagi nanti." },
          { status: 429, headers: { "Retry-After": String(rlEmail.retryAfterSeconds) } },
        );
      }
    }

    // 1. Cari user di database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 401 });
    }

    // 2. Cek password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 3. Buat Tiket (JWT)
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // 4. Simpan Tiket di Cookie
    // httpOnly: true -> Agar tidak bisa dicuri via JavaScript browser
    // secure: true -> Hanya lewat HTTPS (di production)
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/", // Berlaku di seluruh website
    });

    await logActivity(user.id, "LOGIN", "Auth", user.id, { email: user.email }, request);

    return NextResponse.json({ success: true, user: { name: user.name, role: user.role } });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
