import mongoose from "mongoose";

const trialBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    program: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Contacted", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TrialBooking", trialBookingSchema);
