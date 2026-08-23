import { NextResponse } from "next/server";
import { AuthPayload } from "@/src/lib/auth";

export function requireRole(
  user: AuthPayload,
  allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        message: "Access denied",
      },
      { status: 403 }
    );
  }

  return null;
}