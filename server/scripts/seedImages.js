import fs from "fs";
import path from "path";
import { CATEGORIES } from "../config/multer.js";

const __dirname = path.resolve();
const clientAssets = path.join(__dirname, "..", "client", "src", "assets", "images");

// Map source folders to category destinations
const copyMap = [
  { src: path.join(clientAssets, "hero"), category: "hero" },
  { src: path.join(clientAssets, "About"), category: "about" },
  { src: path.join(clientAssets, "logo"), category: "logo" },
  { src: path.join(clientAssets, "gallery", "karateTraining"), category: "gallery" },
];

const required = ["hero", "about", "logo", "gallery"];

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

function seed() {
  let copied = 0;

  for (const item of copyMap) {
    const destDir = path.resolve(__dirname, CATEGORIES[item.category]);

    if (!fs.existsSync(item.src)) {
      console.log(`⚠️  Source folder not found: ${item.src}`);
      continue;
    }

    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(item.src).filter((f) =>
      /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(f)
    );

    for (const file of files) {
      const srcFile = path.join(item.src, file);
      const destFile = path.join(destDir, file);
      if (!fs.existsSync(destFile)) {
        copyFile(srcFile, destFile);
        copied++;
        console.log(`✅ Copied: ${item.category}/${file}`);
      }
    }
  }

  console.log(`\n🎉 Done! ${copied} image(s) copied to uploads.`);
}

seed();
