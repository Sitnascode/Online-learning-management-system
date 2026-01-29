import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI, assignmentsAPI } from "../services/api";
import toast from "react-hot-toast";

const TestPage = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get all courses
      console.log("Testing: Get all courses");
      const coursesResponse = await coursesAPI.getAll();
      results.getAllCourses = {
        success: true,
        data: coursesResponse.data,
        message: `Found ${coursesResponse.data.courses?.length || 0} courses`,
      };
    } catch (error) {
      results.getAllCourses = {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }

    try {
      // Test 2: Get enrolled courses (if student)
      if (user?.role === "student") {
        console.log("Testing: Get enrolled courses");
        const enrolledResponse = await coursesAPI.getEnrolledCourses();
        results.getEnrolledCourses = {
          success: true,
          data: enrolledResponse.data,
          message: `Found ${enrolledResponse.data.enrollments?.length || 0} enrollments`,
        };
      }
    } catch (error) {
      results.getEnrolledCourses = {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }

    try {
      // Test 3: Get my courses (if instructor)
      if (user?.role === "instructor") {
        console.log("Testing: Get my courses");
        const myCoursesResponse = await coursesAPI.getMyCourses();
        results.getMyCourses = {
          success: true,
          data: myCoursesResponse.data,
          message: `Found ${myCoursesResponse.data.courses?.length || 0} courses`,
        };
      }
    } catch (error) {
      results.getMyCourses = {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }

    try {
      // Test 4: Get assignments
      console.log("Testing: Get assignments");
      const assignmentsResponse = await assignmentsAPI.getAll();
      results.getAssignments = {
        success: true,
        data: assignmentsResponse.data,
        message: `Found ${assignmentsResponse.data.assignments?.length || 0} assignments`,
      };
    } catch (error) {
      results.getAssignments = {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">System Test</h1>
        <p>Please log in to run system tests.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Test</h1>
        <button
          onClick={runTests}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Running Tests..." : "Run Tests"}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">User Information</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
            <div>
              <strong>ID:</strong> {user._id}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${
                    result.success ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                {testName}
              </h3>
            </div>
            <div className="card-content">
              {result.success ? (
                <div>
                  <p className="text-green-600 font-medium">✓ Success</p>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">
                        View Data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-medium">✗ Failed</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Error: {result.error}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Running tests...</p>
        </div>
      )}
    </div>
  );
};

export default TestPage;
