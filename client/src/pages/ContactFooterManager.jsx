import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ContentManagers.css";

const emptySettings = {
  academyName: "", contactHeading: "", contactDescription: "",
  phone: "", email: "", address: "", whatsapp: "", mapEmbedUrl: "",
  facebook: "", instagram: "", youtube: "", footerText: "", copyrightText: "",
};

function ContactFooterManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/site-settings", authHeaders);
      setSettings({ ...emptySettings, ...(data.settings || {}) });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/admin/site-settings", settings, authHeaders);
      setSettings({ ...settings, ...(data.settings || {}) });
      showMsg("success", "Contact & footer settings saved!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cm-loading">Loading settings...</div>;

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSave}>
        <div className="cm-card">
          <h3>📞 Contact Section</h3>
          <div className="cm-form-grid">
            <div className="cm-field full"><label>Academy Name</label><input name="academyName" value={settings.academyName} onChange={handleChange} /></div>
            <div className="cm-field full"><label>Contact Heading</label><input name="contactHeading" value={settings.contactHeading} onChange={handleChange} /></div>
            <div className="cm-field full"><label>Contact Description</label><textarea name="contactDescription" value={settings.contactDescription} onChange={handleChange} rows="2" /></div>
            <div className="cm-field"><label>Phone</label><input name="phone" value={settings.phone} onChange={handleChange} /></div>
            <div className="cm-field"><label>Email</label><input name="email" type="email" value={settings.email} onChange={handleChange} /></div>
            <div className="cm-field"><label>WhatsApp (with country code)</label><input name="whatsapp" value={settings.whatsapp} onChange={handleChange} placeholder="919999999999" /></div>
            <div className="cm-field full"><label>Address</label><textarea name="address" value={settings.address} onChange={handleChange} rows="2" /></div>
            <div className="cm-field full"><label>Google Maps Embed URL</label><input name="mapEmbedUrl" value={settings.mapEmbedUrl} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="cm-card">
          <h3>🔗 Social Links</h3>
          <div className="cm-form-grid">
            <div className="cm-field"><label>Facebook</label><input name="facebook" value={settings.facebook} onChange={handleChange} /></div>
            <div className="cm-field"><label>Instagram</label><input name="instagram" value={settings.instagram} onChange={handleChange} /></div>
            <div className="cm-field"><label>YouTube</label><input name="youtube" value={settings.youtube} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="cm-card">
          <h3>🦶 Footer</h3>
          <div className="cm-form-grid">
            <div className="cm-field full"><label>Footer Text</label><textarea name="footerText" value={settings.footerText} onChange={handleChange} rows="3" /></div>
            <div className="cm-field full"><label>Copyright Text</label><input name="copyrightText" value={settings.copyrightText} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="cm-btn-row">
          <button type="submit" className="cm-btn cm-btn-primary" disabled={saving}>{saving ? "Saving..." : "💾 Save Settings"}</button>
        </div>
      </form>
    </div>
  );
}

export default ContactFooterManager;
