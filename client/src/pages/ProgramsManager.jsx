import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ModalPortal from "../components/ModalPortal.jsx";
import ConfirmImageRemoval from "../components/ConfirmImageRemoval.jsx";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

const emptyForm = {
  title: "", desc: "", icon: "🥋", duration: "", level: "", benefits: "",
  fees: "", ageGroup: "", beltLevel: "", trainer: "", published: true,
};

function ProgramsManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // new item form
  const [form, setForm] = useState(emptyForm);
  const [newImage, setNewImage] = useState(null);

  // editing
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImage, setEditImage] = useState(null);
  const [removeProgramImage, setRemoveProgramImage] = useState(null);

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
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/programs", authHeaders);
      setPrograms(data.programs || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load programs." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const imgUrl = (name) => (name ? `${UPLOADS_BASE}/uploads/programs/${name}` : "");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showMsg("error", "Program title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      if (newImage) fd.append("image", newImage);
      await api.post("/programs", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Program added successfully!");
      setForm(emptyForm);
      setNewImage(null);
      fetchPrograms();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to add program.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setEditForm({
      title: p.title || "", desc: p.desc || "", icon: p.icon || "🥋",
      duration: p.duration || "", level: p.level || "", benefits: p.benefits || "",
      fees: p.fees || "", ageGroup: p.ageGroup || "", beltLevel: p.beltLevel || "",
      trainer: p.trainer || "", published: p.published !== false,
    });
    setEditImage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) { showMsg("error", "Program title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(editForm).forEach((k) => fd.append(k, editForm[k]));
      if (editImage) fd.append("image", editImage);
      await api.put(`/programs/${editing._id}`, fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Program updated successfully!");
      setEditing(null);
      fetchPrograms();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update program.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete program "${p.title}"?`)) return;
    try {
      await api.delete(`/programs/${p._id}`, authHeaders);
      showMsg("success", "Program deleted.");
      fetchPrograms();
    } catch (err) {
      showMsg("error", "Failed to delete program.");
    }
  };

  const handleRemoveProgramImage = async () => {
    if (!removeProgramImage) return;
    try {
      const fd = new FormData();
      fd.append("removeImage", "true");
      const { data } = await api.put(`/programs/${removeProgramImage._id}`, fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      if (editing?._id === removeProgramImage._id) setEditing(data.program);
      setRemoveProgramImage(null);
      showMsg("success", `Image removed from ${data.program.title}.`);
      fetchPrograms();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to remove program image.");
    }
  };

  const move = async (idx, dir) => {
    const arr = [...programs];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    // swap order values
    const a = arr[idx];
    const b = arr[target];
    const tmp = a.order;
    try {
      await api.put(`/programs/${a._id}`, { order: b.order }, authHeaders);
      await api.put(`/programs/${b._id}`, { order: tmp }, authHeaders);
      fetchPrograms();
    } catch (err) {
      showMsg("error", "Failed to reorder.");
    }
  };

  if (loading) return <div className="cm-loading">Loading programs...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      {/* Add program */}
      <div className="cm-card">
        <h3>➕ Add New Program</h3>
        <form onSubmit={handleAdd}>
          <div className="cm-form-grid">
            <div className="cm-field full"><label>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Karate" /></div>
            <div className="cm-field"><label>Icon (emoji or text)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="cm-field"><label>Image (optional)</label><input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} /></div>
<div className="cm-field"><label>Duration</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 - 6 Months" /></div>
            <div className="cm-field"><label>Skill Level</label><input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="All Levels" /></div>
            <div className="cm-field"><label>Age Group</label><input value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })} placeholder="Kids / Adults / All" /></div>
            <div className="cm-field"><label>Belt Level</label><input value={form.beltLevel} onChange={(e) => setForm({ ...form, beltLevel: e.target.value })} placeholder="White to Black" /></div>
            <div className="cm-field"><label>Fees</label><input value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="e.g. ₹1,500 / month" /></div>
            <div className="cm-field"><label>Trainer</label><input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} placeholder="Lead Trainer name" /></div>
            <div className="cm-field full"><label>Description</label><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows="3" /></div>
            <div className="cm-field full"><label>Key Benefits</label><textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows="2" /></div>
            <div className="cm-field full">
              <label>Published</label>
              <select value={form.published.toString()} onChange={(e) => setForm({ ...form, published: e.target.value === "true" })}>
                <option value="true">✅ Published</option>
                <option value="false">🚫 Unpublished</option>
              </select>
            </div>
          </div>
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "➕ Add Program"}</button>
          </div>
        </form>
      </div>

      {/* Programs list */}
      <div className="cm-card">
        <h3>📚 Manage Programs ({programs.length})</h3>
        <p className="cm-hint">Use the ⬆️/⬇️ buttons to reorder programs.</p>
        {programs.map((p, idx) => (
          <div className="cm-item" key={p._id}>
            <div className="cm-thumb">
              {p.image ? <img src={imgUrl(p.image)} alt={p.title} /> : <span>{p.icon || "🥋"}</span>}
            </div>
            <div className="cm-item-body">
              <h4>{p.icon} {p.title}</h4>
              <p>{p.desc}</p>
              <p style={{ marginTop: 5 }}><strong>⏱️</strong> {p.duration || "N/A"} · <strong>🎯</strong> {p.level || "N/A"}</p>
            </div>
            <div className="cm-item-actions">
              <button className="cm-icon-btn up" onClick={() => move(idx, -1)} title="Move up">⬆️</button>
              <button className="cm-icon-btn down" onClick={() => move(idx, 1)} title="Move down">⬇️</button>
              <button className="cm-icon-btn edit" onClick={() => openEdit(p)} title="Edit">✏️</button>
              <button className="cm-icon-btn del" onClick={() => handleDelete(p)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
        {programs.length === 0 && <div className="cm-empty">No programs yet.</div>}
      </div>

      {/* Edit modal */}
      {editing && (
        <ModalPortal>
          <div className="cm-modal-overlay" onClick={() => setEditing(null)}>
            <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
              <button className="cm-modal-close" onClick={() => setEditing(null)}>✕</button>
              <h3>✏️ Edit Program</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                {editing.image && <img src={imgUrl(editing.image)} alt="" style={{ width: 70, height: 60, objectFit: "cover", borderRadius: 8 }} />}
                <label className="cm-btn cm-btn-blue" style={{ cursor: "pointer" }}>📁 Change Image
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setEditImage(e.target.files[0])} />
                </label>
                {editing.image && <button type="button" className="cm-btn cm-btn-danger-ghost" onClick={() => setRemoveProgramImage(editing)}>Remove Image</button>}
                {editImage && <span style={{ fontSize: 12 }}>{editImage.name}</span>}
              </div>
              <form onSubmit={handleUpdate}>
                <div className="cm-field"><label>Title *</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                <div className="cm-field"><label>Icon</label><input value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} /></div>
                <div className="cm-field"><label>Duration</label><input value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} /></div>
                <div className="cm-field"><label>Skill Level</label><input value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} /></div>
                <div className="cm-field"><label>Age Group</label><input value={editForm.ageGroup} onChange={(e) => setEditForm({ ...editForm, ageGroup: e.target.value })} /></div>
                <div className="cm-field"><label>Belt Level</label><input value={editForm.beltLevel} onChange={(e) => setEditForm({ ...editForm, beltLevel: e.target.value })} /></div>
                <div className="cm-field"><label>Fees</label><input value={editForm.fees} onChange={(e) => setEditForm({ ...editForm, fees: e.target.value })} /></div>
                <div className="cm-field"><label>Trainer</label><input value={editForm.trainer} onChange={(e) => setEditForm({ ...editForm, trainer: e.target.value })} /></div>
                <div className="cm-field"><label>Description</label><textarea value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} rows="3" /></div>
                <div className="cm-field"><label>Key Benefits</label><textarea value={editForm.benefits} onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value })} rows="2" /></div>
                <div className="cm-field">
                  <label>Published</label>
                  <select value={editForm.published.toString()} onChange={(e) => setEditForm({ ...editForm, published: e.target.value === "true" })}>
                    <option value="true">✅ Published</option>
                    <option value="false">🚫 Unpublished</option>
                  </select>
                </div>
                <div className="cm-btn-row">
                  <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "💾 Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
      <ConfirmImageRemoval open={Boolean(removeProgramImage)} onCancel={() => setRemoveProgramImage(null)} onConfirm={handleRemoveProgramImage} />
    </div>
  );
}

export default ProgramsManager;
