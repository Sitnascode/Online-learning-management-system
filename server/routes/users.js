import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    // Placeholder for users logic
    res.json({ message: "Users endpoint - coming soon" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
