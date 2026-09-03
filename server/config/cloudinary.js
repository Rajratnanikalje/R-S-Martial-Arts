import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Uploads a file buffer directly to Cloudinary using a stream.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Subfolder name under 'r-s-martial-arts' (e.g. 'hero', 'about', 'logo', 'programs', 'gallery', 'trainers', 'testimonials')
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, folder = "general") => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary configuration missing. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables are set."
        )
      );
    }

    if (!buffer) {
      return reject(new Error("No file buffer provided for upload."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `r-s-martial-arts/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
