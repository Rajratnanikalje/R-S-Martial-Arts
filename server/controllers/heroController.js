import HeroContent from "../models/HeroContent.js";
import { deleteUploadedFiles } from "../config/contentUpload.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { logActivity } from "../utils/logActivity.js";

// GET hero content (public)
export const getHeroContent = async (_req, res) => {
  try {
    let content = await HeroContent.findOne();
    if (!content) {
      content = await HeroContent.create({});
    }
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE hero content (admin) — text fields
export const updateHeroContent = async (req, res) => {
  try {
    let content = await HeroContent.findOne();
    if (!content) content = new HeroContent();

    const fields = [
      "tag",
      "title",
      "subtitle",
      "button1Text",
      "button1Link",
      "button2Text",
      "button2Link",
    ];
    fields.forEach((f) => {
      if (typeof req.body[f] === "string") content[f] = req.body[f].trim();
    });

    // Enable/disable hero (boolean)
    if (req.body.enabled !== undefined) content.enabled = String(req.body.enabled) === "true";

    await content.save();
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Hero content updated",
      category: "cms",
      entity: "HeroContent",
    });
    res.json({ message: "Hero content updated successfully.", content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD images to hero (admin)
export const uploadHeroImages = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    let content = await HeroContent.findOne();
    if (!content) content = new HeroContent();

    const oldImages = content.images || [];
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, "hero"))
    );
    const urls = uploadResults.map((r) => r.secure_url);

    // The public Hero has one active image. Replacing it saves the Cloudinary URL
    // and cleans up previous legacy local uploads.
    content.images = urls;
    await content.save();
    deleteUploadedFiles("hero", oldImages);
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Hero image updated",
      category: "cms",
      entity: "HeroContent",
      detail: "Hero image was changed.",
    });

    res.status(201).json({ message: "Hero images uploaded.", content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a hero image (admin)
export const deleteHeroImage = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const decoded = decodeURIComponent(filename);
    let content = await HeroContent.findOne();
    if (!content) return res.status(404).json({ message: "No hero content" });

    content.images = (content.images || []).filter((i) => i !== filename && i !== decoded);
    await content.save();

    deleteUploadedFiles("hero", [decoded]);
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Hero image removed",
      category: "cms",
      entity: "HeroContent",
      detail: "Hero image was removed.",
    });
    res.json({ message: "Hero image deleted.", content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
