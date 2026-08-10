import express from "express";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/gallery", upload.single("image"), (req, res) => {
  res.json({
    success: true,
    image: req.file.filename,
  });
});

export default router;