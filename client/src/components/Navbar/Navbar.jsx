import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import api, { getCachedSiteSettings } from "../../services/api";
import "./Navbar.css";

// Server base URL for uploaded images
const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [academyName, setAcademyName] = useState(() => getCachedSiteSettings()?.academyName || "");
  const resolveLogo = (logo) => {
    if (!logo) return `${UPLOADS_BASE}/uploads/logo/logo.png`;
    return logo.startsWith("http") ? logo : `${UPLOADS_BASE}/uploads/logo/${logo}`;
  };
  const [logoImg, setLogoImg] = useState(() => resolveLogo(getCachedSiteSettings()?.logo));

  useEffect(() => {
    api.get("/site-settings")
      .then(({ data }) => {
        const s = data.settings || {};
        if (s.academyName) setAcademyName(s.academyName);
        if (s.logo) setLogoImg(resolveLogo(s.logo));
      })
      .catch(() => {});
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        {/* Logo & Brand Name Link */}
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src={logoImg} alt="Martial Arts Squad Logo" className="nav-logo-img" />
            <span>{academyName}</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About
          </Link>

          <Link to="/programs" onClick={closeMenu}>
            Programs
          </Link>

          <Link to="/gallery" onClick={closeMenu}>
            Gallery
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>

          {/* 🟢 Corrected Path: /trial */}
          <Link to="/trial" className="trial-btn" onClick={closeMenu}>
            Book Free Trial
          </Link>
        </nav>

        {/* Mobile Toggle Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
