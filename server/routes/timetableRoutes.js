import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "../controllers/timetableController.js";

const router = express.Router();

// Public
router.get("/", getTimetable);

// Admin
router.use(protect, adminOnly);
router.post("/", createTimetable);
router.put("/:id", updateTimetable);
router.delete("/:id", deleteTimetable);

export default router;
