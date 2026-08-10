import mongoose from "mongoose";

const heroContentSchema = new mongoose.Schema(
  {
    // Single embedded doc — only one document in the collection
    images: [{ type: String, trim: true }], // filenames in uploads/hero/
    tag: { type: String, trim: true, default: "RS MARTIAL—ARTS SQUAD & Fitness" },
    title: { type: String, trim: true, default: "Train Your Body.\nMaster Your Mind." },
    subtitle: { type: String, trim: true, default: "Learn martial arts, improve fitness and build confidence with professional trainers." },
    button1Text: { type: String, trim: true, default: "Book Free Trial" },
    button1Link: { type: String, trim: true, default: "#trial" },
button2Text: { type: String, trim: true, default: "View Programs" },
    button2Link: { type: String, trim: true, default: "#programs" },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("HeroContent", heroContentSchema);

