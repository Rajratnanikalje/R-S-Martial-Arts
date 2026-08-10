import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trialRoutes from "./routes/trialRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";

// 🆕 CMS routes
import heroContentRoutes from "./routes/heroContentRoutes.js";
import aboutContentRoutes from "./routes/aboutContentRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import { getSiteSettings } from "./controllers/siteSettingsController.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// MongoDB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Static Upload Folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trials", trialRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/trainers", trainerRoutes);

// 🆕 CMS routes
app.use("/api/hero-content", heroContentRoutes);
app.use("/api/about-content", aboutContentRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/testimonials", testimonialRoutes);

app.get("/api/site-settings", getSiteSettings);

// 🆕 Dashboard + System routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system", systemRoutes);

// Test API
app.get("/", (req, res) => {
  res.send("Martial Academy API Running");
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
