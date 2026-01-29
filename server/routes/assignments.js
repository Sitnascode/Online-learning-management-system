import express from "express";
import { body, validationResult } from "express-validator";
import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments (filtered by role)
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    const { courseId, status } = req.query;
    let assignments;

    if (req.user.role === "student") {
      // Students see assignments from their enrolled courses
      const enrollments = await Enrollment.find({ student: req.user._id });
      const courseIds = enrollments.map((e) => e.course);

      let query = {
        course: { $in: courseIds },
        isPublished: true,
      };

      if (courseId) {
        query.course = courseId;
      }

      assignments = await Assignment.find(query)
        .populate("course", "title")
        .populate("instructor", "firstName lastName")
        .sort({ dueDate: 1 });
    } else if (req.user.role === "instructor") {
      // Instructors see their own assignments
      let query = { instructor: req.user._id };

      if (courseId) {
        query.course = courseId;
      }

      assignments = await Assignment.find(query)
        .populate("course", "title")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "admin") {
      // Admins see all assignments
      let query = {};

      if (courseId) {
        query.course = courseId;
      }

      assignments = await Assignment.find(query)
        .populate("course", "title")
        .populate("instructor", "firstName lastName")
        .sort({ createdAt: -1 });
    }

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get("/:id", authenticate, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "title")
      .populate("instructor", "firstName lastName")
      .populate("submissions.student", "firstName lastName email");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check access permissions
    if (req.user.role === "student") {
      // Students can only see published assignments from enrolled courses
      if (!assignment.isPublished) {
        return res.status(403).json({ message: "Assignment not available" });
      }

      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: assignment.course._id,
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      // Filter submissions to only show student's own submission
      assignment.submissions = assignment.submissions.filter((s) =>
        s.student._id.equals(req.user._id),
      );
    } else if (req.user.role === "instructor") {
      // Instructors can only see their own assignments
      if (!assignment.instructor._id.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }
    // Admins can see all assignments

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Instructor/Admin)
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title is required and must be less than 200 characters"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required"),
    body("maxPoints")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max points must be at least 1"),
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

      // Verify course exists and user has access
      const course = await Course.findById(req.body.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role === "instructor" &&
        !course.instructor.equals(req.user._id)
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized for this course" });
      }

      const assignmentData = {
        ...req.body,
        instructor: req.user._id,
      };

      const assignment = new Assignment(assignmentData);
      await assignment.save();

      await assignment.populate("course", "title");
      await assignment.populate("instructor", "firstName lastName");

      res.status(201).json({
        message: "Assignment created successfully",
        assignment,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Instructor/Admin - own assignments only)
router.put(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  [
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ min: 1 }),
    body("dueDate").optional().isISO8601(),
    body("maxPoints").optional().isInt({ min: 1 }),
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

      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user owns the assignment or is admin
      if (
        req.user.role === "instructor" &&
        !assignment.instructor.equals(req.user._id)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          assignment[key] = req.body[key];
        }
      });

      await assignment.save();
      await assignment.populate("course", "title");
      await assignment.populate("instructor", "firstName lastName");

      res.json({
        message: "Assignment updated successfully",
        assignment,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Instructor/Admin - own assignments only)
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user owns the assignment or is admin
      if (
        req.user.role === "instructor" &&
        !assignment.instructor.equals(req.user._id)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check if assignment has submissions
      if (assignment.submissions.length > 0) {
        return res.status(400).json({
          message: "Cannot delete assignment with submissions",
        });
      }

      await Assignment.findByIdAndDelete(req.params.id);

      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post(
  "/:id/submit",
  authenticate,
  authorize("student"),
  [
    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Submission content is required"),
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

      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      if (!assignment.isPublished) {
        return res.status(400).json({ message: "Assignment not available" });
      }

      // Check if student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: assignment.course,
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      // Check if assignment is overdue
      if (assignment.isOverdue && !assignment.allowLateSubmissions) {
        return res.status(400).json({ message: "Assignment is overdue" });
      }

      await assignment.addSubmission(req.user._id, req.body.content);

      res.json({ message: "Assignment submitted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @desc    Grade assignment submission
// @access  Private (Instructor/Admin)
router.put(
  "/:id/submissions/:submissionId/grade",
  authenticate,
  authorize("instructor", "admin"),
  [
    body("score")
      .isNumeric()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Score must be between 0 and 100"),
    body("feedback").optional().trim(),
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

      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user owns the assignment or is admin
      if (
        req.user.role === "instructor" &&
        !assignment.instructor.equals(req.user._id)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await assignment.gradeSubmission(
        req.params.submissionId,
        req.body.score,
        req.body.feedback || "",
        req.user._id,
      );

      res.json({ message: "Submission graded successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
);

// @route   POST /api/assignments/:id/publish
// @desc    Publish/unpublish assignment
// @access  Private (Instructor/Admin - own assignments only)
router.post(
  "/:id/publish",
  authenticate,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user owns the assignment or is admin
      if (
        req.user.role === "instructor" &&
        !assignment.instructor.equals(req.user._id)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      assignment.isPublished = !assignment.isPublished;
      await assignment.save();

      res.json({
        message: `Assignment ${assignment.isPublished ? "published" : "unpublished"} successfully`,
        assignment,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
