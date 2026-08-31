
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-cookie";

export async function POST() {
  const cookieStore = await cookies();
  
  // Hapus cookie auth
  cookieStore.set(AUTH_COOKIE_NAME, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

  return NextResponse.json({ message: "Logout berhasil" });
}
