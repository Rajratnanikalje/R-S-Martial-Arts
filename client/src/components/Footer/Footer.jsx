import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt 
} from "react-icons/fa";
import api from "../../services/api";
import "./Footer.css";

// Server base URL for uploaded images
const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get("/site-settings")
      .then(({ data }) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const academyName = settings.academyName || "RS MARTIAL ARTS SQUAD";
  const whatsappNumber = (settings.whatsapp || "919156914227").replace(/\D/g, "") || "919156914227";
  const phone = settings.phone || "+91 91569 14227";
  const email = settings.email || "info@rsmartialarts.com";
  const mapUrl = settings.mapEmbedUrl?.trim();
  const address = settings.address || "RS Martial Arts Academy, Main Training Hall, City Center";
  const logoImg = (settings.logo)
    ? `${UPLOADS_BASE}/uploads/logo/${settings.logo}`
    : `${UPLOADS_BASE}/uploads/logo/logo.png`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Column 1: Brand / About Info */}
        <div className="footer-col brand-col">
<div className="footer-logo">
            <img src={logoImg} alt="Martial Arts Squad Logo" />
            <span>{academyName}</span>
          </div>
          <p className="brand-desc">
            Empowering individuals through traditional and modern martial arts. 
            Build discipline, strength, confidence, and self-defense skills with master trainers.
          </p>
          
          {/* Social Media Links */}
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a 
              href={`https://wa.me/${whatsappNumber}`} 
              target="_blank" 
              rel="noreferrer" 
              aria-label="WhatsApp"
              className="wa-icon"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" onClick={scrollToTop}>Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={scrollToTop}>About Us</Link>
            </li>
            <li>
              <Link to="/programs" onClick={scrollToTop}>Programs</Link>
            </li>
            <li>
              <Link to="/gallery" onClick={scrollToTop}>Gallery</Link>
            </li>
            <li>
              <Link to="/trial" onClick={scrollToTop}>Book Free Trial</Link>
            </li>
            <li>
              <Link to="/contact" onClick={scrollToTop}>Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Featured Programs */}
        <div className="footer-col">
          <h4>Our Programs</h4>
          <ul className="footer-links">
            <li><Link to="/programs" onClick={scrollToTop}>Karate & Kumite</Link></li>
            <li><Link to="/programs" onClick={scrollToTop}>Taekwondo</Link></li>
            <li><Link to="/programs" onClick={scrollToTop}>Traditional Self Defence</Link></li>
            <li><Link to="/programs" onClick={scrollToTop}>Mixed Martial Arts (MMA)</Link></li>
            <li><Link to="/programs" onClick={scrollToTop}>Kickboxing & Boxing</Link></li>
            <li><Link to="/programs" onClick={scrollToTop}>Kids Martial Arts</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact & Location */}
        <div className="footer-col contact-col">
          <h4>Get In Touch</h4>
          <ul className="contact-info">
            <li>
              <FaMapMarkerAlt className="info-icon" />
              {mapUrl ? (
                <a href={mapUrl} target="_blank" rel="noreferrer">{address}</a>
              ) : (
                <span>{address}</span>
              )}
            </li>
            <li>
              <FaPhoneAlt className="info-icon" />
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </li>
            <li>
              <FaEnvelope className="info-icon" />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>

          <Link to="/trial" className="footer-cta-btn" onClick={scrollToTop}>
            Join Free Trial Class
          </Link>
        </div>

      </div>

      {/* Bottom Bar: Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RS MARTIAL ARTS SQUAD. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;