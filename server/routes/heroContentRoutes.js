import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import createUploader from "../config/contentUpload.js";
import {
  getHeroContent,
  updateHeroContent,
  uploadHeroImages,
  deleteHeroImage,
} from "../controllers/heroController.js";

const router = express.Router();
const uploadHero = createUploader("hero", "images", true);

// Public
router.get("/", getHeroContent);

// Admin mutations
router.use(protect, adminOnly);

router.put("/", updateHeroContent);
router.post("/images", uploadHero, uploadHeroImages);
router.delete("/images/:filename", deleteHeroImage);

export default router;
