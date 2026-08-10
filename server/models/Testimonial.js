import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    program: { type: String, trim: true, default: "Student" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    review: { type: String, trim: true, default: "" },

    // ❇️ NEW: photo, publish + display order
    photo: { type: String, trim: true, default: "" }, // filename in uploads/testimonials/
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);

