import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const email = "nikaljerajratna1@gmail.com";
    const plainPassword = "admin123";

    // Hash Password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Pehle purana record delete karein to avoid duplication issues
    await User.deleteMany({ email });

    // Naya Admin Create Karein
    const admin = await User.create({
      name: "Raj Admin",
      email: email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ FRESH ADMIN CREATED SUCCESSFULLY!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", plainPassword);
    console.log("🛡️ Role:", admin.role);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

fixAdmin();