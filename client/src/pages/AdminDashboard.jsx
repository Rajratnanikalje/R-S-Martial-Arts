import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

const defaultStats = {
  totalTrials: 0,
  totalContacts: 0,
  totalTrainers: 0,
  totalPrograms: 0,
  totalImages: 0,
  totalTestimonials: 0,
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    stats: defaultStats,
    recentActivities: [],
    latestTrials: [],
    latestContacts: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Admin profile
        const adminResponse = await api.get("/admin/dashboard", config);
        setAdmin(adminResponse.data.admin);

        // Overview: stats + recent activity + latest bookings/contacts
        try {
          const overviewRes = await api.get("/dashboard/overview", config);
          setOverview({
            stats: { ...defaultStats, ...(overviewRes.data.stats || {}) },
            recentActivities: overviewRes.data.recentActivities || [],
            latestTrials: overviewRes.data.latestTrials || [],
            latestContacts: overviewRes.data.latestContacts || [],
          });
        } catch (e) {
          console.error("Overview fetch failed:", e);
        }
        setLoading(false);
      } catch (error) {
        console.error("Dashboard Auth/Fetch Error:", error);
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    };

    fetchData();
    // Light auto-refresh keeps stats/latest data current without heavy polling
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-loading">
        <h2>Loading Dashboard... ⏳</h2>
      </div>
    );
  }

  const stats = [
    { icon: "🥋", label: "Total Trial Bookings", value: overview.stats.totalTrials, to: "/admin/trials" },
    { icon: "📞", label: "Contact Messages", value: overview.stats.totalContacts, to: "/admin/contacts" },
    { icon: "👥", label: "Total Trainers", value: overview.stats.totalTrainers, to: "/admin/trainers" },
    { icon: "🥊", label: "Total Programs", value: overview.stats.totalPrograms, to: "/admin/programs" },
    { icon: "🎞️", label: "Gallery Images", value: overview.stats.totalImages, to: "/admin/galleries" },
    { icon: "💬", label: "Total Testimonials", value: overview.stats.totalTestimonials, to: "/admin/testimonials" },
  ];

  const quickActions = [
    { icon: "🥋", label: "Manage Trials", to: "/admin/trials" },
    { icon: "📞", label: "Contact Messages", to: "/admin/contacts" },
    { icon: "🥊", label: "Add Program", to: "/admin/programs" },
    { icon: "🎞️", label: "Manage Gallery", to: "/admin/galleries" },
    { icon: "🏠", label: "Edit Hero", to: "/admin/hero" },
    { icon: "💾", label: "Backup Data", to: "/admin/backup" },
  ];

  return (
    <>
{/* 1. Welcome Card */}
      {admin && (
        <div className="dash-welcome">
          <div className="dash-welcome-avatar">
            {(admin.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="dash-welcome-body">
            <h2>Welcome back, {admin.name} 👋</h2>
            <p className="dash-welcome-meta">
              <span className="dash-role-badge">Role: {admin.role}</span>
              <span className="dash-welcome-lastlogin">🕘 Last login: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}</span>
            </p>
          </div>
        </div>
      )}

      {/* 2. Statistics Cards */}
      <div className="dash-overview">
        {stats.map((s) => (
          <Link to={s.to} className="dash-stat-card" key={s.label}>
            <span className="dash-stat-icon">{s.icon}</span>
            <div>
              <h2>{s.value}</h2>
              <p>{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

{/* 3. Row: Recent Activities | Latest Trial Bookings */}
      <div className="dash-two-col">
        <div className="dash-recent-card">
          <h3>🕘 Recent Activities</h3>
          {overview.recentActivities.length === 0 && (
            <p className="dash-empty">No activity yet.</p>
          )}
          {overview.recentActivities.slice(0, 6).map((a, i) => (
            <div className="dash-activity-item" key={a._id || i}>
              <span className="dash-activity-dot" />
              <div>
                <strong>{a.action}</strong>
                <small>{a.actor} · {new Date(a.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {overview.recentActivities.length > 0 && (
            <Link to="/admin/activities" className="dash-viewall">
              View All Activity Logs →
            </Link>
          )}
        </div>

        <div className="dash-recent-card">
          <h3>🆕 Latest Trial Bookings</h3>
          {overview.latestTrials.length === 0 && (
            <p className="dash-empty">No bookings yet.</p>
          )}
          {overview.latestTrials.slice(0, 5).map((t) => (
            <div className="dash-mini-item" key={t._id}>
              <div>
                <strong>{t.name}</strong>
                <small>{t.program} · {t.phone}</small>
              </div>
              <span className={`dash-status ${(t.status || "pending").toLowerCase()}`}>
                {t.status || "Pending"}
              </span>
            </div>
          ))}
          <Link to="/admin/trials" className="dash-viewall">
            View All Trials →
          </Link>
        </div>
      </div>

      {/* 4. Row: Latest Contact Messages | Quick Actions */}
      <div className="dash-two-col">
        <div className="dash-recent-card">
          <h3>📩 Latest Contact Messages</h3>
          {overview.latestContacts.length === 0 && (
            <p className="dash-empty">No messages yet.</p>
          )}
          {overview.latestContacts.slice(0, 5).map((c) => (
            <div className="dash-mini-item" key={c._id}>
              <div>
                <strong>{c.name}</strong>
                <small>{c.email || c.phone}</small>
              </div>
              <span className={`dash-status ${(c.status || "pending").toLowerCase()}`}>
                {c.status || "Pending"}
              </span>
            </div>
          ))}
          <Link to="/admin/contacts" className="dash-viewall">
            View All Messages →
          </Link>
        </div>

        <div className="dash-quick-actions dash-quick-card">
          <h3>⚡ Quick Actions</h3>
          <div className="dash-quick-grid">
            {quickActions.map((q) => (
              <Link to={q.to} className="dash-quick-btn" key={q.label}>
                {q.icon} {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;

