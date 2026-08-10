import mongoose from "mongoose";

const aboutContentSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, default: "" },   // filename in uploads/about/
    headingTop: { type: String, trim: true, default: "About Our Academy" },
    headingBottom: { type: String, trim: true, default: "More Than Martial Arts,\nIt's A Way Of Life" },
    paragraph1: { type: String, trim: true, default: "RS MARTIAL ARTS SQUAD is dedicated to developing physical strength, discipline, and confidence through professional martial arts training." },
    paragraph2: { type: String, trim: true, default: "Our experienced trainers help students improve fitness, self-defense skills, and mental focus in a positive, high-energy learning environment." },
    features: [{ type: String, trim: true }],
    badgeValue: { type: String, trim: true, default: "10+" },
    badgeLabel: { type: String, trim: true, default: "Years of Excellence" },
    stats: [
      {
        value: { type: String, trim: true, default: "10+" },
        label: { type: String, trim: true, default: "Years Experience" },
      },
    ],

    // ❇️ NEW: CTA button
    buttonText: { type: String, trim: true, default: "Learn More" },
    buttonLink: { type: String, trim: true, default: "#programs" },
  },
  { timestamps: true }
);

export default mongoose.model("AboutContent", aboutContentSchema);

