import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Resolved"];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = filter !== "All" ? { status: filter } : {};
      const res = await api.get("/complaints/all", { params });
      setComplaints(res.data);
    } catch (err) {
      setError("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (err) {
      setError("Could not update status.");
    }
  };

  const counts = {
    All: complaints.length,
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Complaint queue</h1>
            <p>Review what's open and move it through to resolved.</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="filter-row">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-text">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="panel empty-state">
            <div className="glyph">✅</div>
            Nothing here — the queue for "{filter}" is empty.
          </div>
        ) : (
          <div className="complaint-list">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                isAdmin={true}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
