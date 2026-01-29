import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Filter,
  Search,
  Eye,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

const CoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const categories = [
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
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.level && { level: filters.level }),
      };

      const response = await coursesAPI.getAll(params);
      setCourses(response.data.courses);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      toast.error("Please login to enroll in courses");
      return;
    }

    try {
      await coursesAPI.enroll(courseId);
      toast.success("Successfully enrolled in course!");
      fetchCourses(); // Refresh to update enrollment status
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to enroll in course",
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600">
            Discover and enroll in courses that match your interests
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="input pl-10"
              />
            </form>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className="input"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({ search: "", category: "", level: "", page: 1 })
              }
              className="btn btn-outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {courses.length} of {pagination.total} courses
        </p>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="card-content p-0">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary-600" />
                </div>

                <div className="p-6">
                  {/* Course Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>

                    {/* Instructor */}
                    <p className="text-sm text-gray-500 mb-3">
                      by {course.instructor?.firstName}{" "}
                      {course.instructor?.lastName}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.enrollmentCount} students</span>
                      </div>

                      {course.rating.count > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                          <span>{course.rating.average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      {course.price > 0 ? (
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{course.price}</span>
                        </div>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex-1 btn btn-outline btn-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>

                    {user && user.role === "student" && (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="flex-1 btn btn-primary btn-sm"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>

          {[...Array(pagination.totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-sm ${
                  page === pagination.currentPage
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
