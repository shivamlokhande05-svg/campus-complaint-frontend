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

export default function ComplaintCard({ complaint, isAdmin, onUpdateStatus }) {
  const student = complaint.studentId;

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
        <img
          src={complaint.imageUrl}
          alt="Complaint attachment"
          style={{
            marginTop: 12,
            maxWidth: "220px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            display: "block",
          }}
        />
      )}

      <Stepper status={complaint.status} />

      {complaint.adminRemarks && (
        <div className="admin-remarks">
          <strong>Note from admin:</strong> {complaint.adminRemarks}
        </div>
      )}

      {isAdmin && (
        <div className="status-select-row">
          {STEPS.map((step) => (
            <button
              key={step}
              className={`status-btn ${
                complaint.status === step ? `active-${step.replace(" ", "-")}` : ""
              }`}
              onClick={() => onUpdateStatus(complaint._id, step)}
            >
              Mark {step}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
