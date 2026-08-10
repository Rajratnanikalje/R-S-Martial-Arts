import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
role: {
      type: String,
      enum: ["user", "admin", "super_admin", "content_editor"],
      default: "user",
    },
    // 🔑 FORGOT PASSWORD FIELDS
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;