import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Mail,
  User,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
} from "lucide-react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchInstructors();
    fetchPendingInvites();
  }, []);

  const fetchInstructors = async () => {
    try {
      // TODO: Implement API call to get all instructors
      // const response = await authAPI.getInstructors()
      // setInstructors(response.data.instructors)
    } catch (error) {
      toast.error("Failed to fetch instructors");
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const response = await authAPI.getPendingInstructors();
      setPendingInvites(response.data.instructors);
    } catch (error) {
      toast.error("Failed to fetch pending invites");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.createInstructor({
        ...data,
        sendInvite: data.creationMethod === "invite",
      });

      toast.success(response.data.message);
      reset();
      setShowCreateForm(false);

      if (data.creationMethod === "invite") {
        fetchPendingInvites();
      } else {
        fetchInstructors();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create instructor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Instructor Management
          </h1>
          <p className="text-gray-600">Create and manage instructor accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Instructor
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Policy
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Instructor accounts can only be created by administrators.
                Public registration is restricted to students only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Instructor Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create Instructor Account
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Creation Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creation Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        {...register("creationMethod", {
                          required: "Please select creation method",
                        })}
                        type="radio"
                        value="direct"
                        className="mr-2"
                      />
                      <span className="text-sm">
                        Create with password (immediate access)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register("creationMethod", {
                          required: "Please select creation method",
                        })}
                        type="radio"
                        value="invite"
                        className="mr-2"
                      />
                      <span className="text-sm">Send secure invite link</span>
                    </label>
                  </div>
                  {errors.creationMethod && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.creationMethod.message}
                    </p>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      type="text"
                      className="input"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      type="text"
                      className="input"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="input"
                    placeholder="john.doe@university.edu"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                    })}
                    type="text"
                    className="input"
                    placeholder="johndoe"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Conditional Password Field */}
                <div className="space-y-4">
                  {/* This would be conditionally shown based on creation method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password (if creating directly)
                    </label>
                    <input
                      {...register("password")}
                      type="password"
                      className="input"
                      placeholder="Leave empty for invite method"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? "Creating..." : "Create Instructor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">Pending Invites</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingInvites.length} pending
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {pendingInvites.map((instructor) => (
                <div
                  key={instructor._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {instructor.firstName} {instructor.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {instructor.email}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Invite expires:{" "}
                          {new Date(
                            instructor.inviteExpires,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Instructors */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Instructors</h3>
        </div>
        <div className="card-content">
          {instructors.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No instructors created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {instructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {instructor.firstName} {instructor.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {instructor.email}
                        </p>
                        <p className="text-xs text-green-600">
                          Active instructor
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
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

export default InstructorManagement;
