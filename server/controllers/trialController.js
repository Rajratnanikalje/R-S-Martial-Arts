import TrialBooking from "../models/TrialBooking.js";
import { logActivity } from "../utils/logActivity.js";

// 1. Create Trial Booking (Public Form / Admin Convert)
export const createTrialBooking = async (req, res) => {
  try {
    // 🌟 'status' ko yahan destructure kar liya gaya hai
    const { name, email, phone, program, age, message, status } = req.body;

const booking = await TrialBooking.create({
      name,
      email,
      phone,
      program,
      age,
      message,
      // 🌟 Agar frontend se status bheja gaya hai toh wo aayega, nahi toh default "Pending" rahega
      status: status || "Pending",
    });

    logActivity({
      actor: req.user?.name || "Website",
      actorRole: req.user?.role || "public",
      action: "New trial booking",
      category: "management",
      entity: `Trial: ${booking.name}`,
      detail: `${booking.program} (${booking.status})`,
    });

    res.status(201).json({
      message: "Trial booking submitted successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 2. Get All Trial Bookings (Admin)
export const getTrialBookings = async (req, res) => {
  try {
    const trials = await TrialBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ trials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Trial Status (Pending/Contacted/Confirmed/Cancelled)
export const updateTrialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Contacted", "Confirmed", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid trial status." });
    }

    const updatedTrial = await TrialBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

if (!updatedTrial) {
      return res.status(404).json({ message: "Trial booking not found" });
    }

    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Trial status updated",
      category: "management",
      entity: `Trial: ${updatedTrial.name}`,
      detail: status,
    });

    res.status(200).json({
      message: "Trial status updated successfully",
      trial: updatedTrial,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Trial Booking
export const deleteTrialBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await TrialBooking.findByIdAndDelete(id);
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Trial booking deleted",
      category: "management",
      entity: booking ? `Trial: ${booking.name}` : `Trial: ${id}`,
    });

    res.status(200).json({
      message: "Trial booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};