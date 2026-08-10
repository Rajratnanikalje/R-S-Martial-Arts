import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ModalPortal from "../components/ModalPortal.jsx";
import "./ContentManagers.css";

const emptyForm = { day: "", morningTime: "", morningClass: "", eveningTime: "", eveningClass: "" };

function TimetableManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    if (!editing) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [editing]);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/timetable", authHeaders);
      setEntries(data.timetable || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load timetable." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.day.trim()) { showMsg("error", "Day is required."); return; }
    setSaving(true);
    try {
      await api.post("/timetable", form, authHeaders);
      showMsg("success", "Timetable entry added!");
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to add.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setEditing(t);
    setEditForm({
      day: t.day || "", morningTime: t.morningTime || "", morningClass: t.morningClass || "",
      eveningTime: t.eveningTime || "", eveningClass: t.eveningClass || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/timetable/${editing._id}`, editForm, authHeaders);
      showMsg("success", "Entry updated!");
      setEditing(null);
      fetchData();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete ${t.day}'s entry?`)) return;
    try {
      await api.delete(`/timetable/${t._id}`, authHeaders);
      showMsg("success", "Entry deleted.");
      fetchData();
    } catch (err) { showMsg("error", "Failed to delete."); }
  };

// Export the timetable as a printable PDF (via a dedicated print modal)
  const exportPDF = () => {
    if (entries.length === 0) { showMsg("error", "No timetable entries to export."); return; }
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { showMsg("error", "Popup blocked. Please allow popups to export PDF."); return; }
    win.document.write(`
      <html>
        <head>
          <title>RS MARTIAL ARTS SQUAD — Timetable</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 30px; }
            h1 { font-size: 20px; margin: 0 0 4px 0; }
            .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #111827; color: #fff; text-align: left; padding: 10px 12px; font-size: 13px; }
            td { padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
            tr:nth-child(even) td { background: #f9fafb; }
            .footer { margin-top: 24px; text-align: center; color: #9ca3af; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>RS MARTIAL ARTS SQUAD — Weekly Training Timetable</h1>
          <div class="sub">Generated on ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
          <table>
            <thead>
              <tr>
                <th>Day</th><th>Morning Time</th><th>Morning Class</th><th>Evening Time</th><th>Evening Class</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((t) => `
                <tr>
                  <td><strong>${t.day || ""}</strong></td>
                  <td>${t.morningTime || ""}</td>
                  <td>${t.morningClass || ""}</td>
                  <td>${t.eveningTime || ""}</td>
                  <td>${t.eveningClass || ""}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          <div class="footer">© RS MARTIAL ARTS SQUAD — All Rights Reserved.</div>
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= entries.length) return;
    const a = entries[idx];
    const b = entries[target];
    const tmp = a.order;
    try {
      await api.put(`/timetable/${a._id}`, { order: b.order }, authHeaders);
      await api.put(`/timetable/${b._id}`, { order: tmp }, authHeaders);
      fetchData();
    } catch (err) { showMsg("error", "Failed to reorder."); }
  };

  if (loading) return <div className="cm-loading">Loading timetable...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <div className="cm-card">
        <h3>➕ Add Timetable Entry</h3>
        <form onSubmit={handleAdd}>
          <div className="cm-form-grid">
            <div className="cm-field"><label>Day *</label><input value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} /></div>
            <div className="cm-field"><label>Morning Time</label><input value={form.morningTime} onChange={(e) => setForm({ ...form, morningTime: e.target.value })} placeholder="06:00 AM - 08:00 AM" /></div>
            <div className="cm-field"><label>Morning Class</label><input value={form.morningClass} onChange={(e) => setForm({ ...form, morningClass: e.target.value })} /></div>
            <div className="cm-field"><label>Evening Time</label><input value={form.eveningTime} onChange={(e) => setForm({ ...form, eveningTime: e.target.value })} placeholder="05:00 PM - 07:00 PM" /></div>
            <div className="cm-field"><label>Evening Class</label><input value={form.eveningClass} onChange={(e) => setForm({ ...form, eveningClass: e.target.value })} /></div>
          </div>
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "➕ Add Entry"}</button>
          </div>
        </form>
      </div>

<div className="cm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h3>🗓️ Timetable ({entries.length})</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="cm-btn cm-btn-blue" onClick={() => window.print()}>
              🖨️ Print
            </button>
            <button type="button" className="cm-btn cm-btn-green" onClick={exportPDF}>
              📄 Export PDF
            </button>
          </div>
        </div>
        <p className="cm-hint">Use the ⬆️/⬇️ buttons to reorder timetable entries. Print / Export to save as PDF.</p>

        {/* Printable timetable table */}
        <div className="tt-print-area">
          <div className="tt-print-header">
            <h2>RS MARTIAL ARTS SQUAD — Weekly Training Timetable</h2>
            <p>Generated on {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <table className="tt-print-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Morning Time</th>
                <th>Morning Class</th>
                <th>Evening Time</th>
                <th>Evening Class</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((t) => (
                <tr key={t._id}>
                  <td><strong>{t.day}</strong></td>
                  <td>{t.morningTime}</td>
                  <td>{t.morningClass}</td>
                  <td>{t.eveningTime}</td>
                  <td>{t.eveningClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.map((t, idx) => (
          <div className="cm-item" key={t._id}>
            <div className="cm-thumb">🗓️</div>
            <div className="cm-item-body">
              <h4>{t.day}</h4>
              <p>🌅 {t.morningTime} — {t.morningClass}</p>
              <p>🌙 {t.eveningTime} — {t.eveningClass}</p>
            </div>
            <div className="cm-item-actions">
              <button className="cm-icon-btn up" onClick={() => move(idx, -1)}>⬆️</button>
              <button className="cm-icon-btn down" onClick={() => move(idx, 1)}>⬇️</button>
              <button className="cm-icon-btn edit" onClick={() => openEdit(t)}>✏️</button>
              <button className="cm-icon-btn del" onClick={() => handleDelete(t)}>🗑️</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && <div className="cm-empty">No entries yet.</div>}
      </div>

      {editing && (
        <ModalPortal>
          <div className="cm-modal-overlay" onClick={() => setEditing(null)}>
            <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
              <button className="cm-modal-close" onClick={() => setEditing(null)}>✕</button>
              <h3>✏️ Edit {editing.day}</h3>
              <form onSubmit={handleUpdate}>
                <div className="cm-field">
                  <label>Day *</label>
                  <input value={editForm.day} onChange={(e) => setEditForm({ ...editForm, day: e.target.value })} />
                </div>
                <div className="cm-field">
                  <label>Morning Time</label>
                  <input value={editForm.morningTime} onChange={(e) => setEditForm({ ...editForm, morningTime: e.target.value })} />
                </div>
                <div className="cm-field">
                  <label>Morning Class</label>
                  <input value={editForm.morningClass} onChange={(e) => setEditForm({ ...editForm, morningClass: e.target.value })} />
                </div>
                <div className="cm-field">
                  <label>Evening Time</label>
                  <input value={editForm.eveningTime} onChange={(e) => setEditForm({ ...editForm, eveningTime: e.target.value })} />
                </div>
                <div className="cm-field">
                  <label>Evening Class</label>
                  <input value={editForm.eveningClass} onChange={(e) => setEditForm({ ...editForm, eveningClass: e.target.value })} />
                </div>
                <div className="cm-btn-row">
                  <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "💾 Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default TimetableManager;
