import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hostelBlock: "",
    roomNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { ...form, role });
      login(res.data.user, res.data.token);
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="brand-mark">
          <span className="brand-dot" />
          Campus Fix
        </div>
        <div>
          <h1>Set up your account in under a minute.</h1>
          <p>
            Students file and follow complaints. Wardens and staff manage the
            queue and mark work done. Same system, two views.
          </p>
        </div>
      </div>

      <div className="auth-main">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          style={{ position: "absolute", top: 24, right: 24 }}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="subtitle">Choose the role that matches you.</p>

          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Warden / Admin
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input value={form.name} onChange={update("name")} required />
            </div>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                required
                minLength={6}
              />
            </div>

            {role === "student" && (
              <div style={{ display: "flex", gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Hostel block</label>
                  <input value={form.hostelBlock} onChange={update("hostelBlock")} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Room no.</label>
                  <input value={form.roomNumber} onChange={update("roomNumber")} />
                </div>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="switch-line">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
