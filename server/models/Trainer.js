import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    photo: { type: String, trim: true, default: "" }, // filename in uploads/trainers
  },
  { timestamps: true }
);

export default mongoose.model("Trainer", trainerSchema);
