import multer from "multer";
import path from "path";
import fs from "fs";

// Upload directories for content managers (used for legacy local files)
export const DIRS = {
  hero: "uploads/hero",
  about: "uploads/about",
  logo: "uploads/logo",
  programs: "uploads/programs",
  gallery: "uploads/gallery",
  trainers: "uploads/trainers",
  testimonials: "uploads/testimonials",
};

// Ensure directories exist for legacy compatibility
Object.values(DIRS).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// Factory: creates a memory-based multer middleware for direct streaming
export const createUploader = (_dirKey, field = "image", multiple = false) => {
  const storage = multer.memoryStorage();

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

// Delete a file from a directory safely (skips remote URLs)
export const deleteFile = (dirKey, filename) => {
  if (!filename || filename.startsWith("http")) return;
  const dest = DIRS[dirKey] || DIRS.gallery;
  const p = path.join(dest, filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
};

// Delete files from a directory (array)
export const deleteFiles = (dirKey, filenames = []) => {
  filenames.forEach((f) => deleteFile(dirKey, f));
};

// CMS uploads are generated with a millisecond timestamp. Keep seeded/static
// fallback assets intact even when an old CMS reference is replaced or cleared.
export const deleteUploadedFile = (dirKey, filename) => {
  if (!filename || filename.startsWith("http")) return;
  if (/^\d{10,}-?\.[a-z0-9]+$/i.test(filename || "")) {
    deleteFile(dirKey, filename);
  }
};

export const deleteUploadedFiles = (dirKey, filenames = []) => {
  filenames.forEach((filename) => deleteUploadedFile(dirKey, filename));
};

export default createUploader;
