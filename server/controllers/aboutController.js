import AboutContent from "../models/AboutContent.js";
import { deleteFile } from "../config/contentUpload.js";
import { logActivity } from "../utils/logActivity.js";

const DEFAULT_FEATURES = [
  "Certified & Experienced Master Trainers",
  "Specialized Programs for Kids, Adults & Pros",
  "Flexible Morning & Evening Batches",
];
const DEFAULT_STATS = [
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Students Trained" },
  { value: "13+", label: "Programs Offered" },
];

// GET about content (public)
export const getAboutContent = async (_req, res) => {
  try {
    let content = await AboutContent.findOne();
    if (!content) {
      content = await AboutContent.create({
        features: DEFAULT_FEATURES,
        stats: DEFAULT_STATS,
      });
    }
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE about content (admin) — includes image replace
export const updateAboutContent = async (req, res) => {
  try {
    let content = await AboutContent.findOne();
    if (!content) content = new AboutContent();

const textFields = [
      "headingTop",
      "headingBottom",
      "paragraph1",
      "paragraph2",
      "badgeValue",
      "badgeLabel",
      "buttonText",
      "buttonLink",
    ];
    textFields.forEach((f) => {
      if (typeof req.body[f] === "string") content[f] = req.body[f].trim();
    });

    // features: comma/newline separated string OR array
    if (typeof req.body.features === "string") {
      content.features = req.body.features
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // stats: JSON string OR array
    if (typeof req.body.stats === "string") {
      try {
        const parsed = JSON.parse(req.body.stats);
        if (Array.isArray(parsed)) content.stats = parsed;
      } catch {
        /* ignore invalid JSON */
      }
    }

    // Optional photo replace
    if (req.file) {
      const old = content.image;
      content.image = req.file.filename;
      if (old) deleteFile("about", old);
    }

await content.save();
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "About content updated",
      category: "cms",
      entity: "AboutContent",
    });
    res.json({ message: "About content updated successfully.", content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
