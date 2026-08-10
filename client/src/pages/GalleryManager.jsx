import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ModalPortal from "../components/ModalPortal.jsx";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

const emptyForm = { title: "", icon: "📸", description: "" };

function GalleryManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // add form
  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]);

  // edit
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImages, setEditImages] = useState([]);

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
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSections = async () => {
    try {
      const { data } = await api.get("/galleries", authHeaders);
      setSections(data.sections || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load gallery." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const imgUrl = (name) => (name ? `${UPLOADS_BASE}/uploads/gallery/${name}` : "");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showMsg("error", "Section title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("icon", form.icon);
      fd.append("description", form.description);
      newImages.forEach((f) => fd.append("images", f));
      await api.post("/galleries", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Gallery section added!");
      setForm(emptyForm);
      setNewImages([]);
      fetchSections();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to add section.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s) => {
    setEditing(s);
    setEditForm({ title: s.title || "", icon: s.icon || "📸", description: s.description || "" });
    setEditImages([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editForm.title);
      fd.append("icon", editForm.icon);
      fd.append("description", editForm.description);
      editImages.forEach((f) => fd.append("images", f));
      await api.put(`/galleries/${editing._id}`, fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Gallery section updated!");
      setEditing(null);
      fetchSections();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete section "${s.title}" and all its images?`)) return;
    try {
      await api.delete(`/galleries/${s._id}`, authHeaders);
      showMsg("success", "Section deleted.");
      fetchSections();
    } catch (err) { showMsg("error", "Failed to delete."); }
  };

  const handleDeleteImage = async (s, filename) => {
    if (!window.confirm(`Delete image "${filename}"?`)) return;
    try {
      await api.delete(`/galleries/${s._id}/image/${encodeURIComponent(filename)}`, authHeaders);
      showMsg("success", "Image deleted.");
      fetchSections();
    } catch (err) { showMsg("error", "Failed to delete image."); }
  };

  const move = async (idx, dir, arr, setter) => {
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const a = arr[idx];
    const b = arr[target];
    const tmp = a.order;
    try {
      await api.put(`/galleries/${a._id}`, { order: b.order }, authHeaders);
      await api.put(`/galleries/${b._id}`, { order: tmp }, authHeaders);
      fetchSections();
    } catch (err) { showMsg("error", "Failed to reorder."); }
  };

  if (loading) return <div className="cm-loading">Loading gallery...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      {/* Add section */}
      <div className="cm-card">
        <h3>➕ Add New Gallery Section</h3>
        <form onSubmit={handleAdd}>
          <div className="cm-form-grid">
            <div className="cm-field"><label>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="cm-field"><label>Icon</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="cm-field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="cm-field"><label>Images (multiple)</label><input type="file" accept="image/*" multiple onChange={(e) => setNewImages(Array.from(e.target.files))} /></div>
          </div>
          {newImages.length > 0 && <p style={{ color: "#111", fontSize: 13 }}>📎 {newImages.length} image(s) selected.</p>}
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "➕ Add Section"}</button>
          </div>
        </form>
      </div>

      {/* Sections */}
      <div className="cm-card">
        <h3>🖼️ Gallery Sections ({sections.length})</h3>
        <p className="cm-hint">Rename, reorder, upload or delete images per section.</p>
        {sections.map((s, idx) => (
          <div className="cm-item" key={s._id}>
            <div className="cm-thumb">
              {s.images?.[0] ? <img src={imgUrl(s.images[0])} alt={s.title} /> : <span>{s.icon}</span>}
            </div>
            <div className="cm-item-body">
              <h4>{s.icon} {s.title}</h4>
              <p>{s.description}</p>
              <p style={{ marginTop: 5 }}>📷 {s.images?.length || 0} image(s)</p>
              {s.images?.length > 0 && (
                <div className="cm-image-row">
                  {s.images.map((im) => (
                    <div className="cm-image-box" key={im}>
                      <img src={imgUrl(im)} alt={im} />
                      <button className="cm-remove-img" onClick={() => handleDeleteImage(s, im)} title="Delete">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="cm-item-actions">
              <button className="cm-icon-btn up" onClick={() => move(idx, -1)} title="Move up">⬆️</button>
              <button className="cm-icon-btn down" onClick={() => move(idx, 1)} title="Move down">⬇️</button>
              <button className="cm-icon-btn edit" onClick={() => openEdit(s)} title="Edit">✏️</button>
              <button className="cm-icon-btn del" onClick={() => handleDelete(s)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
        {sections.length === 0 && <div className="cm-empty">No gallery sections yet.</div>}
      </div>

      {/* Edit modal */}
      {editing && (
        <ModalPortal>
          <div className="cm-modal-overlay" onClick={() => setEditing(null)}>
            <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
              <button className="cm-modal-close" onClick={() => setEditing(null)}>✕</button>
              <h3>✏️ Edit Section</h3>
              <form onSubmit={handleUpdate}>
                <div className="cm-field"><label>Title *</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                <div className="cm-field"><label>Icon</label><input value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} /></div>
                <div className="cm-field"><label>Description</label><input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
                <div className="cm-field"><label>Upload More Images</label><input type="file" accept="image/*" multiple onChange={(e) => setEditImages(Array.from(e.target.files))} /></div>
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

export default GalleryManager;
