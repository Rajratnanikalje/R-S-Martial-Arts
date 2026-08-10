import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎯 FORGOT PASSWORD MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [modalMsg, setModalMsg] = useState({ text: "", type: "" });
  const [modalLoading, setModalLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const response = await api.post(
        "/auth/login",
        formData
      );

      if (response.data.user && response.data.user.role === "admin") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/admin/dashboard");
      } else {
        setErrorMsg("Only Admin accounts are authorized to log in.");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Login failed! Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // 📧 FORGOT PASSWORD SUBMIT (Calls Real Backend API)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setModalMsg({ text: "", type: "" });

    try {
      setModalLoading(true);
      const res = await api.post(
        "/auth/forgot-password",
        { email: forgotEmail }
      );

      setModalMsg({ text: res.data.message, type: "success" });
    } catch (err) {
      setModalMsg({
        text: err.response?.data?.message || "Something went wrong!",
        type: "error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-box">
        <h2>Admin Login</h2>

        {errorMsg && <div className="alert-box error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="login-actions">
            <button
              type="button"
              className="forgot-btn"
              onClick={() => {
                setModalMsg({ text: "", type: "" });
                setForgotEmail("");
                setShowModal(true);
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* 📩 FORGOT PASSWORD POPUP MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Forgot Password</h3>
            <p>Enter your registered Admin Email to receive a reset link.</p>

            {modalMsg.text && (
              <div className={`alert-box ${modalMsg.type === "error" ? "error" : "success"}`}>
                {modalMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="Admin Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit" disabled={modalLoading}>
                  {modalLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;
