import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ContentManagers.css";

function ActivityLogs() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, category]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = category ? `/system/activity-logs?category=${encodeURIComponent(category)}` : "/system/activity-logs";
      const { data } = await api.get(url, authHeaders);
      setLogs(data.logs || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load activity logs." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear ALL activity logs? This cannot be undone.")) return;
    try {
      const { data } = await api.delete("/system/clear-activity-logs", authHeaders);
      showMsg("success", data.message || "Activity logs cleared.");
      setLogs([]);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to clear logs.");
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) { showMsg("error", "No logs to export."); return; }
    const headers = ["Date", "Actor", "Role", "Action", "Category", "Entity", "Detail"];
    const rows = logs.map((l) => [
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}"`,
      `"${l.actor || ""}"`,
      `"${l.actorRole || ""}"`,
      `"${l.action || ""}"`,
      `"${l.category || ""}"`,
      `"${l.entity || ""}"`,
      `"${l.detail || ""}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ActivityLogs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) return <div className="cm-loading">Loading activity logs...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <div className="cm-card">
        <div className="cm-btn-row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="cm-select">
              <option value="">All Categories</option>
              <option value="management">Management</option>
              <option value="cms">CMS</option>
              <option value="system">System</option>
              <option value="general">General</option>
            </select>
            <button className="cm-btn cm-btn-blue" onClick={exportCSV}>📥 Export CSV</button>
          </div>
          <button className="cm-btn cm-btn-danger-ghost" onClick={handleClear}>🗑️ Clear All Logs</button>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Category</th>
                <th>Entity</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l._id}>
                    <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</td>
                    <td>{l.actor || "—"}</td>
                    <td>
                      <strong>{l.action || "—"}</strong>
                      {l.actorRole && <span className="cm-badge">{l.actorRole}</span>}
                    </td>
                    <td><span className="cm-cat-badge">{l.category || "general"}</span></td>
                    <td>{l.entity || "—"}</td>
                    <td>{l.detail || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="cm-empty">No activity logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
