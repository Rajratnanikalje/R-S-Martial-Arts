import fs from "fs";
import path from "path";
import { CATEGORIES } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const __dirname = path.resolve();

// Helper to normalize category
const resolveCategory = (category) => {
  return CATEGORIES[category] || CATEGORIES.gallery;
};

// Helper to build public URL for legacy files
const publicUrl = (category, filename) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `/uploads/${category}/${filename}`;
};

// 1. GET all images grouped by category (reads legacy local folder)
export const getImages = async (req, res) => {
  try {
    const result = {};

    for (const [category, dir] of Object.entries(CATEGORIES)) {
      let files = [];
      try {
        files = fs
          .readdirSync(dir)
          .filter((f) => /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(f));
      } catch (err) {
        fs.mkdirSync(dir, { recursive: true });
        files = [];
      }

      result[category] = files.map((file) => ({
        name: file,
        url: publicUrl(category, file),
        path: path.join(dir, file),
      }));
    }

    res.json({ images: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. UPLOAD images to a category (single or multiple) via Cloudinary
export const uploadImages = async (req, res) => {
  try {
    const category = req.params.category || req.body.category || "gallery";
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, category)
    );
    const uploadResults = await Promise.all(uploadPromises);

    const uploaded = uploadResults.map((result) => ({
      name: result.secure_url,
      url: result.secure_url,
      public_id: result.public_id,
    }));

    res.status(201).json({ message: "Images uploaded", images: uploaded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. DELETE an image from a category
export const deleteImage = async (req, res) => {
  try {
    const { category, filename } = req.params;
    const decoded = decodeURIComponent(filename);

    if (!decoded.startsWith("http")) {
      const dir = resolveCategory(category);
      const filePath = path.join(dir, decoded);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Image deleted", filename: decoded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. RENAME an image in a category (legacy local support)
export const renameImage = async (req, res) => {
  try {
    const { category, filename } = req.params;
    const { newName } = req.body;
    const dir = resolveCategory(category);

    if (!newName || !/^[\w.-]+$/.test(newName)) {
      return res.status(400).json({ message: "Invalid new name" });
    }

    const oldPath = path.join(dir, filename);
    const newPath = path.join(dir, newName);

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (fs.existsSync(newPath)) {
      return res.status(400).json({ message: "A file with that name already exists" });
    }

    fs.renameSync(oldPath, newPath);

    res.json({
      message: "Image renamed",
      image: { name: newName, url: publicUrl(category, newName) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
