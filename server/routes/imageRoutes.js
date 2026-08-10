import express from "express";
import upload from "../config/multer.js";
import {
  getImages,
  uploadImages,
  deleteImage,
  renameImage,
} from "../controllers/imageController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all images grouped by category (public - used by the website gallery,
// and also by the admin Image Manager for viewing)
router.get("/", getImages);

// All mutating routes are admin-protected
router.use(protect, adminOnly);

// UPLOAD single or multiple images to a category
router.post("/:category", upload.array("images", 20), uploadImages);

// RENAME an image in a category
router.put("/:category/:filename", renameImage);

// DELETE an image from a category
router.delete("/:category/:filename", deleteImage);

export default router;
