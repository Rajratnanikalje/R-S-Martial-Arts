import ActivityLog from "../models/ActivityLog.js";

/**
 * Persist an activity entry for auditing / recent activity / notifications.
 * Fire-and-forget: never blocks the caller on failure.
 */
export const logActivity = async ({ actor = "system", actorRole = "", action, category = "general", detail = "", entity = "" }) => {
  try {
    await ActivityLog.create({
      actor,
      actorRole,
      action,
      category,
      detail,
      entity,
    });
  } catch (err) {
    // Log silently — auditing must never break core flows.
    console.error("[logActivity] Failed to persist activity:", err.message);
  }
};

export default logActivity;
