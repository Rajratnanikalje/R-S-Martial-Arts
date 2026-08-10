import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminLogin.css"; // Reuse existing login styling

function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (password !== confirmPassword) {
      return setMsg({ text: "Passwords do not match!", type: "error" });
    }

    try {
      setLoading(true);
      const res = await api.post(
        `/auth/reset-password/${resetToken}`,
        { password }
      );

      setMsg({ text: res.data.message, type: "success" });
      
      // Password reset hone ke 2 sec baad Login page par redirect
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || "Reset failed. Link may be expired.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-box">
        <h2>Set New Password</h2>

        {msg.text && (
          <div className={`alert-box ${msg.type === "error" ? "error" : "success"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
