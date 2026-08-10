import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP Popup State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    websiteTitle: "",
    favicon: "",
    adminLogo: "",
    themePrimary: "",
    themeSecondary: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });
  const [cmsLoading, setCmsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch Current Admin Details on Page Load
  useEffect(() => {
    if (!token) {
      alert("Session expired! Please login again.");
      navigate("/login");
      return;
    }

    const fetchAdminProfile = async () => {
      try {
        const res = await api.get("/admin/dashboard", authHeaders);
        if (res.data.admin) {
          setName(res.data.admin.name || "Raj");
          setEmail(res.data.admin.email || "nikaljerajratna1@gmail.com");
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          alert("Your session has expired. Please log in again.");
          navigate("/login");
        }
      }
    };

    fetchAdminProfile();

    api.get("/site-settings")
      .then(({ data }) => setSiteSettings((current) => ({
        ...current,
        websiteTitle: data.settings?.websiteTitle || "",
        favicon: data.settings?.favicon || "",
        adminLogo: data.settings?.adminLogo || "",
        themePrimary: data.settings?.themePrimary || "",
        themeSecondary: data.settings?.themeSecondary || "",
        seoTitle: data.settings?.seoTitle || "",
        seoDescription: data.settings?.seoDescription || "",
        seoKeywords: data.settings?.seoKeywords || "",
      })))
      .catch(() => setMessage({ type: "error", text: "Website settings could not be loaded." }));
  }, [token, navigate]);

  // Step 1: Send OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password aur Confirm password match nahi kar rahe hain!" });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/admin/send-otp",
        { email },
        authHeaders
      );

      setMessage({ type: "success", text: res.data.message });
      setShowOtpModal(true); // Open OTP Modal
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "OTP bhejne me problem aayi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Apply Changes
  const handleVerifyOtpAndSave = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Kripya email par aaya OTP enter karein!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(
        "/admin/confirm-update",
        {
          otp,
          name,
          email,
          oldPassword,
          newPassword,
        },
        authHeaders
      );

      setMessage({ type: "success", text: res.data.message });
      setShowOtpModal(false);
      setOtp("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Verification Failed! Galat OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSettingsChange = (event) => {
    setSiteSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveSiteSettings = async (event) => {
    event.preventDefault();
    setCmsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const websitePayload = {
        websiteTitle: siteSettings.websiteTitle,
        favicon: siteSettings.favicon,
        adminLogo: siteSettings.adminLogo,
        themePrimary: siteSettings.themePrimary,
        themeSecondary: siteSettings.themeSecondary,
        seoTitle: siteSettings.seoTitle,
        seoDescription: siteSettings.seoDescription,
        seoKeywords: siteSettings.seoKeywords,
      };
      const { data } = await api.put("/admin/site-settings", websitePayload, authHeaders);
      setSiteSettings((current) => ({ ...current, ...data.settings }));
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Website settings could not be saved." });
    } finally {
      setCmsLoading(false);
    }
  };

  return (
<div className="settings-container">
      {message.text && (
        <div className={`alert-box ${message.type}`}>{message.text}</div>
      )}

      <div className="settings-card">
        <h3>Edit Profile & Credentials</h3>
        <p>Email, Name, ya Password change karne ke liye Email OTP Verification mandatory hai.</p>

        <form onSubmit={handleFormSubmit} className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Admin Email Address</label>
            <input
              type="email"
              placeholder="Enter Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <hr className="divider" />

          <h4>Change Password (Optional)</h4>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Current password (agar password badal rahe hain)"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Save Changes & Get OTP"}
          </button>
        </form>
      </div>

      {/* Website Identity, Theme & SEO Settings */}
      <div className="settings-card">
        <h3>Website Settings</h3>
        <p>Website title, theme colors aur SEO meta settings ko yahan se control karein.</p>
        <form onSubmit={saveSiteSettings} className="settings-form">
          <div className="form-group"><label>Website Title</label><input name="websiteTitle" value={siteSettings.websiteTitle} onChange={handleSiteSettingsChange} placeholder="RS Martial Arts Squad & Fitness" /></div>
          <div className="form-group"><label>Theme Primary Color</label><input name="themePrimary" type="color" value={siteSettings.themePrimary || "#e63946"} onChange={handleSiteSettingsChange} /></div>
          <div className="form-group"><label>Theme Secondary Color</label><input name="themeSecondary" type="color" value={siteSettings.themeSecondary || "#ff5b6e"} onChange={handleSiteSettingsChange} /></div>
          <div className="form-group"><label>Favicon Filename (uploads/favicon)</label><input name="favicon" value={siteSettings.favicon} onChange={handleSiteSettingsChange} placeholder="favicon.png" /></div>
          <div className="form-group"><label>Admin Logo Filename (uploads/admin)</label><input name="adminLogo" value={siteSettings.adminLogo} onChange={handleSiteSettingsChange} placeholder="admin.png" /></div>
          <div className="form-group"><label>SEO Title</label><input name="seoTitle" value={siteSettings.seoTitle} onChange={handleSiteSettingsChange} /></div>
          <div className="form-group"><label>SEO Description</label><textarea name="seoDescription" value={siteSettings.seoDescription} onChange={handleSiteSettingsChange} rows="3" /></div>
          <div className="form-group"><label>SEO Keywords</label><textarea name="seoKeywords" value={siteSettings.seoKeywords} onChange={handleSiteSettingsChange} rows="2" /></div>
          <button type="submit" className="save-btn" disabled={cmsLoading}>{cmsLoading ? "Saving..." : "Save Website Settings"}</button>
        </form>
      </div>

      {/* OTP POPUP MODAL */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Enter Verification Code (OTP)</h3>
            <p>
              Aapke registered email par 6-digit code bhej diya gaya hai. Changes save karne ke liye OTP enter karein:
            </p>

            <form onSubmit={handleVerifyOtpAndSave}>
              <div className="form-group">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="otp-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
