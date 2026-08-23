import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth-middleware";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      // user,
       user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
  },
    });
  } catch (error) {
    console.error("ME API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user",
      },
      { status: 500 }
    );
  }
}