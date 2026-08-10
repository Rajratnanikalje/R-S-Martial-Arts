import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ContentManagers.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

function LogoManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [academyName, setAcademyName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }

    const load = async () => {
      try {
        const { data } = await api.get("/site-settings");
        const s = data.settings || {};
        setAcademyName(s.academyName || "RS MARTIAL ARTS SQUAD");
        if (s.logo) {
          setLogoUrl(`${UPLOADS_BASE}/uploads/logo/${s.logo}`);
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load branding settings." });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // Upload a new logo image to the existing /api/images logo category
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      showMsg("error", "Please select a logo image.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("images", logoFile);
      const res = await api.post("/images/logo", fd, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data.images && res.data.images[0];
      const filename = uploaded ? uploaded.name : null;

      // Persist the chosen logo filename + academy name using the existing
      // site-settings collection (extended, no new model created).
      if (filename && academyName.trim()) {
        const sRes = await api.put(
          "/admin/site-settings",
          { logo: filename, academyName: academyName.trim() },
          authHeaders
        );
        const s = sRes.data.settings || {};
        if (s.logo) setLogoUrl(`${UPLOADS_BASE}/uploads/logo/${s.logo}`);
      }

      showMsg("success", "Logo uploaded successfully!");
      setLogoFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Logo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Save the academy name (and current logo) to site-settings
  const handleSaveName = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(
        "/admin/site-settings",
        { academyName: academyName.trim() },
        authHeaders
      );
      showMsg("success", "Academy name saved successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save academy name.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cm-loading">Loading branding...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      {/* Logo image */}
      <div className="cm-card">
        <h3>🖼️ Logo Image</h3>
        <p className="cm-hint">Upload the logo used in the Navbar and Footer. Click save to apply immediately.</p>

        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div
            className="cm-thumb"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#111",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ objectFit: "contain" }} />
            ) : (
              <span>✨</span>
            )}
          </div>

          <form onSubmit={handleUpload} style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                style={{ flex: 1, minWidth: 180, padding: 10, border: "1px dashed #bbb", borderRadius: 8, background: "#fafbfc" }}
              />
              <button type="submit" className="cm-btn cm-btn-primary" disabled={uploading}>
                {uploading ? "Uploading..." : "🚀 Upload Logo"}
              </button>
            </div>
            {logoFile && <p style={{ color: "#111", fontSize: 13, marginTop: 8 }}>📎 Selected: {logoFile.name}</p>}
          </form>
        </div>
      </div>

      {/* Academy name */}
      <form onSubmit={handleSaveName}>
        <div className="cm-card">
          <h3>🏷️ Academy Name</h3>
          <p className="cm-hint">Shown next to the logo in the Navbar and Footer.</p>
          <div className="cm-field">
            <label>Brand Name</label>
            <input
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              placeholder="e.g. RS MARTIAL ARTS SQUAD"
            />
          </div>
          <div className="cm-btn-row">
            <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Brand Name"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LogoManager;

