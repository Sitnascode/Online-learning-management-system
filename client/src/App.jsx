import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorManagement from "./pages/InstructorManagement";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Routes>
      {/* Test route */}
      <Route path="/test" element={<TestPage />} />

      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/admin-login"
        element={user ? <Navigate to="/dashboard" /> : <AdminLoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />
      <Route
        path="/set-password"
        element={user ? <Navigate to="/dashboard" /> : <SetPasswordPage />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Layout>{getDashboardComponent()}</Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/instructors"
        element={
          user && user.role === "admin" ? (
            <Layout>
              <InstructorManagement />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Student and Instructor routes */}
      <Route
        path="/courses"
        element={
          user &&
          (user.role === "student" ||
            user.role === "instructor" ||
            user.role === "admin") ? (
            <Layout>
              <CoursesPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/courses/:id"
        element={
          user &&
          (user.role === "student" ||
            user.role === "instructor" ||
            user.role === "admin") ? (
            <Layout>
              <CourseDetailPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/assignments"
        element={
          user &&
          (user.role === "student" ||
            user.role === "instructor" ||
            user.role === "admin") ? (
            <Layout>
              <AssignmentsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/profile"
        element={
          user ? (
            <Layout>
              <ProfilePage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Public information pages */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/help" element={<HelpCenterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
