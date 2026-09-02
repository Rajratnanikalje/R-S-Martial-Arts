import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import api from "../services/api";
import "../pages/AdminDashboard.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [admin, setAdmin] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [unseen, setUnseen] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Live date & time
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load admin profile + activity notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    api
      .get("/admin/dashboard", { headers })
      .then(({ data }) => setAdmin(data.admin || null))
      .catch(() => {});

    api
      .get("/system/activity-logs", { headers })
      .then(({ data }) => {
        const list = data.logs || [];
        setActivities(list.slice(0, 8));
        setUnseen(list.filter((a) => a.category === "management" || a.category === "cms").length);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close sidebar automatically when route changes (mobile UX)
  const location = useLocation();
  useEffect(() => {
    // Only auto-close on route change when on small screens
    if (typeof window !== "undefined" && window.innerWidth <= 767) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Keep sidebar state in sync with viewport: close on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // run once to ensure correct initial state if JS ran after render
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const q = search.trim().toLowerCase();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get("/admin/trials", { headers }),
      api.get("/admin/contacts", { headers }),
    ])
      .then(([tr, co]) => {
        const trialHit = (tr.data.trials || []).find(
          (t) => t.name?.toLowerCase().includes(q) || t.phone?.includes(q)
        );
        const contactHit = (co.data.contacts || []).find(
          (c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)
        );
        if (trialHit) navigate("/admin/trials");
        else if (contactHit) navigate("/admin/contacts");
        else alert("No matching trial or contact found.");
      })
      .catch((err) => alert(err.response?.data?.message || "Search failed."));
  };

  // Refs for notification panel outside-click detection
  const notifPanelRef = useRef(null);
  const bellBtnRef = useRef(null);

  // Close notification panel when clicking/touching outside the panel and bell
  useEffect(() => {
    if (!notifOpen) return;

    const handleOutside = (event) => {
      const target = event.target;
      if (notifPanelRef.current && notifPanelRef.current.contains(target)) return;
      if (bellBtnRef.current && bellBtnRef.current.contains(target)) return;
      setNotifOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [notifOpen]);

  const dateString = now.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeString = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

return (
    <div className="admin-layout">
      {/* 📱 Mobile Top Fixed Bar */}
      <div className="mobile-header-bar">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <div className="mobile-header-title">INNER STRENGTH DASHBOARD</div>
      </div>

      {/* 👤 Mobile Sidebar Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* 📚 Right Column: Header + Content (progresses below the sidebar) */}
      <div className="admin-main">
        {/* Sticky Global Admin Header (top of content area) */}
        <header className="admin-header admin-header-global">
          <div className="admin-header-left">
            <h1>ADMIN CONTROL CENTER</h1>
            <span className="admin-clock">
              🗓 {dateString} · ⏰ {timeString}
            </span>
          </div>

          <form className="admin-search-form" onSubmit={goSearch}>
            <span className="admin-search-icon">🔎</span>
            <input
              className="admin-search-input"
              placeholder="Search trials / contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="admin-header-actions">
            <div className="admin-notif-wrap">
              <button
                ref={bellBtnRef}
                className="admin-bell-btn"
                onClick={() => setNotifOpen((p) => !p)}
                aria-label="Notifications"
              >
                🔔{unseen > 0 && <span className="admin-bell-dot">{unseen}</span>}
              </button>
              {notifOpen && (
                <div ref={notifPanelRef} className="admin-notif-panel">
                  <h4>🔔 Recent Activity</h4>
                  {activities.length === 0 && <p className="admin-notif-empty">No recent activity.</p>}
                  {activities.map((a, i) => (
                    <div className="admin-notif-item" key={a._id || i}>
                      <strong>{a.action}</strong>
                      {a.entity && <span> — {a.entity}</span>}
                      <small>
                        {a.actor} · {new Date(a.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                  <Link to="/admin/activities" className="admin-notif-viewall">
                    View All Activity Logs →
                  </Link>
                </div>
              )}
            </div>

            {admin && (
              <div className="admin-profile-chip">
                <span className="admin-avatar">{(admin.name || "A").charAt(0).toUpperCase()}</span>
                <div className="admin-profile-meta">
                  <strong>{admin.name}</strong>
                  <span className="admin-role-badge">{admin.role}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 📊 Main Content Area */}
        <main className="admin-dashboard">
          <Outlet />
        </main>
      </div>

      {/* 📂 Sidebar Container (always on the left) */}
      <aside className={`sidebar-mobile ${sidebarOpen ? "show" : ""}`}>
        <AdminSidebar closeMenu={closeSidebar} />
      </aside>
    </div>
  );
}

export default AdminLayout;

