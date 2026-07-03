import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";

const CATEGORIES = ["Electrical", "Plumbing", "WiFi", "Cleanliness", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Electrical",
    location: "",
    priority: "Medium",
  });
  const [image, setImage] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/my");
      setComplaints(res.data);
    } catch (err) {
      setError("Could not load your complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append("image", image);

      await api.post("/complaints", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Complaint filed. You can track its status on the right.");
      setForm({
        title: "",
        description: "",
        category: "Electrical",
        location: "",
        priority: "Medium",
      });
      setImage(null);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Could not file complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>File and track complaints</h1>
            <p>Report an issue once — follow its progress right here.</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="panel">
            <h3>New complaint</h3>
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={update("title")}
                  placeholder="e.g. AC not cooling"
                  required
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={update("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Location</label>
                <input
                  value={form.location}
                  onChange={update("location")}
                  placeholder="e.g. Block A, Room 101"
                  required
                />
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={form.priority} onChange={update("priority")}>
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={update("description")}
                  placeholder="What's wrong, and since when?"
                  required
                />
              </div>
              <div className="field">
                <label>Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Filing..." : "File complaint"}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>
              Your complaints ({complaints.length})
            </h3>
            {loading ? (
              <div className="loading-text">Loading your complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="panel empty-state">
                <div className="glyph">📋</div>
                No complaints yet. File one using the form on the left.
              </div>
            ) : (
              <div className="complaint-list">
                {complaints.map((c) => (
                  <ComplaintCard key={c._id} complaint={c} isAdmin={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
