import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="topbar">
      <div className="brand-mark">
        <span className="brand-dot" />
        Campus Fix
      </div>
      <div className="user-chip">
        <div className="avatar">{initials}</div>
        <div>
          <div className="name">{user?.name}</div>
          <div className="role">{user?.role === "admin" ? "Warden / Admin" : "Student"}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
