import express from "express";
import {
  createContact,
  getContacts,
  deleteContact,
  updateContactStatus, // <-- Ye controller function import karein (agar alag file mein hai)
} from "../controllers/contactController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route: User message bhejta hai
router.post("/", createContact);

// Admin Routes: Messages dekhna, status update karna aur delete karna
router.get("/", protect, adminOnly, getContacts);
router.put("/:id", protect, adminOnly, updateContactStatus); // <-- Yeh naya route add kiya hai
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;