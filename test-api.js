#!/usr/bin/env node

/**
 * API Endpoint Tester for EduFlow LMS
 * Tests all available endpoints to verify deployment
 */

import axios from "axios";

const API_BASE = "https://online-learning-management-system-he6h.onrender.com";

console.log("🧪 EduFlow LMS - API Endpoint Testing");
console.log("====================================\n");

async function testEndpoint(method, endpoint, data = null, description = "") {
  try {
    console.log(`🔍 Testing: ${method} ${endpoint}`);
    console.log(`📝 ${description}`);

    let response;
    if (method === "GET") {
      response = await axios.get(`${API_BASE}${endpoint}`);
    } else if (method === "POST") {
      response = await axios.post(`${API_BASE}${endpoint}`, data);
    }

    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    console.log("─".repeat(50));
    return true;
  } catch (error) {
    console.log(`❌ Status: ${error.response?.status || "Network Error"}`);
    console.log(`📄 Error:`, error.response?.data || error.message);
    console.log("─".repeat(50));
    return false;
  }
}

async function runTests() {
  console.log(`🎯 Testing API Base: ${API_BASE}\n`);

  // Test 1: Health Check
  await testEndpoint("GET", "/health", null, "Server health check");

  // Test 2: Root endpoint
  await testEndpoint("GET", "/", null, "API root information");

  // Test 3: Auth test endpoint
  await testEndpoint("GET", "/api/auth/test", null, "Auth routes test");

  // Test 4: Registration endpoint (with test data)
  const testUser = {
    firstName: "Test",
    lastName: "User",
    username: "testuser123",
    email: "test@example.com",
    password: "testpass123",
  };

  await testEndpoint(
    "POST",
    "/api/auth/register",
    testUser,
    "User registration test",
  );

  console.log("\n🎯 Test Summary:");
  console.log("If you see ✅ for most tests, your API is working correctly!");
  console.log(
    "If registration fails with validation errors, that's normal - it means the endpoint is working.",
  );
  console.log("\n📋 Next steps:");
  console.log(
    "1. Update Vercel environment variable: VITE_API_URL=" + API_BASE + "/api",
  );
  console.log("2. Test registration from your frontend");
  console.log("3. Check that frontend calls the correct API URL");
}

runTests().catch(console.error);
