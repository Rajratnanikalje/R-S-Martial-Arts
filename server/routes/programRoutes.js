import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import createUploader from "../config/contentUpload.js";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";

const router = express.Router();
const uploadProgram = createUploader("programs", "image", false);

// Public
router.get("/", getPrograms);

// Admin
router.use(protect, adminOnly);
router.post("/", uploadProgram, createProgram);
router.put("/:id", uploadProgram, updateProgram);
router.delete("/:id", deleteProgram);

export default router;
