import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { assignmentsAPI } from "../services/api";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, overdue, completed

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data.assignments || []);
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (user.role === "student") {
      const userSubmission = assignment.submissions?.find(
        (s) => s.student._id === user._id,
      );

      if (userSubmission) {
        if (userSubmission.status === "graded") return "graded";
        return "submitted";
      }

      if (now > dueDate) return "overdue";
      return "pending";
    }

    // For instructors
    if (now > dueDate) return "closed";
    return "active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "graded":
        return "text-green-600 bg-green-50";
      case "submitted":
        return "text-blue-600 bg-blue-50";
      case "overdue":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "closed":
        return "text-gray-600 bg-gray-50";
      case "active":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "overdue":
        return "Overdue";
      case "pending":
        return "Pending";
      case "closed":
        return "Closed";
      case "active":
        return "Active";
      default:
        return "Unknown";
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    const status = getAssignmentStatus(assignment);

    switch (filter) {
      case "upcoming":
        return status === "pending" || status === "active";
      case "overdue":
        return status === "overdue";
      case "completed":
        return status === "graded" || status === "submitted";
      default:
        return true;
    }
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">
            {user.role === "student"
              ? "View and submit your assignments"
              : "Manage course assignments and submissions"}
          </p>
        </div>
        {user.role === "instructor" && (
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="card-content">
          <div className="flex space-x-1">
            {[
              { key: "all", label: "All Assignments" },
              { key: "upcoming", label: "Upcoming" },
              { key: "overdue", label: "Overdue" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assignments found
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No assignments available yet"
              : `No ${filter} assignments`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const dueDate = new Date(assignment.dueDate);
            const isOverdue = new Date() > dueDate;

            return (
              <div
                key={assignment._id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}
                        >
                          {getStatusText(status)}
                        </span>
                        {!assignment.isPublished &&
                          user.role === "instructor" && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100">
                              Draft
                            </span>
                          )}
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{assignment.course?.title}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {dueDate.toLocaleDateString()}</span>
                          {isOverdue && (
                            <AlertTriangle className="h-4 w-4 ml-1 text-red-500" />
                          )}
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{assignment.maxPoints} points</span>
                        </div>

                        {user.role === "instructor" && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {assignment.submissionCount} submissions
                              {assignment.gradedCount > 0 &&
                                ` (${assignment.gradedCount} graded)`}
                            </span>
                          </div>
                        )}
                      </div>

                      {user.role === "student" && (
                        <div className="mt-3">
                          {(() => {
                            const userSubmission = assignment.submissions?.find(
                              (s) => s.student._id === user._id,
                            );

                            if (userSubmission) {
                              return (
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      Submitted{" "}
                                      {new Date(
                                        userSubmission.submittedAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {userSubmission.grade && (
                                    <div className="text-sm font-medium">
                                      Grade: {userSubmission.grade.score}/
                                      {assignment.maxPoints}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div className="text-sm text-gray-500">
                                Not submitted yet
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="View assignment"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {user.role === "instructor" && (
                        <>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            title="Edit assignment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
