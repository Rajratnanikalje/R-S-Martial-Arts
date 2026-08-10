import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import createUploader from "../config/contentUpload.js";
import {
  getAboutContent,
  updateAboutContent,
} from "../controllers/aboutController.js";

const router = express.Router();
const uploadAbout = createUploader("about", "image", false);

// Public
router.get("/", getAboutContent);

// Admin
router.use(protect, adminOnly);
router.put("/", uploadAbout, updateAboutContent);

export default router;
