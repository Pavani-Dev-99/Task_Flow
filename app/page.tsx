// "use client";

// import { FormEvent, useState } from "react";
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage(data.message);

      if (!isRegister) {
        // window.location.href = "/dashboard";
        router.replace("/dashboard");
      } else {
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #9ca3af",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
    color: "#111827",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontWeight: 600,
    color: "#374151",
    fontSize: "14px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Task Flow
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            {/* Task Management Portal */}
          </p>
        </div>

        {/* LOGIN / REGISTER TABS */}

        <div
          style={{
            display: "flex",
            marginBottom: "25px",
            background: "#f3f4f6",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
              setMessage("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: !isRegister ? "#ffffff" : "transparent",
              color: "#111827",
              fontWeight: !isRegister ? 700 : 400,
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
              setMessage("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: isRegister ? "#ffffff" : "transparent",
              color: "#111827",
              fontWeight: isRegister ? 700 : 400,
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NAME — REGISTER ONLY */}

          {isRegister && (
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* EMAIL */}

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />
          </div>

          {/* PASSWORD */}

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={inputStyle}
            />
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: "#dcfce7",
                color: "#166534",
              }}
            >
              {message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "#ffffff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
