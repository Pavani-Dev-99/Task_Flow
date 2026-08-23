import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";
import { authenticate } from "../../../src/lib/auth-middleware";
import { z } from "zod";

const createTaskSchema = z
  .object({
    startTime: z.string().datetime(),
    stopTime: z.string().datetime(),
    notes: z.string().min(1, "Notes are required"),
    description: z.string().min(1, "Description is required"),
    userId: z.number().int().positive().optional(),
  })
  .refine(
    (data) => new Date(data.stopTime) > new Date(data.startTime),
    {
      message: "Stop Time must be later than Start Time",
      path: ["stopTime"],
    }
  );

// CREATE TASK
export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json();

    const result = createTaskSchema.safeParse(body);

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

    const {
      startTime,
      stopTime,
      notes,
      description,
      userId,
    } = result.data;

    let taskUserId = auth.id;

    // Admin may create task for another employee
    if (auth.role === "ADMIN" && userId) {
      taskUserId = userId;
    }

    // Employee can only create task for themselves
    if (
      auth.role !== "ADMIN" &&
      userId &&
      userId !== auth.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Employees can only create tasks for themselves",
        },
        { status: 403 }
      );
    }

    // const taskUser = await prisma.user.findUnique({
    //   where: {
    //     id: taskUserId,
    //   },
    // });

    // if (!taskUser) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "User not found",
    //     },
    //     { status: 404 }
    //   );
    // }

    const taskUser = await prisma.user.findUnique({
  where: {
    id: taskUserId,
  },
});

if (!taskUser) {
  return NextResponse.json(
    {
      success: false,
      message: "User not found",
    },
    { status: 404 }
  );
}

if (taskUser.role !== "EMPLOYEE") {
  return NextResponse.json(
    {
      success: false,
      message: "Tasks can only be assigned to employees",
    },
    { status: 400 }
  );
}

    const task = await prisma.task.create({
      data: {
        userId: taskUserId,
        startTime: new Date(startTime),
        stopTime: new Date(stopTime),
        notes,
        description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET TASKS
export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const tasks = await prisma.task.findMany({
      where:
        auth.role === "ADMIN"
          ? undefined
          : {
              userId: auth.id,
            },
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

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}