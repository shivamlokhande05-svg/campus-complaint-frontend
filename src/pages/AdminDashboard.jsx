import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Resolved"];
const PAGE_SIZE = 8;

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchComplaints = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: PAGE_SIZE, sortBy };
      if (filter !== "All") params.status = filter;
      if (search) params.search = search;
      const res = await api.get("/complaints/all", { params });
      setComplaints(res.data.complaints);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
      setPage(res.data.currentPage || 1);
    } catch (err) {
      setError("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy]);

  // Debounced search
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchComplaints(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      fetchComplaints(page);
    } catch (err) {
      setError("Could not update status.");
    }
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

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
            style={{ marginBottom: 0, flex: 1 }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-text">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="panel empty-state">
            <div className="glyph">✅</div>
            Nothing here — the queue for "{filter}" is empty.
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 14 }}>
              {totalCount} complaint{totalCount !== 1 ? "s" : ""} in this view
            </p>
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
            {totalPages > 1 && (
              <div className="pagination-row">
                <button
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => fetchComplaints(page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-label">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => fetchComplaints(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
