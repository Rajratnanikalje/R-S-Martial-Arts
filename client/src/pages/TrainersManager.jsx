import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./TrainersManager.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

const emptyForm = { name: "", role: "", experience: "" };

function TrainersManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Add form
  const [form, setForm] = useState(emptyForm);
  const [formPhoto, setFormPhoto] = useState(null);

  // Edit modal
  const [editing, setEditing] = useState(null); // trainer object
  const [editForm, setEditForm] = useState(emptyForm);
  const [editPhoto, setEditPhoto] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchTrainers();
  }, [token, navigate]);

  const fetchTrainers = async () => {
    try {
      const { data } = await api.get("/trainers", authHeaders);
      setTrainers(data.trainers || []);
    } catch (error) {
      console.error("Failed to load trainers:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
      setMessage({ type: "error", text: "Failed to load trainers." });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const photoUrl = (photo) =>
    photo ? `${UPLOADS_BASE}/uploads/trainers/${photo}` : "";

  // ADD
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showMessage("error", "Trainer name is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("role", form.role);
      fd.append("experience", form.experience);
      if (formPhoto) fd.append("photo", formPhoto);

      await api.post("/trainers", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMessage("success", "Trainer added successfully!");
      setForm(emptyForm);
      setFormPhoto(null);
      fetchTrainers();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to add trainer.");
    } finally {
      setSaving(false);
    }
  };

  // OPEN EDIT
  const openEdit = (t) => {
    setEditing(t);
    setEditForm({ name: t.name, role: t.role || "", experience: t.experience || "" });
    setEditPhoto(null);
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showMessage("error", "Trainer name is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("role", editForm.role);
      fd.append("experience", editForm.experience);
      if (editPhoto) fd.append("photo", editPhoto);

      await api.put(`/trainers/${editing._id}`, fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMessage("success", "Trainer updated successfully!");
      setEditing(null);
      fetchTrainers();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to update trainer.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (t) => {
    if (!window.confirm(`Delete trainer "${t.name}"? This will also remove their photo.`)) return;
    try {
      await api.delete(`/trainers/${t._id}`, authHeaders);
      showMessage("success", "Trainer deleted.");
      fetchTrainers();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to delete trainer.");
    }
  };

  return (
<div className="trainers-manager">
      {message.text && <div className={`tr-alert-box ${message.type}`}>{message.text}</div>}

      {/* Add Trainer Form */}
      <div className="tr-add-card">
        <h3>➕ Add New Trainer</h3>
        <form onSubmit={handleAdd} className="tr-form">
          <div className="tr-form-row">
            <div className="tr-field">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Master Rajratna"
              />
            </div>
            <div className="tr-field">
              <label>Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Karate Instructor"
              />
            </div>
            <div className="tr-field">
              <label>Experience</label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 10+ Years Experience"
              />
            </div>
            <div className="tr-field">
              <label>Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setFormPhoto(e.target.files[0])} />
            </div>
          </div>
          <button type="submit" className="tr-submit-btn" disabled={saving}>
            {saving ? "Saving..." : "➕ Add Trainer"}
          </button>
        </form>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <div className="tr-loading">Loading trainers...</div>
      ) : trainers.length === 0 ? (
        <div className="tr-empty">
          <p>No trainers yet. Add your first trainer above.</p>
        </div>
      ) : (
        <div className="tr-grid">
          {trainers.map((t) => (
            <div className="tr-card" key={t._id}>
              <div className="tr-photo">
                {t.photo ? (
                  <img src={photoUrl(t.photo)} alt={t.name} />
                ) : (
                  <span className="tr-no-photo">🥋</span>
                )}
              </div>
              <div className="tr-info">
                <h3>{t.name}</h3>
                {t.role && <p>{t.role}</p>}
                {t.experience && <span>{t.experience}</span>}
              </div>
              <div className="tr-actions">
                <button className="tr-btn edit" onClick={() => openEdit(t)}>✏️ Edit</button>
                <button className="tr-btn del" onClick={() => handleDelete(t)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="tr-modal-overlay" onClick={() => setEditing(null)}>
          <div className="tr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tr-modal-close" onClick={() => setEditing(null)}>✕</button>
            <h3>✏️ Edit Trainer</h3>

            {editing.photo && (
              <div className="tr-modal-preview">
                <img src={photoUrl(editing.photo)} alt={editing.name} />
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="tr-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="tr-field">
                <label>Role</label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                />
              </div>
              <div className="tr-field">
                <label>Experience</label>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                />
              </div>
              <div className="tr-field">
                <label>Replace Photo (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} />
              </div>
              <div className="tr-modal-actions">
                <button type="button" className="tr-btn cancel" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="tr-btn save" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainersManager;
