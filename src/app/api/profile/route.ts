import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-cookie";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET: Current User Profile
export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching profile for user ID:", user.id);

    // Try a simple query first
    const rawUser = await (prisma.user as any).findUnique({
      where: { id: user.id }
    });

    if (!rawUser) {
      console.error("User not found in DB for ID:", user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter fields manually to avoid any select issues
    const profile = {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        status: rawUser.status,
        createdAt: rawUser.createdAt,
        updatedAt: rawUser.updatedAt,
        username: rawUser.username,
        bio: rawUser.bio,
        avatar: rawUser.avatar,
        banner: rawUser.banner,
        socialAccounts: rawUser.socialAccounts,
        telegramChatId: rawUser.telegramChatId,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update Current User Profile
export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, username, bio, avatar, banner, socialAccounts, telegramChatId } = body;

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    // Handle username: if empty string, set to null to avoid unique constraint violation on empty strings
    if (username !== undefined) {
        updateData.username = username === "" ? null : username;
    }
    if (bio !== undefined) updateData.bio = bio;
    
    // SAFETY: Only update avatar/banner if they are not empty strings 
    // to prevent accidental deletion if frontend state fails to load
    if (avatar) updateData.avatar = avatar;
    if (banner) updateData.banner = banner;
    
    if (socialAccounts !== undefined) updateData.socialAccounts = socialAccounts;
    if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;
    
    if (password) {
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    console.log("Updating profile for user:", user.id, "Data:", JSON.stringify(updateData, null, 2));

    const updatedUser = await (prisma.user as any).update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
        username: true,
        bio: true,
        avatar: true,
        banner: true,
        socialAccounts: true,
        telegramChatId: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    // @ts-ignore
    if (error.code === 'P2002') {
        const target = (error as any).meta?.target;
        return NextResponse.json({ error: `Username or Email already exists (${target})` }, { status: 400 });
    }
    return NextResponse.json({ error: `Internal Server Error: ${(error as any).message}` }, { status: 500 });
  }
}

// DELETE: Delete (Suspend) Account
export async function DELETE(request: Request) {
    try {
        const user = await requireUser();
        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { password } = body;

        // Verify password before deleting
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isPasswordValid = await bcrypt.compare(password, dbUser.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Password incorrect" }, { status: 400 });
        }

        // Soft Delete
        await prisma.user.update({
            where: { id: user.id },
            data: {
                status: "SUSPENDED",
                deletedAt: new Date(),
            }
        });

        // Logout by deleting cookie
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete Profile Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
