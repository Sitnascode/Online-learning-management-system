import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI, assignmentsAPI } from "../services/api";
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Trash2,
  Globe,
  Lock,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateCourseModal from "../components/CreateCourseModal";
import EditCourseModal from "../components/EditCourseModal";
import CreateAssignmentModal from "../components/CreateAssignmentModal";
import CourseContentModal from "../components/CourseContentModal";
import CourseAssignmentsModal from "../components/CourseAssignmentsModal";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data.courses);

      // Calculate stats
      const totalCourses = response.data.courses.length;
      const publishedCourses = response.data.courses.filter(
        (c) => c.isPublished,
      ).length;
      const totalStudents = response.data.courses.reduce(
        (sum, course) => sum + course.enrollmentCount,
        0,
      );
      const averageRating =
        response.data.courses.reduce(
          (sum, course) => sum + course.rating.average,
          0,
        ) / totalCourses || 0;

      setStats({
        totalCourses,
        publishedCourses,
        totalStudents,
        averageRating: averageRating.toFixed(1),
      });
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await coursesAPI.create(courseData);
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create course");
    }
  };

  const handleEditCourse = async (courseData) => {
    try {
      await coursesAPI.update(selectedCourse._id, courseData);
      toast.success("Course updated successfully!");
      setShowEditModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await coursesAPI.delete(courseId);
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  const handlePublishToggle = async (courseId) => {
    try {
      await coursesAPI.publish(courseId);
      toast.success("Course status updated!");
      fetchCourses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update course status",
      );
    }
  };

  const handleCreateAssignment = async (assignmentData) => {
    try {
      await assignmentsAPI.create(assignmentData);
      toast.success("Assignment created successfully!");
      setShowCreateAssignmentModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create assignment",
      );
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const openContentModal = (course) => {
    setSelectedCourse(course);
    setShowContentModal(true);
  };

  const openAssignmentsModal = (course) => {
    setSelectedCourse(course);
    setShowAssignmentsModal(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your courses and track student progress.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </button>
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
                <p className="text-sm font-medium text-gray-500">My Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
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
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
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
                  <Globe className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.publishedCourses}
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
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="card-title">My Courses</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Create New Course
            </button>
          </div>
        </div>
        <div className="card-content">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No courses created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        course.isPublished ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {course.isPublished ? (
                        <Globe className="h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {course.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.enrollmentCount} students enrolled •{" "}
                        {course.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.isPublished ? "Published" : "Draft"} • Created{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePublishToggle(course._id)}
                      className={`p-2 rounded-md ${
                        course.isPublished
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title={
                        course.isPublished
                          ? "Unpublish course"
                          : "Publish course"
                      }
                    >
                      {course.isPublished ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="View course"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openAssignmentsModal(course)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                      title="Manage assignments"
                    >
                      <ClipboardList className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openContentModal(course)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                      title="Manage course content"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                      title="Edit course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Create Course</p>
                <p className="text-sm text-gray-600">
                  Start building a new course
                </p>
              </div>
            </button>

            <button
              onClick={() => alert("Send Announcement feature coming soon!")}
              className="flex items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Send Announcement</p>
                <p className="text-sm text-gray-600">Notify all students</p>
              </div>
            </button>

            <button
              onClick={() => setShowCreateAssignmentModal(true)}
              className="flex items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Create Assignment</p>
                <p className="text-sm text-gray-600">Add new assignment</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {showEditModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onSubmit={handleEditCourse}
        />
      )}

      {showCreateAssignmentModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateAssignmentModal(false)}
          onSubmit={handleCreateAssignment}
        />
      )}

      {showContentModal && selectedCourse && (
        <CourseContentModal
          course={selectedCourse}
          onClose={() => {
            setShowContentModal(false);
            setSelectedCourse(null);
          }}
          onUpdate={fetchCourses}
        />
      )}

      {showAssignmentsModal && selectedCourse && (
        <CourseAssignmentsModal
          course={selectedCourse}
          onClose={() => {
            setShowAssignmentsModal(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;
