import fs from "fs";
import path from "path";
import Trainer from "../models/Trainer.js";

const __dirname = path.resolve();
const TRAINERS_DIR = path.join(__dirname, "uploads", "trainers");

// Ensure trainers folder exists
fs.mkdirSync(TRAINERS_DIR, { recursive: true });

const publicUrl = (filename) => `/uploads/trainers/${filename}`;

// 1. GET all trainers (public + admin)
export const getTrainers = async (_req, res) => {
  try {
    const trainers = await Trainer.find().sort({ order: 1, createdAt: -1 });
    res.json({ trainers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. CREATE a trainer (with optional photo)
export const createTrainer = async (req, res) => {
  try {
    const { name, role, experience } = req.body;

    if (!name || !name.trim()) {
      if (req.file) {
        fs.unlinkSync(path.join(TRAINERS_DIR, req.file.filename));
      }
      return res.status(400).json({ message: "Trainer name is required" });
    }

    const photo = req.file ? req.file.filename : "";
    const order = await Trainer.countDocuments();

    const trainer = await Trainer.create({
      name: name.trim(),
      role: (role || "").trim(),
      experience: (experience || "").trim(),
      photo,
      order,
    });

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: { ...trainer.toObject(), photoUrl: photo ? publicUrl(photo) : "" },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(path.join(TRAINERS_DIR, req.file.filename));
    }
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE a trainer (name/role/experience + optional photo replace)
export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, experience, order } = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      if (req.file) fs.unlinkSync(path.join(TRAINERS_DIR, req.file.filename));
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (name && name.trim()) trainer.name = name.trim();
    if (role !== undefined) trainer.role = role.trim();
    if (experience !== undefined) trainer.experience = experience.trim();
    if (order !== undefined && Number.isFinite(Number(order))) trainer.order = Number(order);

    // If a new photo is uploaded, replace old one
    if (req.file) {
      const oldPhoto = trainer.photo;
      if (oldPhoto) {
        const oldPath = path.join(TRAINERS_DIR, oldPhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      trainer.photo = req.file.filename;
    }

    await trainer.save();

    res.json({
      message: "Trainer updated successfully",
      trainer: { ...trainer.toObject(), photoUrl: trainer.photo ? publicUrl(trainer.photo) : "" },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(path.join(TRAINERS_DIR, req.file.filename));
    res.status(500).json({ message: error.message });
  }
};

// 4. DELETE a trainer (and its photo)
export const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (trainer.photo) {
      const photoPath = path.join(TRAINERS_DIR, trainer.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    await Trainer.findByIdAndDelete(id);
    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
