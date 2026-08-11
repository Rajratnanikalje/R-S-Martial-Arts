import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./About.css";

// Server base URL for uploaded images
const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const DEFAULT_ABOUT = {
  headingTop: "More Than Martial Arts,",
  headingBottom: "It's A Way Of Life",
  paragraph1: "RS MARTIAL ARTS SQUAD is dedicated to developing physical strength, discipline, and confidence through professional martial arts training.",
  paragraph2: "Our experienced trainers help students improve fitness, self-defense skills, and mental focus in a positive, high-energy learning environment.",
  badgeValue: "10+",
  badgeLabel: "Years of Excellence",
  features: [
    "Certified & Experienced Master Trainers",
    "Specialized Programs for Kids, Adults & Pros",
    "Flexible Morning & Evening Batches",
  ],
  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Students Trained" },
    { value: "13+", label: "Programs Offered" },
  ],
};

const normalizeFeatures = (value) => {
  const features = [];
  const add = (item, splitPlainText = true) => {
    if (Array.isArray(item)) return item.forEach((feature) => add(feature, false));
    if (typeof item !== "string") return;

    const text = item.trim();
    if (!text) return;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.forEach((feature) => add(feature, false));
      if (typeof parsed === "string" && parsed !== text) return add(parsed, splitPlainText);
    } catch {
      // Plain feature text is the normal case.
    }

    const values = splitPlainText ? text.split(/[\n,]/) : [text];
    values.forEach((feature) => {
      if (feature.trim()) features.push(feature.trim());
    });
  };

  add(value);
  return features;
};

function About() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    api.get("/about-content")
      .then(({ data }) => setAbout({
        ...DEFAULT_ABOUT,
        ...(data.content || {}),
        features: normalizeFeatures(data.content?.features),
      }))
      .catch(() => {});
  }, []);

  const aboutImg = about.image
    ? `${UPLOADS_BASE}/uploads/about/${about.image}`
    : `${UPLOADS_BASE}/uploads/about/about.png`;

  const normalizedFeatures = normalizeFeatures(about.features);
  const features = normalizedFeatures.length
    ? normalizedFeatures
    : DEFAULT_ABOUT.features;

  const stats = Array.isArray(about.stats) && about.stats.length
    ? about.stats
    : DEFAULT_ABOUT.stats;

  return (
    <section className="about" id="about">
      <div className="about-container">
        
        {/* --- Image Section with Badge Overlay --- */}
        <div className="about-image">
          <div className="image-box">
            {/* 👈 2. Emoji ki jagah <img> tag lagaya */}
            <img src={aboutImg} alt="Martial Arts Training" className="about-main-img" />
            
            <div className="experience-badge">
              <h4>{about.badgeValue}</h4>
              <p>{about.badgeLabel}</p>
            </div>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="about-content">
          <p className="section-tag">About Our Academy</p>

          <h2>
            {about.headingTop}
            <br />
            {about.headingBottom}
          </h2>

          <p className="about-para1">{about.paragraph1}</p>
          <p className="about-para2">{about.paragraph2}</p>

          {/* Feature Highlights */}
          <ul className="about-features">
            {features.map((f, i) => (
              <li key={i}>✔ {f}</li>
            ))}
          </ul>

{/* Stats Box */}
          <div className="about-stats">
            {stats.map((s, i) => (
              <div className="stat-item" key={i}>
                <h3>{s.value}</h3>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {about.buttonLink && (
            <a href={about.buttonLink} className="about-cta-btn">
              {about.buttonText || "Learn More"}
            </a>
          )}
        </div>

      </div>
    </section>
  );
}

export default About;
