import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import {
  Users,
  BookOpen,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  UserCheck,
  Settings,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalUsers: 1247,
    totalCourses: 89,
    totalEnrollments: 234,
    pendingApprovals: 3,
  });

  useEffect(() => {
    fetchPendingInstructors();
  }, []);

  const fetchPendingInstructors = async () => {
    try {
      const response = await authAPI.getPendingInstructors();
      setPendingInstructors(response.data.instructors || []);
    } catch (error) {
      console.error("Failed to fetch pending instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}. Manage your LMS platform.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/instructors"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Instructors
          </Link>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingInstructors.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Instructor Approvals */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Pending Instructor Invites
              </h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingInstructors.length} pending
              </span>
            </div>
          </div>
          <div className="p-6">
            {pendingInstructors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No pending instructor invites</p>
                <Link
                  to="/admin/instructors"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Create new instructor →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInstructors.map((instructor) => (
                  <div
                    key={instructor._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {instructor.firstName} {instructor.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {instructor.email}
                        </p>
                        <p className="text-sm text-blue-600">
                          @{instructor.username}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(instructor.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to="/admin/instructors"
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              System Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">System Status</p>
                    <p className="text-sm text-gray-600">
                      All services operational
                    </p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Users</p>
                    <p className="text-sm text-gray-600">Last 24 hours</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">892</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Course Completion
                    </p>
                    <p className="text-sm text-gray-600">Average rate</p>
                  </div>
                </div>
                <span className="text-purple-600 font-medium">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/instructors"
              className="flex items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Manage Instructors</p>
                <p className="text-sm text-gray-600">
                  Create and manage instructor accounts
                </p>
              </div>
            </Link>

            <button className="flex items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Course Management</p>
                <p className="text-sm text-gray-600">Oversee all courses</p>
              </div>
            </button>

            <button className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View detailed reports</p>
              </div>
            </button>

            <button className="flex items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-center">
                <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-sm text-gray-600">Configure platform</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
