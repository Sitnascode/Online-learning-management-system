import express from "express";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    // Placeholder for notifications logic
    res.json({ message: "Notifications endpoint - coming soon" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
