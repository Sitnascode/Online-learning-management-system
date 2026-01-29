import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get("/dashboard", authenticate, authorize("admin"), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({
      role: "instructor",
    });
    const pendingInstructors = await User.countDocuments({
      role: "instructor",
      isActive: false,
    });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      isPublished: true,
    });
    const draftCourses = await Course.countDocuments({ isPublished: false });

    // Get enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({
      status: "active",
    });
    const completedEnrollments = await Enrollment.countDocuments({
      status: "completed",
    });

    // Calculate completion rate
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentCourses = await Course.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentEnrollments = await Enrollment.countDocuments({
      enrolledAt: { $gte: thirtyDaysAgo },
    });

    // Get active users (users who have accessed in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const activeUsers = await Enrollment.distinct("student", {
      "progress.lastAccessedAt": { $gte: oneDayAgo },
    });

    // Get top courses by enrollment
    const topCourses = await Course.find({ isPublished: true })
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .populate("instructor", "firstName lastName")
      .select("title enrollmentCount instructor category");

    // Get recent enrollments
    const recentEnrollmentsList = await Enrollment.find()
      .sort({ enrolledAt: -1 })
      .limit(10)
      .populate("student", "firstName lastName")
      .populate("course", "title")
      .select("student course enrolledAt status");

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
        pending: pendingInstructors,
        recent: recentUsers,
        active: activeUsers.length,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        recent: recentCourses,
        top: topCourses,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        recent: recentEnrollments,
        completionRate,
        recentList: recentEnrollmentsList,
      },
      system: {
        status: "healthy",
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/system
// @desc    Get system statistics
// @access  Private (Admin)
router.get("/system", authenticate, authorize("admin"), async (req, res) => {
  try {
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      platform: process.platform,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/courses/:id
// @desc    Get course analytics
// @access  Private (Instructor/Admin)
router.get(
  "/courses/:id",
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
          .json({ message: "Not authorized to view this course analytics" });
      }

      const enrollments = await Enrollment.find({ course: req.params.id })
        .populate("student", "firstName lastName")
        .sort({ enrolledAt: -1 });

      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(
        (e) => e.status === "active",
      ).length;
      const completedEnrollments = enrollments.filter(
        (e) => e.status === "completed",
      ).length;

      const averageProgress =
        totalEnrollments > 0
          ? Math.round(
              enrollments.reduce(
                (sum, e) => sum + (e.progress?.overallProgress || 0),
                0,
              ) / totalEnrollments,
            )
          : 0;

      res.json({
        course: {
          id: course._id,
          title: course.title,
          category: course.category,
          level: course.level,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollments,
          averageProgress,
          list: enrollments,
        },
        rating: course.rating,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
