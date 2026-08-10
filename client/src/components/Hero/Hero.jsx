import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Hero.css";

// Server base URL for uploaded images
const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const DEFAULT_HERO = {
  tag: "RS MARTIAL—ARTS SQUAD & Fitness",
  title: "Train Your Body.\nMaster Your Mind.",
  subtitle: "Learn martial arts, improve fitness and build confidence with professional trainers.",
  button1Text: "Book Free Trial",
  button1Link: "#trial",
  button2Text: "View Programs",
  button2Link: "#programs",
};

function Hero() {
  const [lightbox, setLightbox] = useState(false);
  const [hero, setHero] = useState(DEFAULT_HERO);

  const openLightbox = () => setLightbox(true);
  const closeLightbox = () => setLightbox(false);

  // Fetch dynamic hero content from CMS (falls back to defaults)
  useEffect(() => {
    api.get("/hero-content")
      .then(({ data }) => setHero({ ...DEFAULT_HERO, ...(data.content || {}) }))
      .catch(() => {});
  }, []);

  // Close lightbox with Escape key & lock page scroll while open
  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  const imgSrc = `${UPLOADS_BASE}/uploads/hero/hero.png`;

  return (
    <section className="hero" id="home">
      {/* Ambient neon orbs */}
      <div className="hero-orb hero-orb-1" aria-hidden="true" />
      <div className="hero-orb hero-orb-2" aria-hidden="true" />

      <div className="hero-container">
        {/* LEFT COLUMN: Text & Buttons */}
        <div className="hero-content">
          <p className="hero-tag">{hero.tag}</p>

          <h1>
            {(hero.title || "").split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < (hero.title || "").split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="hero-text">{hero.subtitle}</p>

          <div className="hero-buttons">
            <button
              className="primary-btn shiny-btn"
              onClick={() =>
                hero.button1Link?.startsWith("#")
                  ? document.getElementById(hero.button1Link.slice(1))?.scrollIntoView({ behavior: "smooth" })
                  : (window.location.href = hero.button1Link)
              }
            >
              {hero.button1Text}
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                hero.button2Link?.startsWith("#")
                  ? document.getElementById(hero.button2Link.slice(1))?.scrollIntoView({ behavior: "smooth" })
                  : (window.location.href = hero.button2Link)
              }
            >
              {hero.button2Text}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>10+</strong>
              <span>Programs</span>
            </div>
            <div className="hero-stat">
              <strong>15+</strong>
              <span>Years</span>
            </div>
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Students</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Premium Glass Framed Image */}
        <div className="hero-image-wrapper">
          <button
            className="hero-image-btn"
            onClick={openLightbox}
            aria-label="View training image"
          >
            <span className="hero-glass-frame">
              <img
                src={imgSrc}
                alt="Martial Arts Trainer"
                className="hero-img"
              />
              <span className="hero-zoom-hint" aria-hidden="true">🔍</span>
            </span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightbox && (
        <div className="hero-lightbox" onClick={closeLightbox}>
          <button
            className="hero-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="hero-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={imgSrc} alt="Martial Arts Trainer - Fullscreen" />
          </div>
          <p className="hero-lightbox-caption">
            RS MARTIAL—ARTS SQUAD — Train Your Body. Master Your Mind.
          </p>
        </div>
      )}
    </section>
  );
}

export default Hero;

