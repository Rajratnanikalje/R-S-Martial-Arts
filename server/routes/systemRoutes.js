import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getActivityLogs,
  markActivityRead,
  markAllActivitiesRead,
  deleteActivityLog,
  clearActivityLogs,
  exportBackup,
  importRestore,
} from "../controllers/systemController.js";

const router = express.Router();

// Activity Logs
router.get("/activity-logs", protect, adminOnly, getActivityLogs);
router.put("/activity-logs/read-all", protect, adminOnly, markAllActivitiesRead);
router.put("/activity-logs/:id/read", protect, adminOnly, markActivityRead);
router.delete("/activity-logs/:id", protect, adminOnly, deleteActivityLog);
router.delete("/clear-activity-logs", protect, adminOnly, clearActivityLogs);

// Backup & Restore
router.get("/backup", protect, adminOnly, exportBackup);
router.post("/restore", protect, adminOnly, importRestore);

export default router;
