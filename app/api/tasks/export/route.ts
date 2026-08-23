import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { authenticate } from "../../../../src/lib/auth-middleware";

function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const tasks = await prisma.task.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const headers = [
      "Task ID",
      "User ID",
      "User Name",
      "User Email",
      "User Role",
      "Start Time",
      "Stop Time",
      "Notes",
      "Description",
      "Created At",
      "Updated At",
    ];

    const rows = tasks.map((task) => [
      task.id,
      task.user.id,
      task.user.name,
      task.user.email,
      task.user.role,
      task.startTime.toISOString(),
      task.stopTime.toISOString(),
      task.notes,
      task.description,
      task.createdAt.toISOString(),
      task.updatedAt.toISOString(),
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tasks-report.csv"',
      },
    });
  } catch (error) {
    console.error("Task CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export tasks",
      },
      { status: 500 }
    );
  }
}