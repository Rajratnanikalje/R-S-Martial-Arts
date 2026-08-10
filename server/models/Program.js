import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true, default: "🥋" },
    duration: { type: String, trim: true, default: "3 - 6 Months" },
    level: { type: String, trim: true, default: "All Levels" },
    benefits: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },   // filename in uploads/programs/
    order: { type: Number, default: 0 },

    // ❇️ NEW: professional program fields
    fees: { type: String, trim: true, default: "" },
    ageGroup: { type: String, trim: true, default: "" },
    beltLevel: { type: String, trim: true, default: "" },
    trainer: { type: String, trim: true, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Program", programSchema);

