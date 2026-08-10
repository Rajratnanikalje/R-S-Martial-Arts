import Timetable from "../models/Timetable.js";

export const DEFAULT_TIMETABLE = [
  { day: "Monday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Karate Training", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Kickboxing", order: 0 },
  { day: "Tuesday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Kudo Training", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Fitness Training", order: 1 },
  { day: "Wednesday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Thang-Ta Martial Arts", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Self Defense", order: 2 },
  { day: "Thursday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Karate Training", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Kids Martial Arts", order: 3 },
  { day: "Friday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Fitness Training", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Kickboxing", order: 4 },
  { day: "Saturday", morningTime: "06:00 AM - 08:00 AM", morningClass: "Special Training", eveningTime: "05:00 PM - 07:00 PM", eveningClass: "Personal Training", order: 5 },
];

// GET timetable (public)
export const getTimetable = async (_req, res) => {
  try {
    let entries = await Timetable.find().sort({ order: 1, createdAt: 1 });
    if (entries.length === 0) {
      await Timetable.insertMany(DEFAULT_TIMETABLE);
      entries = await Timetable.find().sort({ order: 1 });
    }
    res.json({ timetable: entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE entry (admin)
export const createTimetable = async (req, res) => {
  try {
    const { day, morningTime, morningClass, eveningTime, eveningClass } = req.body;
    if (!day || !day.trim()) {
      return res.status(400).json({ message: "Day is required" });
    }
    const count = await Timetable.countDocuments();
    const entry = await Timetable.create({
      day: day.trim(),
      morningTime: (morningTime || "").trim(),
      morningClass: (morningClass || "").trim(),
      eveningTime: (eveningTime || "").trim(),
      eveningClass: (eveningClass || "").trim(),
      order: count,
    });
    res.status(201).json({ message: "Timetable entry created.", entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE entry (admin)
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Timetable.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    ["day", "morningTime", "morningClass", "eveningTime", "eveningClass"].forEach((f) => {
      if (typeof req.body[f] === "string") entry[f] = req.body[f].trim();
    });
    if (req.body.order !== undefined) entry.order = Number(req.body.order);

    await entry.save();
    res.json({ message: "Timetable entry updated.", entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE entry (admin)
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Timetable.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    await Timetable.findByIdAndDelete(id);
    res.json({ message: "Timetable entry deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
