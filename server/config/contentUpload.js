import multer from "multer";
import path from "path";
import fs from "fs";

// Upload directories for content managers
export const DIRS = {
  hero: "uploads/hero",
  about: "uploads/about",
  programs: "uploads/programs",
  gallery: "uploads/gallery",
  trainers: "uploads/trainers",
  testimonials: "uploads/testimonials",
};

// Ensure directories exist
Object.values(DIRS).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// Factory: creates a multer middleware for a given directory
export const createUploader = (dirKey, field = "image", multiple = false) => {
  const dest = DIRS[dirKey] || DIRS.gallery;

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => cb(null, Date.now() + "-" + path.extname(file.originalname)),
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp|svg/;
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      if (allowed.test(ext)) cb(null, true);
      else cb(new Error("Only image files are allowed"));
    },
  });

  if (multiple) return upload.array(field, 20);
  return upload.single(field);
};

// Delete a file from a directory safely
export const deleteFile = (dirKey, filename) => {
  if (!filename) return;
  const dest = DIRS[dirKey] || DIRS.gallery;
  const p = path.join(dest, filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
};

// Delete files from a directory (array)
export const deleteFiles = (dirKey, filenames = []) => {
  filenames.forEach((f) => deleteFile(dirKey, f));
};

export default createUploader;

