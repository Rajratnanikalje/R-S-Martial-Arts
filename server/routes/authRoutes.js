import express from "express";
import { 
  login, 
  signup, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Official Forgot/Reset Password Endpoints
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

export default router;