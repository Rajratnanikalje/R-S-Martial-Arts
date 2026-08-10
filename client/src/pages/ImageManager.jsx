import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ImageManager.css";

// Categories available for image management
const CATEGORIES = [
  { key: "hero", label: "Hero", icon: "🖼️", usage: "Homepage hero banner" },
  { key: "about", label: "About", icon: "📖", usage: "About section image" },
  { key: "logo", label: "Logo", icon: "✨", usage: "Navbar & Footer logo" },
  { key: "gallery", label: "Gallery", icon: "🎞️", usage: "Gallery training photos" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

function ImageManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [activeCategory, setActiveCategory] = useState("hero");
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Rename state
  const [renaming, setRenaming] = useState(null); // {oldName}
  const [renameValue, setRenameValue] = useState("");

  // Lightbox preview
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchImages();
  }, [token, navigate]);

  const fetchImages = async () => {
    try {
      const { data } = await api.get("/images", authHeaders);
      setImages(data.images || {});
    } catch (error) {
      console.error("Failed to load images:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
      setMessage({ type: "error", text: "Failed to load images." });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleFilesSelected = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      showMessage("error", "Please select at least one image.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      await api.post(`/images/${activeCategory}`, formData, {
        ...authHeaders,
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });
      showMessage("success", "Images uploaded successfully!");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete image "${filename}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/images/${activeCategory}/${filename}`, authHeaders);
      showMessage("success", "Image deleted.");
      fetchImages();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Delete failed.");
    }
  };

  const startRename = (filename) => {
    setRenaming(filename);
    setRenameValue(filename);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renaming || !renameValue.trim()) return;
    try {
      await api.put(
        `/images/${activeCategory}/${encodeURIComponent(renaming)}`,
        { newName: renameValue.trim() },
        authHeaders
      );
      showMessage("success", "Image renamed.");
      setRenaming(null);
      setRenameValue("");
      fetchImages();
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Rename failed.");
    }
  };

  const copyUrl = (url) => {
    const fullUrl = `${UPLOADS_BASE}${url}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => showMessage("success", "Image URL copied to clipboard!"))
      .catch(() => showMessage("error", "Could not copy URL."));
  };

  const currentImages = images[activeCategory] || [];

  return (
<div className="image-manager">
      {message.text && (
        <div className={`img-alert-box ${message.type}`}>{message.text}</div>
      )}

      {/* Upload Section */}
      <div className="img-upload-card">
        <h3>⬆️ Upload Images to {CATEGORIES.find((c) => c.key === activeCategory)?.label}</h3>
        <p>Select one or more images (JPG, PNG, GIF, WEBP, SVG — max 10MB each).</p>
        <form onSubmit={handleUpload} className="img-upload-form">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="img-file-input"
          />
          <button type="submit" className="img-upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "🚀 Upload Images"}
          </button>
        </form>
        {selectedFiles.length > 0 && (
          <p className="img-selected-count">📎 {selectedFiles.length} file(s) selected.</p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="img-category-tabs">
        {CATEGORIES.map((cat) => {
          const count = (images[cat.key] || []).length;
          return (
            <button
              key={cat.key}
              className={`img-cat-tab ${activeCategory === cat.key ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span>{cat.icon}</span> {cat.label}
              <span className="img-cat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Category Info */}
      <div className="img-category-info">
        <strong>{CATEGORIES.find((c) => c.key === activeCategory)?.label}:</strong>{" "}
        {CATEGORIES.find((c) => c.key === activeCategory)?.usage} —{" "}
        {currentImages.length} image(s)
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="img-loading">Loading images...</div>
      ) : currentImages.length === 0 ? (
        <div className="img-empty">
          <p>No images in this category yet.</p>
          <p>Upload some images above to get started.</p>
        </div>
      ) : (
        <div className="img-grid">
          {currentImages.map((img) => (
            <div className="img-card" key={img.name}>
              <div className="img-thumb" onClick={() => setPreview(img)}>
                <img src={`${UPLOADS_BASE}${img.url}`} alt={img.name} />
              </div>

              <div className="img-card-body">
                <div className="img-name" title={img.name}>
                  {renaming === img.name ? (
                    <form onSubmit={handleRenameSubmit} className="img-rename-form">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                      />
                      <button type="submit">✓</button>
                      <button type="button" onClick={() => setRenaming(null)}>✕</button>
                    </form>
                  ) : (
                    <span>{img.name}</span>
                  )}
                </div>

                <div className="img-actions">
                  <button className="img-btn view" onClick={() => setPreview(img)} title="Preview">
                    👁️
                  </button>
                  <button className="img-btn copy" onClick={() => copyUrl(img.url)} title="Copy URL">
                    🔗
                  </button>
                  <button className="img-btn edit" onClick={() => startRename(img.name)} title="Rename">
                    ✏️
                  </button>
                  <button className="img-btn del" onClick={() => handleDelete(img.name)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview */}
      {preview && (
        <div className="img-lightbox" onClick={() => setPreview(null)}>
          <div className="img-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="img-lightbox-close" onClick={() => setPreview(null)}>✕</button>
            <img src={`${UPLOADS_BASE}${preview.url}`} alt={preview.name} />
            <p>{preview.name}</p>
            <button className="img-lightbox-copy" onClick={() => copyUrl(preview.url)}>
              🔗 Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageManager;
