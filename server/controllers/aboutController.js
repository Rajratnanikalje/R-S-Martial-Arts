import AboutContent from "../models/AboutContent.js";
import { deleteUploadedFile } from "../config/contentUpload.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
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

// Supports the JSON FormData payload and legacy records where an array was
// accidentally stored as one or more JSON strings.
const normalizeFeatures = (value) => {
  const features = [];

  const add = (item, splitPlainText = true) => {
    if (Array.isArray(item)) {
      item.forEach((feature) => add(feature, false));
      return;
    }
    if (typeof item !== "string") return;

    const text = item.trim();
    if (!text) return;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        parsed.forEach((feature) => add(feature, false));
        return;
      }
      if (typeof parsed === "string" && parsed !== text) {
        add(parsed, splitPlainText);
        return;
      }
    } catch {
      // Normal feature text is not JSON.
    }

    const values = splitPlainText ? text.split(/[\n,]/) : [text];
    values.forEach((feature) => {
      const cleanFeature = feature.trim();
      if (cleanFeature) features.push(cleanFeature);
    });
  };

  add(value);
  return features;
};

const featuresChanged = (current, normalized) =>
  JSON.stringify(current) !== JSON.stringify(normalized);

// GET about content (public)
export const getAboutContent = async (_req, res) => {
  try {
    let content = await AboutContent.findOne();
    if (!content) {
      content = await AboutContent.create({
        features: DEFAULT_FEATURES,
        stats: DEFAULT_STATS,
      });
    } else {
      const normalizedFeatures = normalizeFeatures(content.features);
      if (featuresChanged(content.features, normalizedFeatures)) {
        content.features = normalizedFeatures;
        await content.save();
      }
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

    // Features are sent as a JSON array in FormData. This also repairs old
    // stringified values, preventing double-stringification on later saves.
    if (req.body.features !== undefined) {
      content.features = normalizeFeatures(req.body.features);
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

    // Explicit image removal clears the existing CMS reference. Static fallback
    // files are intentionally retained; generated CMS uploads are cleaned up.
    const imageRemoved = String(req.body.removeImage) === "true";
    if (imageRemoved) {
      const old = content.image;
      content.image = "";
      if (old) deleteUploadedFile("about", old);
    }

    // Optional photo replace
    if (req.file) {
      const old = content.image;
      const uploadRes = await uploadToCloudinary(req.file.buffer, "about");
      content.image = uploadRes.secure_url;
      if (old) deleteUploadedFile("about", old);
    }

    await content.save();
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: req.file ? "About image updated" : imageRemoved ? "About image removed" : "About content updated",
      category: "cms",
      entity: "AboutContent",
      detail: req.file ? "About image was changed." : imageRemoved ? "About image was removed." : "",
    });
    res.json({ message: "About content updated successfully.", content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
