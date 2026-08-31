import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "WRITER";

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = verifyToken(token || "");
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, status: true, name: true, avatar: true },
  });

  if (!user || user.status !== "ACTIVE") return null;
  return user as {
    id: string;
    email: string;
    role: Role;
    status: "ACTIVE" | "SUSPENDED";
    name: string;
    avatar: string | null;
  };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;
  return user;
}
