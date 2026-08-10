import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed categories and their destination folders
export const CATEGORIES = {
  hero: "uploads/hero",
  about: "uploads/about",
  logo: "uploads/logo",
  gallery: "uploads/gallery",
};

// Ensure all category folders exist
Object.values(CATEGORIES).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category || req.body.category || "gallery";
    const dir = CATEGORIES[category] || CATEGORIES.gallery;
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default upload;
