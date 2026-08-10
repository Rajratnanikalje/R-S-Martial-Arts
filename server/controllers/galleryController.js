import GallerySection from "../models/GallerySection.js";
import { deleteFiles } from "../config/contentUpload.js";

// GET galleries (public) — one section = one document.
// Sections are only ever created explicitly via the "Add Section" action.
// No auto-seeding of default/placeholder sections.
export const getGalleries = async (_req, res) => {
  try {
    const sections = await GallerySection.find().sort({ order: 1, createdAt: 1 });
    res.json({ sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE gallery section (admin)
export const createGallery = async (req, res) => {
  try {
    const { title, icon, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Section title is required" });
    }
    const count = await GallerySection.countDocuments();
    const files = req.files || [];
    const section = await GallerySection.create({
      title: title.trim(),
      icon: (icon || "📸").trim(),
      description: (description || "").trim(),
      images: files.map((f) => f.filename),
      order: count,
    });
    res.status(201).json({ message: "Gallery section created.", section });
  } catch (error) {
    if (req.files) deleteFiles("gallery", req.files.map((f) => f.filename));
    res.status(500).json({ message: error.message });
  }
};

// UPDATE gallery section (admin)
export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await GallerySection.findById(id);
    if (!section) {
      if (req.files) deleteFiles("gallery", req.files.map((f) => f.filename));
      return res.status(404).json({ message: "Section not found" });
    }

    if (typeof req.body.title === "string") section.title = req.body.title.trim();
    if (typeof req.body.icon === "string") section.icon = req.body.icon.trim();
    if (typeof req.body.description === "string") section.description = req.body.description.trim();
    if (req.body.order !== undefined) section.order = Number(req.body.order);

    // Append new uploaded images
    if (req.files && req.files.length) {
      section.images = [...(section.images || []), ...req.files.map((f) => f.filename)];
    }

    await section.save();
    res.json({ message: "Gallery section updated.", section });
  } catch (error) {
    if (req.files) deleteFiles("gallery", req.files.map((f) => f.filename));
    res.status(500).json({ message: error.message });
  }
};

// DELETE gallery section (admin) + its images
export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await GallerySection.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    if (section.images?.length) deleteFiles("gallery", section.images);
    await GallerySection.findByIdAndDelete(id);
    res.json({ message: "Gallery section deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a single image from a section (admin)
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id, filename } = req.params;
    if (!/^[\w.-]+$/.test(filename)) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    const section = await GallerySection.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.images = (section.images || []).filter((i) => i !== filename);
    await section.save();
    deleteFiles("gallery", [filename]);
    res.json({ message: "Image deleted.", section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
