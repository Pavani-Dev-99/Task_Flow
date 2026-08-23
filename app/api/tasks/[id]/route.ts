import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { authenticate } from "../../../../src/lib/auth-middleware";
import { z } from "zod";

const updateTaskSchema = z.object({
  startTime: z.string().datetime().optional(),
  stopTime: z.string().datetime().optional(),
  notes: z.string().min(1, "Notes are required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});

// UPDATE TASK
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { id } = await params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    // Employees can only edit their own tasks.
    if (auth.role !== "ADMIN" && task.userId !== auth.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only edit your own tasks",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = updateTaskSchema.safeParse(body);

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

    // Validate final start/stop times, including partial updates.
    const finalStartTime = data.startTime
      ? new Date(data.startTime)
      : task.startTime;

    const finalStopTime = data.stopTime
      ? new Date(data.stopTime)
      : task.stopTime;

    if (finalStopTime <= finalStartTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Stop Time must be later than Start Time",
        },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(data.startTime && {
          startTime: new Date(data.startTime),
        }),
        ...(data.stopTime && {
          stopTime: new Date(data.stopTime),
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task",
      },
      { status: 500 }
    );
  }
}

// DELETE TASK
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { id } = await params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    // Employees can only delete their own tasks.
    if (auth.role !== "ADMIN" && task.userId !== auth.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own tasks",
        },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete task",
      },
      { status: 500 }
    );
  }
}