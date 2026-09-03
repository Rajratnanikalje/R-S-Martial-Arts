import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./Testimonials.css";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const uploadsBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/testimonials");
      const list = Array.isArray(data.testimonials) ? data.testimonials : [];
      const mapped = list.map((item) => ({
        name: item.name || "",
        program: item.program || "Student",
        rating: Number(item.rating) || 5,
        review: item.review || "",
        photo: item.photo ? (item.photo.startsWith("http") ? item.photo : `${uploadsBase}/uploads/testimonials/${item.photo}`) : "",
      }));
      setReviews(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [uploadsBase]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  useEffect(() => {
    const onFocus = () => fetchTestimonials();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchTestimonials]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + Number(curr.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      alert("Please fill in your name and review!");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        program: program.trim() || "Student",
        rating: Number(rating),
        review: reviewText.trim(),
        published: true,
      };

      await api.post("/testimonials/public", payload);
      await fetchTestimonials();

      setName("");
      setProgram("");
      setRating(5);
      setReviewText("");
      setIsModalOpen(false);
      alert("Thank you for your review!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to submit review right now.");
    }
  };

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonial-container">
        <p className="section-tag">Student Reviews</p>
        <h2>What Our Students Say</h2>

        {/* --- Rating Overall Summary & Action Button --- */}
        <div className="rating-summary-box">
          <div className="score-box">
            <span className="avg-score">⭐ {avgRating}</span>
            <span className="total-reviews">({reviews.length} Real Student Reviews)</span>
          </div>
          <button className="btn-add-review" onClick={() => setIsModalOpen(true)}>
            + Write a Review
          </button>
        </div>

        {/* --- Reviews Grid --- */}
        <div className="testimonial-grid-wrapper">
          <div className="testimonial-grid">
            {reviews.map((item, index) => (
              <div className="testimonial-card" key={index}>
                <h3>{item.name}</h3>
                <span>{item.program}</span>

                <p className="review">"{item.review}"</p>

                <div className="stars">
                  {"⭐".repeat(item.rating || 5)}
                </div>

                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="testimonial-photo"
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: "50%", marginTop: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Add Review Modal Popup --- */}
      {isModalOpen && (
        <div className="review-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>

            <h3>Give Your Real Feedback</h3>
            <p className="modal-sub">Share your experience with our academy</p>

            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Program / Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Karate / MMA Student"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Rating (Stars)</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-review">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Testimonials;