import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api";
import CourseAssignmentsModal from "../components/CourseAssignmentsModal";
import CourseContentModal from "../components/CourseContentModal";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Award,
  Play,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Globe,
  Calendar,
  User,
  Target,
  BookMarked,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(id);
      setCourse(response.data.course);
      setEnrollment(response.data.enrollment);
    } catch (error) {
      toast.error("Failed to fetch course details");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll in courses");
      navigate("/login");
      return;
    }

    if (user.role !== "student") {
      toast.error("Only students can enroll in courses");
      return;
    }

    try {
      setEnrolling(true);
      await coursesAPI.enroll(id);
      toast.success("Successfully enrolled in course!");
      fetchCourseDetails(); // Refresh to show enrollment status
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to enroll in course",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm("Are you sure you want to unenroll from this course?"))
      return;

    try {
      await coursesAPI.unenroll(id);
      toast.success("Successfully unenrolled from course");
      fetchCourseDetails(); // Refresh to update enrollment status
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

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Course not found
        </h3>
        <button
          onClick={() => navigate("/courses")}
          className="btn btn-primary"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-sm text-gray-500">{course.level}</span>
                {course.language && (
                  <span className="text-sm text-gray-500">
                    <Globe className="h-3 w-3 inline mr-1" />
                    {course.language}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              {/* Instructor Info */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Course Instructor</p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {course.enrollmentCount}
                  </p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(course.duration)}h
                  </p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {course.totalMaterials}
                  </p>
                  <p className="text-sm text-gray-600">Materials</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {course.rating.average.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({course.rating.count} reviews)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  What You'll Learn
                </h3>
              </div>
              <div className="card-content">
                <ul className="space-y-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <BookMarked className="h-5 w-5 mr-2" />
                Course Content
              </h3>
            </div>
            <div className="card-content">
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={module._id}
                      className="border border-gray-200 rounded-lg"
                    >
                      <div className="p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900">
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                      {module.materials && module.materials.length > 0 && (
                        <div className="p-4 space-y-2">
                          {module.materials.map((material, materialIndex) => (
                            <div
                              key={material._id}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center">
                                <Play className="h-4 w-4 text-gray-400 mr-3" />
                                <span className="text-sm text-gray-700">
                                  {materialIndex + 1}. {material.title}
                                </span>
                              </div>
                              {material.duration > 0 && (
                                <span className="text-xs text-gray-500">
                                  {material.duration} min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Course content will be available soon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Prerequisites</h3>
              </div>
              <div className="card-content">
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <div className="card sticky top-6">
            <div className="card-content">
              {/* Price */}
              <div className="text-center mb-6">
                {course.price > 0 ? (
                  <div className="flex items-center justify-center text-3xl font-bold text-gray-900">
                    <DollarSign className="h-8 w-8" />
                    {course.price}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-green-600">Free</div>
                )}
              </div>

              {/* Enrollment Status */}
              {enrollment ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        You're enrolled!
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-green-700">
                        Progress: {enrollment.progress?.overallProgress || 0}%
                      </p>
                      <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${enrollment.progress?.overallProgress || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full btn btn-primary">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </button>

                  <button
                    onClick={handleUnenroll}
                    className="w-full btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Unenroll from Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user && user.role === "student" ? (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || !course.canEnroll}
                      className="w-full btn btn-primary"
                    >
                      {enrolling ? "Enrolling..." : "Enroll Now"}
                    </button>
                  ) : user && user.role === "instructor" ? (
                    course.instructor._id === user._id ? (
                      // Course owner - show management options
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium">
                            You are the instructor of this course
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => setShowAssignmentsModal(true)}
                            className="w-full btn btn-primary flex items-center justify-center"
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Manage Assignments
                          </button>

                          <button
                            onClick={() => setShowContentModal(true)}
                            className="w-full btn btn-outline flex items-center justify-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Manage Content
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/courses/${course._id}/settings`)
                            }
                            className="w-full btn btn-outline flex items-center justify-center"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Course Settings
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Other instructor viewing
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          You're viewing this as an instructor
                        </p>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full btn btn-primary"
                    >
                      Login to Enroll
                    </button>
                  )}

                  {!course.canEnroll && (
                    <p className="text-sm text-red-600 text-center">
                      This course is not available for enrollment
                    </p>
                  )}
                </div>
              )}

              {/* Course Info */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Language</span>
                  <span className="text-gray-900">{course.language}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Tags</h3>
              </div>
              <div className="card-content">
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals for course management */}
      {showAssignmentsModal && course && (
        <CourseAssignmentsModal
          course={course}
          onClose={() => setShowAssignmentsModal(false)}
        />
      )}

      {showContentModal && course && (
        <CourseContentModal
          course={course}
          onClose={() => setShowContentModal(false)}
          onUpdate={fetchCourseDetails}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
