import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import { logActivity } from "../utils/logActivity.js";

// All registered Mongoose models known to the backup/restore feature.
const MODEL_NAMES = [
  "User",
  "Contact",
  "TrialBooking",
  "Trainer",
  "HeroContent",
  "AboutContent",
  "Program",
  "GallerySection",
  "Timetable",
  "Testimonial",
  "SiteSettings",
  "ActivityLog",
];

/**
 * GET /api/system/activity-logs
 * Returns recent activity logs, optionally filtered by category.
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500))
      .lean();

    const adminId = String(req.user?._id || "");
    const notifications = logs.map((log) => ({
      ...log,
      isRead: (log.readBy || []).some((id) => String(id) === adminId),
    }));

    res.json({ logs: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markActivityRead = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: "Activity not found." });
    res.json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllActivitiesRead = async (req, res) => {
  try {
    await ActivityLog.updateMany(
      { readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Activity not found." });
    res.json({ message: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/system/clear-activity-logs
 * Clears all activity logs (destructive), logs the action after clearing.
 */
export const clearActivityLogs = async (req, res) => {
  try {
    const { count } = await ActivityLog.deleteMany({});
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Activity logs cleared",
      category: "system",
      detail: `${count} log(s) removed`,
    });
    res.json({ message: `Cleared ${count} activity log(s).` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/system/backup
 * Exports the entire database (all collections) as JSON.
 */
export const exportBackup = async (_req, res) => {
  try {
    const backup = {};
    for (const name of MODEL_NAMES) {
      try {
        const Model = mongoose.models[name];
        if (!Model) continue;
        backup[name] = await Model.find({}).lean();
      } catch (err) {
        backup[name] = [];
      }
    }
    res.json({
      app: "martial-academy-cms",
      exportedAt: new Date().toISOString(),
      data: backup,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/system/restore
 * Restores the database from a previously exported backup.
 * Only the collections present in the backup are replaced.
 */
export const importRestore = async (req, res) => {
  try {
    const { data } = req.body || {};
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Invalid backup: missing data object." });
    }

    const restored = [];
    for (const name of MODEL_NAMES) {
      const docs = data[name];
      if (!Array.isArray(docs)) continue;
      const Model = mongoose.models[name];
      if (!Model) continue;

      // Remove legacy _id / __v from incoming docs so Mongo can regenerate.
      const cleanDocs = docs.map(({ _id, __v, ...rest }) => rest);

      try {
        await Model.deleteMany({});
        if (cleanDocs.length > 0) {
          await Model.insertMany(cleanDocs, { ordered: false });
        }
        restored.push(`${name}: ${cleanDocs.length}`);
      } catch (err) {
        restored.push(`${name}: ERROR`);
      }
    }

    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Backup restored",
      category: "system",
      detail: restored.join(", "),
    });

    res.json({ message: "Backup restored successfully.", restored });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

