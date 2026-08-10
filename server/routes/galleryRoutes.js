import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import createUploader from "../config/contentUpload.js";
import {
  getGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  deleteGalleryImage,
} from "../controllers/galleryController.js";

const router = express.Router();
const uploadGallery = createUploader("gallery", "images", true);

// Public
router.get("/", getGalleries);

// Admin
router.use(protect, adminOnly);
router.post("/", uploadGallery, createGallery);
router.put("/:id", uploadGallery, updateGallery);
router.delete("/:id", deleteGallery);
router.delete("/:id/image/:filename", deleteGalleryImage);

export default router;
