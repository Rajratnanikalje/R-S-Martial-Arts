import Program from "../models/Program.js";
import { deleteFile } from "../config/contentUpload.js";
import { logActivity } from "../utils/logActivity.js";

// Default programs used only if DB is empty
export const DEFAULT_PROGRAMS = [
  { title: "Traditional Self Defence", desc: "Learn practical traditional techniques for real-life protection and safety.", icon: "🛡️", duration: "3 - 6 Months", level: "Beginner to Advanced", benefits: "Street safety, quick reflexes, threat neutralization & confidence booster." },
  { title: "Karate (Kumite + Kata)", desc: "Master forms (Kata) and sparring combat techniques (Kumite) in traditional Karate.", icon: "🥋", duration: "6 - 12 Months", level: "All Levels", benefits: "Belt ranking, mental focus, precision striking & self-discipline." },
  { title: "Taekwondo", desc: "Develop high-speed kicking, agility, flexibility, and Olympic-style combat skills.", icon: "🥋", duration: "6 - 12 Months", level: "All Levels", benefits: "High kicks, fast footwork, core balance & explosive agility." },
  { title: "Boxing", desc: "Enhance footwork, head movement, stamina, and powerful striking combinations.", icon: "🥊", duration: "3 - 6 Months", level: "Beginner to Pro", benefits: "Heavy stamina, punch power, head movement & cardiovascular health." },
  { title: "Mixed Martial Arts (MMA)", desc: "Combine striking, grappling, and submission wrestling for total combat mastery.", icon: "🤼", duration: "6 - 12 Months", level: "Intermediate to Advanced", benefits: "Full body strength, submission locks, takedowns & cage combat readiness." },
  { title: "Lathi Kathi", desc: "Traditional Indian stick fighting art focusing on balance, coordination, and defense.", icon: "🥢", duration: "3 - 6 Months", level: "All Levels", benefits: "Traditional weapon control, wrist flexibility & cultural martial heritage." },
  { title: "Nunchaku (Nunchuck)", desc: "Master weapon control, hand-eye coordination, speed, and wrist reflexes.", icon: "⚔️", duration: "2 - 4 Months", level: "Intermediate", benefits: "Hand-eye coordination, lightning speed & extreme focus." },
  { title: "Thang-Ta Martial Arts", desc: "Learn the ancient Manipuri martial art focused on weapon training and combat skills.", icon: "⚔️", duration: "6 Months", level: "All Levels", benefits: "Ancient sword & spear combat, balance, and tactical coordination." },
  { title: "Kudo", desc: "A modern martial art combining karate and judo techniques with practical fighting skills.", icon: "🥋", duration: "6 Months", level: "All Levels", benefits: "Full-contact combat, throws, grappling & defensive resilience." },
  { title: "Kickboxing", desc: "Improve your strength, stamina and striking techniques with professional training.", icon: "🥊", duration: "3 - 6 Months", level: "Beginner Friendly", benefits: "Weight loss, fat burn, powerful kick-punch routines & endurance." },
  { title: "Fitness Training", desc: "Build strength, flexibility, endurance and overall physical fitness.", icon: "💪", duration: "Flexible", level: "All Levels", benefits: "Fat burn, muscle toning, stamina building & personalized workouts." },
  { title: "Kids Martial Arts", desc: "Develop confidence, discipline, concentration and fitness in children.", icon: "🧒", duration: "Ongoing", level: "Beginner (Kids)", benefits: "Bully prevention, focus in studies, physical energy channelization." },
  { title: "Personal Training", desc: "Get customized training sessions according to your fitness goals.", icon: "🏋️", duration: "Customized", level: "1-on-1 Dedicated", benefits: "Personalized attention, flexible timings & fast track goal achievement." },
];

// GET programs (public) — seeds defaults if empty
export const getPrograms = async (_req, res) => {
  try {
    let programs = await Program.find().sort({ order: 1, createdAt: 1 });
    if (programs.length === 0) {
      await Program.insertMany(
        DEFAULT_PROGRAMS.map((p, i) => ({ ...p, order: i }))
      );
      programs = await Program.find().sort({ order: 1 });
    }
    res.json({ programs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE program (admin)
export const createProgram = async (req, res) => {
  try {
    const { title, desc, icon, duration, level, benefits, fees, ageGroup, beltLevel, trainer, published } = req.body;
    if (!title || !title.trim()) {
      if (req.file) deleteFile("programs", req.file.filename);
      return res.status(400).json({ message: "Program title is required" });
    }
    const count = await Program.countDocuments();
    const program = await Program.create({
      title: title.trim(),
      desc: (desc || "").trim(),
      icon: (icon || "🥋").trim(),
      duration: (duration || "").trim(),
      level: (level || "").trim(),
      benefits: (benefits || "").trim(),
      fees: (fees || "").trim(),
      ageGroup: (ageGroup || "").trim(),
      beltLevel: (beltLevel || "").trim(),
      trainer: (trainer || "").trim(),
      published: published !== undefined ? String(published) === "true" : true,
      image: req.file ? req.file.filename : "",
      order: count,
    });
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Program created",
      category: "cms",
      entity: `Program: ${program.title}`,
    });
    res.status(201).json({ message: "Program created successfully.", program });
  } catch (error) {
    if (req.file) deleteFile("programs", req.file.filename);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE program (admin)
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id);
    if (!program) {
      if (req.file) deleteFile("programs", req.file.filename);
      return res.status(404).json({ message: "Program not found" });
    }

const fields = ["title", "desc", "icon", "duration", "level", "benefits", "fees", "ageGroup", "beltLevel", "trainer"];
    fields.forEach((f) => {
      if (typeof req.body[f] === "string") program[f] = req.body[f].trim();
    });

    if (req.body.order !== undefined) program.order = Number(req.body.order);

    // Publish/unpublish
    if (req.body.published !== undefined) program.published = String(req.body.published) === "true";

    if (req.file) {
      const old = program.image;
      program.image = req.file.filename;
      if (old) deleteFile("programs", old);
    }

    await program.save();
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Program updated",
      category: "cms",
      entity: `Program: ${program.title}`,
    });
    res.json({ message: "Program updated successfully.", program });
  } catch (error) {
    if (req.file) deleteFile("programs", req.file.filename);
    res.status(500).json({ message: error.message });
  }
};

// DELETE program (admin)
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    if (program.image) deleteFile("programs", program.image);
    await Program.findByIdAndDelete(id);
    res.json({ message: "Program deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
