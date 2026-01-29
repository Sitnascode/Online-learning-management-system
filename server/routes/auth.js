import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   GET /api/auth/test
// @desc    Test auth routes
// @access  Public
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      adminLogin: "POST /api/auth/admin-login",
      profile: "GET /api/auth/profile (requires auth)",
    },
  });
});

// @route   POST /api/auth/register
// @desc    Register a new student (STUDENTS ONLY)
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password, firstName, lastName, username } = req.body;

      // SECURITY: Only allow student registration
      // Instructors and Admins must be created by admin

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Create new STUDENT user only
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        username,
        role: "student", // HARDCODED - no role selection allowed
        createdBy: null, // Self-registered
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: "Student account created successfully",
        token,
        user,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user and check password
      const user = await User.findByCredentials(email, password);

      // Security check: Ensure instructors are properly created (not self-registered)
      if (user.role === "instructor" && !user.createdBy) {
        return res.status(403).json({
          message: "Invalid instructor account. Please contact administrator.",
        });
      }

      // Check for pending invite
      if (user.inviteToken && user.inviteExpires > Date.now()) {
        return res.status(403).json({
          message: "Please complete account setup using your invite link.",
          requiresSetup: true,
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticate,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("bio").optional().isLength({ max: 500 }),
    body("phone").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const allowedUpdates = [
        "firstName",
        "lastName",
        "bio",
        "phone",
        "dateOfBirth",
        "address",
        "preferences",
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

export default router;

// @route   POST /api/auth/admin-login
// @desc    Admin login with additional security
// @access  Public
router.post(
  "/admin-login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
    body("adminKey").optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password, adminKey } = req.body;

      // Optional: Check admin key for additional security
      if (
        process.env.ADMIN_LOGIN_KEY &&
        adminKey !== process.env.ADMIN_LOGIN_KEY
      ) {
        return res.status(403).json({ message: "Invalid admin access key" });
      }

      // Find user and check password
      const user = await User.findByCredentials(email, password);

      // Verify admin role
      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin privileges required." });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: "Admin login successful",
        token,
        user,
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
);

// @route   POST /api/auth/approve-instructor
// @desc    Approve instructor account (Admin only)
// @access  Private (Admin)
router.post(
  "/approve-instructor",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "instructor") {
        return res.status(400).json({ message: "User is not an instructor" });
      }

      user.isInstructorApproved = true;
      await user.save();

      res.json({
        message: "Instructor approved successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);
// @route   POST /api/auth/create-instructor
// @desc    Create instructor account (Admin only)
// @access  Private (Admin)
router.post(
  "/create-instructor",
  authenticate,
  authorize("admin"),
  [
    body("email").isEmail().normalizeEmail(),
    body("firstName").trim().isLength({ min: 1 }),
    body("lastName").trim().isLength({ min: 1 }),
    body("username").trim().isLength({ min: 3 }),
    body("sendInvite").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        email,
        firstName,
        lastName,
        username,
        sendInvite = false,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      let userData = {
        email,
        firstName,
        lastName,
        username,
        role: "instructor",
        createdBy: req.user._id,
        isActive: true,
      };

      if (sendInvite) {
        // Generate secure invite token
        const crypto = await import("crypto");
        const inviteToken = crypto.randomBytes(32).toString("hex");
        userData.inviteToken = inviteToken;
        userData.inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        userData.password = crypto.randomBytes(16).toString("hex"); // Temporary password
      } else {
        // Admin sets password directly
        if (!req.body.password) {
          return res
            .status(400)
            .json({ message: "Password required when not sending invite" });
        }
        userData.password = req.body.password;
      }

      const instructor = new User(userData);
      await instructor.save();

      // TODO: Send invite email if sendInvite is true
      if (sendInvite) {
        // Email logic would go here
        console.log(`Invite link: /set-password?token=${userData.inviteToken}`);
      }

      res.status(201).json({
        message: sendInvite
          ? "Instructor created and invite sent"
          : "Instructor created successfully",
        instructor: {
          id: instructor._id,
          email: instructor.email,
          username: instructor.username,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          role: instructor.role,
          inviteToken: sendInvite ? userData.inviteToken : undefined,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   POST /api/auth/set-password
// @desc    Set password using invite token
// @access  Public
router.post(
  "/set-password",
  [
    body("token").isLength({ min: 1 }).withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, password } = req.body;

      // Find user with valid invite token
      const user = await User.findOne({
        inviteToken: token,
        inviteExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired invite token" });
      }

      // Set new password and clear invite token
      user.password = password;
      user.inviteToken = null;
      user.inviteExpires = null;
      user.isEmailVerified = true;
      await user.save();

      // Generate JWT token
      const jwtToken = generateToken(user._id);

      res.json({
        message: "Password set successfully",
        token: jwtToken,
        user,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   GET /api/auth/pending-instructors
// @desc    Get instructors with pending invites (Admin only)
// @access  Private (Admin)
router.get(
  "/pending-instructors",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const pendingInstructors = await User.find({
        role: "instructor",
        inviteToken: { $ne: null },
        inviteExpires: { $gt: Date.now() },
      })
        .select("-password -inviteToken")
        .populate("createdBy", "firstName lastName");

      res.json({
        instructors: pendingInstructors,
        count: pendingInstructors.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);
