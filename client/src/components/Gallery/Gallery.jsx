import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Gallery.css";

const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch gallery sections from the CMS (single source of truth = MongoDB).
  // The admin Gallery Manager and the frontend Gallery always read the same
  // /galleries data, so uploads/deletes sync instantly on both sides.
  useEffect(() => {
    api.get("/galleries")
      .then(({ data }) => {
        const sections = Array.isArray(data.sections) ? data.sections : [];
        setCategories(
          sections.map((s) => ({
            title: s.title || "Gallery",
            icon: s.icon || "📸",
            description: s.description || "",
            photos: (s.images || []).map((img, i) => ({
              src: /^https?:\/\//.test(img)
                ? img
                : `${UPLOADS_BASE}/uploads/gallery/${img}`,
              caption: `${s.title || "Gallery"} ${i + 1}`,
            })),
          }))
        );
      })
      .catch(() => setCategories([]));
  }, []);

  const handleOpenModal = (category) => {
    if (category.photos.length === 0) return; // Khali category par modal na khule
    setSelectedCategory(category);
    setActivePhotoIndex(0);
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % selectedCategory.photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + selectedCategory.photos.length) % selectedCategory.photos.length);
  };

  return (
    <section className="gallery" id="gallery">
      <div className="gallery-container">
        <p className="section-tag">Our Gallery</p>
        <h2>Training Moments</h2>

        <div className="gallery-grid">
          {categories.map((item, index) => (
            <div
              className="gallery-card"
              key={index}
              onClick={() => handleOpenModal(item)}
            >
              {/* Image ya Emoji render logic */}
              <div className="gallery-image">
                {item.photos.length > 0 ? (
                  <img src={item.photos[0].src} alt={item.title} className="card-img" />
                ) : (
                  <span className="card-icon">{item.icon}</span>
                )}
              </div>

              <div className="gallery-overlay">
                <h3>{item.title}</h3>
                <span className="photo-count">{item.photos.length} Photos ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedCategory && (
        <div className="gallery-modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>

            <button className="close-btn" onClick={() => setSelectedCategory(null)}>✕</button>

            <div className="modal-header-info">
              <h3>{selectedCategory.title}</h3>
              <p>Photo {activePhotoIndex + 1} of {selectedCategory.photos.length}</p>
            </div>

            <div className="main-photo-view">
              {selectedCategory.photos.length > 1 && (
                <button className="nav-btn prev" onClick={handlePrevPhoto}>❮</button>
              )}

              <img
                src={selectedCategory.photos[activePhotoIndex].src}
                alt={selectedCategory.photos[activePhotoIndex].caption}
              />

              {selectedCategory.photos.length > 1 && (
                <button className="nav-btn next" onClick={handleNextPhoto}>❯</button>
              )}
            </div>

            <p className="photo-caption">
              {selectedCategory.photos[activePhotoIndex].caption}
            </p>

            <div className="thumbnails-wrapper">
              {selectedCategory.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo.src}
                  alt="thumb"
                  className={`thumb-img ${i === activePhotoIndex ? "active" : ""}`}
                  onClick={() => setActivePhotoIndex(i)}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
