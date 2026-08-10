import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getContacts,
  getTrialBookings,
  updateTrialStatus,
  deleteTrialBooking,
  requestUpdateOTP,
  confirmUpdateWithOTP,
} from "../controllers/adminController.js";
// 🟢 Imported deleteContact function
import { deleteContact } from "../controllers/contactController.js";
import { updateSiteSettings } from "../controllers/siteSettingsController.js";

const router = express.Router();

// Dashboard Route
router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    admin: req.user,
  });
});

// Contacts Routes
router.get("/contacts", protect, adminOnly, getContacts);
// 🟢 ADDED: Contact Delete Route
router.delete("/contacts/:id", protect, adminOnly, deleteContact);

// Trials Routes
router.get("/trials", protect, adminOnly, getTrialBookings);
router.put("/trials/:id", protect, adminOnly, updateTrialStatus);
router.delete("/trials/:id", protect, adminOnly, deleteTrialBooking);

// OTP & Security Routes
router.post("/send-otp", protect, adminOnly, requestUpdateOTP);
router.put("/confirm-update", protect, adminOnly, confirmUpdateWithOTP);

router.put("/site-settings", protect, adminOnly, updateSiteSettings);

// REQUIRED: Export default router
export default router;
