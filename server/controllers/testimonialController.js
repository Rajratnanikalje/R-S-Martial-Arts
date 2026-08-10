import Testimonial from "../models/Testimonial.js";
import { deleteFiles } from "../config/contentUpload.js";
import { logActivity } from "../utils/logActivity.js";

export const DEFAULT_TESTIMONIALS = [
  { name: "Amit Sharma", program: "Karate Student", rating: 5, review: "The training environment is excellent. I improved my fitness, confidence and discipline." },
  { name: "Priya Patil", program: "Self Defense Training", rating: 5, review: "The trainers are very supportive and teach practical self-defense techniques." },
  { name: "Rahul More", program: "Kickboxing Student", rating: 4, review: "Amazing experience. Professional coaches and great workout sessions." },
];

// GET testimonials (public returns only published; admin passes ?all=true)
export const getTestimonials = async (req, res) => {
  try {
    const all = req.query.all === "true";
    const reviews = all
      ? await Testimonial.find().sort({ order: 1, createdAt: 1 })
      : await Testimonial.find({ published: true }).sort({ order: 1, createdAt: 1 });
    res.json({ testimonials: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE testimonial (admin)
export const createTestimonial = async (req, res) => {
  try {
    const { name, program, rating, review, photo, published, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    // If a photo file was uploaded via multer, use its stored filename
    const photoFilename = req.file ? req.file.filename : (photo || "").trim();
    const count = await Testimonial.countDocuments();
    const testimonial = await Testimonial.create({
      name: name.trim(),
      program: (program || "Student").trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      review: (review || "").trim(),
      photo: photoFilename,
      published: published !== undefined ? String(published) === "true" : true,
      order: order !== undefined ? Number(order) : count,
    });
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Testimonial created",
      category: "cms",
      entity: `Testimonial: ${testimonial.name}`,
    });
    res.status(201).json({ message: "Testimonial created.", testimonial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE testimonial (admin)
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    if (typeof req.body.name === "string") testimonial.name = req.body.name.trim();
    if (typeof req.body.program === "string") testimonial.program = req.body.program.trim();
    if (typeof req.body.review === "string") testimonial.review = req.body.review.trim();
    if (req.body.rating !== undefined) testimonial.rating = Math.min(5, Math.max(1, Number(req.body.rating) || 5));
if (typeof req.body.photo === "string") testimonial.photo = req.body.photo.trim();
    // If a new photo file was uploaded via multer, replace the old one
    if (req.file) {
      const oldPhoto = testimonial.photo;
      testimonial.photo = req.file.filename;
      if (oldPhoto) deleteFiles("testimonials", [oldPhoto]);
    }
    if (req.body.published !== undefined) testimonial.published = String(req.body.published) === "true";
    if (req.body.order !== undefined) testimonial.order = Number(req.body.order);

    await testimonial.save();
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Testimonial updated",
      category: "cms",
      entity: `Testimonial: ${testimonial.name}`,
    });
    res.json({ message: "Testimonial updated.", testimonial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE testimonial (admin)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    if (testimonial.photo) deleteFiles("testimonials", [testimonial.photo]);
    await Testimonial.findByIdAndDelete(id);
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Testimonial deleted",
      category: "cms",
      entity: `Testimonial: ${testimonial.name}`,
    });
    res.json({ message: "Testimonial deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
