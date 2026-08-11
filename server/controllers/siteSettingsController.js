import SiteSettings from "../models/SiteSettings.js";
import { deleteUploadedFile } from "../config/contentUpload.js";
import { logActivity } from "../utils/logActivity.js";

const editableFields = [
  "academyName",
  "logo",
  "contactHeading",
  "contactDescription",
  "phone",
  "email",
  "address",
  "whatsapp",
  "mapEmbedUrl",
  "facebook",
  "instagram",
  "youtube",
  "footerText",
  "copyrightText",
  // ❇️ NEW: website identity + SEO + theme
  "websiteTitle",
  "favicon",
  "adminLogo",
  "themePrimary",
  "themeSecondary",
  "seoTitle",
  "seoDescription",
  "seoKeywords",
];

export const getSiteSettings = async (_req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json({ settings });
  } catch {
    res.status(500).json({ message: "Unable to load site settings." });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const updates = {};
    for (const field of editableFields) {
      if (typeof req.body[field] === "string") updates[field] = req.body[field].trim();
    }
    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) {
      return res.status(400).json({ message: "Please enter a valid contact email." });
    }
    if (updates.mapEmbedUrl && !/^https:\/\//i.test(updates.mapEmbedUrl)) {
      return res.status(400).json({ message: "Map URL must start with https://" });
    }
    const current = await SiteSettings.findOne();
    const previousLogo = current?.logo || "";
    const settings = await SiteSettings.findOneAndUpdate({}, updates, { new: true, upsert: true, setDefaultsOnInsert: true });
    if (Object.hasOwn(updates, "logo") && previousLogo && previousLogo !== settings.logo) {
      deleteUploadedFile("logo", previousLogo);
    }
    const logoChanged = Object.hasOwn(updates, "logo") && previousLogo !== settings.logo;
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: logoChanged ? (settings.logo ? "Logo updated" : "Logo removed") : "Website settings updated",
      category: logoChanged ? "cms" : "settings",
      entity: "SiteSettings",
      detail: logoChanged ? (settings.logo ? "Logo was changed." : "Logo was removed.") : "",
    });
    res.json({ message: "Website settings updated successfully.", settings });
  } catch {
    res.status(500).json({ message: "Unable to update site settings." });
  }
};
