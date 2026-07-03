import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
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
          <h1>Every complaint tracked, from report to resolved.</h1>
          <p>
            No more lost requests or forgotten follow-ups. File it once, watch
            it move through the queue, and know exactly who's handling it.
          </p>
          <div className="stat-row">
            <div>
              <span className="stat-num">01</span>
              <span className="stat-label">Report the issue</span>
            </div>
            <div>
              <span className="stat-num">02</span>
              <span className="stat-label">Staff picks it up</span>
            </div>
            <div>
              <span className="stat-num">03</span>
              <span className="stat-label">Resolved & closed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="subtitle">Log in to file or track your complaints.</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="switch-line">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
