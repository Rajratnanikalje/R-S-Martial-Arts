import express from "express";
import {
  createTrialBooking,
  getTrialBookings,
  updateTrialStatus,
  deleteTrialBooking,
} from "../controllers/trialController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; 
// Note: Agar aapne authMiddleware ka path alag rakha hai toh use check kar lein

const router = express.Router();

// 1. Public Route: Frontend Form se booking submit karne ke liye
router.post("/", createTrialBooking);

// 2. Admin Routes: Dashboard par trials dekhne, status badalne, aur delete karne ke liye
router.get("/", protect, adminOnly, getTrialBookings);
router.put("/:id", protect, adminOnly, updateTrialStatus);
router.delete("/:id", protect, adminOnly, deleteTrialBooking);

export default router;