import express from "express";
import { body, validationResult } from "express-validator";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      instructor,
    } = req.query;

    const filters = { isPublished: true };

    if (category) filters.category = category;
    if (level) filters.level = level;
    if (instructor) filters.instructor = instructor;

    let query = Course.find(filters)
      .populate("instructor", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    if (search) {
      query = Course.find({
        ...filters,
        $text: { $search: search },
      })
        .populate("instructor", "firstName lastName avatar")
        .sort({ score: { $meta: "textScore" } });
    }

    const courses = await query.limit(limit * 1).skip((page - 1) * limit);

    const total = await Course.countDocuments(filters);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/courses/my-courses
// @desc    Get instructor's courses
// @access  Private (Instructor/Admin)
router.get(
  "/my-courses",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.user._id })
        .populate("instructor", "firstName lastName avatar")
        .sort({ createdAt: -1 });

      res.json({ courses });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   GET /api/courses/enrolled
// @desc    Get student's enrolled courses
// @access  Private (Student)
router.get("/enrolled", authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.getStudentEnrollments(req.user._id);
    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "firstName lastName avatar bio")
      .populate("reviews.user", "firstName lastName avatar");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled (if authenticated)
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: req.params.id,
      });
    }

    res.json({ course, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor/Admin)
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title is required and must be less than 100 characters"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage(
        "Description is required and must be less than 1000 characters",
      ),
    body("category")
      .isIn([
        "Programming",
        "Data Science",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Health & Fitness",
        "Language",
        "Personal Development",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("level").optional().isIn(["Beginner", "Intermediate", "Advanced"]),
    body("price").optional().isNumeric().isFloat({ min: 0 }),
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

      const courseData = {
        ...req.body,
        instructor: req.user._id,
      };

      const course = new Course(courseData);
      await course.save();

      await course.populate("instructor", "firstName lastName avatar");

      res.status(201).json({
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Instructor/Admin - own courses only)
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  [
    body("title").optional().trim().isLength({ min: 1, max: 100 }),
    body("description").optional().trim().isLength({ min: 1, max: 1000 }),
    body("category")
      .optional()
      .isIn([
        "Programming",
        "Data Science",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Health & Fitness",
        "Language",
        "Personal Development",
        "Other",
      ]),
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

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this course" });
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          course[key] = req.body[key];
        }
      });

      await course.save();
      await course.populate("instructor", "firstName lastName avatar");

      res.json({
        message: "Course updated successfully",
        course,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Instructor/Admin - own courses only)
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this course" });
      }

      // Check if course has enrollments
      const enrollmentCount = await Enrollment.countDocuments({
        course: req.params.id,
      });
      if (enrollmentCount > 0) {
        return res.status(400).json({
          message:
            "Cannot delete course with active enrollments. Please contact admin.",
        });
      }

      await Course.findByIdAndDelete(req.params.id);

      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private (Student)
router.post("/:id/enroll", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.canEnroll) {
      return res
        .status(400)
        .json({ message: "Course is not available for enrollment" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: req.params.id,
    });

    await enrollment.save();

    // Update course enrollment count
    await course.enrollUser();

    await enrollment.populate("course", "title description thumbnail");

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/courses/:id/enroll
// @desc    Unenroll from course
// @access  Private (Student)
router.delete("/:id/enroll", authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    await Enrollment.findByIdAndDelete(enrollment._id);

    // Update course enrollment count
    const course = await Course.findById(req.params.id);
    if (course) {
      await course.unenrollUser();
    }

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/courses/:id/enrollments
// @desc    Get course enrollments
// @access  Private (Instructor/Admin - own courses only)
router.get(
  "/:id/enrollments",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view enrollments" });
      }

      const enrollments = await Enrollment.getCourseEnrollments(req.params.id);

      res.json({ enrollments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   POST /api/courses/:id/publish
// @desc    Publish/unpublish course
// @access  Private (Instructor/Admin - own courses only)
router.post(
  "/:id/publish",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (
        course.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to publish this course" });
      }

      course.isPublished = !course.isPublished;
      await course.save();

      res.json({
        message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
        course,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
