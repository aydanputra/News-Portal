import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Helper: Get User
async function getUser(id: string) {
    const user = await (prisma.user as any).findUnique({
        where: { id }
    });
    
    if (!user) return null;

    // Filter fields manually to avoid select issues and linter errors
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        telegramChatId: user.telegramChatId
    };
}

// GET: Detail User
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const currentUser = verifyToken(token || "");

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await getUser(id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error: any) {
    console.error("Get User Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch user" }, { status: 500 });
  }
}

// PUT: Update User
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      const currentUser = verifyToken(token || "");
  
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      const body = await request.json();
      const { name, email, password, role, status, username, bio, telegramChatId } = body;

      // Check for email duplication if email is being changed
      if (email) {
          const existingUser = await (prisma.user as any).findFirst({
              where: { 
                  email,
                  id: { not: id }
              }
          });
          if (existingUser) {
              return NextResponse.json({ error: "Email sudah digunakan oleh pengguna lain" }, { status: 400 });
          }
      }

      // Prepare Update Data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (username !== undefined) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;
      
      if (role) {
          if (!Object.values(Role).includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
          updateData.role = role;
      }
      if (status) {
          updateData.status = status;
      }
      if (password && password.length >= 8) {
          updateData.password = await bcrypt.hash(password, 10);
      }

      // Execute Update
      const updatedUser = await (prisma.user as any).update({
          where: { id },
          data: updateData,
          select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true
          }
      });
      
      console.log(`[AUDIT] User updated: ${updatedUser.email} by ${currentUser.email}`);

      return NextResponse.json(updatedUser);
  
    } catch (error) {
      console.error("Update User Error:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// DELETE: Soft Delete User
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      const currentUser = verifyToken(token || "");
  
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (id === currentUser.id) {
          return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
      }

      // Soft Delete
      // @ts-ignore
      await prisma.user.update({
          where: { id },
          data: { 
              // @ts-ignore
              deletedAt: new Date(),
              // @ts-ignore
              status: "SUSPENDED" 
          }
      });
      
      console.log(`[AUDIT] User deleted (soft): ${id} by ${currentUser.email}`);

      return NextResponse.json({ success: true });
  
    } catch (error) {
      console.error("Delete User Error:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}