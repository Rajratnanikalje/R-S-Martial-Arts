import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import createUploader from "../config/contentUpload.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();
const uploadPhoto = createUploader("testimonials", "photo", false);

// Public
router.get("/", getTestimonials);
router.post("/public", createTestimonial);

// Admin
router.use(protect, adminOnly);
router.post("/", uploadPhoto, createTestimonial);
router.put("/:id", uploadPhoto, updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
