import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    academyName: { type: String, trim: true, default: "Rajratna Martial Arts & Fitness Academy" },
    logo: { type: String, trim: true, default: "" },
    contactHeading: { type: String, trim: true, default: "Start Your Martial Arts Journey Today" },
    contactDescription: { type: String, trim: true, default: "Join Rajratna Martial Arts & Fitness Academy." },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    mapEmbedUrl: { type: String, trim: true, default: "" },

    // ❇️ NEW social + footer settings
    facebook: { type: String, trim: true, default: "https://facebook.com" },
    instagram: { type: String, trim: true, default: "https://instagram.com" },
    youtube: { type: String, trim: true, default: "https://youtube.com" },
footerText: { type: String, trim: true, default: "Empowering individuals through traditional and modern martial arts. Build discipline, strength, confidence, and self-defense skills with master trainers." },
    copyrightText: { type: String, trim: true, default: "RS MARTIAL ARTS SQUAD. All Rights Reserved." },

    // ❇️ NEW: Website identity + SEO + theme
    websiteTitle: { type: String, trim: true, default: "RS Martial Arts Squad & Fitness" },
    favicon: { type: String, trim: true, default: "" },
    adminLogo: { type: String, trim: true, default: "" },
    themePrimary: { type: String, trim: true, default: "#e63946" },
    themeSecondary: { type: String, trim: true, default: "#ff5b6e" },
    seoTitle: { type: String, trim: true, default: "RS Martial Arts Squad & Fitness – Karate, MMA, Kickboxing" },
    seoDescription: { type: String, trim: true, default: "Join RS Martial Arts & Fitness Academy. Learn Karate, MMA, Kickboxing, Self Defense and more with professional trainers." },
    seoKeywords: { type: String, trim: true, default: "martial arts, karate, mma, kickboxing, self defense, fitness" },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);

