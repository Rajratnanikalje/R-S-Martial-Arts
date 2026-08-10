import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getDashboardOverview } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/admin-dashboard/overview
router.get("/overview", protect, adminOnly, getDashboardOverview);

export default router;
