import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ConfirmImageRemoval from "../components/ConfirmImageRemoval.jsx";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

function HeroManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [files, setFiles] = useState([]);
  const [imageToRemove, setImageToRemove] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchContent = async () => {
    try {
      const { data } = await api.get("/hero-content", authHeaders);
      setContent(data.content || {});
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load hero content." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleChange = (e) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/hero-content", content, authHeaders);
      showMsg("success", "Hero content saved successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save hero content.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      showMsg("error", "Please select at least one image.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      await api.post("/hero-content/images", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Hero image(s) uploaded!");
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      fetchContent();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (filename) => {
    try {
      await api.delete(`/hero-content/images/${encodeURIComponent(filename)}`, authHeaders);
      setImageToRemove("");
      showMsg("success", "Image deleted.");
      fetchContent();
    } catch (err) {
      showMsg("error", "Failed to delete image.");
    }
  };

  if (loading) {
    return <div className="cm-loading">Loading hero content...</div>;
  }

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      {/* Images */}
      <div className="cm-card">
        <h3>🖼️ Current Hero Image</h3>
        <p className="cm-hint">Change the active hero image or remove it to use the existing static fallback.</p>
        <form onSubmit={handleUpload} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFiles(e.target.files[0] ? [e.target.files[0]] : [])} className="cm-file-input" style={{ flex: 1, minWidth: 220, padding: 10, border: "1px dashed #bbb", borderRadius: 8, background: "#fafbfc" }} />
          <button type="submit" className="cm-btn cm-btn-primary" disabled={uploading}>
            {uploading ? "Uploading..." : (content.images || []).length ? "Change Image" : "Upload Image"}
          </button>
        </form>
        <div className="cm-image-row">
          {(content.images || []).length === 0 && <p style={{ color: "#888" }}>No hero images yet.</p>}
          {(content.images || []).map((img) => (
            <div className="cm-image-box" key={img}>
              <img src={img.startsWith("http") ? img : `${UPLOADS_BASE}/uploads/hero/${img}`} alt="Hero" />
              <button className="cm-remove-img" onClick={() => setImageToRemove(img)} title="Remove image">✕</button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmImageRemoval open={Boolean(imageToRemove)} onCancel={() => setImageToRemove("")} onConfirm={() => handleDeleteImage(imageToRemove)} />

{/* Enable / Disable */}
      <div className="cm-card">
        <h3>⚡ Hero Status</h3>
        <p className="cm-hint">Toggle whether the hero section is shown on the public website.</p>
        <label className="cm-switch-row">
          <input
            type="checkbox"
            checked={content.enabled !== false}
            onChange={(e) => setContent({ ...content, enabled: e.target.checked })}
          />
          <span className={content.enabled === false ? "cm-badge off" : "cm-badge on"}>
            {content.enabled === false ? "Disabled" : "Enabled"}
          </span>
        </label>
      </div>

      {/* Text fields */}
      <div className="cm-card">
        <h3>✏️ Hero Content</h3>
        <p className="cm-hint">Edit the hero tagline, title, subtitle, and button details.</p>
        <form onSubmit={handleSave}>
          <div className="cm-form-grid">
            <div className="cm-field full">
              <label>Tag Line</label>
              <input name="tag" value={content.tag || ""} onChange={handleChange} />
            </div>
            <div className="cm-field full">
              <label>Title (use \n for line break)</label>
              <textarea name="title" value={content.title || ""} onChange={handleChange} rows="2" />
            </div>
            <div className="cm-field full">
              <label>Subtitle / Description</label>
              <textarea name="subtitle" value={content.subtitle || ""} onChange={handleChange} rows="3" />
            </div>
            <div className="cm-field">
              <label>Button 1 Text</label>
              <input name="button1Text" value={content.button1Text || ""} onChange={handleChange} />
            </div>
            <div className="cm-field">
              <label>Button 1 Link (#trial or /trial)</label>
              <input name="button1Link" value={content.button1Link || ""} onChange={handleChange} />
            </div>
            <div className="cm-field">
              <label>Button 2 Text</label>
              <input name="button2Text" value={content.button2Text || ""} onChange={handleChange} />
            </div>
            <div className="cm-field">
              <label>Button 2 Link (#programs or /programs)</label>
              <input name="button2Link" value={content.button2Link || ""} onChange={handleChange} />
            </div>
          </div>
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Hero Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HeroManager;
