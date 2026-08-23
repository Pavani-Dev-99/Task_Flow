
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
    const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get logged-in user
        const userResponse = await fetch("/api/auth/me");
        const userData = await userResponse.json();

        if (!userData.success) {
        //   window.location.href = "/";
        router.replace("/");
          return;
        }

        setUser(userData.user);

        // Get tasks
        const taskResponse = await fetch("/api/tasks");
        const taskData = await taskResponse.json();

        if (taskData.success) {
          setTasks(taskData.tasks);
        } else {
          console.error("Failed to load tasks:", taskData.message);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        // window.location.href = "/";
        router.replace("/");
      } finally {
        setLoading(false);
        setTaskLoading(false);
      }
    }

    loadDashboard();
//   }, []);
}, [router]);

  async function updateTaskStatus(taskId: number) {
  try {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    const newStatus =
      currentTask.status === "COMPLETED"
        ? "PENDING"
        : "COMPLETED";

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Failed to update task:", data.message);
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: data.task.status,
            }
          : task
      )
    );
  } catch (error) {
    console.error("Update task error:", error);
  }
}

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    // window.location.href = "/";
    router.replace("/");
  }

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f7fb",
          color: "#111827",
          fontSize: "18px",
        }}
      >
        Loading dashboard...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#111827",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          height: "70px",
          background: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        <h2 style={{ margin: 0 }}>Task Flow</h2>

        <button
          onClick={logout}
          style={{
            background: "#ffffff",
            color: "#111827",
            border: "none",
            padding: "9px 18px",
            borderRadius: "7px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </header>

      {/* CONTENT */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* WELCOME */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "8px" }}>
            Welcome, {user?.name} 👋
          </h1>

          <p style={{ color: "#6b7280", margin: 0 }}>
            Manage and track your assigned tasks.
          </p>
        </div>

        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {/* TOTAL */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#6b7280", margin: 0 }}>
              Total Tasks
            </p>

            <h2
              style={{
                fontSize: "32px",
                margin: "10px 0 0",
              }}
            >
              {totalTasks}
            </h2>
          </div>

          {/* PENDING */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#6b7280", margin: 0 }}>
              Pending
            </p>

            <h2
              style={{
                fontSize: "32px",
                margin: "10px 0 0",
              }}
            >
              {pendingTasks}
            </h2>
          </div>

          {/* COMPLETED */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#6b7280", margin: 0 }}>
              Completed
            </p>

            <h2
              style={{
                fontSize: "32px",
                margin: "10px 0 0",
              }}
            >
              {completedTasks}
            </h2>
          </div>
        </div>

        {/* TASKS */}
        <div
          style={{
            marginTop: "30px",
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Your Tasks</h2>

          {taskLoading ? (
            <p style={{ color: "#6b7280" }}>
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              No tasks available yet.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 8px",
                        }}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p
                          style={{
                            margin: "0 0 10px",
                            color: "#6b7280",
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      {task.dueDate && (
                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                            fontSize: "14px",
                          }}
                        >
                          Due:{" "}
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        background:
                          task.status === "COMPLETED"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          task.status === "COMPLETED"
                            ? "#166534"
                            : "#92400e",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.status}
                    </span>
                    <button
  onClick={() => updateTaskStatus(task.id)}
  style={{
    marginTop: "10px",
    padding: "7px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
  }}
>
  {task.status === "COMPLETED"
    ? "Mark Pending"
    : "Mark Completed"}
</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACCOUNT INFORMATION */}
        <div
          style={{
            marginTop: "20px",
            background: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Account Information
          </h3>

          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Role:</strong> {user?.role}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {user?.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </section>
    </main>
  );
}