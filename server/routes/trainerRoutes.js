import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from "../controllers/trainerController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Trainer photo upload config (trainers folder)
const __dirname = path.resolve();
const TRAINERS_DIR = path.join(__dirname, "uploads", "trainers");
fs.mkdirSync(TRAINERS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TRAINERS_DIR),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GET all trainers (public - used by the website)
router.get("/", getTrainers);

// All mutating routes are admin-protected
router.use(protect, adminOnly);

// CREATE trainer with optional photo
router.post("/", upload.single("photo"), createTrainer);

// UPDATE trainer (name/role/experience + optional photo)
router.put("/:id", upload.single("photo"), updateTrainer);

// DELETE trainer
router.delete("/:id", deleteTrainer);

export default router;
