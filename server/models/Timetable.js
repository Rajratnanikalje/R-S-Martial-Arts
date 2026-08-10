import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    day: { type: String, trim: true, required: true },
    morningTime: { type: String, trim: true, default: "06:00 AM - 08:00 AM" },
    morningClass: { type: String, trim: true, default: "Training" },
    eveningTime: { type: String, trim: true, default: "05:00 PM - 07:00 PM" },
    eveningClass: { type: String, trim: true, default: "Training" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);

