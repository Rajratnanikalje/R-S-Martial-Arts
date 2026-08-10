import Contact from "../models/Contact.js";
import { logActivity } from "../utils/logActivity.js";

// 1. Create Contact (Public Form Submissions)
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

const contact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    logActivity({
      actor: req.user?.name || "Website",
      actorRole: req.user?.role || "public",
      action: "New contact message",
      category: "management",
      entity: `Contact: ${contact.name}`,
      detail: contact.email || contact.phone,
    });

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 2. Get All Contacts (Admin Dashboard View)
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 3. Delete Contact Message
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Contact message deleted",
      category: "management",
      entity: contact ? `Contact: ${contact.name}` : `Contact: ${id}`,
    });

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 4. Update Contact Status (Admin Action)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedContactStatuses = ["New", "Contacted", "Trial Scheduled", "Converted", "Joined", "Not Interested"];
    if (!allowedContactStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid contact status." });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

if (!updatedContact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    logActivity({
      actor: req.user?.name || "admin",
      actorRole: req.user?.role || "admin",
      action: "Contact status updated",
      category: "management",
      entity: `Contact: ${updatedContact.name}`,
      detail: status,
    });

    res.status(200).json({
      message: "Status updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
