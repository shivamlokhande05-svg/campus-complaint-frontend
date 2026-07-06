import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";

const CATEGORIES = ["Electrical", "Plumbing", "WiFi", "Cleanliness", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];
const PAGE_SIZE = 5;

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Duplicate-detection dialog state
  const [duplicateInfo, setDuplicateInfo] = useState(null); // { existingComplaint }
  const [joiningDuplicate, setJoiningDuplicate] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Electrical",
    location: "",
    priority: "Medium",
  });
  const [image, setImage] = useState(null);

  const fetchComplaints = async (pageNum = 1, searchTerm = search, sortOption = sortBy) => {
    setLoading(true);
    try {
      const res = await api.get("/complaints/my", {
        params: { page: pageNum, limit: PAGE_SIZE, search: searchTerm || undefined, sortBy: sortOption },
      });
      setComplaints(res.data.complaints);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
      setPage(res.data.currentPage || 1);
    } catch (err) {
      setError("Could not load your complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
  }, []);

  // Debounced search — waits 400ms after typing stops before hitting the API
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchComplaints(1, search, sortBy);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Sort changes should apply immediately, no debounce needed
  const isFirstSortRender = React.useRef(true);
  useEffect(() => {
    if (isFirstSortRender.current) {
      isFirstSortRender.current = false;
      return;
    }
    fetchComplaints(1, search, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmitFeedback = async (complaintId, rating, comment) => {
    try {
      await api.put(`/complaints/${complaintId}/feedback`, { rating, comment });
      fetchComplaints(page, search, sortBy);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit feedback.");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Electrical",
      location: "",
      priority: "Medium",
    });
    setImage(null);
  };

  const submitComplaint = async (force = false) => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);
    if (force) data.append("force", "true");

    const res = await api.post("/complaints", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await submitComplaint(false);

      if (result.duplicate) {
        // Don't file yet — ask the student if they want to join the existing complaint
        setDuplicateInfo(result.existingComplaint);
        setSubmitting(false);
        return;
      }

      setSuccess("Complaint filed. You can track its status on the right.");
      resetForm();
      fetchComplaints(1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not file complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  // Student confirms: "Yes, I'm affected by this too" — join the existing complaint instead
  const handleJoinExisting = async () => {
    setJoiningDuplicate(true);
    try {
      await api.put(`/complaints/${duplicateInfo._id}/affected`);
      setSuccess("You've been added to the existing complaint for this issue.");
      resetForm();
      setDuplicateInfo(null);
      fetchComplaints(1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not join the existing complaint.");
      setDuplicateInfo(null);
    } finally {
      setJoiningDuplicate(false);
    }
  };

  // Student says: "No, file mine separately" — force-create a new complaint
  const handleFileSeparately = async () => {
    setJoiningDuplicate(true);
    try {
      await submitComplaint(true);
      setSuccess("Complaint filed separately.");
      resetForm();
      setDuplicateInfo(null);
      fetchComplaints(1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not file complaint.");
      setDuplicateInfo(null);
    } finally {
      setJoiningDuplicate(false);
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
                {submitting ? "Checking..." : "File complaint"}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>
              Your complaints ({totalCount})
            </h3>
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
              <div className="loading-text">Loading your complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="panel empty-state">
                <div className="glyph">📋</div>
                No complaints yet. File one using the form on the left.
              </div>
            ) : (
              <>
                <div className="complaint-list">
                  {complaints.map((c) => (
                    <ComplaintCard
                      key={c._id}
                      complaint={c}
                      isAdmin={false}
                      onSubmitFeedback={handleSubmitFeedback}
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
      </div>

      {duplicateInfo && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>This issue may already be reported</h3>
            <p>
              An open complaint already exists for <strong>{duplicateInfo.location}</strong> in
              the <strong>{duplicateInfo.category}</strong> category
              {duplicateInfo.affectedCount > 1
                ? ` — ${duplicateInfo.affectedCount} students are already affected by it.`
                : "."}{" "}
              Would you like to mark yourself as affected too, instead of filing a new one?
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-btn-secondary"
                disabled={joiningDuplicate}
                onClick={handleFileSeparately}
              >
                File separately
              </button>
              <button
                className="dialog-btn-primary"
                disabled={joiningDuplicate}
                onClick={handleJoinExisting}
              >
                {joiningDuplicate ? "Adding you..." : "Yes, I'm affected too"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
