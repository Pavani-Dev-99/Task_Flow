import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function authenticate(request: NextRequest) {
  const cookieToken = request.cookies.get("session")?.value;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 }
    );
  }

  try {
    return verifyToken(token);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired session",
      },
      { status: 401 }
    );
  }
}