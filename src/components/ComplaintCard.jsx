import React from "react";

const STEPS = ["Pending", "In Progress", "Resolved"];

function Stepper({ status }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className="step-wrap">
              <div
                className={`step-dot ${isDone ? "done" : ""} ${
                  isCurrent ? "current" : ""
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <div className="step-label">{step}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${isDone ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StarRating({ value, onChange, readOnly }) {
  const [hover, setHover] = React.useState(0);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ pointerEvents: readOnly ? "none" : "auto" }}>
      {stars.map((n) => (
        <span
          key={n}
          className={`star ${n <= (hover || value) ? "star-filled" : ""}`}
          onClick={() => !readOnly && onChange(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function FeedbackSection({ complaint, isAdmin, onSubmitFeedback }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (complaint.status !== "Resolved") return null;

  // Already rated — show it as read-only (both student and admin see this)
  if (complaint.rating) {
    return (
      <div className="feedback-box feedback-given">
        <div className="feedback-label">
          {isAdmin ? "Student feedback" : "Your feedback"}
        </div>
        <StarRating value={complaint.rating} onChange={() => {}} readOnly />
        {complaint.feedbackComment && (
          <p className="feedback-comment">"{complaint.feedbackComment}"</p>
        )}
      </div>
    );
  }

  // Admin never gets to submit feedback, only view it once given
  if (isAdmin) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmitFeedback(complaint._id, rating, comment);
    setSubmitting(false);
  };

  return (
    <div className="feedback-box">
      <div className="feedback-label">How was this resolved?</div>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        className="feedback-textarea"
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        className="feedback-submit-btn"
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
      >
        {submitting ? "Submitting..." : "Submit feedback"}
      </button>
    </div>
  );
}

export default function ComplaintCard({ complaint, isAdmin, onUpdateStatus, onSubmitFeedback }) {
  const student = complaint.studentId;
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState(null);
  const [remarks, setRemarks] = React.useState(complaint.adminRemarks || "");
  const [saving, setSaving] = React.useState(false);

  const openStatusDialog = (step) => {
    setRemarks(complaint.adminRemarks || "");
    setPendingStatus(step);
  };

  const confirmStatusChange = async () => {
    setSaving(true);
    await onUpdateStatus(complaint._id, pendingStatus, remarks);
    setSaving(false);
    setPendingStatus(null);
  };

  return (
    <div className="complaint-card">
      <div className="complaint-top">
        <div>
          <div className="complaint-title">{complaint.title}</div>
          <div className="complaint-meta">
            {complaint.location}
            {isAdmin && student ? ` · Filed by ${student.name}` : ""}
            {" · "}
            {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <span className="badge badge-category">{complaint.category}</span>
          <span className={`badge badge-priority-${complaint.priority}`}>
            {complaint.priority}
          </span>
        </div>
      </div>

      {complaint.affectedCount > 1 && (
        <div className="affected-badge">
          👥 {complaint.affectedCount} students affected by this issue
        </div>
      )}

      <div className="complaint-desc">{complaint.description}</div>

      {complaint.imageUrl && (
        <>
          <div className="complaint-thumb-wrap" onClick={() => setLightboxOpen(true)}>
            <img
              src={complaint.imageUrl}
              alt="Complaint attachment"
              className="complaint-thumb"
            />
            <div className="complaint-thumb-hint">🔍 Click to enlarge</div>
          </div>

          {lightboxOpen && (
            <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
              <button
                className="lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <img
                src={complaint.imageUrl}
                alt="Complaint attachment enlarged"
                className="lightbox-image"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}

      <Stepper status={complaint.status} />

      {complaint.adminRemarks && (
        <div className="admin-remarks">
          <strong>Note from admin:</strong> {complaint.adminRemarks}
        </div>
      )}

      <FeedbackSection
        complaint={complaint}
        isAdmin={isAdmin}
        onSubmitFeedback={onSubmitFeedback}
      />

      {isAdmin && (
        <div className="status-select-row">
          {STEPS.map((step) => (
            <button
              key={step}
              className={`status-btn ${
                complaint.status === step ? `active-${step.replace(" ", "-")}` : ""
              }`}
              onClick={() => openStatusDialog(step)}
            >
              Mark {step}
            </button>
          ))}
        </div>
      )}

      {pendingStatus && (
        <div className="dialog-overlay" onClick={() => setPendingStatus(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Mark as {pendingStatus}</h3>
            <p>
              Add a note for the student about this update (optional) — they'll see
              it on their dashboard.
            </p>
            <textarea
              className="feedback-textarea"
              placeholder="e.g. Technician assigned, will fix by evening"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              autoFocus
            />
            <div className="dialog-actions" style={{ marginTop: 14 }}>
              <button
                className="dialog-btn-secondary"
                onClick={() => setPendingStatus(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="dialog-btn-primary"
                onClick={confirmStatusChange}
                disabled={saving}
              >
                {saving ? "Saving..." : `Confirm: ${pendingStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
