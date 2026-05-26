import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// GET: List Users (Admin Only)
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");

    const skip = (page - 1) * limit;

    const whereClause: any = {
        deletedAt: null, // Filter soft deleted
        OR: search ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ] : undefined
    };

    if (role && Object.values(Role).includes(role as Role)) {
        whereClause.role = role as Role;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                // @ts-ignore
                status: true,
                createdAt: true,
                // @ts-ignore
                lastLoginAt: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where: whereClause })
    ]);

    return NextResponse.json({
        data: users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (error) {
    console.error("List Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Create User (Admin Only)
export async function POST(request: Request) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      const currentUser = verifyToken(token || "");
  
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      const body = await request.json();
      const { name, email, password, role, username, bio, telegramChatId } = body;

      // Validation
      if (!name || !email || !password || !role) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (!Object.values(Role).includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      if (role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Password complexity check (min 8 chars)
      if (password.length < 8) {
          return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }

      // Check Email Uniqueness
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
          return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      const normalizedUsername = typeof username === "string" ? username.trim() : "";
      if (normalizedUsername) {
          const existingUsername = await (prisma.user as any).findFirst({
              where: { username: normalizedUsername },
              select: { id: true }
          });
          if (existingUsername) {
              return NextResponse.json({ error: "Username already used" }, { status: 400 });
          }
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // @ts-ignore
      const newUser = await (prisma.user as any).create({
          data: {
              name,
              email,
              password: hashedPassword,
              role: role as Role,
              // @ts-ignore
              status: "ACTIVE",
              username: normalizedUsername || null,
              bio: typeof bio === "string" ? bio.trim() : null,
              telegramChatId: typeof telegramChatId === "string" ? telegramChatId.trim() : null
          },
          select: {
              id: true,
              name: true,
              email: true,
              role: true,
              username: true,
              bio: true,
              telegramChatId: true,
              // @ts-ignore
              status: true,
              createdAt: true
          }
      });
      
      console.log(`[AUDIT] User created: ${newUser.email} by ${currentUser.email}`);

      return NextResponse.json(newUser, { status: 201 });
  
    } catch (error) {
      console.error("Create User Error:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }
