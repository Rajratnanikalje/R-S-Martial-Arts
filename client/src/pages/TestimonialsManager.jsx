import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ModalPortal from "../components/ModalPortal.jsx";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

const emptyForm = { name: "", program: "Student", rating: 5, review: "", photo: "", published: true, order: 0 };

function TestimonialsManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState(emptyForm);
  const [newPhoto, setNewPhoto] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editPhoto, setEditPhoto] = useState(null);

  useEffect(() => {
    if (!editing) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [editing]);

  const imgUrl = (name) => (name ? (name.startsWith("http") ? name : `${UPLOADS_BASE}/uploads/testimonials/${name}`) : "");

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

const fetchData = async () => {
    try {
      const { data } = await api.get("/testimonials?all=true", authHeaders);
      setReviews(data.testimonials || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load testimonials." });
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
    if (!form.name.trim() || !form.review.trim()) { showMsg("error", "Name and review are required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      if (newPhoto) fd.append("photo", newPhoto);
      await api.post("/testimonials", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Testimonial added!");
      setForm(emptyForm);
      setNewPhoto(null);
      fetchData();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to add.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setEditing(t);
    setEditPhoto(null);
    setEditForm({
      name: t.name || "", program: t.program || "Student", rating: t.rating ?? 5,
      review: t.review || "", photo: t.photo || "",
      published: t.published !== false, order: t.order ?? 0,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(editForm).forEach((k) => fd.append(k, editForm[k]));
      if (editPhoto) fd.append("photo", editPhoto);
      await api.put(`/testimonials/${editing._id}`, fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Testimonial updated!");
      setEditing(null);
      fetchData();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= reviews.length) return;
    const a = reviews[idx];
    const b = reviews[target];
    const tmp = a.order;
    try {
      await api.put(`/testimonials/${a._id}`, { order: b.order }, authHeaders);
      await api.put(`/testimonials/${b._id}`, { order: tmp }, authHeaders);
      fetchData();
    } catch (err) { showMsg("error", "Failed to reorder."); }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete testimonial by "${t.name}"?`)) return;
    try {
      await api.delete(`/testimonials/${t._id}`, authHeaders);
      showMsg("success", "Testimonial deleted.");
      fetchData();
    } catch (err) { showMsg("error", "Failed to delete."); }
  };

  if (loading) return <div className="cm-loading">Loading testimonials...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <div className="cm-card">
        <h3>➕ Add Testimonial</h3>
        <form onSubmit={handleAdd}>
          <div className="cm-form-grid">
            <div className="cm-field"><label>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="cm-field"><label>Program / Course</label><input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} /></div>
            <div className="cm-field">
              <label>Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
<div className="cm-field full"><label>Review *</label><textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} rows="3" /></div>
            <div className="cm-field"><label>Student Photo</label><input type="file" accept="image/*" onChange={(e) => setNewPhoto(e.target.files[0])} /></div>
            <div className="cm-field">
              <label>Published</label>
              <select value={form.published.toString()} onChange={(e) => setForm({ ...form, published: e.target.value === "true" })}>
                <option value="true">✅ Published</option>
                <option value="false">🚫 Unpublished</option>
              </select>
            </div>
            <div className="cm-field"><label>Display Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
          </div>
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "➕ Add Testimonial"}</button>
          </div>
        </form>
      </div>

      <div className="cm-card">
        <h3>💬 Testimonials ({reviews.length})</h3>
{reviews.map((t, idx) => (
          <div className="cm-item" key={t._id}>
            <div className="cm-thumb">
              {t.photo ? <img src={imgUrl(t.photo)} alt={t.name} /> : <span>💬</span>}
            </div>
            <div className="cm-item-body">
              <h4>{t.name} <span style={{ color: "#b45309" }}>{"⭐".repeat(t.rating || 5)}</span></h4>
              <p>{t.program}</p>
              <p style={{ marginTop: 5 }}>"{t.review}"</p>
              <p style={{ marginTop: 5, fontSize: 12 }}>
                {t.published !== false
                  ? <span style={{ color: "#16a34a" }}>✅ Published</span>
                  : <span style={{ color: "#dc2626" }}>🚫 Unpublished</span>
                } · Order: {t.order ?? 0}
              </p>
            </div>
            <div className="cm-item-actions">
              <button className="cm-icon-btn up" onClick={() => move(idx, -1)} title="Move up">⬆️</button>
              <button className="cm-icon-btn down" onClick={() => move(idx, 1)} title="Move down">⬇️</button>
              <button className="cm-icon-btn edit" onClick={() => openEdit(t)}>✏️</button>
              <button className="cm-icon-btn del" onClick={() => handleDelete(t)}>🗑️</button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="cm-empty">No testimonials yet.</div>}
      </div>

      {editing && (
        <ModalPortal>
          <div className="cm-modal-overlay" onClick={() => setEditing(null)}>
            <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
              <button className="cm-modal-close" onClick={() => setEditing(null)}>✕</button>
              <h3>✏️ Edit Testimonial</h3>
              <form onSubmit={handleUpdate}>
                <div className="cm-field"><label>Name *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div className="cm-field"><label>Program</label><input value={editForm.program} onChange={(e) => setEditForm({ ...editForm, program: e.target.value })} /></div>
                <div className="cm-field">
                  <label>Rating</label>
                  <select value={editForm.rating} onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"⭐".repeat(r)} ({r})</option>)}
                  </select>
                </div>
                <div className="cm-field"><label>Review *</label><textarea value={editForm.review} onChange={(e) => setEditForm({ ...editForm, review: e.target.value })} rows="3" /></div>
                {editForm.photo && !editPhoto && (
                  <div className="cm-field" style={{ marginBottom: 10 }}>
                    <img src={imgUrl(editForm.photo)} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} />
                  </div>
                )}
                <div className="cm-field"><label>Change Student Photo</label><input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} /></div>
                <div className="cm-field">
                  <label>Published</label>
                  <select value={editForm.published.toString()} onChange={(e) => setEditForm({ ...editForm, published: e.target.value === "true" })}>
                    <option value="true">✅ Published</option>
                    <option value="false">🚫 Unpublished</option>
                  </select>
                </div>
                <div className="cm-field"><label>Display Order</label><input type="number" value={editForm.order} onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })} /></div>
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

export default TestimonialsManager;
