"use client";

// import { useEffect, useMemo, useState } from "react";
// import { useMemo, useState } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
};

type Task = {
  id: number;
  userId: number;
  startTime: string;
  stopTime: string;
  notes: string;
  description: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminPage() {
  console.log("ADMIN COMPONENT RENDERED");

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // async function loadData() {
  //   try {
  //     setLoading(true);

  //     const [usersResponse, tasksResponse] = await Promise.all([
  //       fetch("/api/users"),
  //       fetch("/api/tasks"),
  //     ]);

  //     const usersData = await usersResponse.json();
  //     const tasksData = await tasksResponse.json();

  //     if (usersData.success) {
  //       setUsers(usersData.users);
  //     } else {
  //       showMessage(usersData.message || "Failed to load users", "error");
  //     }

  //     if (tasksData.success) {
  //       setTasks(tasksData.tasks);
  //     } else {
  //       showMessage(tasksData.message || "Failed to load tasks", "error");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     showMessage("Failed to load admin data", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   loadData();
  // }, []);

  //   const showMessage = useMemo(
  //   () =>
  //     (
  //       text: string,
  //       type: "success" | "error" = "success"
  //     ) => {
  //       setMessage(text);
  //       setMessageType(type);

  //       setTimeout(() => {
  //         setMessage("");
  //       }, 4000);
  //     },
  //   []
  // );
  const showMessage = useCallback(
  (text: string, type: "success" | "error" = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  },
  []
);

  const loadData = useCallback(async () => {
  console.log("1. loadData started");

  try {
    console.log("2. Starting fetch");

    const [usersResponse, tasksResponse] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/tasks"),
    ]);

    console.log("3. Both fetches completed");

    const usersData = await usersResponse.json();
    console.log("4. Users JSON:", usersData);

    const tasksData = await tasksResponse.json();
    console.log("5. Tasks JSON:", tasksData);

    if (!usersData.success) {
      throw new Error(usersData.message || "Failed to load users");
    }

    if (!tasksData.success) {
      throw new Error(tasksData.message || "Failed to load tasks");
    }

    return {
      users: usersData.users,
      tasks: tasksData.tasks,
    };
  } catch (error) {
    console.error("LOAD DATA ERROR:", error);
    throw error;
  }
}, []);

useEffect(() => {
  let cancelled = false;

  async function initializeDashboard() {
    try {
      const data = await loadData();

      if (cancelled) return;

      setUsers(data.users);
      setTasks(data.tasks);
    } catch (error) {
      if (cancelled) return;

      console.error("Dashboard initialization failed:", error);
      showMessage("Failed to load admin data", "error");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  initializeDashboard();

  return () => {
    cancelled = true;
  };
}, [loadData, showMessage]);

  // async function toggleUser(user: User) {
  //   try {
  //     setActionLoading(user.id);

  //     const response = await fetch(`/api/users/${user.id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         isActive: !user.isActive,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!data.success) {
  //       showMessage(data.message || "Failed to update user", "error");
  //       return;
  //     }

  //     showMessage(
  //       `${user.name} ${
  //         user.isActive ? "deactivated" : "activated"
  //       } successfully`
  //     );

  //     await loadData();
  //   } catch (error) {
  //     console.error(error);
  //     showMessage("Failed to update user", "error");
  //   } finally {
  //     setActionLoading(null);
  //   }
  // }
  async function toggleUser(user: User) {
  try {
    setActionLoading(user.id);

    const newStatus = !user.isActive;

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: newStatus,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      showMessage(data.message || "Failed to update user", "error");
      return;
    }

    // Update the user immediately in React state
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? { ...currentUser, isActive: newStatus }
          : currentUser
      )
    );

    showMessage(
      `${user.name} ${
        newStatus ? "activated" : "deactivated"
      } successfully`
    );
  } catch (error) {
    console.error("TOGGLE USER ERROR:", error);
    showMessage("Failed to update user", "error");
  } finally {
    setActionLoading(null);
  }
}

  // async function deleteUser(user: User) {
  //   const confirmed = window.confirm(
  //     `Delete user "${user.name}"?\n\nThis action cannot be undone.`
  //   );

  //   if (!confirmed) {
  //     return;
  //   }

  //   try {
  //     setActionLoading(user.id);

  //     const response = await fetch(`/api/users/${user.id}`, {
  //       method: "DELETE",
  //     });

  //     const data = await response.json();

  //     if (!data.success) {
  //       showMessage(data.message || "Failed to delete user", "error");
  //       return;
  //     }

  //     showMessage("User deleted successfully");

  //     await loadData();
  //   } catch (error) {
  //     console.error(error);
  //     showMessage("Failed to delete user", "error");
  //   } finally {
  //     setActionLoading(null);
  //   }
  // }

  async function deleteUser(user: User) {
  const confirmed = window.confirm(
    `Delete user "${user.name}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    setActionLoading(user.id);

    const response = await fetch(`/api/users/${user.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!data.success) {
      showMessage(data.message || "Failed to delete user", "error");
      return;
    }

    // Remove the deleted user from React state
    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => currentUser.id !== user.id)
    );

    showMessage("User deleted successfully");
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    showMessage("Failed to delete user", "error");
  } finally {
    setActionLoading(null);
  }
}

  // function downloadCsv() {
  //   window.location.href = "/api/tasks/export";
  // }

  function downloadCsv() {
  window.open("/api/tasks/export", "_blank");
}

  const activeUsers = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users]
  );

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users]
  );

  const employeeUsers = useMemo(
    () => users.filter((user) => user.role === "EMPLOYEE").length,
    [users]
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <h2>Loading Admin Dashboard</h2>
          <p>Fetching users and tasks...</p>
        </div>

        <style>{`
          .admin-page {
            min-height: 100vh;
            background: #f5f7fb;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-container {
            text-align: center;
            color: #374151;
          }

          .loading-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }

          .loading-container h2 {
            margin: 0 0 8px;
            font-size: 20px;
          }

          .loading-container p {
            margin: 0;
            color: #6b7280;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="container">
        <header className="page-header">
          <div>
            <div className="eyebrow">ADMINISTRATION</div>
            <h1>Admin Dashboard</h1>
            <p>
              Manage users, monitor employee tasks, and export task reports.
            </p>
          </div>

          <button className="export-button" onClick={downloadCsv}>
            <span>↓</span>
            Export Tasks CSV
          </button>
        </header>

        {message && (
          <div className={`alert ${messageType}`}>
            <span className="alert-icon">
              {messageType === "success" ? "✓" : "!"}
            </span>

            <span>{message}</span>

            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">U</div>
            <div>
              <p>Total Users</p>
              <h2>{users.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">✓</div>
            <div>
              <p>Active Users</p>
              <h2>{activeUsers}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon task-icon">T</div>
            <div>
              <p>Total Tasks</p>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admin-icon">A</div>
            <div>
              <p>Administrators</p>
              <h2>{adminUsers}</h2>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>User Management</h2>
              <p>Manage account status and user access.</p>
            </div>

            <div className="panel-count">
              {employeeUsers} employees
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="id-cell">#{user.id}</td>

                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                        </div>
                      </div>
                    </td>

                    <td className="email-cell">{user.email}</td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "ADMIN" ? "admin" : "employee"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        <span className="status-dot" />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className={`action-button ${
                            user.isActive ? "deactivate" : "activate"
                          }`}
                          disabled={actionLoading === user.id}
                          onClick={() => toggleUser(user)}
                        >
                          {actionLoading === user.id
                            ? "..."
                            : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          className="delete-button"
                          disabled={actionLoading === user.id}
                          onClick={() => deleteUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-icon">U</div>
                      <strong>No users found</strong>
                      <span>There are currently no users to display.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>All Tasks</h2>
              <p>Monitor tasks submitted by employees.</p>
            </div>

            <div className="panel-count">{tasks.length} tasks</div>
          </div>

          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Start Time</th>
                  <th>Stop Time</th>
                  <th>Notes</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="id-cell">#{task.id}</td>

                    <td>
                      <div className="employee-cell">
                        <div className="small-avatar">
                          {task.user.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{task.user.name}</strong>
                          <span>{task.user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="date-cell">
                      {formatDate(task.startTime)}
                    </td>

                    <td className="date-cell">
                      {formatDate(task.stopTime)}
                    </td>

                    <td>
                      <div className="text-cell">
                        {task.notes || "—"}
                      </div>
                    </td>

                    <td>
                      <div className="text-cell description-cell">
                        {task.description || "—"}
                      </div>
                    </td>
                  </tr>
                ))}

                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div className="empty-icon">T</div>
                      <strong>No tasks found</strong>
                      <span>No employee tasks have been submitted yet.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          <span>Grey Shield Task Management System</span>
          <span>Admin Console</span>
        </footer>
      </div>

      <style>{`
        .admin-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #111827;
          padding: 40px 24px 60px;
        }

        .container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 30px;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #2563eb;
          margin-bottom: 8px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1.2;
          font-weight: 700;
          color: #111827;
        }

        .page-header p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .export-button {
          border: 0;
          background: #2563eb;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);
          transition: 0.2s ease;
        }

        .export-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .export-button span {
          font-size: 18px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .alert-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: currentColor;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .alert button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: currentColor;
          font-size: 20px;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 17px;
        }

        .users-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .active-icon {
          background: #ecfdf5;
          color: #059669;
        }

        .task-icon {
          background: #fff7ed;
          color: #ea580c;
        }

        .admin-icon {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-card p {
          margin: 0 0 4px;
          color: #6b7280;
          font-size: 13px;
        }

        .stat-card h2 {
          margin: 0;
          font-size: 26px;
          line-height: 1;
        }

        .panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 24px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .panel-header {
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .panel-header p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .panel-count {
          background: #f3f4f6;
          color: #4b5563;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          text-align: left;
          padding: 13px 20px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f1f3;
          font-size: 13px;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fafafa;
        }

        .id-cell {
          color: #9ca3af;
          font-weight: 600;
          white-space: nowrap;
        }

        .user-cell,
        .employee-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .user-cell strong,
        .employee-cell strong {
          display: block;
          color: #111827;
          font-size: 13px;
        }

        .avatar,
        .small-avatar {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 700;
          border-radius: 50%;
        }

        .avatar {
          width: 34px;
          height: 34px;
          font-size: 13px;
        }

        .small-avatar {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }

        .employee-cell span {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          margin-top: 2px;
        }

        .email-cell {
          color: #4b5563;
        }

        .role-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 9px;
        }

        .role-badge.admin {
          background: #f3e8ff;
          color: #7e22ce;
        }

        .role-badge.employee {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .status-badge.active {
          background: #ecfdf5;
          color: #047857;
        }

        .status-badge.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .action-button,
        .delete-button {
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .action-button:disabled,
        .delete-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-button.activate {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .action-button.activate:hover:not(:disabled) {
          background: #d1fae5;
        }

        .action-button.deactivate {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .action-button.deactivate:hover:not(:disabled) {
          background: #ffedd5;
        }

        .delete-button {
          background: white;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .delete-button:hover:not(:disabled) {
          background: #fef2f2;
        }

        .date-cell {
          color: #4b5563;
          white-space: nowrap;
          font-size: 12px;
        }

        .text-cell {
          max-width: 220px;
          color: #4b5563;
          line-height: 1.5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .description-cell {
          max-width: 300px;
        }

        .empty-state {
          height: 180px;
          text-align: center;
          color: #6b7280;
        }

        .empty-state > * {
          display: block;
        }

        .empty-icon {
          width: 38px;
          height: 38px;
          margin: 0 auto 10px;
          border-radius: 8px;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex !important;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .empty-state strong {
          color: #374151;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .empty-state span {
          font-size: 12px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          color: #9ca3af;
          font-size: 12px;
          padding: 10px 2px;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .admin-page {
            padding: 25px 14px 40px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .page-header h1 {
            font-size: 27px;
          }

          .export-button {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .panel-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </main>
  );
}