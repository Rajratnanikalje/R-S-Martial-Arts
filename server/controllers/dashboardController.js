import TrialBooking from "../models/TrialBooking.js";
import Contact from "../models/Contact.js";
import Trainer from "../models/Trainer.js";
import Program from "../models/Program.js";
import GallerySection from "../models/GallerySection.js";
import Testimonial from "../models/Testimonial.js";
import ActivityLog from "../models/ActivityLog.js";

/**
 * GET admin dashboard overview:
 *  - stat cards (totals)
 *  - recent activities
 *  - latest trial bookings
 *  - latest contact messages
 * Returns everything the dashboard needs in one request (perf friendly).
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const counts = await Promise.all([
      TrialBooking.countDocuments(),
      Contact.countDocuments(),
      Trainer.countDocuments(),
      Program.countDocuments(),
      GallerySection.aggregate([{ $project: { n: { $size: { $ifNull: ["$images", []] } } } }, { $group: { _id: null, total: { $sum: "$n" } } }]),
      Testimonial.countDocuments(),
    ]);

    const [
      totalTrials,
      totalContacts,
      totalTrainers,
      totalPrograms,
      galleryAgg,
      totalTestimonials,
    ] = counts;

    const totalImages = galleryAgg?.[0]?.total || 0;

    const [recentActivities, latestTrials, latestContacts] = await Promise.all([
      ActivityLog.find().sort({ createdAt: -1 }).limit(15).lean(),
      TrialBooking.find().sort({ createdAt: -1 }).limit(8).lean(),
      Contact.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    res.json({
      stats: {
        totalTrials,
        totalContacts,
        totalTrainers,
        totalPrograms,
        totalImages,
        totalTestimonials,
      },
      recentActivities,
      latestTrials,
      latestContacts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

