import axios from "axios";

// API URL - configurable for different deployments
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://online-learning-management-system-he6h.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  adminLogin: (credentials) => api.post("/auth/admin-login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
  // Admin-only instructor management
  createInstructor: (instructorData) =>
    api.post("/auth/create-instructor", instructorData),
  getPendingInstructors: () => api.get("/auth/pending-instructors"),
  setPassword: (tokenData) => api.post("/auth/set-password", tokenData),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get("/courses/my-courses"),
  getEnrolledCourses: () => api.get("/courses/enrolled"),
  create: (courseData) => api.post("/courses", courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  unenroll: (courseId) => api.delete(`/courses/${courseId}/enroll`),
  getEnrollments: (courseId) => api.get(`/courses/${courseId}/enrollments`),
  publish: (courseId) => api.post(`/courses/${courseId}/publish`),
  uploadMaterial: (courseId, formData) =>
    api.post(`/courses/${courseId}/materials`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get("/assignments", { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (assignmentData) => api.post("/assignments", assignmentData),
  update: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (assignmentId, formData) =>
    api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSubmissions: (assignmentId) =>
    api.get(`/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId, gradeData) =>
    api.put(`/submissions/${submissionId}/grade`, gradeData),
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get("/analytics/dashboard"),
  getCourseStats: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getUserProgress: (userId) => api.get(`/analytics/users/${userId}/progress`),
  getSystemStats: () => api.get("/analytics/system"),
};

export default api;
