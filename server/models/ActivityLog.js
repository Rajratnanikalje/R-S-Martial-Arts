import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: String, trim: true, default: "system" },
    actorRole: { type: String, trim: true, default: "" },
    action: { type: String, trim: true, required: true },
    category: { type: String, trim: true, default: "general" },
    detail: { type: String, trim: true, default: "" },
    entity: { type: String, trim: true, default: "" },
    // Notification read state is per administrator and reuses the existing
    // activity collection instead of creating a parallel notification store.
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Index for fast listing by recency
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
