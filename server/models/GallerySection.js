import mongoose from "mongoose";

const gallerySectionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    icon: { type: String, trim: true, default: "📸" },
    description: { type: String, trim: true, default: "" },
    images: [{ type: String, trim: true }],   // filenames in uploads/gallery/
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("GallerySection", gallerySectionSchema);

