import { useState, useEffect } from "react";
import {
  X,
  Plus,
  FileText,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { assignmentsAPI } from "../services/api";
import toast from "react-hot-toast";

const CourseAssignmentsModal = ({ course, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxPoints: 100,
    allowLateSubmissions: false,
    latePenalty: 0,
    submissionType: "both",
    allowedFileTypes: [],
    maxFileSize: 10,
  });

  const submissionTypes = [
    { value: "text", label: "Text Only" },
    { value: "file", label: "File Only" },
    { value: "both", label: "Text and File" },
  ];

  useEffect(() => {
    fetchAssignments();
  }, [course._id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getAll({ courseId: course._id });
      setAssignments(response.data.assignments || []);
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileTypesChange = (e) => {
    const value = e.target.value;
    const fileTypes = value
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      allowedFileTypes: fileTypes,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      maxPoints: 100,
      allowLateSubmissions: false,
      latePenalty: 0,
      submissionType: "both",
      allowedFileTypes: [],
      maxFileSize: 10,
    });
    setEditingAssignment(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Assignment description is required");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }

    // Validate due date is in the future
    const dueDate = new Date(formData.dueDate);
    if (dueDate <= new Date()) {
      toast.error("Due date must be in the future");
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        ...formData,
        course: course._id,
      };

      if (editingAssignment) {
        await assignmentsAPI.update(editingAssignment._id, assignmentData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentsAPI.create(assignmentData);
        toast.success("Assignment created successfully!");
      }

      resetForm();
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      maxPoints: assignment.maxPoints,
      allowLateSubmissions: assignment.allowLateSubmissions,
      latePenalty: assignment.latePenalty,
      submissionType: assignment.submissionType,
      allowedFileTypes: assignment.allowedFileTypes || [],
      maxFileSize: assignment.maxFileSize,
    });
    setEditingAssignment(assignment);
    setShowCreateForm(true);
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    try {
      await assignmentsAPI.delete(assignmentId);
      toast.success("Assignment deleted successfully!");
      fetchAssignments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete assignment",
      );
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (now > dueDate)
      return { text: "Closed", color: "text-red-600 bg-red-50" };
    if (assignment.isPublished)
      return { text: "Active", color: "text-green-600 bg-green-50" };
    return { text: "Draft", color: "text-gray-600 bg-gray-50" };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Assignments - {course?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Course Assignments
              </h3>
              <p className="text-gray-600">
                Manage assignments for this course
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">
                {editingAssignment
                  ? "Edit Assignment"
                  : "Create New Assignment"}
              </h4>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe the assignment objectives"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed instructions for students"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Points
                    </label>
                    <input
                      type="number"
                      name="maxPoints"
                      value={formData.maxPoints}
                      onChange={handleInputChange}
                      min={1}
                      max={1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Type
                    </label>
                    <select
                      name="submissionType"
                      value={formData.submissionType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {submissionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      name="maxFileSize"
                      value={formData.maxFileSize}
                      onChange={handleInputChange}
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowLateSubmissions"
                      checked={formData.allowLateSubmissions}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Allow late submissions
                    </label>
                  </div>

                  {formData.allowLateSubmissions && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">
                        Penalty (% per day):
                      </label>
                      <input
                        type="number"
                        name="latePenalty"
                        value={formData.latePenalty}
                        onChange={handleInputChange}
                        min={0}
                        max={100}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading
                      ? "Saving..."
                      : editingAssignment
                        ? "Update Assignment"
                        : "Create Assignment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Assignments List */}
          <div className="space-y-4">
            {loading && assignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No assignments yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first assignment for this course
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </button>
              </div>
            ) : (
              assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = new Date() > dueDate;

                return (
                  <div
                    key={assignment._id}
                    className="bg-white border rounded-lg p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {assignment.title}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                          {!assignment.isPublished && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">
                          {assignment.description}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {dueDate.toLocaleDateString()}</span>
                            {isOverdue && (
                              <span className="text-red-500 ml-1">
                                (Overdue)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{assignment.maxPoints} points</span>
                          </div>

                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>
                              {assignment.submissionCount || 0} submissions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="View assignment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                          title="Edit assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignmentsModal;
