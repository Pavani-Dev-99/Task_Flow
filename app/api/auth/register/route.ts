import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // const { name, email, password } = body;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    // const passwordHash = await bcrypt.hash(password, 12);

    // const user = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     passwordHash,
    //     role: "EMPLOYEE",
    //     isActive: true,
    //   },
    // });

    const password_hash = await bcrypt.hash(password, 12);

// const user = await prisma.user.create({

const user = await prisma.user.create({
  data: {
    name,
    email,
    password_hash,
    role: "EMPLOYEE",
    is_active: true,
  },
});
//   data: {
//     name,
//     email,
//     password_hash,
//     role: "EMPLOYEE",
//     isActive: true,
//   },
// });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
      },
      { status: 500 }
    );
  }
}