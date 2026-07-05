import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import api from "../api";
import Navbar from "../components/Navbar";

const CATEGORY_COLORS = ["#5b3fe0", "#ff6b5b", "#ffb443", "#00c896", "#7c5cff"];
const STATUS_COLORS = {
  Pending: "#ff6b5b",
  "In Progress": "#ffb443",
  Resolved: "#00c896",
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/complaints/analytics");
        setData(res.data);
      } catch (err) {
        setError("Could not load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Analytics</h1>
            <p>A quick look at how complaints are trending.</p>
          </div>
          <Link to="/admin" className="pagination-btn" style={{ textDecoration: "none" }}>
            ← Back to queue
          </Link>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-text">Loading analytics...</div>
        ) : !data ? null : (
          <>
            {/* Stat cards */}
            <div className="analytics-stats-row">
              <div className="analytics-stat-card">
                <div className="analytics-stat-num">{data.totalCount}</div>
                <div className="analytics-stat-label">Total complaints</div>
              </div>
              <div className="analytics-stat-card">
                <div className="analytics-stat-num" style={{ color: "var(--mint)" }}>
                  {data.resolvedCount}
                </div>
                <div className="analytics-stat-label">Resolved</div>
              </div>
              <div className="analytics-stat-card">
                <div className="analytics-stat-num" style={{ color: "var(--amber)" }}>
                  {data.avgResolutionDays > 0 ? `${data.avgResolutionDays}d` : "—"}
                </div>
                <div className="analytics-stat-label">Avg. resolution time</div>
              </div>
            </div>

            <div className="analytics-charts-grid">
              {/* Category breakdown */}
              <div className="panel">
                <h3>Complaints by category</h3>
                {data.categoryBreakdown.length === 0 ? (
                  <p style={{ color: "var(--text-soft)", fontSize: 13.5 }}>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ category, count }) => `${category}: ${count}`}
                      >
                        {data.categoryBreakdown.map((entry, i) => (
                          <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Status breakdown */}
              <div className="panel">
                <h3>Complaints by status</h3>
                {data.statusBreakdown.length === 0 ? (
                  <p style={{ color: "var(--text-soft)", fontSize: 13.5 }}>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {data.statusBreakdown.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#5b3fe0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Monthly trend */}
              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <h3>Complaints filed — last 6 months</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#5b3fe0"
                      strokeWidth={3}
                      dot={{ fill: "#5b3fe0", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
