import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { authenticate } from "../../../../src/lib/auth-middleware";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // const updateData: {
    //   name?: string;
    //   email?: string;
    //   role?: "ADMIN" | "EMPLOYEE";
    //   isActive?: boolean;
    //   passwordHash?: string;
    //   passwordChangedAt?: Date;
    // } = {};

    // if (data.name !== undefined) {
    //   updateData.name = data.name;
    // }

    // if (data.email !== undefined) {
    //   updateData.email = data.email;
    // }

    // if (data.role !== undefined) {
    //   updateData.role = data.role;
    // }

    // if (data.isActive !== undefined) {
    //   updateData.isActive = data.isActive;
    // }

    // if (data.password !== undefined) {
    //   updateData.passwordHash = await bcrypt.hash(data.password, 12);
    //   updateData.passwordChangedAt = new Date();
    // }

    const updateData: {
  name?: string;
  email?: string;
  role?: "ADMIN" | "EMPLOYEE";
  is_active?: boolean;
  password_hash?: string;
  password_changed_at?: Date;
} = {};

if (data.name !== undefined) {
  updateData.name = data.name;
}

if (data.email !== undefined) {
  updateData.email = data.email;
}

if (data.role !== undefined) {
  updateData.role = data.role;
}

if (data.isActive !== undefined) {
  updateData.is_active = data.isActive;
}

if (data.password !== undefined) {
  updateData.password_hash = await bcrypt.hash(data.password, 12);
  updateData.password_changed_at = new Date();
}

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // isActive: true,
        is_active: true,
        // passwordChangedAt: true,
        password_changed_at: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (userId === auth.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}