import bcrypt from "bcryptjs";
import Contact from "../models/Contact.js";
import TrialBooking from "../models/TrialBooking.js";
import User from "../models/User.js"; 
import { sendOTP } from "../utils/sendEmail.js";

// Temporary Store for OTPs
const otpStore = {};

// 1. Get All Contact Messages
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Trial Bookings
export const getTrialBookings = async (req, res) => {
  try {
    const trials = await TrialBooking.find().sort({ createdAt: -1 });
    res.json({ trials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Trial Booking Status
export const updateTrialStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Contacted", "Confirmed", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid trial status." });
    }
    const trial = await TrialBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!trial) {
      return res.status(404).json({ message: "Trial booking not found" });
    }

    res.json({ message: "Status updated successfully", trial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Trial Booking
export const deleteTrialBooking = async (req, res) => {
  try {
    const trial = await TrialBooking.findByIdAndDelete(req.params.id);

    if (!trial) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Request OTP (Send Email OTP)
export const requestUpdateOTP = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found!" });
    }

    // 6 Digit OTP Generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory (Expires in 10 minutes)
    otpStore[adminId] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    // Send Email
    await sendOTP(admin.email, otp);

    res.json({ message: `OTP aapke email (${admin.email}) par bhej diya gaya hai!` });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Email bhejne me error: " + error.message });
  }
};

// 6. Confirm Update with OTP (STRICT OTP CHECK)
export const confirmUpdateWithOTP = async (req, res) => {
  try {
    const { otp, oldPassword, newPassword, email, name } = req.body;
    const adminId = req.user._id || req.user.id;

    // 1. STRICT OTP VERIFICATION
    const savedOtpData = otpStore[adminId];

    if (!savedOtpData || savedOtpData.code !== otp) {
      return res.status(400).json({ message: "Galat (Invalid) OTP! Kripya sahi OTP enter karein." });
    }

    if (Date.now() > savedOtpData.expiresAt) {
      delete otpStore[adminId];
      return res.status(400).json({ message: "OTP expire ho chuka hai. Phir se OTP mangayein." });
    }

    // 2. FETCH ADMIN FROM DB
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found!" });
    }

    // 3. CHANGE PASSWORD (IF PROVIDED)
    if (newPassword && newPassword.trim() !== "") {
      if (!oldPassword) {
        return res.status(400).json({ message: "Password change karne ke liye Current Password dena zaroori hai!" });
      }

      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current Password galat hai!" });
      }

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    // 4. CHANGE NAME & EMAIL (IF PROVIDED)
    if (name && name.trim() !== "") {
      admin.name = name;
    }

    if (email && email.trim() !== "") {
      admin.email = email;
    }

    // Database me changes save karein
    await admin.save();

    // Clear OTP from memory after successful update
    delete otpStore[adminId];

    res.json({
      message: "Admin profile, email, aur password successfully update ho gaya hai!",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
