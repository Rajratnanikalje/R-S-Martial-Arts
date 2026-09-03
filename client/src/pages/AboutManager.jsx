import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ConfirmImageRemoval from "../components/ConfirmImageRemoval.jsx";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

const normalizeFeatures = (value) => {
  const features = [];
  const add = (item, splitPlainText = true) => {
    if (Array.isArray(item)) return item.forEach((feature) => add(feature, false));
    if (typeof item !== "string") return;

    const text = item.trim();
    if (!text) return;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.forEach((feature) => add(feature, false));
      if (typeof parsed === "string" && parsed !== text) return add(parsed, splitPlainText);
    } catch {
      // Plain feature text is expected here.
    }

    const values = splitPlainText ? text.split(/[\n,]/) : [text];
    values.forEach((feature) => {
      if (feature.trim()) features.push(feature.trim());
    });
  };

  add(value);
  return features;
};

function AboutManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newImage, setNewImage] = useState(null);
  const [featureInput, setFeatureInput] = useState("");
  const [confirmRemoveImage, setConfirmRemoveImage] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchContent = async () => {
    try {
      const { data } = await api.get("/about-content", authHeaders);
      setContent({
        ...(data.content || {}),
        features: normalizeFeatures(data.content?.features),
      });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load about content." });
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

  const handleStatChange = (i, key, val) => {
    const stats = [...(content.stats || [])];
    if (!stats[i]) stats[i] = { value: "", label: "" };
    stats[i][key] = val;
    setContent({ ...content, stats });
  };

  const addStat = () => {
    setContent({ ...content, stats: [...(content.stats || []), { value: "", label: "" }] });
  };
  const removeStat = (i) => {
    const stats = [...(content.stats || [])];
    stats.splice(i, 1);
    setContent({ ...content, stats });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setContent({ ...content, features: [...(content.features || []), featureInput.trim()] });
    setFeatureInput("");
  };
  const removeFeature = (i) => {
    const features = [...(content.features || [])];
    features.splice(i, 1);
    setContent({ ...content, features });
  };
  const updateFeature = (i, value) => {
    const features = [...(content.features || [])];
    features[i] = value;
    setContent({ ...content, features });
  };

  const handleRemoveImage = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("removeImage", "true");
      await api.put("/about-content", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      setConfirmRemoveImage(false);
      showMsg("success", "About image removed successfully!");
      fetchContent();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to remove image.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(content || {}).forEach((k) => {
        if (["features", "stats"].includes(k)) return;
        if (content[k] != null) fd.append(k, content[k]);
      });
      if (content.features) fd.append("features", JSON.stringify(content.features));
      if (content.stats) fd.append("stats", JSON.stringify(content.stats));
      if (newImage) fd.append("image", newImage);

      await api.put("/about-content", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "About content saved successfully!");
      setNewImage(null);
      fetchContent();
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cm-loading">Loading about content...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <div className="cm-card">
        <h3>🖼️ About Image</h3>
        <p className="cm-hint">Replace the About section image.</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          {content.image ? (
            <img src={content.image.startsWith("http") ? content.image : `${UPLOADS_BASE}/uploads/about/${content.image}`} alt="About" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }} />
          ) : (
            <div className="cm-thumb">📖</div>
          )}
          <label className="cm-btn cm-btn-blue" style={{ cursor: "pointer" }}>
            📁 Choose New Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setNewImage(e.target.files[0])} />
          </label>
          {content.image && <button type="button" className="cm-btn cm-btn-danger-ghost" onClick={() => setConfirmRemoveImage(true)}>Remove Image</button>}
          {newImage && <span style={{ color: "#111", fontSize: 13 }}>Selected: {newImage.name}</span>}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="cm-card">
          <h3>✏️ About Headings & Text</h3>
          <div className="cm-form-grid">
            <div className="cm-field">
              <label>Section Tag</label>
              <input name="headingTop" value={content.headingTop || ""} onChange={handleChange} />
            </div>
            <div className="cm-field">
              <label>Badge Value</label>
              <input name="badgeValue" value={content.badgeValue || ""} onChange={handleChange} />
            </div>
            <div className="cm-field">
              <label>Badge Label</label>
              <input name="badgeLabel" value={content.badgeLabel || ""} onChange={handleChange} />
            </div>
            <div className="cm-field full">
              <label>Main Heading (use \n for line break)</label>
              <textarea name="headingBottom" value={content.headingBottom || ""} onChange={handleChange} rows="2" />
            </div>
            <div className="cm-field full">
              <label>Paragraph 1</label>
              <textarea name="paragraph1" value={content.paragraph1 || ""} onChange={handleChange} rows="3" />
            </div>
            <div className="cm-field full">
              <label>Paragraph 2</label>
              <textarea name="paragraph2" value={content.paragraph2 || ""} onChange={handleChange} rows="3" />
            </div>
            <div className="cm-field"><label>Button Text</label><input name="buttonText" value={content.buttonText || ""} onChange={handleChange} /></div>
            <div className="cm-field"><label>Button Link</label><input name="buttonLink" value={content.buttonLink || ""} onChange={handleChange} placeholder="#programs" /></div>
          </div>
        </div>

        <div className="cm-card">
          <h3>✨ Feature Highlights</h3>
          <div className="cm-btn-row" style={{ marginTop: 0 }}>
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature point..."
              style={{ flex: 1, minWidth: 200, padding: 11, border: "1px solid #d1d5db", borderRadius: 8 }}
            />
            <button type="button" className="cm-btn cm-btn-blue" onClick={addFeature}>+ Add</button>
          </div>
          {(content.features || []).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <input
                value={f}
                onChange={(e) => updateFeature(i, e.target.value)}
                aria-label={`Feature highlight ${i + 1}`}
                style={{ flex: 1, padding: 11, border: "1px solid #d1d5db", borderRadius: 8 }}
              />
              <button type="button" className="cm-icon-btn del" onClick={() => removeFeature(i)}>🗑️</button>
            </div>
          ))}
        </div>

        <div className="cm-card">
          <h3>📊 Statistics</h3>
          {(content.stats || []).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <input value={s.value || ""} placeholder="Value (10+)"
                onChange={(e) => handleStatChange(i, "value", e.target.value)}
                style={{ flex: 1, minWidth: 120, padding: 11, border: "1px solid #d1d5db", borderRadius: 8 }} />
              <input value={s.label || ""} placeholder="Label (Years Experience)"
                onChange={(e) => handleStatChange(i, "label", e.target.value)}
                style={{ flex: 2, minWidth: 160, padding: 11, border: "1px solid #d1d5db", borderRadius: 8 }} />
              <button type="button" className="cm-icon-btn del" onClick={() => removeStat(i)}>🗑️</button>
            </div>
          ))}
          <button type="button" className="cm-btn cm-btn-ghost" onClick={addStat}>+ Add Stat</button>
        </div>

        <div className="cm-btn-row">
          <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>
            {saving ? "Saving..." : "💾 Save About Content"}
          </button>
        </div>
      </form>
      <ConfirmImageRemoval open={confirmRemoveImage} onCancel={() => setConfirmRemoveImage(false)} onConfirm={handleRemoveImage} busy={saving} />
    </div>
  );
}

export default AboutManager;
