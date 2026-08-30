import React from "react";
import "./AdminSidebar.css";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ closeMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (closeMenu) closeMenu();
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar-content">
      <h2>Inner Strength Martial Arts & Fitness Academy.</h2>

      <ul>
        <li>
          <NavLink to="/admin/dashboard" onClick={closeMenu}>
            📊 Dashboard
          </NavLink>
        </li>

        {/* 📋 MANAGEMENT */}
        <li className="sidebar-divider">📋 MANAGEMENT</li>

        <li>
          <NavLink to="/admin/trials" onClick={closeMenu}>
            🥋 Trial Bookings
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/contacts" onClick={closeMenu}>
            📞 Contact Messages
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/trainers" onClick={closeMenu}>
            👥 Trainers
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reports" onClick={closeMenu}>
            📈 Reports
          </NavLink>
        </li>

        {/* 🌐 WEBSITE CMS */}
        <li className="sidebar-divider">🌐 WEBSITE CMS</li>

        <li>
          <NavLink to="/admin/hero" onClick={closeMenu}>
            🏠 Hero
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/about" onClick={closeMenu}>
            📖 About
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/logo" onClick={closeMenu}>
            🖼️ Logo
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/programs" onClick={closeMenu}>
            🥋 Programs
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/galleries" onClick={closeMenu}>
            🎞️ Gallery
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/timetable" onClick={closeMenu}>
            🗓️ Timetable
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/testimonials" onClick={closeMenu}>
            💬 Testimonials
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/contact-footer" onClick={closeMenu}>
            📞 Contact & Footer
          </NavLink>
        </li>

        {/* ⚙️ WEBSITE SETTINGS */}
        <li className="sidebar-divider">⚙️ WEBSITE SETTINGS</li>

        <li>
          <NavLink to="/admin/settings" onClick={closeMenu}>
            ⚙️ Website Settings
          </NavLink>
        </li>

        {/* 💾 SYSTEM */}
        <li className="sidebar-divider">💾 SYSTEM</li>

        <li>
          <NavLink to="/admin/activities" onClick={closeMenu}>
            📜 Activity Logs
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/backup" onClick={closeMenu}>
            💾 Backup & Restore
          </NavLink>
        </li>

        <li className="sidebar-spacer" />

        <li>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;

