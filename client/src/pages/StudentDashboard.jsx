import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Bell,
  Eye,
  Play,
  CheckCircle,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const enrolledResponse = await coursesAPI.getEnrolledCourses();
      setEnrolledCourses(enrolledResponse.data.enrollments || []);

      // Fetch available courses (limited)
      const availableResponse = await coursesAPI.getAll({ limit: 6 });
      setAvailableCourses(availableResponse.data.courses || []);

      // Calculate stats
      const enrollments = enrolledResponse.data.enrollments || [];
      const completedCourses = enrollments.filter(
        (e) => e.status === "completed",
      ).length;
      const totalProgress = enrollments.reduce(
        (sum, e) => sum + (e.progress?.overallProgress || 0),
        0,
      );
      const averageProgress =
        enrollments.length > 0
          ? Math.round(totalProgress / enrollments.length)
          : 0;
      const totalHours = enrollments.reduce(
        (sum, e) => sum + (e.progress?.totalTimeSpent || 0),
        0,
      );

      setStats({
        enrolledCourses: enrollments.length,
        completedCourses,
        totalHours: Math.round(totalHours / 60), // Convert minutes to hours
        averageProgress,
      });
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await coursesAPI.enroll(courseId);
      toast.success("Successfully enrolled in course!");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to enroll in course",
      );
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course?"))
      return;

    try {
      await coursesAPI.unenroll(courseId);
      toast.success("Successfully unenrolled from course");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to unenroll from course",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Continue your learning journey and track your progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Enrolled Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.enrolledCourses}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedCourses}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Hours Studied
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Average Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageProgress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Courses</h3>
          </div>
          <div className="card-content">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                <p className="text-sm text-gray-400">
                  Browse available courses below to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          enrollment.status === "completed"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {enrollment.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {enrollment.course?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Progress: {enrollment.progress?.overallProgress || 0}%
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              enrollment.status === "completed"
                                ? "bg-green-600"
                                : "bg-blue-600"
                            }`}
                            style={{
                              width: `${enrollment.progress?.overallProgress || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/courses/${enrollment.course._id}`)
                        }
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Continue learning"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUnenroll(enrollment.course._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Unenroll from course"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Courses */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">Available Courses</h3>
              <button
                onClick={() => navigate("/courses")}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Browse All
              </button>
            </div>
          </div>
          <div className="card-content">
            {availableCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No courses available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableCourses.slice(0, 4).map((course) => {
                  const isEnrolled = enrolledCourses.some(
                    (e) => e.course._id === course._id,
                  );

                  return (
                    <div
                      key={course._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {course.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {course.instructor?.firstName}{" "}
                            {course.instructor?.lastName} • {course.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {course.enrollmentCount} students
                            </span>
                            {course.price > 0 && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-green-600 font-medium">
                                  ${course.price}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {isEnrolled ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md">
                            Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course._id)}
                            className="btn btn-sm btn-primary"
                          >
                            Enroll
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">
                Enroll in courses to see your learning activity
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {enrollment.status === "completed"
                        ? "Completed"
                        : "Studying"}{" "}
                      "{enrollment.course?.title}"
                    </p>
                    <p className="text-xs text-gray-500">
                      {enrollment.progress?.lastAccessedAt
                        ? new Date(
                            enrollment.progress.lastAccessedAt,
                          ).toLocaleDateString()
                        : new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
